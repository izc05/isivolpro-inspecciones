import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const bridgePath = path.resolve(
  process.cwd(),
  "src/integration/ConnectedInspectionBridge.jsx",
);
let source = fs.readFileSync(bridgePath, "utf8");

if (!source.includes('from "../sync/fileSyncRuntime.js"')) {
  const importAnchor = `import {
  isSyncConfigured,
  syncInspectionWorkspace,
} from "../sync/syncRuntime.js";`;
  if (!source.includes(importAnchor)) {
    throw new Error("No se encontró el runtime estructurado en ConnectedInspectionBridge");
  }
  source = source.replace(
    importAnchor,
    `${importAnchor}
import { syncWorkspaceFiles } from "../sync/fileSyncRuntime.js";`,
  );
}

if (!source.includes("fileTransfer = await syncWorkspaceFiles")) {
  const autoAnchor = `        if (result.inspections !== workspace) {
          setInspections(result.inspections);
        }

        const pullConflicts = Number(result.pull?.conflicts || 0);`;
  if (!source.includes(autoAnchor)) {
    throw new Error("No se encontró el bloque automático de sincronización");
  }
  source = source.replace(
    autoAnchor,
    `        const structuredInspections = result.inspections || workspace;
        const fileTransfer = await syncWorkspaceFiles({
          inspections: structuredInspections,
          activeLocalId: currentId,
          firebaseUser: user,
          signal: controller.signal,
        });
        if (fileTransfer.inspections !== workspace) {
          setInspections(fileTransfer.inspections);
        }

        const pullConflicts = Number(result.pull?.conflicts || 0);`,
  );

  const stateAnchor = `        setSyncState({
          status: totalConflicts > 0 ? "conflict" : result.errors > 0 ? "error" : "synced",
          total: Number(result.total || 0) + received,
          synced: Number(result.synced || 0),
          conflicts: totalConflicts,
          errors: Number(result.errors || 0),
          message: totalConflicts > 0
            ? "Hay cambios de otro dispositivo que necesitan revisión."
            : result.errors > 0
              ? "No se pudieron sincronizar todos los cambios."
              : imported > 0
                ? \`\${imported} cambio\${imported === 1 ? "" : "s"} recibido\${imported === 1 ? "" : "s"} de otro dispositivo.\`
                : result.total > 0
                  ? "Cambios sincronizados."
                  : "Todo está al día.",
        });`;
  if (!source.includes(stateAnchor)) {
    throw new Error("No se encontró el estado automático de sincronización");
  }
  source = source.replace(
    stateAnchor,
    `        const fileErrors = Number(fileTransfer.summary.errors.length || 0);
        const transferredFiles = Number(fileTransfer.summary.uploaded || 0) + Number(fileTransfer.summary.downloaded || 0);
        setSyncState({
          status: totalConflicts > 0
            ? "conflict"
            : Number(result.errors || 0) + fileErrors > 0
              ? "error"
              : "synced",
          total: Number(result.total || 0) + received + Number(fileTransfer.summary.inspected || 0),
          synced: Number(result.synced || 0) + transferredFiles,
          conflicts: totalConflicts,
          errors: Number(result.errors || 0) + fileErrors,
          message: totalConflicts > 0
            ? "Hay cambios de otro dispositivo que necesitan revisión."
            : Number(result.errors || 0) + fileErrors > 0
              ? "No se pudieron sincronizar todos los datos o archivos."
              : transferredFiles > 0
                ? \`\${transferredFiles} archivo\${transferredFiles === 1 ? "" : "s"} sincronizado\${transferredFiles === 1 ? "" : "s"}.\`
                : imported > 0
                  ? \`\${imported} cambio\${imported === 1 ? "" : "s"} recibido\${imported === 1 ? "" : "s"} de otro dispositivo.\`
                  : result.total > 0
                    ? "Cambios sincronizados."
                    : "Todo está al día.",
        });`,
  );
}

if (!source.includes("closureFileTransfer = await syncWorkspaceFiles")) {
  const closeAnchor = `      let synchronizedList = syncResult.inspections || nextInspections;
      setInspections(synchronizedList);
      let synchronizedInspection = getCurrentInspection(synchronizedList, currentId);`;
  if (!source.includes(closeAnchor)) {
    throw new Error("No se encontró el bloque previo al cierre presencial");
  }
  source = source.replace(
    closeAnchor,
    `      let synchronizedList = syncResult.inspections || nextInspections;
      const closureFileTransfer = await syncWorkspaceFiles({
        inspections: synchronizedList,
        activeLocalId: null,
        firebaseUser: user,
      });
      if (closureFileTransfer.summary.errors.length > 0) {
        throw Object.assign(
          new Error("No se pudieron sincronizar todas las fotografías o documentos antes del cierre."),
          {
            code: "FILE_SYNC_BEFORE_CLOSE_FAILED",
            fileErrors: closureFileTransfer.summary.errors,
          },
        );
      }
      synchronizedList = closureFileTransfer.inspections;
      setInspections(synchronizedList);
      let synchronizedInspection = getCurrentInspection(synchronizedList, currentId);`,
  );
}

fs.writeFileSync(bridgePath, source);
console.log("Sincronización protegida de archivos integrada en ConnectedInspectionBridge.");
