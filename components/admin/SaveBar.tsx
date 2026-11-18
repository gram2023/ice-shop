import { AlertIcon, CheckIcon } from "../icons";

type Props = {
  message: string | null;
  saved: boolean;
  pending: boolean;
  label?: string;
};

/** ท้ายฟอร์มตั้งค่า: ข้อความผลการบันทึก + ปุ่มบันทึก */
export default function SaveBar({ message, saved, pending, label = "บันทึก" }: Props) {
  return (
    <>
      {message && (
        <p
          role={saved ? "status" : "alert"}
          className={`flex items-start gap-2 rounded-xl p-3 text-sm font-medium ${
            saved ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {saved ? (
            <CheckIcon className="size-5 shrink-0" />
          ) : (
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
          )}
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-full bg-blue-600 px-8 font-bold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-wait disabled:bg-blue-400 sm:w-auto"
      >
        {pending ? "กำลังบันทึก…" : label}
      </button>
    </>
  );
}
