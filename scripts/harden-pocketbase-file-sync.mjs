import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const hooksDir = path.resolve(process.cwd(), "server/pocketbase/pb_hooks");
const filesHookPath = path.join(hooksDir, "isivolt_files.pb.js");
const closureHookPath = path.join(hooksDir, "isivolt_closure.pb.js");
let filesHook = fs.readFileSync(filesHookPath, "utf8");
let closureHook = fs.readFileSync(closureHookPath, "utf8");

if (filesHook.includes("new ConflictError(")) {
  filesHook = filesHook.replace(
    "throw new ConflictError(\"El archivo ya está sincronizado\", {",
    "throw new BadRequestError(\"El archivo ya está sincronizado\", {",
  );
}

if (!closureHook.includes("function countUploadedInspectionPhotos")) {
  const anchor = "function checkClosureRequirements(payload, policy, platform) {";
  if (!closureHook.includes(anchor)) {
    throw new Error("No se encontró checkClosureRequirements en el hook de cierre");
  }

  const helper = `function countUploadedInspectionPhotos(app, inspectionRecordId, companyId) {
  const records = app.findRecordsByFilter(
    "inspection_files",
    "inspection = {:inspection} && company = {:company} && fileType = 'image'",
    "",
    500,
    0,
    { inspection: inspectionRecordId, company: companyId },
  );
  return records.length;
}

function checkClosureRequirements(payload, policy, platform, uploadedPhotoCount) {`;
  closureHook = closureHook.replace(anchor, helper);

  const photoAnchor = "  const photoCount = countPayloadPhotos(payload);";
  if (!closureHook.includes(photoAnchor)) {
    throw new Error("No se encontró el conteo de fotografías del payload");
  }
  closureHook = closureHook.replace(
    photoAnchor,
    `  const payloadPhotoCount = countPayloadPhotos(payload);
  const synchronizedPhotoCount = Math.max(0, Number(uploadedPhotoCount || 0));
  const photoCount = policy.requireServerSyncBeforeClose
    ? synchronizedPhotoCount
    : Math.max(payloadPhotoCount, synchronizedPhotoCount);`,
  );

  const callAnchor = "  const requirements = checkClosureRequirements(payload, policy, platform);";
  if (!closureHook.includes(callAnchor)) {
    throw new Error("No se encontró la llamada de requisitos de cierre");
  }
  closureHook = closureHook.replace(
    callAnchor,
    `  const uploadedPhotoCount = countUploadedInspectionPhotos(
    e.app,
    inspection.id,
    auth.companyId,
  );
  const requirements = checkClosureRequirements(
    payload,
    policy,
    platform,
    uploadedPhotoCount,
  );`,
  );
}

if (filesHook.includes("ConflictError")) {
  throw new Error("El hook de archivos todavía utiliza ConflictError");
}
if (!closureHook.includes("synchronizedPhotoCount")) {
  throw new Error("El cierre no está comprobando fotografías sincronizadas");
}

fs.writeFileSync(filesHookPath, filesHook);
fs.writeFileSync(closureHookPath, closureHook);
console.log("Hooks de archivos y cierre reforzados correctamente.");
