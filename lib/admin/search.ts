/**
 * แปลงคำค้นของแอดมินเป็นตัวกรองของ Supabase (PostgREST) แบบปลอดภัย
 *
 * รับเฉพาะ A-Z 0-9 และ - (เลขออเดอร์) กับตัวเลข (เบอร์โทร)
 * ตัดอักขระอื่นทิ้งทั้งหมด เพื่อไม่ให้แทรกไวยากรณ์ตัวกรอง เช่น , . ( ) :
 * คืนค่า null ถ้าคำค้นสั้นเกินไป (ต้องอย่างน้อย 3 ตัว)
 */
export function buildSearchFilter(raw: string): string | null {
  const orderTerm = raw.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
  const phoneDigits = raw.replace(/\D/g, "");
  const parts: string[] = [];
  if (orderTerm.length >= 3) parts.push(`order_no.ilike.%${orderTerm}%`);
  if (phoneDigits.length >= 3) parts.push(`phone.like.%${phoneDigits}%`);
  return parts.length ? parts.join(",") : null;
}
