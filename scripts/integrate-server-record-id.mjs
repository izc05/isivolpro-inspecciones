import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const enginePath = path.resolve(process.cwd(), "src/sync/syncEngine.js");
const mergePath = path.resolve(process.cwd(), "src/sync/remoteMerge.js");
let engine = fs.readFileSync(enginePath, "utf8");
let merge = fs.readFileSync(mergePath, "utf8");

if (!engine.includes("updateSyncMetadata")) {
  engine = engine.replace(
    `  markLocalInspectionSynced,
  markLocalInspectionSyncing,
} from "./localSyncStore.js";`,
    `  markLocalInspectionSynced,
  markLocalInspectionSyncing,
  updateSyncMetadata,
} from "./localSyncStore.js";`,
  );
}

if (!engine.includes("serverRecordId: response.recordId")) {
  const anchor = `      markLocalInspectionSynced(item.localInspectionId, {
        serverRevision: response?.revision || item.revision,
        syncedAt: response?.syncedAt || new Date().toISOString(),
      });`;
  if (!engine.includes(anchor)) {
    throw new Error("No se encontró la confirmación de sincronización en syncEngine.js");
  }
  engine = engine.replace(
    anchor,
    `${anchor}
      if (response?.recordId) {
        updateSyncMetadata(item.localInspectionId, (current) => ({
          ...current,
          serverRecordId: response.recordId,
        }));
      }`,
  );
}

if (!merge.includes("serverRecordId: remote.id")) {
  const anchor = `    inspectionId,
    status: remote.status || current.status,`;
  if (!merge.includes(anchor)) {
    throw new Error("No se encontró el bloque de metadatos remotos en remoteMerge.js");
  }
  merge = merge.replace(
    anchor,
    `    inspectionId,
    serverRecordId: remote.id || current.serverRecordId || "",
    status: remote.status || current.status,`,
  );
}

fs.writeFileSync(enginePath, engine);
fs.writeFileSync(mergePath, merge);
console.log("Identificadores internos de PocketBase integrados en los metadatos locales.");
