-- Ice Express: เฟส 4 — ตั้งค่าร้าน (ข้อมูลชำระเงิน / ส่งฟรี) + ที่เก็บรูป
-- วิธีใช้: Supabase > SQL Editor > วางทั้งไฟล์ > กด Run (รันซ้ำได้)
-- ⚠️ ลำดับ: รันไฟล์นี้ก่อน แล้วค่อยรัน place_order.sql (ฉบับเฟส 4)
--
-- ไฟล์นี้ "เพิ่ม" อย่างเดียว ไม่แก้หรือลบข้อมูลเดิม

-- 1) เพิ่มช่องในตาราง settings (ปล่อยว่างได้)
alter table public.settings
  add column if not exists bank_name text,
  add column if not exists bank_account_name text,
  add column if not exists bank_account_number text,
  add column if not exists promptpay_id text,
  add column if not exists promptpay_qr_url text,
  -- สั่งครบกี่ถุงส่งฟรี (0 = ไม่มีส่งฟรี)
  add column if not exists free_shipping_min_qty int not null default 10;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'settings_free_shipping_min_qty_check'
  ) then
    alter table public.settings
      add constraint settings_free_shipping_min_qty_check
      check (free_shipping_min_qty between 0 and 999);
  end if;
end $$;

-- 2) ที่เก็บรูปสินค้าและรูป QR: ทุกคนดูรูปได้ (หน้าร้านต้องแสดงรูป)
--    จำกัดไฟล์ JPG / PNG / WebP ไม่เกิน 2 MB (ไม่รับ SVG เพราะฝังโค้ดอันตรายได้)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'shop-images',
  'shop-images',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 3) สิทธิ์ใน Storage: อัปโหลด / แก้ / ลบ ได้เฉพาะแอดมิน (ใช้ is_admin() เดิม)
drop policy if exists "admin read shop images" on storage.objects;
create policy "admin read shop images" on storage.objects
  for select to authenticated
  using (bucket_id = 'shop-images' and public.is_admin());

drop policy if exists "admin insert shop images" on storage.objects;
create policy "admin insert shop images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'shop-images' and public.is_admin());

drop policy if exists "admin update shop images" on storage.objects;
create policy "admin update shop images" on storage.objects
  for update to authenticated
  using (bucket_id = 'shop-images' and public.is_admin())
  with check (bucket_id = 'shop-images' and public.is_admin());

drop policy if exists "admin delete shop images" on storage.objects;
create policy "admin delete shop images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'shop-images' and public.is_admin());

-- ให้ Supabase API เห็นช่องใหม่ทันที
notify pgrst, 'reload schema';
