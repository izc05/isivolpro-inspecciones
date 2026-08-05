import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const hookPath = path.resolve(
  process.cwd(),
  "server/pocketbase/pb_hooks/isivolt_closure.pb.js",
);
let source = fs.readFileSync(hookPath, "utf8");

if (source.includes("function buildTrustedInspectionInstallation")) {
  console.log("El cierre PocketBase ya usa coordenadas administrativas confiables.");
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
  "function validLatitude(value) {",
  `function installationValue(installation, key) {
  if (!installation) return null;
  if (typeof installation.get === "function") return installation.get(key);
  return installation[key];
}

function buildTrustedInspectionInstallation(inspection) {
  const latitude = inspection.get("closureLatitude");
  const longitude = inspection.get("closureLongitude");
  const allowedRadiusMeters = inspection.get("closureRadiusMeters");
  const policy = closureObject(inspection.get("closurePolicy"));

  if (latitude === null && longitude === null) return null;
  return {
    latitude: latitude,
    longitude: longitude,
    allowedRadiusMeters: allowedRadiusMeters,
    closurePolicy: policy,
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
  "resolución administrativa de instalación",
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
  const trustedInstallation = buildTrustedInspectionInstallation(inspection);
  const installation = installationRecord || trustedInstallation;
  const installationPolicy = installationRecord
    ? installationRecord.get("closurePolicy")
    : trustedInstallation
      ? trustedInstallation.closurePolicy
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
console.log("Cierre PocketBase configurado con coordenadas administrativas protegidas.");
