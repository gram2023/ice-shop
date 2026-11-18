-- Ice Express: เฟส 6 — แอดมินแก้ข้อมูลร้านทั้งหมดผ่านเว็บ
-- วิธีใช้: Supabase > SQL Editor > วางทั้งไฟล์ > กด Run (รันซ้ำได้)
-- ⚠️ ลำดับ: รันไฟล์นี้ก่อน แล้วค่อยรัน place_order.sql (ฉบับเฟส 6)
--
-- ไฟล์นี้ "เพิ่ม" อย่างเดียว ไม่แก้หรือลบข้อมูลเดิม
-- ทุกช่องปล่อยว่าง (null) ได้: ถ้าว่าง หน้าเว็บจะใช้ค่าตั้งต้นจาก lib/shop-config.ts
-- สิทธิ์: ใช้ RLS เดิมของตาราง settings (ทุกคนอ่านได้ / แก้ได้เฉพาะแอดมิน)
--        + เพิ่มกฎ: ลบออเดอร์ได้เฉพาะที่ยกเลิกแล้ว

alter table public.settings
  -- ข้อมูลร้าน
  add column if not exists shop_name text,
  add column if not exists tagline text,
  add column if not exists description text,
  -- ติดต่อ
  add column if not exists address text,
  add column if not exists phone text,
  add column if not exists line_id text,
  add column if not exists line_url text,
  add column if not exists facebook_name text,
  add column if not exists facebook_url text,
  -- แผนที่ (ลิงก์ฝังจาก Google Maps + ลิงก์นำทาง)
  add column if not exists map_embed_url text,
  add column if not exists map_link_url text,
  -- รายการ (เก็บเป็น JSON array)
  add column if not exists opening_hours jsonb,
  add column if not exists highlights jsonb,
  add column if not exists faq jsonb,
  -- รูป
  add column if not exists logo_url text,
  add column if not exists hero_image_url text,
  -- กฎการจัดส่ง
  add column if not exists delivery_lead_minutes int,
  add column if not exists delivery_max_days int;

-- ตรวจค่าในฐานข้อมูลอีกชั้น (ฝั่งเว็บตรวจละเอียดกว่านี้แล้ว)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'settings_opening_hours_array') then
    alter table public.settings add constraint settings_opening_hours_array
      check (opening_hours is null or jsonb_typeof(opening_hours) = 'array');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'settings_highlights_array') then
    alter table public.settings add constraint settings_highlights_array
      check (highlights is null or jsonb_typeof(highlights) = 'array');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'settings_faq_array') then
    alter table public.settings add constraint settings_faq_array
      check (faq is null or jsonb_typeof(faq) = 'array');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'settings_delivery_lead_range') then
    alter table public.settings add constraint settings_delivery_lead_range
      check (delivery_lead_minutes is null or delivery_lead_minutes between 0 and 2880);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'settings_delivery_max_days_range') then
    alter table public.settings add constraint settings_delivery_max_days_range
      check (delivery_max_days is null or delivery_max_days between 1 and 30);
  end if;
end $$;

-- แผนที่ต้องเป็นลิงก์ฝังของ Google Maps เท่านั้น (กันฝังเว็บอื่นลงหน้าร้าน)
-- ค่าว่าง '' = แอดมินเลือกไม่แสดงแผนที่ / null = ยังไม่ได้ตั้ง (ใช้ค่าตั้งต้น)
alter table public.settings drop constraint if exists settings_map_embed_google;
alter table public.settings add constraint settings_map_embed_google
  check (
    map_embed_url is null
    or map_embed_url = ''
    or map_embed_url like 'https://www.google.com/maps%'
  );

-- ลบออเดอร์ได้เฉพาะออเดอร์ที่ "ยกเลิก" แล้วเท่านั้น
-- (restrictive = ใช้ร่วมกับสิทธิ์แอดมินเดิม ต้องผ่านทั้งคู่ · รายการสินค้าในออเดอร์ถูกลบตามอัตโนมัติ)
drop policy if exists "delete only cancelled orders" on public.orders;
create policy "delete only cancelled orders" on public.orders
  as restrictive
  for delete
  using (status = 'cancelled');

-- ให้ Supabase API เห็นช่องใหม่ทันที
notify pgrst, 'reload schema';
