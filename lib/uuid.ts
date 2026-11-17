const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** ตรวจว่าเป็นรหัสแบบ UUID (ใช้ตรวจรหัสสินค้า/ออเดอร์ที่มาจากภายนอก) */
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}
