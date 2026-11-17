-- Ice Express: ฟังก์ชันรับคำสั่งซื้อจากลูกค้า (เฟส 2)
-- วิธีใช้: เปิด Supabase > SQL Editor > วางทั้งไฟล์ > กด Run
-- รันซ้ำได้ (create or replace) และไม่แก้โครงสร้างตารางเดิมใน schema.sql
--
-- ทำไมต้องมีฟังก์ชันนี้
--   RLS ของตาราง orders / order_items อนุญาตให้เฉพาะแอดมินเขียนได้
--   ฟังก์ชันนี้ (security definer) จึงเป็นช่องทางเดียวที่ลูกค้าบันทึกออเดอร์ได้
--
-- ⚠️ ฟังก์ชันนี้คือด่านตรวจความปลอดภัยหลัก
--   ใครที่มี anon key (เป็น key สาธารณะ) เรียกฟังก์ชันนี้ตรง ๆ ได้โดยไม่ผ่านหน้าเว็บ
--   - คิดราคาจากตาราง products เอง ไม่เชื่อราคาจากเบราว์เซอร์
--   - คิดค่าส่งจาก settings และส่งฟรีเมื่อครบจำนวนถุงที่กำหนด
--   - บังคับสถานะ pending / unpaid เสมอ
--   - จำกัดจำนวนออเดอร์ต่อเบอร์โทร กันสแปม
--   - บันทึกออเดอร์และรายการสินค้าในขั้นตอนเดียว ถ้าพังกลางทางจะยกเลิกทั้งหมด

create or replace function public.place_order(
  p_customer_name text,
  p_phone text,
  p_address text,
  p_delivery_at timestamptz,
  p_payment_method text,
  p_items jsonb,
  p_note text default null
)
returns jsonb
language plpgsql
volatile
security definer
-- ไม่ให้ค้นหาตาราง/ฟังก์ชันจาก schema อื่นโดยอัตโนมัติ (ทุกตารางในฟังก์ชันระบุ public. ไว้แล้ว)
set search_path = ''
as $$
declare
  -- ⚠️ ค่าเหล่านี้ต้องตรงกับฝั่งเว็บ (lib/shop-config.ts และ lib/order-rules.ts)
  c_free_shipping_min_qty constant int := 10;
  c_max_lines constant int := 20;
  c_max_quantity constant int := 999;
  c_max_delivery_days constant int := 7;
  c_rate_limit_count constant int := 3;
  c_rate_limit_window constant interval := interval '10 minutes';

  v_name text := btrim(coalesce(p_customer_name, ''));
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_address text := btrim(coalesce(p_address, ''));
  v_note text := nullif(btrim(coalesce(p_note, '')), '');

  v_line_count int;
  v_distinct_count int;
  v_found_count int;
  v_quantity_ok boolean;
  v_total_qty int;
  v_subtotal numeric(10,2);
  v_delivery_fee numeric(10,2);
  v_total numeric(10,2);
  v_order_id uuid;
  v_order_no text;
  v_attempt int := 0;
  v_items jsonb;
begin
  -- 1) ตรวจข้อมูลลูกค้า
  if char_length(v_name) not between 2 and 100 then
    raise exception 'ICE_INVALID_NAME';
  end if;

  if v_phone !~ '^0[0-9]{8,9}$' then
    raise exception 'ICE_INVALID_PHONE';
  end if;

  if char_length(v_address) not between 10 and 500 then
    raise exception 'ICE_INVALID_ADDRESS';
  end if;

  if v_note is not null and char_length(v_note) > 500 then
    raise exception 'ICE_INVALID_NOTE';
  end if;

  if p_payment_method is null or p_payment_method not in ('transfer', 'qr', 'cod') then
    raise exception 'ICE_INVALID_PAYMENT';
  end if;

  if p_delivery_at is null
     or p_delivery_at <= now()
     or p_delivery_at > now() + make_interval(days => c_max_delivery_days) then
    raise exception 'ICE_INVALID_DELIVERY_TIME';
  end if;

  -- 2) ตรวจรายการสินค้า รูปแบบ: [{ "product_id": "<uuid>", "quantity": 1-999 }, ...]
  if p_items is null
     or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) not between 1 and c_max_lines then
    raise exception 'ICE_INVALID_ITEMS';
  end if;

  begin
    select
      count(*),
      count(distinct r.product_id),
      count(p.id),
      bool_and(coalesce(r.quantity between 1 and c_max_quantity, false)),
      coalesce(sum(r.quantity), 0),
      coalesce(sum(p.price * r.quantity), 0)
    into
      v_line_count, v_distinct_count, v_found_count,
      v_quantity_ok, v_total_qty, v_subtotal
    from (
      select
        (t.e ->> 'product_id')::uuid as product_id,
        (t.e ->> 'quantity')::int as quantity
      from jsonb_array_elements(p_items) as t(e)
    ) as r
    left join public.products as p
      on p.id = r.product_id and p.is_active = true;
  exception
    when invalid_text_representation or numeric_value_out_of_range then
      raise exception 'ICE_INVALID_ITEMS';
  end;

  if v_quantity_ok is not true or v_distinct_count <> v_line_count then
    raise exception 'ICE_INVALID_ITEMS';
  end if;

  if v_found_count <> v_line_count then
    raise exception 'ICE_PRODUCT_UNAVAILABLE';
  end if;

  -- 3) กันสแปม: เบอร์เดียวกันสั่งได้ไม่เกิน c_rate_limit_count ครั้งใน c_rate_limit_window
  --    (ล็อกตามเบอร์โทร เพื่อไม่ให้คำขอที่ส่งพร้อมกันหลุดการนับ)
  perform pg_advisory_xact_lock(hashtext('ice_place_order:' || v_phone));

  if (
    select count(*)
    from public.orders as o
    where o.phone = v_phone
      and o.created_at > now() - c_rate_limit_window
  ) >= c_rate_limit_count then
    raise exception 'ICE_RATE_LIMITED';
  end if;

  -- 4) ค่าส่ง (ส่งฟรีเมื่อครบจำนวนถุง)
  select s.delivery_fee into v_delivery_fee
  from public.settings as s
  where s.id = 1;

  v_delivery_fee := coalesce(v_delivery_fee, 0);
  if v_total_qty >= c_free_shipping_min_qty then
    v_delivery_fee := 0;
  end if;
  v_total := v_subtotal + v_delivery_fee;

  -- 5) บันทึกออเดอร์ เลขออเดอร์ = ICE-ปปดดวว-สุ่ม 4 หลัก (สุ่มใหม่ถ้าซ้ำ)
  loop
    v_attempt := v_attempt + 1;
    v_order_no := 'ICE-'
      || to_char(now() at time zone 'Asia/Bangkok', 'YYMMDD')
      || '-'
      || lpad((floor(random() * 10000))::int::text, 4, '0');

    begin
      insert into public.orders (
        order_no, customer_name, phone, address, delivery_at, note,
        payment_method, payment_status, status,
        subtotal, delivery_fee, total
      )
      values (
        v_order_no, v_name, v_phone, v_address, p_delivery_at, v_note,
        p_payment_method, 'unpaid', 'pending',
        v_subtotal, v_delivery_fee, v_total
      )
      returning id into v_order_id;
      exit;
    exception
      when unique_violation then
        if v_attempt >= 10 then
          raise exception 'ICE_ORDER_NO_UNAVAILABLE';
        end if;
    end;
  end loop;

  -- 6) รายการสินค้าในออเดอร์ (ราคาและชื่อจากตาราง products ณ ตอนสั่ง)
  insert into public.order_items (
    order_id, product_id, product_name, unit_price, quantity, line_total
  )
  select v_order_id, p.id, p.name, p.price, r.quantity, p.price * r.quantity
  from (
    select
      (t.e ->> 'product_id')::uuid as product_id,
      (t.e ->> 'quantity')::int as quantity,
      t.ord
    from jsonb_array_elements(p_items) with ordinality as t(e, ord)
  ) as r
  join public.products as p
    on p.id = r.product_id and p.is_active = true
  order by r.ord;

  -- 7) ส่งกลับเฉพาะข้อมูลที่หน้าเว็บต้องใช้ (ไม่ส่งข้อมูลส่วนตัวของลูกค้ากลับ)
  select jsonb_agg(
    jsonb_build_object(
      'name', p.name,
      'unit_price', p.price,
      'quantity', r.quantity,
      'line_total', p.price * r.quantity
    )
    order by r.ord
  )
  into v_items
  from (
    select
      (t.e ->> 'product_id')::uuid as product_id,
      (t.e ->> 'quantity')::int as quantity,
      t.ord
    from jsonb_array_elements(p_items) with ordinality as t(e, ord)
  ) as r
  join public.products as p
    on p.id = r.product_id and p.is_active = true;

  return jsonb_build_object(
    'order_no', v_order_no,
    'subtotal', v_subtotal,
    'delivery_fee', v_delivery_fee,
    'total', v_total,
    'total_quantity', v_total_qty,
    'items', coalesce(v_items, '[]'::jsonb)
  );
end;
$$;

-- สิทธิ์: ให้ลูกค้า (anon) และผู้ใช้ที่ล็อกอินเรียกฟังก์ชันนี้ได้
revoke all on function public.place_order(text, text, text, timestamptz, text, jsonb, text) from public;
grant execute on function public.place_order(text, text, text, timestamptz, text, jsonb, text) to anon, authenticated;

-- ให้ Supabase API เห็นฟังก์ชันใหม่ทันที
notify pgrst, 'reload schema';
