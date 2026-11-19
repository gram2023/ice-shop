import type { ReactNode } from "react";

type Props = {
  id: string;
  /** คำเล็กเหนือหัวข้อ เช่น "เกี่ยวกับร้าน" */
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  /** dark = วางบนพื้นเขียว */
  tone?: "light" | "dark";
};

/** หัวข้อของแต่ละส่วน: คำเล็กสีเน้น + หัวข้อตัวหนาใหญ่ (ฟอนต์ Kanit) + คำอธิบาย */
export default function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
}: Props) {
  const dark = tone === "dark";
  return (
    <div className={`reveal ${align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}`}>
      <p className={`text-sm font-semibold ${dark ? "text-sun-400" : "text-ember-600"}`}>{eyebrow}</p>
      <h2
        id={id}
        className={`mt-1 font-display text-3xl leading-tight uppercase sm:text-4xl ${
          dark ? "text-white" : "text-forest-800"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p className={`mt-3 text-base leading-relaxed sm:text-lg ${dark ? "text-forest-100" : "text-slate-600"}`}>
          {description}
        </p>
      )}
    </div>
  );
}
