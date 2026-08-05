import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const appPath = path.resolve(process.cwd(), "src/App.jsx");
let source = fs.readFileSync(appPath, "utf8");

if (source.includes("syncInspectionWorkspace")) {
  console.log("La descarga y unión remota ya están integradas en App.jsx.");
  process.exit(0);
}

function replaceExact(label, before, after) {
  if (!source.includes(before)) {
    throw new Error(`No se encontró el bloque esperado: ${label}`);
  }
  source = source.replace(before, after);
}

replaceExact(
  "importación del adaptador local",
  `  markInspectionRecordPending,
  migrateInspectionRecords,
  refreshInspectionListSyncMetadata,
} from "./sync/inspectionRecord.js";`,
  `  markInspectionRecordPending,
  migrateInspectionRecords,
} from "./sync/inspectionRecord.js";`,
);

replaceExact(
  "importación del runtime completo",
  `import {
  isSyncConfigured,
  syncPendingInspections,
} from "./sync/syncRuntime.js";`,
  `import {
  isSyncConfigured,
  syncInspectionWorkspace,
} from "./sync/syncRuntime.js";`,
);

replaceExact(
  "ejecución de sincronización",
  `        const result = await syncPendingInspections({
          firebaseUser: user,
          signal: controller.signal,
        });
        if (result.synced > 0) {
          setInspections((previous) => refreshInspectionListSyncMetadata(previous));
        }
        setSyncRuntimeState({
          status: result.conflicts > 0 ? "conflict" : result.errors > 0 ? "error" : "synced",
          total: result.total,
          synced: result.synced,
          conflicts: result.conflicts,
          errors: result.errors,
          message: result.conflicts > 0
            ? "Hay cambios que necesitan revisión."
            : result.errors > 0
              ? "No se pudieron enviar todos los cambios."
              : result.total > 0
                ? "Cambios sincronizados."
                : "Todo está al día.",
        });`,
  `        const result = await syncInspectionWorkspace({
          firebaseUser: user,
          inspections,
          activeLocalId: currentId,
          signal: controller.signal,
        });
        if (result.inspections !== inspections) {
          setInspections(result.inspections);
        }
        const pullConflicts = Number(result.pull?.conflicts || 0);
        const totalConflicts = Number(result.conflicts || 0) + pullConflicts;
        const received = Number(result.pull?.received || 0);
        const imported = Number(result.pull?.added || 0) + Number(result.pull?.updated || 0);
        setSyncRuntimeState({
          status: totalConflicts > 0 ? "conflict" : result.errors > 0 ? "error" : "synced",
          total: Number(result.total || 0) + received,
          synced: result.synced,
          conflicts: totalConflicts,
          errors: result.errors,
          message: totalConflicts > 0
            ? "Hay cambios de otro dispositivo que necesitan revisión."
            : result.errors > 0
              ? "No se pudieron sincronizar todos los cambios."
              : imported > 0
                ? `${imported} cambio${imported === 1 ? "" : "s"} recibido${imported === 1 ? "" : "s"} de otro dispositivo.`
                : result.total > 0
                  ? "Cambios sincronizados."
                  : "Todo está al día.",
        });`,
);

replaceExact(
  "dependencias del efecto",
  "  }, [inspections, user, syncTrigger]);",
  "  }, [inspections, user, currentId, syncTrigger]);",
);

fs.writeFileSync(appPath, source);
console.log("Descarga y unión remota integradas correctamente en src/App.jsx.");
