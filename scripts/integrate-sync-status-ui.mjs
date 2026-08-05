import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const appPath = path.resolve(process.cwd(), "src/App.jsx");
let source = fs.readFileSync(appPath, "utf8");

if (source.includes("function SyncStatusPill")) {
  console.log("El indicador de sincronización ya está integrado en App.jsx.");
  process.exit(0);
}

function replaceExact(label, before, after) {
  if (!source.includes(before)) {
    throw new Error(`No se encontró el bloque esperado: ${label}`);
  }
  source = source.replace(before, after);
}

replaceExact(
  "componente EmptyState",
  `function EmptyState({ title, text }) {
  return <div className="bg-white rounded-3xl p-8 text-center border border-slate-100"><h2 className="font-black text-slate-900">{fixText(title)}</h2><p className="text-sm text-slate-500 mt-2">{fixText(text)}</p></div>;
}`,
  `function SyncStatusPill({ state, configured, authenticated, onRetry }) {
  if (!configured) return null;

  const status = authenticated ? state?.status || "idle" : "account";
  const variants = {
    account: { icon: "○", label: "Inicia sesión para sincronizar", tone: "bg-slate-800 text-white border-slate-700" },
    idle: { icon: "○", label: "Sincronización preparada", tone: "bg-white text-slate-700 border-slate-200" },
    syncing: { icon: "↻", label: state?.message || "Sincronizando...", tone: "bg-blue-50 text-blue-800 border-blue-200" },
    synced: { icon: "✓", label: state?.message || "Todo está al día", tone: "bg-emerald-50 text-emerald-800 border-emerald-200" },
    offline: { icon: "☁", label: state?.message || "Cambios pendientes sin conexión", tone: "bg-amber-50 text-amber-900 border-amber-200" },
    conflict: { icon: "!", label: state?.message || "Cambios que necesitan revisión", tone: "bg-red-50 text-red-800 border-red-200" },
    error: { icon: "!", label: state?.message || "Error de sincronización", tone: "bg-red-50 text-red-800 border-red-200" },
  };
  const variant = variants[status] || variants.idle;
  const canRetry = authenticated && ["offline", "conflict", "error", "synced", "idle"].includes(status);

  return (
    <button
      type="button"
      onClick={canRetry ? onRetry : undefined}
      className={\`fixed right-3 bottom-24 z-[110] max-w-[calc(100vw-1.5rem)] flex items-center gap-2 rounded-2xl border px-3 py-2 text-left shadow-lg backdrop-blur print:hidden \${variant.tone} \${canRetry ? "cursor-pointer active:scale-[0.98]" : "cursor-default"}\`}
      title={canRetry ? "Comprobar sincronización ahora" : variant.label}
      aria-live="polite"
    >
      <span className={\`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white/70 text-sm font-black \${status === "syncing" ? "animate-spin" : ""}\`}>
        {variant.icon}
      </span>
      <span className="min-w-0">
        <strong className="block truncate text-xs font-black">{variant.label}</strong>
        {canRetry && <small className="block text-[10px] opacity-70">Pulse para comprobar</small>}
      </span>
    </button>
  );
}

function EmptyState({ title, text }) {
  return <div className="bg-white rounded-3xl p-8 text-center border border-slate-100"><h2 className="font-black text-slate-900">{fixText(title)}</h2><p className="text-sm text-slate-500 mt-2">{fixText(text)}</p></div>;
}`,
);

replaceExact(
  "render del indicador",
  `        {screen !== "report" && <BottomNav screen={screen} setScreen={setScreen} onReportClick={openReportReview} />}`,
  `        {screen !== "report" && (
          <SyncStatusPill
            state={syncRuntimeState}
            configured={isSyncConfigured()}
            authenticated={Boolean(user)}
            onRetry={() => setSyncTrigger((value) => value + 1)}
          />
        )}
        {screen !== "report" && <BottomNav screen={screen} setScreen={setScreen} onReportClick={openReportReview} />}`,
);

fs.writeFileSync(appPath, source);
console.log("Indicador de sincronización integrado correctamente en src/App.jsx.");
