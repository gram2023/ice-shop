-- Ice Express: เฟส UI-3 — รูปหน้าแรกและโลโก้ที่แอดมินอัปโหลดเอง
-- วิธีใช้: Supabase > SQL Editor > วางทั้งไฟล์ > กด Run (รันซ้ำได้)
-- ⚠️ รันไฟล์นี้ "ก่อน" ใช้โค้ดเฟส UI-3 (โค้ดใหม่อ่านช่องเหล่านี้)
--
-- ไฟล์นี้ "เพิ่ม" อย่างเดียว ไม่แก้หรือลบข้อมูลเดิม
-- ช่อง logo_url (โลโก้) และ hero_image_url (รูปหลักส่วนบน) มีอยู่แล้วจาก phase6.sql
-- สิทธิ์: ใช้ RLS เดิมของตาราง settings และที่เก็บรูป shop-images (แก้/อัปโหลดได้เฉพาะแอดมิน)

alter table public.settings
  -- รูปเล็กส่วนบน (ซ้อนมุมรูปหลัก)
  add column if not exists hero_image2_url text,
  -- รูปในส่วน "เกี่ยวกับร้าน"
  add column if not exists about_image_url text;

-- รูปทุกช่องต้องเป็นลิงก์ https (ฝั่งเว็บตรวจละเอียดกว่านี้: ต้องเป็นรูปในที่เก็บรูปของร้านเท่านั้น)
alter table public.settings drop constraint if exists settings_images_https;
alter table public.settings add constraint settings_images_https
  check (
    (logo_url is null or logo_url like 'https://%')
    and (hero_image_url is null or hero_image_url like 'https://%')
    and (hero_image2_url is null or hero_image2_url like 'https://%')
    and (about_image_url is null or about_image_url like 'https://%')
  );

-- ให้ Supabase API เห็นช่องใหม่ทันที
notify pgrst, 'reload schema';
