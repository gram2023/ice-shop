-- Ice Express: โครงสร้างฐานข้อมูล Supabase (ฉบับมีระบบแอดมิน)
-- วิธีใช้: เปิด Supabase > SQL Editor > วางทั้งไฟล์ > กด Run (รันครั้งเดียว)

-- 1) แอดมิน
create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- 2) สินค้า
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  size_label text,
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 3) คำสั่งซื้อ
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique,
  customer_name text not null,
  phone text not null,
  address text not null,
  delivery_at timestamptz not null,
  note text,
  payment_method text not null check (payment_method in ('transfer','qr','cod')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid')),
  status text not null default 'pending'
    check (status in ('pending','accepted','preparing','delivering','delivered','cancelled')),
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  created_at timestamptz not null default now()
);

-- 4) รายการสินค้าในออเดอร์
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(10,2) not null,
  quantity int not null check (quantity > 0),
  line_total numeric(10,2) not null
);

-- 5) ตั้งค่าร้าน (มีแถวเดียว)
create table public.settings (
  id int primary key default 1 check (id = 1),
  delivery_fee numeric(10,2) not null default 0,
  promo_text text,
  updated_at timestamptz not null default now()
);

-- 6) เปิด Row Level Security
alter table public.admins enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.settings enable row level security;

-- 7) Policies
create policy "public read active products" on public.products
  for select using (is_active = true or public.is_admin());
create policy "admin insert products" on public.products
  for insert with check (public.is_admin());
create policy "admin update products" on public.products
  for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete products" on public.products
  for delete using (public.is_admin());

create policy "public read settings" on public.settings
  for select using (true);
create policy "admin update settings" on public.settings
  for update using (public.is_admin()) with check (public.is_admin());

create policy "admin all orders" on public.orders
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all order_items" on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

-- 8) ข้อมูลตัวอย่าง (ราคาเป็นตัวอย่าง แก้ได้ภายหลัง)
insert into public.settings (id, delivery_fee, promo_text)
values (1, 20, 'สั่งครบ 10 ถุง ส่งฟรี');

insert into public.products (name, description, size_label, price, sort_order) values
  ('น้ำแข็งถุงเล็ก', 'น้ำแข็งสะอาด เหมาะสำหรับใช้ในบ้าน', '2 กก.', 10, 1),
  ('น้ำแข็งถุงกลาง', 'เหมาะสำหรับร้านค้าขนาดเล็ก', '5 กก.', 20, 2),
  ('น้ำแข็งถุงใหญ่', 'เหมาะสำหรับงานเลี้ยงและร้านอาหาร', '20 กก.', 60, 3),
  ('น้ำแข็งหลอด', 'น้ำแข็งหลอดใส เหมาะสำหรับเครื่องดื่ม', '20 กก.', 70, 4),
  ('น้ำแข็งบด', 'น้ำแข็งบดละเอียด เหมาะสำหรับแช่อาหารสด', '20 กก.', 65, 5);