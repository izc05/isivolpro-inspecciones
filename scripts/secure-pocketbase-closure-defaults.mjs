import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const hookPath = path.resolve(
  process.cwd(),
  "server/pocketbase/pb_hooks/isivolt_closure.pb.js",
);
let source = fs.readFileSync(hookPath, "utf8");

const insecureDefaults = `const CLOSURE_DEFAULTS = {
  allowCloseFromWeb: true,
  requireMobileClose: false,
  requireLocation: false,
  allowedRadiusMeters: 100,
  maximumAccuracyMeters: 50,
  requireInspectorSignature: true,
  requireClientSignature: false,
  minimumPhotoCount: 0,
  requireServerSyncBeforeClose: false,
  allowAdminOverride: true,
};`;

const secureDefaults = `const CLOSURE_DEFAULTS = {
  allowCloseFromWeb: false,
  requireMobileClose: true,
  requireLocation: true,
  allowedRadiusMeters: 100,
  maximumAccuracyMeters: 50,
  requireInspectorSignature: true,
  requireClientSignature: false,
  minimumPhotoCount: 1,
  requireServerSyncBeforeClose: true,
  allowAdminOverride: true,
};`;

if (source.includes(secureDefaults)) {
  console.log("La política segura de cierre ya está aplicada.");
  process.exit(0);
}
if (!source.includes(insecureDefaults)) {
  throw new Error("No se encontró la política de cierre inicial esperada");
}

source = source.replace(insecureDefaults, secureDefaults);
fs.writeFileSync(hookPath, source);
console.log("Política segura de cierre aplicada en PocketBase.");
