import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const runtimePath = path.resolve(process.cwd(), "src/sync/fileSyncRuntime.js");
let source = fs.readFileSync(runtimePath, "utf8");

if (source.includes("mappedLocalRecord")) {
  console.log("Las referencias locales de archivos ya se verifican antes de omitir descargas.");
  process.exit(0);
}

const before = `      const mapped = getLocalFileMapping(inspectionId, remote.syncFileId);
      const existingLocal = localBySyncId.get(remote.syncFileId);
      if (mapped?.localFileId || existingLocal?.id) {
        const localFileId = mapped?.localFileId || existingLocal.id;
        saveLocalFileMapping(inspectionId, remote.syncFileId, {
          localFileId,
          serverFileId: remote.serverFileId,
          fileName: remote.fileName,
          sha256: remote.sha256,
        });
        updatedInspection = replaceInspectionFileReference(updatedInspection, remote.syncFileId, {
          fileId: localFileId,
          syncFileId: remote.syncFileId,
          serverFileId: remote.serverFileId,
          remoteAvailable: true,
        });
        summary.skipped += 1;
        continue;
      }`;

const after = `      const mapped = getLocalFileMapping(inspectionId, remote.syncFileId);
      const existingLocal = localBySyncId.get(remote.syncFileId);
      let mappedLocalRecord = null;
      if (mapped?.localFileId) {
        try {
          mappedLocalRecord = await fileStorage.getFile(mapped.localFileId);
        } catch {
          mappedLocalRecord = null;
        }
      }
      const confirmedLocal = mappedLocalRecord?.id ? mappedLocalRecord : existingLocal;
      if (confirmedLocal?.id) {
        const localFileId = confirmedLocal.id;
        saveLocalFileMapping(inspectionId, remote.syncFileId, {
          localFileId,
          serverFileId: remote.serverFileId,
          fileName: remote.fileName,
          sha256: remote.sha256,
        });
        updatedInspection = replaceInspectionFileReference(updatedInspection, remote.syncFileId, {
          fileId: localFileId,
          syncFileId: remote.syncFileId,
          serverFileId: remote.serverFileId,
          remoteAvailable: true,
        });
        summary.skipped += 1;
        continue;
      }`;

if (!source.includes(before)) {
  throw new Error("No se encontró el bloque de deduplicación de descarga esperado");
}

source = source.replace(before, after);
fs.writeFileSync(runtimePath, source);
console.log("Referencias locales obsoletas controladas correctamente.");
