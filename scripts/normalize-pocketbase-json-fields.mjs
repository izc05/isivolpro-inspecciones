import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = [
  "server/pocketbase/pb_hooks/sync_core_utils.js",
  "server/pocketbase/pb_hooks/technician_access_utils.js",
  "server/pocketbase/pb_hooks/inspection_assignment_utils.js",
];

const genericApplications = `function applications(value) {
  const source = objectValue(value);
  let enabled = source.preinspectionsBt;
  if (enabled === undefined && value && typeof value.get === "function") {
    enabled = value.get("preinspectionsBt");
  }
  return {
    preinspectionsBt: booleanSetting(enabled, true),
  };
}

function recordApplications(record) {
  if (!record) return { preinspectionsBt: true };
  try {
    const result = new DynamicModel({ preinspectionsBt: true });
    record.unmarshalJSONField("applications", result);
    return {
      preinspectionsBt: booleanSetting(result.preinspectionsBt, true),
    };
  } catch (error) {
    return applications(record.get("applications"));
  }
}`;

function replaceFunction(source, name, replacement) {
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`No se encontró ${name}`);
  const brace = source.indexOf("{", start);
  let depth = 0;
  let end = -1;
  for (let index = brace; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") {
      depth -= 1;
      if (depth === 0) {
        end = index + 1;
        break;
      }
    }
  }
  if (end < 0) throw new Error(`No se pudo delimitar ${name}`);
  return source.slice(0, start) + replacement + source.slice(end);
}

for (const relativePath of files) {
  const filePath = path.join(root, relativePath);
  let source = fs.readFileSync(filePath, "utf8");
  source = replaceFunction(source, "applications", genericApplications);
  source = source.replaceAll('applications(event.auth.get("applications"))', "recordApplications(event.auth)");
  source = source.replaceAll('applications(record.get("applications"))', "recordApplications(record)");
  if (!source.includes("recordApplications: recordApplications,")) {
    source = source.replace(
      "module.exports = {\n  applications: applications,",
      "module.exports = {\n  applications: applications,\n  recordApplications: recordApplications,",
    );
  }
  fs.writeFileSync(filePath, source);
}

const syncHookPath = path.join(root, "server/pocketbase/pb_hooks/isivolt_sync.pb.js");
let syncHook = fs.readFileSync(syncHookPath, "utf8");
syncHook = syncHook.replaceAll(
  'sync.applications(record.get("applications"))',
  "sync.recordApplications(record)",
);
fs.writeFileSync(syncHookPath, syncHook);

console.log("Acceso nativo a campos JSON de PocketBase normalizado");
