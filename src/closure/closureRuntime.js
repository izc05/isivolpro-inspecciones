import { Capacitor } from "@capacitor/core";
import {
  buildClosureEvent,
  validateClosureRequirements,
  validateOnSiteLocation,
} from "./onSiteClosure.js";
import { captureCurrentLocation } from "./locationCapture.js";
import { getDeviceId, markLocalInspectionSynced } from "../sync/localSyncStore.js";
import {
  ensureSyncSession,
  getSyncAccessToken,
} from "../sync/syncAuth.js";
import { createSyncApiClient } from "../sync/syncApiClient.js";

function countInspectionPhotos(inspection) {
  const ids = new Set();
  const responses = inspection?.responses || {};
  Object.entries(responses).forEach(([responseId, response]) => {
    (response?.photos || []).forEach((photo, index) => {
      ids.add(String(photo?.fileId || photo?.id || photo?.fileName || `${responseId}-${index}`));
    });
  });

  (inspection?.fieldSheets || []).forEach((sheet, index) => {
    const photo = sheet?.photo;
    if (photo) ids.add(String(photo.fileId || photo.id || photo.fileName || `field-${index}`));
  });

  (inspection?.data?.attachments || []).forEach((file, index) => {
    if (!String(file?.mimeType || "").startsWith("image/")) return;
    ids.add(String(file.fileId || file.id || file.fileName || `attachment-${index}`));
  });

  return ids.size;
}

export function getClosureReadiness({ inspection, policy, platform } = {}) {
  const signatures = inspection?.signatures || {};
  return validateClosureRequirements({
    policy,
    platform,
    inspectorSigned: Boolean(signatures.inspector),
    clientSigned: Boolean(signatures.client),
    photoCount: countInspectionPhotos(inspection),
    synchronized: inspection?.sync?.syncStatus === "SYNCED",
  });
}

export async function closeInspectionOnSite({
  inspection,
  installation,
  policy,
  geolocation,
  firebaseUser,
  baseUrl,
  fetchImpl = globalThis.fetch,
  platform = Capacitor.getPlatform(),
  overrideReason = "",
} = {}) {
  if (!inspection?.sync?.inspectionId) {
    throw Object.assign(new Error("La preinspección no tiene un identificador sincronizable"), {
      code: "INSPECTION_NOT_SYNC_READY",
    });
  }
  if (!firebaseUser) {
    throw Object.assign(new Error("Se necesita una cuenta autenticada para cerrar"), {
      code: "SYNC_USER_NOT_AUTHENTICATED",
    });
  }

  const readiness = getClosureReadiness({ inspection, policy, platform });
  const wantsOverride = Boolean(String(overrideReason || "").trim());
  if (!readiness.valid && !wantsOverride) {
    const error = new Error("Faltan requisitos obligatorios para cerrar la preinspección");
    error.code = "CLOSURE_REQUIREMENTS_NOT_MET";
    error.requirements = readiness;
    throw error;
  }

  let position = null;
  let location = validateOnSiteLocation({ policy, installation, position });
  if (readiness.policy.requireLocation) {
    position = await captureCurrentLocation({ geolocation, platform });
    location = validateOnSiteLocation({ policy, installation, position });
    if (!location.valid && !wantsOverride) {
      const error = new Error(
        location.result === "INSUFFICIENT_ACCURACY"
          ? "La precisión del GPS no es suficiente para cerrar"
          : location.result === "OUTSIDE_RADIUS"
            ? "El dispositivo está fuera del radio permitido"
            : "No se pudo validar la ubicación del cierre",
      );
      error.code = location.code || "CLOSURE_LOCATION_INVALID";
      error.location = location;
      throw error;
    }
  }

  await ensureSyncSession({
    firebaseUser,
    baseUrl,
    fetchImpl,
  });

  const event = buildClosureEvent({
    inspectionId: inspection.sync.inspectionId,
    userId: firebaseUser.uid || "",
    deviceId: getDeviceId(),
    platform,
    requirements: readiness,
    location,
    overrideReason,
  });
  const client = createSyncApiClient({
    baseUrl,
    fetchImpl,
    getAccessToken: getSyncAccessToken,
  });
  const response = await client.closeInspection(
    inspection.sync.inspectionId,
    {
      baseRevision: Number(inspection.sync.serverRevision || 0),
      deviceId: event.deviceId,
      platform,
      evidence: event.evidence || {},
      overrideReason: event.overrideReason || "",
      capturedAtDevice: event.capturedAtDevice,
    },
  );

  markLocalInspectionSynced(inspection.id, {
    serverRevision: response?.revision,
    syncedAt: response?.closedAt || new Date().toISOString(),
  });

  return {
    response,
    event,
    readiness,
    location,
  };
}
