import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const appPath = path.resolve(process.cwd(), "src/App.jsx");
let source = fs.readFileSync(appPath, "utf8");

if (source.includes("handleCloseInspectionOnSite")) {
  console.log("La interfaz de cierre GPS ya está integrada en App.jsx.");
  process.exit(0);
}

function replaceExact(label, before, after) {
  if (!source.includes(before)) {
    throw new Error(`No se encontró el bloque esperado: ${label}`);
  }
  source = source.replace(before, after);
}

replaceExact(
  "plugin Geolocation",
  'import { Share } from "@capacitor/share";',
  'import { Share } from "@capacitor/share";\nimport { Geolocation } from "@capacitor/geolocation";',
);

replaceExact(
  "importaciones de cierre",
  'import { clearSyncSession } from "./sync/syncAuth.js";',
  `import { clearSyncSession } from "./sync/syncAuth.js";
import { getSyncMetadata } from "./sync/localSyncStore.js";
import {
  AdminClosurePolicyModal,
  InspectionClosureModal,
} from "./closure/ClosureModals.jsx";
import { closeInspectionOnSite } from "./closure/closureRuntime.js";
import {
  getInstallationClosureLocation,
  readLocalClosurePolicy,
  saveLocalClosurePolicy,
} from "./closure/closurePolicyStore.js";`,
);

replaceExact(
  "usuario y perfil",
  '  const { plan: accountPlan, user, openAuth } = useAuth();',
  '  const { plan: accountPlan, user, profile, openAuth } = useAuth();',
);

replaceExact(
  "estado de política de cierre",
  '  const [companySettings, setCompanySettingsState] = useState(DEFAULT_COMPANY_SETTINGS);',
  `  const [companySettings, setCompanySettingsState] = useState(DEFAULT_COMPANY_SETTINGS);
  const [closurePolicy, setClosurePolicy] = useState(() => readLocalClosurePolicy());
  const [showClosureSettings, setShowClosureSettings] = useState(false);
  const [showClosureModal, setShowClosureModal] = useState(false);
  const [closureBusy, setClosureBusy] = useState(false);
  const [closureFeedback, setClosureFeedback] = useState(null);`,
);

replaceExact(
  "persistencia de política de cierre",
  `  useEffect(() => {
    localStorage.setItem(PLAN_STORAGE_KEY, normalizeSubscriptionPlan(plan));
  }, [plan]);`,
  `  useEffect(() => {
    localStorage.setItem(PLAN_STORAGE_KEY, normalizeSubscriptionPlan(plan));
  }, [plan]);

  useEffect(() => {
    saveLocalClosurePolicy(closurePolicy);
  }, [closurePolicy]);`,
);

replaceExact(
  "controladores de cierre",
  '  const currentInspection = inspections.find((inspection) => inspection.id === currentId);',
  `  const currentInspection = inspections.find((inspection) => inspection.id === currentId);
  const closurePlatform = Capacitor.getPlatform();
  const canConfigureClosure = Boolean(user);
  const currentClosureInstallation = getInstallationClosureLocation(data);

  const saveClosureInstallation = (installation) => {
    setData((previous) => ({
      ...previous,
      installationLatitude: installation?.latitude ?? "",
      installationLongitude: installation?.longitude ?? "",
      closureAllowedRadiusMeters: installation?.allowedRadiusMeters ?? closurePolicy.allowedRadiusMeters,
      closurePolicy,
    }));
  };

  const handleCloseInspectionOnSite = async ({ installation, overrideReason = "" }) => {
    if (!user) {
      setShowClosureModal(false);
      openAuth("login");
      return;
    }
    if (!currentInspection || !currentId) {
      setClosureFeedback({ type: "error", message: "No hay una preinspección activa." });
      return;
    }
    if (syncInFlightRef.current) {
      setClosureFeedback({ type: "error", message: "Hay una sincronización en curso. Vuelva a intentarlo en unos segundos." });
      return;
    }

    setClosureBusy(true);
    setClosureFeedback(null);
    syncInFlightRef.current = true;

    try {
      const nextData = {
        ...data,
        installationLatitude: installation?.latitude ?? "",
        installationLongitude: installation?.longitude ?? "",
        closureAllowedRadiusMeters: installation?.allowedRadiusMeters ?? closurePolicy.allowedRadiusMeters,
        closurePolicy,
      };
      setData(nextData);

      const localSnapshot = markInspectionRecordPending({
        ...currentInspection,
        data: nextData,
        selectedBlocks,
        responses,
        measurements,
        fieldSheets,
        signatures,
        calculations,
        sync: getSyncMetadata(currentId) || currentInspection.sync,
      }, {
        ownerUserId: user.uid || "",
      });
      const nextInspections = inspections.map((inspection) =>
        inspection.id === currentId ? localSnapshot : inspection
      );
      enqueueSyncOperation({
        inspectionId: localSnapshot.sync.inspectionId,
        localInspectionId: localSnapshot.id,
        revision: localSnapshot.sync.localRevision || localSnapshot.sync.revision,
        payload: buildInspectionSyncPayload(localSnapshot),
      });
      setInspections(nextInspections);

      const syncResult = await syncInspectionWorkspace({
        firebaseUser: user,
        inspections: nextInspections,
        activeLocalId: null,
      });
      if (syncResult.skipped) {
        throw Object.assign(new Error("El servidor de sincronización todavía no está configurado."), {
          code: syncResult.reason,
        });
      }
      const totalConflicts = Number(syncResult.conflicts || 0) + Number(syncResult.pull?.conflicts || 0);
      if (totalConflicts > 0) {
        throw Object.assign(new Error("La preinspección ha cambiado en otro dispositivo y necesita revisión."), {
          code: "REVISION_CONFLICT",
        });
      }
      if (Number(syncResult.errors || 0) > 0) {
        throw Object.assign(new Error("No se pudieron sincronizar todos los cambios antes del cierre."), {
          code: "SYNC_BEFORE_CLOSE_FAILED",
        });
      }

      const synchronizedList = syncResult.inspections || nextInspections;
      setInspections(synchronizedList);
      const synchronizedInspection = synchronizedList.find((inspection) => inspection.id === currentId);
      if (!synchronizedInspection) {
        throw new Error("No se pudo recuperar la preinspección sincronizada.");
      }

      const closure = await closeInspectionOnSite({
        inspection: synchronizedInspection,
        installation,
        policy: closurePolicy,
        geolocation: Geolocation,
        firebaseUser: user,
        platform: closurePlatform,
        overrideReason,
      });
      const confirmedSync = getSyncMetadata(currentId) || synchronizedInspection.sync;
      setInspections((previous) => previous.map((inspection) =>
        inspection.id === currentId
          ? {
              ...inspection,
              sync: confirmedSync,
              status: "Cerrada",
              closedAt: closure.response?.closedAt || new Date().toISOString(),
              closureResult: closure.response?.result || closure.event?.result,
            }
          : inspection
      ));
      setClosureFeedback({
        type: "success",
        message: closure.response?.result === "OVERRIDDEN"
          ? "Preinspección cerrada mediante excepción administrativa."
          : "Preinspección cerrada y ubicación validada correctamente.",
        evidence: closure.response?.evidence || closure.location?.evidence || null,
      });
      setSyncRuntimeState({
        status: "synced",
        total: 1,
        synced: 1,
        conflicts: 0,
        errors: 0,
        message: "Cierre confirmado por el servidor.",
      });
      setSyncTrigger((value) => value + 1);
    } catch (error) {
      console.error("No se pudo cerrar la preinspección", error);
      const message = error?.code === "SYNC_USER_NOT_PROVISIONED"
        ? "La cuenta todavía no está habilitada en el servidor IsiVoltPro."
        : error?.message || "No se pudo completar el cierre presencial.";
      setClosureFeedback({
        type: "error",
        message,
        evidence: error?.location?.evidence || null,
      });
    } finally {
      syncInFlightRef.current = false;
      setClosureBusy(false);
    }
  };`,
);

const settingsLine = '        {screen === "settings" && <SettingsScreen plan={plan} setPlan={setPlan} setScreen={setScreen} legalAccepted={legalAccepted} legalAcceptedAt={legalAcceptedAt} onAcceptLegal={acceptLegal} generatedReportsCount={generatedReportsCount} customReportTitle={customReportTitle} setCustomReportTitle={setCustomReportTitle} companySettings={companySettings} setCompanySettings={setCompanySettings} theme={theme} setTheme={setTheme} checklistOverrides={checklistOverrides} setChecklistOverrides={setChecklistOverrides} customChecklistItems={customChecklistItems} />}';
replaceExact(
  "acceso administrativo al cierre",
  settingsLine,
  `${settingsLine}
        {screen === "settings" && canConfigureClosure && (
          <button
            type="button"
            onClick={() => setShowClosureSettings(true)}
            className="fixed bottom-24 left-1/2 z-[115] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center justify-center gap-2 rounded-2xl bg-[#071E3D] px-4 py-3.5 text-sm font-black text-white shadow-xl print:hidden"
          >
            <ShieldCheck className="h-5 w-5 text-[#FFC928]" /> Configurar cierre presencial
          </button>
        )}`,
);

replaceExact(
  "botón de cierre en informe",
  '        {screen !== "report" && <BottomNav screen={screen} setScreen={setScreen} onReportClick={openReportReview} />}',
  `        {screen === "report" && currentId && (
          <button
            type="button"
            onClick={() => {
              if (!user) {
                openAuth("login");
                return;
              }
              setClosureFeedback(null);
              setShowClosureModal(true);
            }}
            className="fixed bottom-5 left-1/2 z-[115] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center justify-center gap-2 rounded-2xl bg-[#071E3D] px-4 py-3.5 text-sm font-black text-white shadow-2xl print:hidden"
          >
            <Crosshair className="h-5 w-5 text-[#FFC928]" /> Cerrar en la instalación
          </button>
        )}
        {screen !== "report" && <BottomNav screen={screen} setScreen={setScreen} onReportClick={openReportReview} />}`,
);

replaceExact(
  "modales de cierre",
  `        {showFinalReview && (`,
  `        <AdminClosurePolicyModal
          open={showClosureSettings}
          policy={closurePolicy}
          onClose={() => setShowClosureSettings(false)}
          onSave={(nextPolicy) => {
            const savedPolicy = saveLocalClosurePolicy(nextPolicy);
            setClosurePolicy(savedPolicy);
            setData((previous) => ({ ...previous, closurePolicy: savedPolicy }));
            setShowClosureSettings(false);
          }}
        />
        <InspectionClosureModal
          open={showClosureModal}
          inspection={currentInspection ? {
            ...currentInspection,
            data,
            selectedBlocks,
            responses,
            measurements,
            fieldSheets,
            signatures,
            calculations,
            sync: getSyncMetadata(currentId) || currentInspection.sync,
          } : null}
          policy={closurePolicy}
          installation={currentClosureInstallation}
          platform={closurePlatform}
          busy={closureBusy}
          feedback={closureFeedback}
          isAdmin={canConfigureClosure}
          onClose={() => {
            setShowClosureModal(false);
            setClosureFeedback(null);
          }}
          onSaveInstallation={saveClosureInstallation}
          onConfirm={handleCloseInspectionOnSite}
        />
        {showFinalReview && (`,
);

fs.writeFileSync(appPath, source);
console.log("Interfaz administrativa y cierre GPS integrados correctamente en src/App.jsx.");
