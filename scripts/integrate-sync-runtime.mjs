import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const appPath = path.resolve(process.cwd(), "src/App.jsx");
let source = fs.readFileSync(appPath, "utf8");

if (source.includes('from "./sync/syncRuntime.js"')) {
  console.log("La sincronización automática ya está integrada en App.jsx.");
  process.exit(0);
}

function replaceExact(label, before, after) {
  if (!source.includes(before)) {
    throw new Error(`No se encontró el bloque esperado: ${label}`);
  }
  source = source.replace(before, after);
}

replaceExact(
  "adaptador de registros",
  `  markInspectionRecordPending,
  migrateInspectionRecords,
} from "./sync/inspectionRecord.js";`,
  `  markInspectionRecordPending,
  migrateInspectionRecords,
  refreshInspectionListSyncMetadata,
} from "./sync/inspectionRecord.js";`,
);

replaceExact(
  "importaciones del runtime",
  `import {
  enqueueSyncOperation,
  removeInspectionQueueItems,
} from "./sync/syncQueue.js";`,
  `import {
  enqueueSyncOperation,
  removeInspectionQueueItems,
} from "./sync/syncQueue.js";
import { clearSyncSession } from "./sync/syncAuth.js";
import {
  isSyncConfigured,
  syncPendingInspections,
} from "./sync/syncRuntime.js";`,
);

replaceExact(
  "estado del runtime",
  `  const [currentId, setCurrentId] = useState(null);
  const skipNextAutoSaveRef = useRef(false);`,
  `  const [currentId, setCurrentId] = useState(null);
  const skipNextAutoSaveRef = useRef(false);
  const syncTimerRef = useRef(null);
  const syncInFlightRef = useRef(false);
  const [syncTrigger, setSyncTrigger] = useState(0);
  const [syncRuntimeState, setSyncRuntimeState] = useState({
    status: "idle",
    total: 0,
    synced: 0,
    conflicts: 0,
    errors: 0,
    message: "",
  });`,
);

replaceExact(
  "efectos de sesión y conectividad",
  `  useEffect(() => {
    setPlanState(normalizeSubscriptionPlan(accountPlan));
  }, [accountPlan]);`,
  `  useEffect(() => {
    setPlanState(normalizeSubscriptionPlan(accountPlan));
  }, [accountPlan]);

  useEffect(() => {
    if (!user) clearSyncSession();
  }, [user]);

  useEffect(() => {
    const handleOnline = () => setSyncTrigger((value) => value + 1);
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);`,
);

replaceExact(
  "efecto de sincronización automática",
  `  // Guardar lista de inspecciones cuando cambie
  useEffect(() => {
    localStorage.setItem("isivolt_inspecciones", JSON.stringify(inspections));
  }, [inspections]);`,
  `  // Guardar lista de inspecciones cuando cambie
  useEffect(() => {
    localStorage.setItem("isivolt_inspecciones", JSON.stringify(inspections));
  }, [inspections]);

  // Sincronizar la cola después de un breve periodo sin cambios y al recuperar Internet.
  useEffect(() => {
    if (!user || !isSyncConfigured()) return undefined;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setSyncRuntimeState((current) => ({
        ...current,
        status: "offline",
        message: "Sin conexión. Los cambios quedan pendientes en el dispositivo.",
      }));
      return undefined;
    }

    window.clearTimeout(syncTimerRef.current);
    const controller = new AbortController();
    syncTimerRef.current = window.setTimeout(async () => {
      if (syncInFlightRef.current) return;
      syncInFlightRef.current = true;
      setSyncRuntimeState((current) => ({ ...current, status: "syncing", message: "Sincronizando..." }));

      try {
        const result = await syncPendingInspections({
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
        });
      } catch (error) {
        if (error?.name !== "AbortError") {
          console.warn("No se pudo completar la sincronización", error);
          setSyncRuntimeState((current) => ({
            ...current,
            status: "error",
            errors: Math.max(1, current.errors || 0),
            message: error?.message || "Error de sincronización",
          }));
        }
      } finally {
        syncInFlightRef.current = false;
      }
    }, 1200);

    return () => {
      window.clearTimeout(syncTimerRef.current);
      controller.abort();
    };
  }, [inspections, user, syncTrigger]);`,
);

fs.writeFileSync(appPath, source);
console.log("Sincronización automática integrada correctamente en src/App.jsx.");
