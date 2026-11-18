-- Ice Express: เฟส 5 — ลูกค้าติดตามออเดอร์
-- วิธีใช้: Supabase > SQL Editor > วางทั้งไฟล์ > กด Run (รันซ้ำได้)
-- ไฟล์นี้ "เพิ่ม" อย่างเดียว ไม่แก้ตารางเดิม
--
-- หลักการ
--   - ลูกค้าต้องกรอก "เลขออเดอร์ + เบอร์โทรที่ใช้สั่ง" ตรงกันทั้งคู่ ถึงจะเห็นข้อมูล
--   - แสดงเฉพาะข้อมูลที่จำเป็น ไม่ส่งที่อยู่ เบอร์โทรเต็ม หรือหมายเหตุกลับไป
--   - กันการเดาสุ่ม: ค้นหาผิด 5 ครั้งใน 15 นาที → เบอร์นั้นถูกล็อก 15 นาที
--     (ตัวจำกัดอยู่ในฟังก์ชันนี้เอง เรียกตรงด้วย anon key ก็เลี่ยงไม่ได้)

-- 1) ประวัติการค้นหาผิด (เก็บเบอร์โทร + เวลา) ลบทิ้งอัตโนมัติหลัง 1 วัน
create table if not exists public.order_lookup_attempts (
  id bigint generated always as identity primary key,
  phone text not null,
  attempted_at timestamptz not null default now()
);

create index if not exists order_lookup_attempts_phone_time_idx
  on public.order_lookup_attempts (phone, attempted_at);
create index if not exists order_lookup_attempts_time_idx
  on public.order_lookup_attempts (attempted_at);

-- เปิด RLS โดยไม่สร้าง policy = ไม่มีใครอ่าน/เขียนตารางนี้ตรง ๆ ได้ (ใช้ได้เฉพาะผ่านฟังก์ชัน)
alter table public.order_lookup_attempts enable row level security;
revoke all on public.order_lookup_attempts from anon, authenticated;

-- 2) ฟังก์ชันติดตามออเดอร์
create or replace function public.track_order(p_order_no text, p_phone text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  c_max_failures constant int := 5;
  c_window constant interval := interval '15 minutes';
  c_retention constant interval := interval '1 day';

  v_order_no text := upper(btrim(coalesce(p_order_no, '')));
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_order public.orders%rowtype;
  v_items jsonb;
  v_name_masked text;
begin
  -- รูปแบบผิด → ปฏิเสธเลย (ไม่นับเป็นการเดา เพราะไม่มีทางตรงกับออเดอร์ใด)
  if v_order_no !~ '^ICE-[0-9]{6}-[0-9]{4}$' or v_phone !~ '^0[0-9]{8,9}$' then
    raise exception 'ICE_INVALID_INPUT';
  end if;

  -- ล็อกตามเบอร์โทร ไม่ให้คำขอที่ส่งพร้อมกันหลุดการนับ
  perform pg_advisory_xact_lock(hashtext('ice_track_order:' || v_phone));

  -- ลบประวัติเก่ากว่า 1 วัน (ไม่เก็บเบอร์โทรนานเกินจำเป็น)
  delete from public.order_lookup_attempts as a
  where a.attempted_at < now() - c_retention;

  if (
    select count(*)
    from public.order_lookup_attempts as a
    where a.phone = v_phone
      and a.attempted_at > now() - c_window
  ) >= c_max_failures then
    raise exception 'ICE_TOO_MANY_ATTEMPTS';
  end if;

  select * into v_order
  from public.orders as o
  where o.order_no = v_order_no
    and o.phone = v_phone;

  if not found then
    insert into public.order_lookup_attempts (phone) values (v_phone);
    -- ต้อง return (ห้าม raise) ไม่งั้นการบันทึกครั้งที่ผิดด้านบนจะถูกยกเลิกไปด้วย
    return jsonb_build_object('found', false);
  end if;

  select jsonb_agg(
    jsonb_build_object(
      'name', i.product_name,
      'quantity', i.quantity,
      'line_total', i.line_total
    )
    order by i.product_name
  )
  into v_items
  from public.order_items as i
  where i.order_id = v_order.id;

  -- ชื่อแบบปิดบางส่วน เช่น "สมชาย ใจดี" → "สม*** ใจ***"
  select string_agg(left(w, 2) || '***', ' ')
  into v_name_masked
  from regexp_split_to_table(btrim(v_order.customer_name), '\s+') as w;

  -- ส่งกลับเฉพาะข้อมูลที่จำเป็น (ไม่มีที่อยู่ / เบอร์โทร / หมายเหตุ)
  return jsonb_build_object(
    'found', true,
    'order_no', v_order.order_no,
    'customer_name_masked', v_name_masked,
    'status', v_order.status,
    'payment_status', v_order.payment_status,
    'payment_method', v_order.payment_method,
    'delivery_at', v_order.delivery_at,
    'created_at', v_order.created_at,
    'subtotal', v_order.subtotal,
    'delivery_fee', v_order.delivery_fee,
    'total', v_order.total,
    'items', coalesce(v_items, '[]'::jsonb)
  );
end;
$$;

revoke all on function public.track_order(text, text) from public;
grant execute on function public.track_order(text, text) to anon, authenticated;

-- ให้ Supabase API เห็นฟังก์ชันใหม่ทันที
notify pgrst, 'reload schema';
