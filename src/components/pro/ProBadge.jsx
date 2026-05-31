import React from "react";
import { Crown } from "lucide-react";

export default function ProBadge({ plan = "demo" }) {
  const isPro = plan === "pro";
  return (
    <span className={`inline-flex max-w-full shrink-0 items-center gap-1 rounded-2xl px-2.5 py-1 text-[11px] leading-none font-black border whitespace-nowrap ${isPro ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-yellow-50 text-yellow-800 border-yellow-100"}`}>
      <Crown className="w-3.5 h-3.5 shrink-0" />
      <span className="truncate">{isPro ? "Pro activo" : "Demo"}</span>
    </span>
  );
}
