import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Crosshair,
  MapPin,
  Save,
  Settings2,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import { getClosureReadiness } from "./closureRuntime.js";
import { normalizeClosurePolicy } from "./closurePolicyStore.js";

const REQUIREMENT_LABELS = {
  MOBILE_DEVICE_REQUIRED: "Debe realizarse desde la APK móvil",
  INSPECTOR_SIGNATURE_REQUIRED: "Falta la firma del inspector",
  CLIENT_SIGNATURE_REQUIRED: "Falta la firma del cliente",
  MINIMUM_PHOTOS_REQUIRED: "No se ha alcanzado el mínimo de fotografías",
  SERVER_SYNC_REQUIRED: "Hay cambios pendientes de sincronizar",
};

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
      <span className="min-w-0">
        <strong className="block text-sm font-black text-slate-900">{label}</strong>
        {description && <small className="mt-1 block text-xs leading-relaxed text-slate-500">{description}</small>}
      </span>
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 accent-[#071E3D]"
      />
    </label>
  );
}

function NumberField({ label, value, min, max, step = 1, suffix, onChange }) {
  return (
    <label className="block rounded-2xl border border-slate-200 bg-white p-4">
      <span className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-[#FFC928]"
        />
        {suffix && <span className="text-xs font-bold text-slate-500">{suffix}</span>}
      </div>
    </label>
  );
}

export function AdminClosurePolicyModal({ open, policy, onClose, onSave }) {
  const [draft, setDraft] = useState(() => normalizeClosurePolicy(policy));

  useEffect(() => {
    if (open) setDraft(normalizeClosurePolicy(policy));
  }, [open, policy]);

  if (!open) return null;

  const patch = (key, value) => setDraft((current) => normalizeClosurePolicy({
    ...current,
    [key]: value,
  }));

  return (
    <div className="fixed inset-0 z-[260] flex items-end justify-center bg-[#071E3D]/70 backdrop-blur-sm sm:items-center">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Cerrar configuración" />
      <section className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-slate-50 shadow-2xl sm:rounded-[2rem]">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#071E3D] text-[#FFC928]">
              <Settings2 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-black text-[#071E3D]">Cierre de preinspecciones</h2>
              <p className="text-xs text-slate-500">Política administrativa por defecto</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl bg-slate-100 p-2 text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-3 p-5">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs leading-relaxed text-blue-900">
            Estas reglas se aplican a todas las preinspecciones. Una instalación podrá tener un radio o una política diferente.
          </div>

          <ToggleRow
            label="Exigir cierre desde la APK"
            description="Impide el cierre definitivo desde el navegador del PC."
            checked={draft.requireMobileClose}
            onChange={(value) => patch("requireMobileClose", value)}
          />
          <ToggleRow
            label="Exigir ubicación GPS"
            description="Compara la posición del móvil con la coordenada de la instalación."
            checked={draft.requireLocation}
            onChange={(value) => patch("requireLocation", value)}
          />

          {draft.requireLocation && (
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                label="Radio permitido"
                value={draft.allowedRadiusMeters}
                min={1}
                max={10000}
                suffix="m"
                onChange={(value) => patch("allowedRadiusMeters", value)}
              />
              <NumberField
                label="Precisión máxima"
                value={draft.maximumAccuracyMeters}
                min={1}
                max={1000}
                suffix="m"
                onChange={(value) => patch("maximumAccuracyMeters", value)}
              />
            </div>
          )}

          <ToggleRow
            label="Firma del inspector obligatoria"
            checked={draft.requireInspectorSignature}
            onChange={(value) => patch("requireInspectorSignature", value)}
          />
          <ToggleRow
            label="Firma del cliente obligatoria"
            checked={draft.requireClientSignature}
            onChange={(value) => patch("requireClientSignature", value)}
          />
          <NumberField
            label="Fotografías mínimas"
            value={draft.minimumPhotoCount}
            min={0}
            max={100}
            onChange={(value) => patch("minimumPhotoCount", value)}
          />
          <ToggleRow
            label="Sincronizar antes de cerrar"
            description="El servidor debe confirmar todos los cambios antes de aceptar el cierre."
            checked={draft.requireServerSyncBeforeClose}
            onChange={(value) => patch("requireServerSyncBeforeClose", value)}
          />
          <ToggleRow
            label="Permitir excepción del administrador"
            description="La excepción exige motivo y conserva toda la evidencia GPS disponible."
            checked={draft.allowAdminOverride}
            onChange={(value) => patch("allowAdminOverride", value)}
          />
          <ToggleRow
            label="Permitir cierre desde PC"
            checked={draft.allowCloseFromWeb}
            onChange={(value) => patch("allowCloseFromWeb", value)}
          />
        </div>

        <footer className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
          <button
            type="button"
            onClick={() => onSave(normalizeClosurePolicy(draft))}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#071E3D] px-4 py-3.5 text-sm font-black text-white shadow-lg"
          >
            <Save className="h-5 w-5 text-[#FFC928]" /> Guardar política
          </button>
        </footer>
      </section>
    </div>
  );
}

export function InspectionClosureModal({
  open,
  inspection,
  policy,
  installation,
  platform,
  busy,
  feedback,
  isAdmin,
  onClose,
  onSaveInstallation,
  onConfirm,
}) {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [allowedRadiusMeters, setAllowedRadiusMeters] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  useEffect(() => {
    if (!open) return;
    setLatitude(installation?.latitude ?? "");
    setLongitude(installation?.longitude ?? "");
    setAllowedRadiusMeters(installation?.allowedRadiusMeters ?? policy?.allowedRadiusMeters ?? 100);
    setOverrideReason("");
  }, [open, installation, policy]);

  const readiness = useMemo(() => getClosureReadiness({
    inspection,
    policy,
    platform,
  }), [inspection, policy, platform]);

  if (!open) return null;

  const location = {
    latitude: latitude === "" ? null : Number(latitude),
    longitude: longitude === "" ? null : Number(longitude),
    allowedRadiusMeters: allowedRadiusMeters === "" ? null : Number(allowedRadiusMeters),
  };
  const hasCoordinates = Number.isFinite(location.latitude) && Number.isFinite(location.longitude);
  const blockingMissing = readiness.missing.filter((code) => code !== "SERVER_SYNC_REQUIRED");
  const canOverride = Boolean(isAdmin && policy?.allowAdminOverride && overrideReason.trim());
  const canClose = blockingMissing.length === 0 && (!policy?.requireLocation || hasCoordinates);

  const saveLocation = () => onSaveInstallation(location);
  const confirm = () => {
    saveLocation();
    onConfirm({
      installation: location,
      overrideReason: canOverride ? overrideReason.trim() : "",
    });
  };

  return (
    <div className="fixed inset-0 z-[270] flex items-end justify-center bg-[#071E3D]/75 backdrop-blur-sm sm:items-center">
      <button type="button" className="absolute inset-0" onClick={busy ? undefined : onClose} aria-label="Cerrar validación" />
      <section className="relative max-h-[94vh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-slate-50 shadow-2xl sm:rounded-[2rem]">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#071E3D] text-[#FFC928]">
              <Crosshair className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-black text-[#071E3D]">Cerrar en la instalación</h2>
              <p className="max-w-[240px] truncate text-xs text-slate-500">{inspection?.data?.name || "Preinspección BT"}</p>
            </div>
          </div>
          <button type="button" disabled={busy} onClick={onClose} className="rounded-xl bg-slate-100 p-2 text-slate-500 disabled:opacity-40">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <Smartphone className="h-5 w-5 text-[#071E3D]" />
              <strong className="mt-2 block text-xs text-slate-900">Dispositivo</strong>
              <span className="text-xs text-slate-500">{platform === "android" ? "APK Android" : platform}</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <ShieldCheck className="h-5 w-5 text-[#071E3D]" />
              <strong className="mt-2 block text-xs text-slate-900">Radio</strong>
              <span className="text-xs text-slate-500">{location.allowedRadiusMeters || policy?.allowedRadiusMeters || 100} m</span>
            </div>
          </div>

          <section className="rounded-3xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#071E3D]" />
              <div>
                <h3 className="text-sm font-black text-slate-900">Coordenada de la instalación</h3>
                <p className="text-xs text-slate-500">Debe configurarla el administrador antes del cierre.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Latitud" value={latitude} min={-90} max={90} step="any" onChange={setLatitude} />
              <NumberField label="Longitud" value={longitude} min={-180} max={180} step="any" onChange={setLongitude} />
            </div>
            <div className="mt-3">
              <NumberField label="Radio específico" value={allowedRadiusMeters} min={1} max={10000} suffix="m" onChange={setAllowedRadiusMeters} />
            </div>
            <button type="button" onClick={saveLocation} className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-700">
              Guardar ubicación en la preinspección
            </button>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-black text-slate-900">Requisitos</h3>
            <div className="mt-3 space-y-2">
              {readiness.missing.length === 0 ? (
                <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4" /> Preparada para cerrar
                </div>
              ) : readiness.missing.map((code) => (
                <div key={code} className="flex items-center gap-2 rounded-2xl bg-amber-50 p-3 text-xs font-bold text-amber-900">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{REQUIREMENT_LABELS[code] || code}</span>
                </div>
              ))}
            </div>
          </section>

          {isAdmin && policy?.allowAdminOverride && (
            <label className="block rounded-3xl border border-orange-200 bg-orange-50 p-4">
              <span className="text-xs font-black uppercase tracking-wide text-orange-800">Excepción administrativa</span>
              <textarea
                value={overrideReason}
                onChange={(event) => setOverrideReason(event.target.value)}
                placeholder="Motivo obligatorio para cerrar de forma excepcional"
                className="mt-2 min-h-20 w-full rounded-2xl border border-orange-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-orange-300"
              />
            </label>
          )}

          {feedback && (
            <div className={`rounded-2xl border p-4 text-sm font-bold ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>
              {feedback.message}
              {feedback.evidence && (
                <p className="mt-2 text-xs font-medium opacity-80">
                  Distancia: {Math.round(feedback.evidence.distanceMeters || 0)} m · Precisión: {Math.round(feedback.evidence.accuracyMeters || 0)} m
                </p>
              )}
            </div>
          )}
        </div>

        <footer className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
          <button
            type="button"
            disabled={busy || (!canClose && !canOverride)}
            onClick={confirm}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#071E3D] px-4 py-3.5 text-sm font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? "Validando ubicación..." : canOverride ? "Autorizar excepción y cerrar" : "Capturar GPS y cerrar"}
          </button>
        </footer>
      </section>
    </div>
  );
}
