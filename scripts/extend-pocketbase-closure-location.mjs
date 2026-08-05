import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const hookPath = path.resolve(
  process.cwd(),
  "server/pocketbase/pb_hooks/isivolt_closure.pb.js",
);
let source = fs.readFileSync(hookPath, "utf8");

if (source.includes("function buildPayloadInstallation")) {
  console.log("El cierre PocketBase ya admite coordenadas incluidas en la preinspección.");
  process.exit(0);
}

function replaceExact(label, before, after) {
  if (!source.includes(before)) {
    throw new Error(`No se encontró el bloque esperado: ${label}`);
  }
  source = source.replace(before, after);
}

replaceExact(
  "lector de valores de instalación",
  `function validLatitude(value) {`,
  `function installationValue(installation, key) {
  if (!installation) return null;
  if (typeof installation.get === "function") return installation.get(key);
  return installation[key];
}

function buildPayloadInstallation(payload) {
  const data = closureObject(payload && payload.data);
  const latitude = data.installationLatitude !== undefined
    ? data.installationLatitude
    : data.latitude;
  const longitude = data.installationLongitude !== undefined
    ? data.installationLongitude
    : data.longitude;
  const allowedRadiusMeters = data.closureAllowedRadiusMeters !== undefined
    ? data.closureAllowedRadiusMeters
    : data.allowedRadiusMeters;

  if (latitude === undefined && longitude === undefined) return null;
  return {
    latitude: latitude,
    longitude: longitude,
    allowedRadiusMeters: allowedRadiusMeters,
    closurePolicy: closureObject(data.closurePolicy),
  };
}

function validLatitude(value) {`,
);

replaceExact(
  "coordenadas de instalación",
  `  const installationLatitude = closureFinite(installation.get("latitude"));
  const installationLongitude = closureFinite(installation.get("longitude"));`,
  `  const installationLatitude = closureFinite(installationValue(installation, "latitude"));
  const installationLongitude = closureFinite(installationValue(installation, "longitude"));`,
);

replaceExact(
  "radio de instalación",
  `    Number(installation.get("allowedRadiusMeters") || policy.allowedRadiusMeters || 100),`,
  `    Number(installationValue(installation, "allowedRadiusMeters") || policy.allowedRadiusMeters || 100),`,
);

replaceExact(
  "resolución de instalación y política",
  `  const company = e.app.findRecordById("companies", auth.companyId);
  const installationId = inspection.getString("installation");
  const installation = installationId
    ? e.app.findRecordById("installations", installationId)
    : null;
  const policy = mergeClosurePolicy(
    company.get("closurePolicy"),
    installation ? installation.get("closurePolicy") : {},
  );
  const platform = ["android", "ios", "web"].includes(String(body.platform))
    ? String(body.platform)
    : "web";
  const payload = closureObject(inspection.get("payload"));`,
  `  const company = e.app.findRecordById("companies", auth.companyId);
  const payload = closureObject(inspection.get("payload"));
  const installationId = inspection.getString("installation");
  const installationRecord = installationId
    ? e.app.findRecordById("installations", installationId)
    : null;
  const payloadInstallation = buildPayloadInstallation(payload);
  const installation = installationRecord || payloadInstallation;
  const installationPolicy = installationRecord
    ? installationRecord.get("closurePolicy")
    : payloadInstallation
      ? payloadInstallation.closurePolicy
      : {};
  const policy = mergeClosurePolicy(
    company.get("closurePolicy"),
    installationPolicy,
  );
  const platform = ["android", "ios", "web"].includes(String(body.platform))
    ? String(body.platform)
    : "web";`,
);

fs.writeFileSync(hookPath, source);
console.log("Cierre PocketBase ampliado para coordenadas incluidas en la preinspección.");
