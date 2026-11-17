/**
 * ตรวจข้อมูลฟอร์มสินค้า (ใช้ฝั่ง server ใน Server Action)
 * ค่าที่ไม่ใช่ข้อความ (เช่น ไฟล์) จะถูกมองเป็นค่าว่าง
 */

export const PRODUCT_LIMITS = {
  nameMax: 100,
  descriptionMax: 500,
  sizeLabelMax: 50,
  priceMax: 100000,
} as const;

export type ProductField = "name" | "description" | "sizeLabel" | "price";
export type ProductErrors = Partial<Record<ProductField | "image", string>>;

export type ProductInput = {
  name: string;
  description: string | null;
  sizeLabel: string | null;
  price: number;
  isActive: boolean;
};

/** ค่าที่ผู้ใช้กรอกไว้ ใช้เติมกลับเข้าฟอร์มเมื่อบันทึกไม่ผ่าน */
export type ProductFormValues = {
  name: string;
  description: string;
  sizeLabel: string;
  price: string;
  isActive: boolean;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

/** ราคาไม่ติดลบ ทศนิยมไม่เกิน 2 ตำแหน่ง เช่น "60", "12.5", "1,200" */
export function parsePrice(raw: string): number | null {
  const cleaned = raw.replace(/,/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) && value <= PRODUCT_LIMITS.priceMax ? value : null;
}

export function readProductForm(get: (name: string) => unknown): ProductFormValues {
  return {
    name: text(get("name")),
    description: text(get("description")),
    sizeLabel: text(get("sizeLabel")),
    price: text(get("price")),
    isActive: get("isActive") === "on" || get("isActive") === "true",
  };
}

export function validateProductInput(
  values: ProductFormValues,
): { ok: true; data: ProductInput } | { ok: false; errors: ProductErrors } {
  const errors: ProductErrors = {};

  if (!values.name) errors.name = "กรุณากรอกชื่อสินค้า";
  else if (values.name.length > PRODUCT_LIMITS.nameMax) {
    errors.name = `ชื่อสินค้ายาวเกิน ${PRODUCT_LIMITS.nameMax} ตัวอักษร`;
  }

  if (values.description.length > PRODUCT_LIMITS.descriptionMax) {
    errors.description = `คำอธิบายยาวเกิน ${PRODUCT_LIMITS.descriptionMax} ตัวอักษร`;
  }

  if (values.sizeLabel.length > PRODUCT_LIMITS.sizeLabelMax) {
    errors.sizeLabel = `ขนาดยาวเกิน ${PRODUCT_LIMITS.sizeLabelMax} ตัวอักษร`;
  }

  const price = parsePrice(values.price);
  if (!values.price) errors.price = "กรุณากรอกราคา";
  else if (price === null) {
    errors.price = `ราคาไม่ถูกต้อง กรอกตัวเลข 0–${PRODUCT_LIMITS.priceMax.toLocaleString("th-TH")} (ทศนิยมไม่เกิน 2 ตำแหน่ง)`;
  }

  if (Object.keys(errors).length > 0 || price === null) return { ok: false, errors };

  return {
    ok: true,
    data: {
      name: values.name,
      description: values.description || null,
      sizeLabel: values.sizeLabel || null,
      price,
      isActive: values.isActive,
    },
  };
}
