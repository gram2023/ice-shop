import { formatOpeningTime, phoneHref, shopConfig } from "@/lib/shop-config";
import { ChatIcon, ClockIcon, IceIcon, PhoneIcon } from "./icons";

export default function Footer() {
  return (
    <footer className="mt-auto bg-blue-950 text-sky-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <IceIcon className="size-7 text-sky-300" />
            <p className="text-xl font-bold text-white">{shopConfig.name}</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-sky-200/80">
            {shopConfig.tagline}
          </p>
        </div>

        <ul className="space-y-3 text-base">
          <li>
            <a
              href={phoneHref()}
              className="inline-flex items-center gap-2 hover:text-white hover:underline"
            >
              <PhoneIcon className="size-5 shrink-0 text-sky-300" />
              <span>โทร {shopConfig.phone}</span>
            </a>
          </li>
          <li>
            <a
              href={shopConfig.lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:text-white hover:underline"
            >
              <ChatIcon className="size-5 shrink-0 text-sky-300" />
              <span>LINE: {shopConfig.lineId}</span>
            </a>
          </li>
        </ul>

        <div className="flex gap-2">
          <ClockIcon className="mt-0.5 size-5 shrink-0 text-sky-300" />
          <div>
            <p className="font-semibold text-white">เวลาเปิด-ปิด</p>
            <ul className="mt-1 space-y-1 text-sm">
              {shopConfig.openingHours.map((h) => (
                <li key={h.label}>
                  {h.label}: {formatOpeningTime(h)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-sky-200/70">
        © {shopConfig.name} สงวนลิขสิทธิ์
      </div>
    </footer>
  );
}
