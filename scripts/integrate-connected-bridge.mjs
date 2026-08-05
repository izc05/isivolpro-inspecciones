import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const appPath = path.resolve(process.cwd(), "src/App.jsx");
let source = fs.readFileSync(appPath, "utf8");

const importLine = 'import ConnectedInspectionBridge from "./integration/ConnectedInspectionBridge.jsx";';
if (!source.includes(importLine)) {
  const anchor = 'import { CHECKLIST } from "./data/checklistRebt2002";';
  if (!source.includes(anchor)) {
    throw new Error("No se encontró el ancla de importación CHECKLIST");
  }
  source = source.replace(anchor, `${anchor}\n${importLine}`);
}

const oldSyncComment = "  // Sincronizar la cola después de un breve periodo sin cambios y al recuperar Internet.";
const oldSyncStart = source.indexOf(oldSyncComment);
if (oldSyncStart >= 0) {
  const dependencyCandidates = [
    "  }, [inspections, user, currentId, syncTrigger]);",
    "  }, [inspections, user, syncTrigger]);",
  ];
  let oldSyncEnd = -1;
  let matchedDependency = "";
  for (const candidate of dependencyCandidates) {
    const index = source.indexOf(candidate, oldSyncStart);
    if (index >= 0 && (oldSyncEnd < 0 || index < oldSyncEnd)) {
      oldSyncEnd = index;
      matchedDependency = candidate;
    }
  }
  if (oldSyncEnd < 0) {
    throw new Error("No se encontró el final del efecto antiguo de sincronización");
  }
  oldSyncEnd += matchedDependency.length;
  source = `${source.slice(0, oldSyncStart)}  // La sincronización bidireccional se gestiona en ConnectedInspectionBridge.\n${source.slice(oldSyncEnd)}`;
}

if (source.includes("function SyncStatusPill(")) {
  const start = source.indexOf("function SyncStatusPill(");
  const end = source.indexOf("function EmptyState(", start);
  if (end < 0) throw new Error("No se pudo aislar el indicador antiguo de sincronización");
  source = `${source.slice(0, start)}${source.slice(end)}`;
}

source = source.replace(/\s*\{screen !== "report" && \(\s*<SyncStatusPill[\s\S]*?<\/SyncStatusPill>\s*\)\}\s*/g, "\n");

const bridgeMarker = "<ConnectedInspectionBridge";
if (!source.includes(bridgeMarker)) {
  const bottomNavAnchor = '{screen !== "report" && <BottomNav screen={screen} setScreen={setScreen} onReportClick={openReportReview} />}';
  if (!source.includes(bottomNavAnchor)) {
    throw new Error("No se encontró el ancla BottomNav para montar el puente conectado");
  }
  const bridge = `        <ConnectedInspectionBridge
          screen={screen}
          currentId={currentId}
          inspections={inspections}
          setInspections={setInspections}
          data={data}
          setData={setData}
          selectedBlocks={selectedBlocks}
          responses={responses}
          measurements={measurements}
          fieldSheets={fieldSheets}
          signatures={signatures}
          calculations={calculations}
        />\n        `;
  source = source.replace(bottomNavAnchor, `${bridge}${bottomNavAnchor}`);
}

fs.writeFileSync(appPath, source);
console.log("ConnectedInspectionBridge montado correctamente en src/App.jsx.");
