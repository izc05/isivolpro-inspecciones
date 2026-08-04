import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const hooksDir = path.resolve(process.cwd(), "server/pocketbase/pb_hooks");
const closurePath = path.join(hooksDir, "isivolt_closure.pb.js");
let closure = fs.readFileSync(closurePath, "utf8");

function replaceExact(label, before, after) {
  if (!closure.includes(before)) {
    if (closure.includes(after)) return;
    throw new Error(`No se encontró el bloque esperado para normalizar: ${label}`);
  }
  closure = closure.replace(before, after);
}

replaceExact(
  "Number.isFinite",
  "  return Number.isFinite(number) ? number : null;",
  "  return isFinite(number) ? number : null;",
);

replaceExact(
  "potencias de Haversine",
  `  const haversine = Math.sin(latDelta / 2) ** 2 +
    Math.cos(latA) * Math.cos(latB) * Math.sin(lonDelta / 2) ** 2;`,
  `  const sinLatitude = Math.sin(latDelta / 2);
  const sinLongitude = Math.sin(lonDelta / 2);
  const haversine = sinLatitude * sinLatitude +
    Math.cos(latA) * Math.cos(latB) * sinLongitude * sinLongitude;`,
);

replaceExact(
  "identificador de foto de respuesta",
  "      const id = String((photo && (photo.fileId || photo.id || photo.fileName)) || `${key}-${index}`);",
  "      const id = String((photo && (photo.fileId || photo.id || photo.fileName)) || (key + \"-\" + index));",
);

replaceExact(
  "identificador de hoja de campo",
  "    const id = String(photo.fileId || photo.id || photo.fileName || `field-${index}`);",
  "    const id = String(photo.fileId || photo.id || photo.fileName || (\"field-\" + index));",
);

replaceExact(
  "detección MIME de imagen",
  `    if (!mime.startsWith("image/")) return;
    const id = String(file.fileId || file.id || file.fileName || \`attachment-\${index}\`);`,
  `    if (mime.indexOf("image/") !== 0) return;
    const id = String(file.fileId || file.id || file.fileName || ("attachment-" + index));`,
);

replaceExact(
  "plataforma admitida",
  `  const platform = ["android", "ios", "web"].includes(String(body.platform))
    ? String(body.platform)
    : "web";`,
  `  const requestedPlatform = String(body.platform);
  const platform = ["android", "ios", "web"].indexOf(requestedPlatform) >= 0
    ? requestedPlatform
    : "web";`,
);

replaceExact(
  "helper de valores anulables",
  `function validLatitude(value) {`,
  `function closureNullable(value) {
  return value === undefined || value === null ? null : value;
}

function validLatitude(value) {`,
);

for (const field of [
  "latitude",
  "longitude",
  "accuracyMeters",
  "installationLatitude",
  "installationLongitude",
  "distanceMeters",
  "allowedRadiusMeters",
  "maximumAccuracyMeters",
]) {
  replaceExact(
    `valor anulable ${field}`,
    `    closure.set("${field}", evidence.${field} ?? null);`,
    `    closure.set("${field}", closureNullable(evidence.${field}));`,
  );
}

fs.writeFileSync(closurePath, closure);

const forbidden = ["?.", "??", "**", ".includes(", ".startsWith(", "Number.isFinite"];
const files = fs.readdirSync(hooksDir)
  .filter((name) => name.endsWith(".js"))
  .map((name) => path.join(hooksDir, name));

const violations = [];
for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  for (const token of forbidden) {
    if (content.includes(token)) violations.push(`${path.basename(file)} contiene ${token}`);
  }
}

if (violations.length) {
  throw new Error(`Los hooks todavía contienen sintaxis no permitida:\n${violations.join("\n")}`);
}

console.log("Hooks PocketBase normalizados y comprobados para la política ES5.");
