const numberFormat = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** แสดงราคาเป็นบาท เช่น 60 → "60 บาท", 12.5 → "12.5 บาท" */
export function formatPrice(price: number) {
  return `${numberFormat.format(price)} บาท`;
}
