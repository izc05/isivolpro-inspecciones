import React, { useEffect, useMemo, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";
import {
  AlertTriangle,
  CheckCircle2,
  Cloud,
  Crosshair,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  WifiOff,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  buildInspectionSyncPayload,
  markInspectionRecordPending,
} from "../sync/inspectionRecord.js";
import { enqueueSyncOperation } from "../sync/syncQueue.js";
import {
  getSyncMetadata,
  markLocalInspectionSynced,
} from "../sync/localSyncStore.js";
import {
  clearSyncSession,
  readSyncSession,
} from "../sync/syncAuth.js";
import {
  isSyncConfigured,
  syncInspectionWorkspace,
} from "../sync/syncRuntime.js";
import { syncWorkspaceFiles } from "../sync/fileSyncRuntime.js";
import {
  AdminClosurePolicyModal,
  InspectionClosureModal,
} from "../closure/ClosureModals.jsx";
import { closeInspectionOnSite } from "../closure/closureRuntime.js";
import {
  loadCompanyClosurePolicy,
  loadInspectionClosureConfig,
  saveCompanyClosurePolicy,
  saveInspectionClosureConfig,
} from "../closure/closureAdminRuntime.js";
import {
  getInstallationClosureLocation,
  readLocalClosurePolicy,
  saveLocalClosurePolicy,
} from "../closure/closurePolicyStore.js";

const EMPTY_SYNC_STATE = Object.freeze({
  status: "idle",
  total: 0,
  synced: 0,
  conflicts: 0,
  errors: 0,
  message: "",
});

function SyncStatusPill({ state, configured, authenticated, onRetry }) {
  if (!configured) return null;

  const status = authenticated ? state.status || "idle" : "account";
  const variants = {
    account: {
      icon: Cloud,
      label: "Inicie sesión para sincronizar",
      tone: "border-slate-700 bg-slate-800 text-white",
    },
    idle: {
      icon: Cloud,
      label: "Sincronización preparada",
      tone: "border-slate-200 bg-white text-slate-700",
    },
    syncing: {
      icon: LoaderCircle,
      label: state.message || "Sincronizando...",
      tone: "border-blue-200 bg-blue-50 text-blue-800",
    },
    synced: {
      icon: CheckCircle2,
      label: state.message || "Todo está al día",
      tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
    },
    offline: {
      icon: WifiOff,
      label: state.message || "Cambios pendientes sin conexión",
      tone: "border-amber-200 bg-amber-50 text-amber-900",
    },
    conflict: {
      icon: AlertTriangle,
      label: state.message || "Cambios que necesitan revisión",
      tone: "border-red-200 bg-red-50 text-red-800",
    },
    error: {
      icon: AlertTriangle,
      label: state.message || "Error de sincronización",
      tone: "border-red-200 bg-red-50 text-red-800",
    },
  };
  const variant = variants[status] || variants.idle;
  const Icon = variant.icon;
  const canRetry = authenticated && status !== "syncing";

  return (
    <button
      type="button"
      onClick={canRetry ? onRetry : undefined}
      className={`fixed bottom-24 right-3 z-[120] flex max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-2xl border px-3 py-2 text-left shadow-lg backdrop-blur print:hidden ${variant.tone} ${canRetry ? "cursor-pointer active:scale-[0.98]" : "cursor-default"}`}
      title={canRetry ? "Comprobar sincronización ahora" : variant.label}
      aria-live="polite"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white/70">
        <Icon className={`h-4 w-4 ${status === "syncing" ? "animate-spin" : ""}`} />
      </span>
      <span className="min-w-0">
        <strong className="block max-w-[260px] truncate text-xs font-black">{variant.label}</strong>
        {canRetry && <small className="block text-[10px] opacity-70">Pulse para comprobar</small>}
      </span>
    </button>
  );
}

function getCurrentInspection(inspections, currentId) {
  return inspections.find((inspection) => inspection.id === currentId) || null;
}

function buildInspectionSnapshot({
  inspection,
  data,
  selectedBlocks,
  responses,
  measurements,
  fieldSheets,
  signatures,
  calculations,
  userId,
}) {
  const currentSync = getSyncMetadata(inspection.id) || inspection.sync;
  return markInspectionRecordPending({
    ...inspection,
    data,
    selectedBlocks,
    responses,
    measurements,
    fieldSheets,
    signatures,
    calculations,
    sync: currentSync,
  }, {
    ownerUserId: userId || "",
  });
}

export default function ConnectedInspectionBridge({
  screen,
  currentId,
  inspections,
  setInspections,
  data,
  setData,
  selectedBlocks,
  responses,
  measurements,
  fieldSheets,
  signatures,
  calculations,
  manualSyncTrigger = 0,
  onSyncStateChange,
}) {
  const { user, profile, openAuth } = useAuth();
  const [syncState, setSyncState] = useState(EMPTY_SYNC_STATE);
  const [syncTrigger, setSyncTrigger] = useState(0);
  const [closurePolicy, setClosurePolicy] = useState(() => readLocalClosurePolicy());
  const [showPolicy, setShowPolicy] = useState(false);
  const [showClosure, setShowClosure] = useState(false);
  const [closureBusy, setClosureBusy] = useState(false);
  const [closureFeedback, setClosureFeedback] = useState(null);
  const syncTimerRef = useRef(null);
  const syncInFlightRef = useRef(false);
  const latestInspectionsRef = useRef(inspections);

  const configured = isSyncConfigured();
  const platform = Capacitor.getPlatform();
  const currentInspection = useMemo(
    () => getCurrentInspection(inspections, currentId),
    [inspections, currentId],
  );
  const installation = useMemo(
    () => getInstallationClosureLocation(data),
    [data],
  );
  const syncSessionRole = readSyncSession()?.record?.role || "";
  const isAdmin = profile?.role === "admin" || syncSessionRole === "admin";
  const canConfigure = Boolean(user) && (isAdmin || !configured);

  useEffect(() => {
    latestInspectionsRef.current = inspections;
  }, [inspections]);

  useEffect(() => {
    onSyncStateChange?.(syncState);
  }, [syncState, onSyncStateChange]);

  useEffect(() => {
    if (!user) clearSyncSession();
  }, [user]);

  useEffect(() => {
    const handleOnline = () => setSyncTrigger((value) => value + 1);
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  useEffect(() => {
    if (!user || !configured) return undefined;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setSyncState((current) => ({
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
      setSyncState((current) => ({
        ...current,
        status: "syncing",
        message: "Sincronizando...",
      }));

      try {
        const workspace = latestInspectionsRef.current;
        const result = await syncInspectionWorkspace({
          firebaseUser: user,
          inspections: workspace,
          activeLocalId: currentId,
          signal: controller.signal,
        });
        const structuredInspections = result.inspections || workspace;
        const fileTransfer = await syncWorkspaceFiles({
          inspections: structuredInspections,
          activeLocalId: currentId,
          firebaseUser: user,
          signal: controller.signal,
        });
        if (fileTransfer.inspections !== workspace) {
          setInspections(fileTransfer.inspections);
        }

        const pullConflicts = Number(result.pull?.conflicts || 0);
        const totalConflicts = Number(result.conflicts || 0) + pullConflicts;
        const received = Number(result.pull?.received || 0);
        const imported = Number(result.pull?.added || 0) + Number(result.pull?.updated || 0);
        const fileErrors = Number(fileTransfer.summary.errors.length || 0);
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
                ? `${transferredFiles} archivo${transferredFiles === 1 ? "" : "s"} sincronizado${transferredFiles === 1 ? "" : "s"}.`
                : imported > 0
                  ? `${imported} cambio${imported === 1 ? "" : "s"} recibido${imported === 1 ? "" : "s"} de otro dispositivo.`
                  : result.total > 0
                    ? "Cambios sincronizados."
                    : "Todo está al día.",
        });
      } catch (error) {
        if (error?.name !== "AbortError") {
          console.warn("No se pudo completar la sincronización", error);
          setSyncState((current) => ({
            ...current,
            status: "error",
            errors: Math.max(1, current.errors || 0),
            message: error?.message || "Error de sincronización",
          }));
        }
      } finally {
        syncInFlightRef.current = false;
      }
    }, 1400);

    return () => {
      window.clearTimeout(syncTimerRef.current);
      controller.abort();
    };
  }, [inspections, user, currentId, configured, syncTrigger, manualSyncTrigger, setInspections]);

  useEffect(() => {
    if (!user || !configured) return undefined;
    const controller = new AbortController();
    loadCompanyClosurePolicy({
      firebaseUser: user,
      signal: controller.signal,
    }).then((policy) => {
      setClosurePolicy(policy);
      saveLocalClosurePolicy(policy);
    }).catch((error) => {
      if (error?.name !== "AbortError" && error?.status !== 403) {
        console.warn("No se pudo cargar la política de cierre", error);
      }
    });
    return () => controller.abort();
  }, [user, configured]);

  const savePolicy = async (nextPolicy) => {
    const localPolicy = saveLocalClosurePolicy(nextPolicy);
    setClosurePolicy(localPolicy);
    setShowPolicy(false);

    if (!user || !configured) return;
    try {
      const remotePolicy = await saveCompanyClosurePolicy({
        firebaseUser: user,
        policy: localPolicy,
      });
      setClosurePolicy(remotePolicy);
      saveLocalClosurePolicy(remotePolicy);
      setSyncState((current) => ({
        ...current,
        status: "synced",
        message: "Política de cierre guardada en el servidor.",
      }));
    } catch (error) {
      setSyncState((current) => ({
        ...current,
        status: "error",
        message: error?.message || "No se pudo guardar la política de cierre.",
      }));
    }
  };

  const openClosure = async () => {
    if (!user) {
      openAuth("login");
      return;
    }
    setClosureFeedback(null);

    if (!currentInspection?.sync?.inspectionId || !configured) {
      setShowClosure(true);
      return;
    }

    setClosureBusy(true);
    try {
      const config = await loadInspectionClosureConfig({
        firebaseUser: user,
        inspection: {
          ...currentInspection,
          sync: getSyncMetadata(currentId) || currentInspection.sync,
        },
      });
      setClosurePolicy(config.policy);
      saveLocalClosurePolicy(config.policy);
      setData((previous) => ({
        ...previous,
        installationLatitude: config.latitude ?? previous.installationLatitude ?? "",
        installationLongitude: config.longitude ?? previous.installationLongitude ?? "",
        closureAllowedRadiusMeters: config.allowedRadiusMeters ?? previous.closureAllowedRadiusMeters ?? config.policy.allowedRadiusMeters,
        closurePolicy: config.policy,
      }));
      const confirmedSync = getSyncMetadata(currentId);
      if (confirmedSync) {
        setInspections((previous) => previous.map((inspection) =>
          inspection.id === currentId ? { ...inspection, sync: confirmedSync } : inspection
        ));
      }
    } catch (error) {
      if (!isAdmin || ![404, 409].includes(Number(error?.status || 0))) {
        setClosureFeedback({
          type: "error",
          message: error?.message || "No se pudo cargar la configuración protegida de cierre.",
        });
      }
    } finally {
      setClosureBusy(false);
      setShowClosure(true);
    }
  };

  const saveInstallationLocally = (nextInstallation) => {
    if (!isAdmin && configured) return;
    setData((previous) => ({
      ...previous,
      installationLatitude: nextInstallation?.latitude ?? "",
      installationLongitude: nextInstallation?.longitude ?? "",
      closureAllowedRadiusMeters: nextInstallation?.allowedRadiusMeters ?? closurePolicy.allowedRadiusMeters,
      closurePolicy,
    }));
  };

  const closeOnSite = async ({ installation: requestedInstallation, overrideReason = "" }) => {
    if (!user) {
      setShowClosure(false);
      openAuth("login");
      return;
    }
    if (!currentInspection || !currentId) {
      setClosureFeedback({ type: "error", message: "No hay una preinspección activa." });
      return;
    }
    if (!configured) {
      setClosureFeedback({
        type: "error",
        message: "El servidor de sincronización todavía no está configurado.",
      });
      return;
    }
    if (syncInFlightRef.current) {
      setClosureFeedback({
        type: "error",
        message: "Hay una sincronización en curso. Vuelva a intentarlo en unos segundos.",
      });
      return;
    }

    setClosureBusy(true);
    setClosureFeedback(null);
    syncInFlightRef.current = true;

    try {
      const nextData = {
        ...data,
        ...(isAdmin ? {
          installationLatitude: requestedInstallation?.latitude ?? "",
          installationLongitude: requestedInstallation?.longitude ?? "",
          closureAllowedRadiusMeters: requestedInstallation?.allowedRadiusMeters ?? closurePolicy.allowedRadiusMeters,
          closurePolicy,
        } : {}),
      };
      if (isAdmin) setData(nextData);

      const localSnapshot = buildInspectionSnapshot({
        inspection: currentInspection,
        data: nextData,
        selectedBlocks,
        responses,
        measurements,
        fieldSheets,
        signatures,
        calculations,
        userId: user.uid,
      });
      const nextInspections = inspections.map((inspectionItem) =>
        inspectionItem.id === currentId ? localSnapshot : inspectionItem
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
      const totalConflicts = Number(syncResult.conflicts || 0) + Number(syncResult.pull?.conflicts || 0);
      if (syncResult.skipped) throw new Error("El servidor de sincronización no está disponible.");
      if (totalConflicts > 0) throw new Error("La preinspección cambió en otro dispositivo y necesita revisión.");
      if (Number(syncResult.errors || 0) > 0) throw new Error("No se sincronizaron todos los cambios antes del cierre.");

      let synchronizedList = syncResult.inspections || nextInspections;
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
      let synchronizedInspection = getCurrentInspection(synchronizedList, currentId);
      if (!synchronizedInspection) throw new Error("No se recuperó la preinspección sincronizada.");

      let effectiveInstallation;
      let effectivePolicy;
      if (isAdmin) {
        const config = await saveInspectionClosureConfig({
          firebaseUser: user,
          inspection: {
            ...synchronizedInspection,
            sync: getSyncMetadata(currentId) || synchronizedInspection.sync,
          },
          installation: requestedInstallation,
          policy: closurePolicy,
        });
        effectiveInstallation = {
          latitude: config.latitude,
          longitude: config.longitude,
          allowedRadiusMeters: config.allowedRadiusMeters,
        };
        effectivePolicy = config.policy;
      } else {
        const config = await loadInspectionClosureConfig({
          firebaseUser: user,
          inspection: {
            ...synchronizedInspection,
            sync: getSyncMetadata(currentId) || synchronizedInspection.sync,
          },
        });
        effectiveInstallation = {
          latitude: config.latitude,
          longitude: config.longitude,
          allowedRadiusMeters: config.allowedRadiusMeters,
        };
        effectivePolicy = config.policy;
      }

      const configuredSync = getSyncMetadata(currentId) || synchronizedInspection.sync;
      synchronizedInspection = {
        ...synchronizedInspection,
        sync: configuredSync,
        data: {
          ...synchronizedInspection.data,
          installationLatitude: effectiveInstallation.latitude,
          installationLongitude: effectiveInstallation.longitude,
          closureAllowedRadiusMeters: effectiveInstallation.allowedRadiusMeters,
          closurePolicy: effectivePolicy,
        },
      };
      synchronizedList = synchronizedList.map((inspectionItem) =>
        inspectionItem.id === currentId ? synchronizedInspection : inspectionItem
      );
      setInspections(synchronizedList);
      setData(synchronizedInspection.data);
      setClosurePolicy(effectivePolicy);
      saveLocalClosurePolicy(effectivePolicy);

      const closure = await closeInspectionOnSite({
        inspection: synchronizedInspection,
        installation: effectiveInstallation,
        policy: effectivePolicy,
        geolocation: Geolocation,
        firebaseUser: user,
        platform,
        overrideReason,
      });
      const confirmedSync = getSyncMetadata(currentId) || synchronizedInspection.sync;
      setInspections((previous) => previous.map((inspectionItem) =>
        inspectionItem.id === currentId
          ? {
              ...inspectionItem,
              sync: confirmedSync,
              status: "Cerrada",
              closedAt: closure.response?.closedAt || new Date().toISOString(),
              closureResult: closure.response?.result || closure.event?.result,
            }
          : inspectionItem
      ));
      setClosureFeedback({
        type: "success",
        message: closure.response?.result === "OVERRIDDEN"
          ? "Preinspección cerrada mediante excepción administrativa."
          : "Preinspección cerrada y ubicación validada correctamente.",
        evidence: closure.response?.evidence || closure.location?.evidence || null,
      });
      setSyncState({
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
      setClosureFeedback({
        type: "error",
        message: error?.code === "SYNC_USER_NOT_PROVISIONED"
          ? "La cuenta todavía no está habilitada en el servidor IsiVoltPro."
          : error?.message || "No se pudo completar el cierre presencial.",
        evidence: error?.location?.evidence || null,
      });
    } finally {
      syncInFlightRef.current = false;
      setClosureBusy(false);
    }
  };

  return (
    <>
      <SyncStatusPill
        state={syncState}
        configured={configured}
        authenticated={Boolean(user)}
        onRetry={() => setSyncTrigger((value) => value + 1)}
      />

      {screen === "settings" && canConfigure && (
        <button
          type="button"
          onClick={() => setShowPolicy(true)}
          className="fixed bottom-24 left-1/2 z-[118] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center justify-center gap-2 rounded-2xl bg-[#071E3D] px-4 py-3.5 text-sm font-black text-white shadow-xl print:hidden"
        >
          <ShieldCheck className="h-5 w-5 text-[#FFC928]" /> Configurar cierre presencial
        </button>
      )}

      {screen === "report" && currentId && (
        <button
          type="button"
          onClick={openClosure}
          className="fixed bottom-5 left-1/2 z-[118] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center justify-center gap-2 rounded-2xl bg-[#071E3D] px-4 py-3.5 text-sm font-black text-white shadow-2xl print:hidden"
        >
          <Crosshair className="h-5 w-5 text-[#FFC928]" /> Cerrar en la instalación
        </button>
      )}

      <AdminClosurePolicyModal
        open={showPolicy}
        policy={closurePolicy}
        onClose={() => setShowPolicy(false)}
        onSave={savePolicy}
      />
      <InspectionClosureModal
        open={showClosure}
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
        installation={installation}
        platform={platform}
        busy={closureBusy}
        feedback={closureFeedback}
        isAdmin={isAdmin || !configured}
        onClose={() => {
          setShowClosure(false);
          setClosureFeedback(null);
        }}
        onSaveInstallation={saveInstallationLocally}
        onConfirm={closeOnSite}
      />
    </>
  );
}
