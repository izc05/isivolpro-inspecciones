import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const componentPath = path.resolve(
  process.cwd(),
  "src/closure/ClosureModals.jsx",
);
let source = fs.readFileSync(componentPath, "utf8");

if (source.includes("disabled={!isAdmin}")) {
  console.log("Las coordenadas protegidas ya son de solo lectura para inspectores.");
  process.exit(0);
}

function replaceExact(label, before, after) {
  if (!source.includes(before)) {
    throw new Error(`No se encontró el bloque esperado: ${label}`);
  }
  source = source.replace(before, after);
}

replaceExact(
  "propiedad disabled de NumberField",
  "function NumberField({ label, value, min, max, step = 1, suffix, onChange }) {",
  "function NumberField({ label, value, min, max, step = 1, suffix, disabled = false, onChange }) {",
);

replaceExact(
  "input numérico deshabilitable",
  `          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-[#FFC928]"`,
  `          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-[#FFC928] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"`,
);

replaceExact(
  "descripción de coordenadas protegidas",
  `<p className="text-xs text-slate-500">Debe configurarla el administrador antes del cierre.</p>`,
  `<p className="text-xs text-slate-500">{isAdmin ? "Puede modificarla y guardarla en el servidor." : "Configurada y protegida por el administrador."}</p>`,
);

replaceExact(
  "campos de coordenadas",
  `<NumberField label="Latitud" value={latitude} min={-90} max={90} step="any" onChange={setLatitude} />
              <NumberField label="Longitud" value={longitude} min={-180} max={180} step="any" onChange={setLongitude} />`,
  `<NumberField label="Latitud" value={latitude} min={-90} max={90} step="any" disabled={!isAdmin} onChange={setLatitude} />
              <NumberField label="Longitud" value={longitude} min={-180} max={180} step="any" disabled={!isAdmin} onChange={setLongitude} />`,
);

replaceExact(
  "campo de radio protegido",
  `<NumberField label="Radio específico" value={allowedRadiusMeters} min={1} max={10000} suffix="m" onChange={setAllowedRadiusMeters} />`,
  `<NumberField label="Radio específico" value={allowedRadiusMeters} min={1} max={10000} suffix="m" disabled={!isAdmin} onChange={setAllowedRadiusMeters} />`,
);

replaceExact(
  "botón de guardado solo administrador",
  `<button type="button" onClick={saveLocation} className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-700">
              Guardar ubicación en la preinspección
            </button>`,
  `{isAdmin && (
              <button type="button" onClick={saveLocation} className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-700">
                Guardar ubicación protegida
              </button>
            )}`,
);

fs.writeFileSync(componentPath, source);
console.log("Campos de cierre protegidos para usuarios no administradores.");
