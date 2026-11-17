/**
 * ไอคอนแบบ SVG ที่ใช้ในเว็บ (เขียนเองเพื่อไม่ต้องติดตั้งไลบรารีเพิ่ม)
 * ทุกไอคอนใช้สีตาม text color ของ element แม่ (currentColor)
 */

type IconProps = {
  className?: string;
};

function Outline({
  className = "size-6",
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

/** ก้อนน้ำแข็ง (ใช้เป็นโลโก้และภาพแทนสินค้าที่ไม่มีรูป) */
export function IceIcon({ className }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M12 2.5 3.5 7.25v9.5L12 21.5l8.5-4.75v-9.5L12 2.5Z" />
      <path d="M3.5 7.25 12 12l8.5-4.75" />
      <path d="M12 12v9.5" />
      <path d="M7 10.5v3.25" />
      <path d="M15.75 15.5l2-1.1" />
    </Outline>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
    </Outline>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M6 18 18 6M6 6l12 12" />
    </Outline>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </Outline>
  );
}

/** ฟองแชต (ใช้กับปุ่ม LINE) */
export function ChatIcon({ className }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M21 11.5c0 4.418-4.03 8-9 8-1.03 0-2.02-.154-2.94-.437L4.5 20.5l1.2-3.6C4.03 15.47 3 13.58 3 11.5c0-4.418 4.03-8 9-8s9 3.582 9 8Z" />
      <path d="M8.25 11.5h.01M12 11.5h.01M15.75 11.5h.01" />
    </Outline>
  );
}

export function FacebookIcon({ className = "size-6" }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M14 8h3V4h-3c-2.76 0-5 2.24-5 5v2H7v4h2v7h4v-7h3l1-4h-4V9c0-.55.45-1 1-1Z" />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </Outline>
  );
}

export function MapPinIcon({ className }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </Outline>
  );
}

export function CartIcon({ className }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </Outline>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <Outline className={className}>
      <path d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </Outline>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </Outline>
  );
}

export function TagIcon({ className }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
      <path d="M6 6h.008v.008H6V6Z" />
    </Outline>
  );
}

export function AlertIcon({ className }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
    </Outline>
  );
}

export function MinusIcon({ className }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M5 12h14" />
    </Outline>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M12 5v14M5 12h14" />
    </Outline>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <Outline className={className}>
      <path d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </Outline>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </Outline>
  );
}
