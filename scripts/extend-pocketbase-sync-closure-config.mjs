import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const hookPath = path.resolve(
  process.cwd(),
  "server/pocketbase/pb_hooks/isivolt_sync.pb.js",
);
let source = fs.readFileSync(hookPath, "utf8");

if (source.includes("closureConfig:")) {
  console.log("La sincronización ya incluye la configuración protegida de cierre.");
  process.exit(0);
}

const before = `    deletedAt: record.getString("deletedAt"),
    created: record.getString("created"),`;
const after = `    deletedAt: record.getString("deletedAt"),
    closureConfig: {
      latitude: record.get("closureLatitude"),
      longitude: record.get("closureLongitude"),
      allowedRadiusMeters: record.get("closureRadiusMeters"),
      policy: record.get("closurePolicy"),
      configuredBy: record.getString("closureConfiguredBy"),
      configuredAt: record.getString("closureConfiguredAt")
    },
    created: record.getString("created"),`;

if (!source.includes(before)) {
  throw new Error("No se encontró el serializador de preinspecciones esperado");
}

source = source.replace(before, after);
fs.writeFileSync(hookPath, source);
console.log("Configuración protegida de cierre añadida a la sincronización.");
