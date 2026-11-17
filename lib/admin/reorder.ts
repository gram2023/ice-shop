/**
 * ลำดับใหม่หลังเลื่อนสินค้าขึ้น/ลง 1 ตำแหน่ง
 * คืนค่ารายการ id ตามลำดับใหม่ หรือ null ถ้าเลื่อนไม่ได้ (อยู่บนสุด/ล่างสุด/ไม่พบ)
 */
export function reorderIds(
  ids: string[],
  id: string,
  direction: "up" | "down",
): string[] | null {
  const index = ids.indexOf(id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= ids.length) return null;
  const next = [...ids];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/**
 * แถวที่ต้องอัปเดต sort_order ให้เป็น 1, 2, 3, ... ตามลำดับใหม่
 * (อัปเดตเฉพาะแถวที่ค่าเปลี่ยน ปกติเลื่อน 1 ครั้งแก้แค่ 2 แถว)
 */
export function sortOrderUpdates(
  orderedIds: string[],
  current: Map<string, number>,
): { id: string; sortOrder: number }[] {
  return orderedIds
    .map((id, i) => ({ id, sortOrder: i + 1 }))
    .filter(({ id, sortOrder }) => current.get(id) !== sortOrder);
}
