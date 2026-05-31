import React from "react";
import { LockKeyhole } from "lucide-react";

export default function DemoLimitNotice({ text = "Estás usando IsiVoltPro en modo Demo." }) {
  return (
    <div className="rounded-[1.5rem] bg-yellow-50 border border-yellow-100 p-4 flex items-start gap-3 text-yellow-900">
      <LockKeyhole className="w-5 h-5 shrink-0 mt-0.5" />
      <p className="text-sm font-bold">{text}</p>
    </div>
  );
}
