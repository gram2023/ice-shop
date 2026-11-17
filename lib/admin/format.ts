/** ตัวช่วยจัดรูปแบบข้อมูลในหน้าแอดมิน (เวลาไทยเสมอ) */

const shortDateTime = new Intl.DateTimeFormat("th-TH", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Bangkok",
});

/** เช่น "พ. 18 พ.ย. 10:00 น." */
export function formatShortDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${shortDateTime.format(date)} น.`;
}

/** เบอร์โทรที่เก็บเป็นตัวเลขล้วน → มีขีดอ่านง่าย เช่น 0812345678 → 081-234-5678 */
export function formatPhone(digits: string) {
  if (/^0\d{9}$/.test(digits)) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (/^0\d{8}$/.test(digits)) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
  }
  return digits;
}
