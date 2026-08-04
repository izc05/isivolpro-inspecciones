const CLOSURE_DEFAULTS = {
  allowCloseFromWeb: true,
  requireMobileClose: false,
  requireLocation: false,
  allowedRadiusMeters: 100,
  maximumAccuracyMeters: 50,
  requireInspectorSignature: true,
  requireClientSignature: false,
  minimumPhotoCount: 0,
  requireServerSyncBeforeClose: false,
  allowAdminOverride: true,
};

function closureRequireUser(e) {
  if (!e.auth || e.auth.collection().name !== "users") {
    throw new UnauthorizedError("Se necesita una cuenta IsiVoltPro válida");
  }
  if (!e.auth.getBool("active")) {
    throw new ForbiddenError("La cuenta está desactivada");
  }
  const companyId = e.auth.getString("company");
  if (!companyId) {
    throw new ForbiddenError("La cuenta no tiene una empresa asignada");
  }
  return {
    userId: e.auth.id,
    companyId,
    role: e.auth.getString("role"),
  };
}

function closureObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function mergeClosurePolicy(companyPolicy, installationPolicy) {
  return Object.assign(
    {},
    CLOSURE_DEFAULTS,
    closureObject(companyPolicy),
    closureObject(installationPolicy),
  );
}

function closureFinite(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function validLatitude(value) {
  const number = closureFinite(value);
  return number !== null && number >= -90 && number <= 90;
}

function validLongitude(value) {
  const number = closureFinite(value);
  return number !== null && number >= -180 && number <= 180;
}

function radians(value) {
  return value * Math.PI / 180;
}

function distanceMeters(pointA, pointB) {
  const earthRadius = 6371000;
  const latA = radians(Number(pointA.latitude));
  const latB = radians(Number(pointB.latitude));
  const latDelta = radians(Number(pointB.latitude) - Number(pointA.latitude));
  const lonDelta = radians(Number(pointB.longitude) - Number(pointA.longitude));
  const haversine = Math.sin(latDelta / 2) ** 2 +
    Math.cos(latA) * Math.cos(latB) * Math.sin(lonDelta / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function countPayloadPhotos(payload) {
  const ids = {};
  const responses = closureObject(payload.responses);
  Object.keys(responses).forEach((key) => {
    const photos = Array.isArray(responses[key] && responses[key].photos)
      ? responses[key].photos
      : [];
    photos.forEach((photo, index) => {
      const id = String((photo && (photo.fileId || photo.id || photo.fileName)) || `${key}-${index}`);
      ids[id] = true;
    });
  });

  const fieldSheets = Array.isArray(payload.fieldSheets) ? payload.fieldSheets : [];
  fieldSheets.forEach((sheet, index) => {
    if (!sheet || !sheet.photo) return;
    const photo = sheet.photo;
    const id = String(photo.fileId || photo.id || photo.fileName || `field-${index}`);
    ids[id] = true;
  });

  const attachments = Array.isArray(payload.data && payload.data.attachments)
    ? payload.data.attachments
    : [];
  attachments.forEach((file, index) => {
    const mime = String((file && file.mimeType) || "");
    if (!mime.startsWith("image/")) return;
    const id = String(file.fileId || file.id || file.fileName || `attachment-${index}`);
    ids[id] = true;
  });

  return Object.keys(ids).length;
}

function checkClosureRequirements(payload, policy, platform) {
  const signatures = closureObject(payload.signatures);
  const inspectorSigned = Boolean(signatures.inspector);
  const clientSigned = Boolean(signatures.client);
  const photoCount = countPayloadPhotos(payload);
  const missing = [];

  if (policy.requireMobileClose && platform !== "android" && platform !== "ios") {
    missing.push("MOBILE_DEVICE_REQUIRED");
  }
  if (policy.requireInspectorSignature && !inspectorSigned) {
    missing.push("INSPECTOR_SIGNATURE_REQUIRED");
  }
  if (policy.requireClientSignature && !clientSigned) {
    missing.push("CLIENT_SIGNATURE_REQUIRED");
  }
  if (photoCount < Number(policy.minimumPhotoCount || 0)) {
    missing.push("MINIMUM_PHOTOS_REQUIRED");
  }

  return {
    valid: missing.length === 0,
    missing,
    inspectorSigned,
    clientSigned,
    photoCount,
  };
}

function validateClosureLocation(policy, installation, evidence) {
  if (!policy.requireLocation) {
    return {
      valid: true,
      result: "NOT_REQUIRED",
      evidence: null,
    };
  }

  if (!installation) {
    return {
      valid: false,
      result: "ERROR",
      code: "INSTALLATION_REQUIRED_FOR_LOCATION",
      evidence: null,
    };
  }

  const installationLatitude = closureFinite(installation.get("latitude"));
  const installationLongitude = closureFinite(installation.get("longitude"));
  const latitude = closureFinite(evidence.latitude);
  const longitude = closureFinite(evidence.longitude);
  const accuracyMeters = Math.max(0, closureFinite(evidence.accuracyMeters) || 0);

  if (!validLatitude(installationLatitude) || !validLongitude(installationLongitude)) {
    return {
      valid: false,
      result: "ERROR",
      code: "INSTALLATION_LOCATION_MISSING",
      evidence: null,
    };
  }
  if (!validLatitude(latitude) || !validLongitude(longitude)) {
    return {
      valid: false,
      result: "ERROR",
      code: "DEVICE_LOCATION_INVALID",
      evidence: null,
    };
  }

  const allowedRadiusMeters = Math.max(
    1,
    Number(installation.get("allowedRadiusMeters") || policy.allowedRadiusMeters || 100),
  );
  const maximumAccuracyMeters = Math.max(1, Number(policy.maximumAccuracyMeters || 50));
  const distance = distanceMeters(
    { latitude, longitude },
    { latitude: installationLatitude, longitude: installationLongitude },
  );
  const normalizedEvidence = {
    latitude,
    longitude,
    accuracyMeters,
    installationLatitude,
    installationLongitude,
    distanceMeters: distance,
    allowedRadiusMeters,
    maximumAccuracyMeters,
    capturedAtDevice: String(evidence.capturedAtDevice || ""),
  };

  if (accuracyMeters > maximumAccuracyMeters) {
    return {
      valid: false,
      result: "INSUFFICIENT_ACCURACY",
      code: "GPS_ACCURACY_TOO_LOW",
      evidence: normalizedEvidence,
    };
  }
  if (distance > allowedRadiusMeters) {
    return {
      valid: false,
      result: "OUTSIDE_RADIUS",
      code: "OUTSIDE_ALLOWED_RADIUS",
      evidence: normalizedEvidence,
    };
  }

  return {
    valid: true,
    result: "VALIDATED",
    code: "ON_SITE_LOCATION_VALIDATED",
    evidence: normalizedEvidence,
  };
}

routerAdd("POST", "/api/isivolt/v1/inspections/{inspectionId}/close", (e) => {
  const auth = closureRequireUser(e);
  const inspectionId = String(e.request.pathValue("inspectionId") || "").trim();
  const body = new DynamicModel({
    baseRevision: 0,
    deviceId: "",
    platform: "web",
    evidence: {},
    overrideReason: "",
    capturedAtDevice: "",
  });
  e.bindBody(body);

  if (!inspectionId) {
    throw new BadRequestError("Falta inspectionId", { code: "INSPECTION_ID_REQUIRED" });
  }
  if (!String(body.deviceId || "").trim()) {
    throw new BadRequestError("Falta deviceId", { code: "DEVICE_ID_REQUIRED" });
  }

  const records = e.app.findRecordsByFilter(
    "inspections",
    "inspectionId = {:inspectionId} && company = {:company}",
    "",
    1,
    0,
    { inspectionId, company: auth.companyId },
  );
  if (!records.length) {
    throw new NotFoundError("No se ha encontrado la preinspección");
  }

  const inspection = records[0];
  const currentRevision = inspection.getInt("revision");
  if (Number(body.baseRevision || 0) !== currentRevision) {
    return e.json(409, {
      code: "REVISION_CONFLICT",
      message: "La preinspección ha cambiado antes del cierre",
      serverRevision: currentRevision,
    });
  }

  const company = e.app.findRecordById("companies", auth.companyId);
  const installationId = inspection.getString("installation");
  const installation = installationId
    ? e.app.findRecordById("installations", installationId)
    : null;
  const policy = mergeClosurePolicy(
    company.get("closurePolicy"),
    installation ? installation.get("closurePolicy") : {},
  );
  const platform = ["android", "ios", "web"].includes(String(body.platform))
    ? String(body.platform)
    : "web";
  const payload = closureObject(inspection.get("payload"));
  const requirements = checkClosureRequirements(payload, policy, platform);
  const location = validateClosureLocation(policy, installation, closureObject(body.evidence));
  const overrideReason = String(body.overrideReason || "").trim();
  const wantsOverride = Boolean(overrideReason);

  if (wantsOverride) {
    if (!policy.allowAdminOverride || auth.role !== "admin") {
      throw new ForbiddenError("No tiene permiso para autorizar un cierre excepcional", {
        code: "CLOSURE_OVERRIDE_FORBIDDEN",
      });
    }
  } else {
    if (!requirements.valid) {
      return e.json(422, {
        code: "CLOSURE_REQUIREMENTS_NOT_MET",
        message: "Faltan requisitos obligatorios para cerrar",
        requirements,
      });
    }
    if (!location.valid) {
      return e.json(422, {
        code: location.code,
        message: "La ubicación no permite cerrar la preinspección",
        location,
      });
    }
  }

  const now = new Date().toISOString();
  const capturedAtDevice = String(
    body.capturedAtDevice ||
    (location.evidence && location.evidence.capturedAtDevice) ||
    now,
  );
  const finalResult = wantsOverride ? "OVERRIDDEN" : location.result;
  let response = null;

  e.app.runInTransaction((txApp) => {
    const txInspection = txApp.findRecordById("inspections", inspection.id);
    const txRevision = txInspection.getInt("revision");
    if (txRevision !== currentRevision) {
      response = {
        conflict: true,
        serverRevision: txRevision,
      };
      return;
    }

    const nextRevision = txRevision + 1;
    txInspection.set("status", "CLOSED");
    txInspection.set("revision", nextRevision);
    txInspection.set("closedAt", now);
    txInspection.set("closedBy", auth.userId);
    txInspection.set("lastSyncedAt", now);
    txApp.save(txInspection);

    const closureCollection = txApp.findCollectionByNameOrId("inspection_closures");
    const closure = new Record(closureCollection);
    const evidence = location.evidence || {};
    closure.set("company", auth.companyId);
    closure.set("inspection", txInspection.id);
    closure.set("inspectionId", inspectionId);
    closure.set("closedBy", auth.userId);
    closure.set("deviceId", String(body.deviceId).slice(0, 160));
    closure.set("platform", platform);
    closure.set("latitude", evidence.latitude ?? null);
    closure.set("longitude", evidence.longitude ?? null);
    closure.set("accuracyMeters", evidence.accuracyMeters ?? null);
    closure.set("installationLatitude", evidence.installationLatitude ?? null);
    closure.set("installationLongitude", evidence.installationLongitude ?? null);
    closure.set("distanceMeters", evidence.distanceMeters ?? null);
    closure.set("allowedRadiusMeters", evidence.allowedRadiusMeters ?? null);
    closure.set("maximumAccuracyMeters", evidence.maximumAccuracyMeters ?? null);
    closure.set("result", finalResult);
    closure.set("requirements", requirements);
    closure.set("evidence", evidence);
    closure.set("overrideReason", wantsOverride ? overrideReason : "");
    closure.set("capturedAtDevice", capturedAtDevice);
    closure.set("receivedAtServer", now);
    closure.set("serverRevision", nextRevision);
    txApp.save(closure);

    const eventCollection = txApp.findCollectionByNameOrId("inspection_events");
    const event = new Record(eventCollection);
    event.set("company", auth.companyId);
    event.set("inspection", txInspection.id);
    event.set("inspectionId", inspectionId);
    event.set("user", auth.userId);
    event.set("deviceId", String(body.deviceId).slice(0, 160));
    event.set("eventType", wantsOverride ? "ADMIN_OVERRIDE" : "CLOSED_ON_SITE");
    event.set("revision", nextRevision);
    event.set("details", {
      platform,
      result: finalResult,
      requirements,
      evidence,
      overrideReason: wantsOverride ? overrideReason : null,
    });
    event.set("clientCreatedAt", capturedAtDevice);
    txApp.save(event);

    response = {
      conflict: false,
      closureId: closure.id,
      inspectionId,
      status: "CLOSED",
      result: finalResult,
      revision: nextRevision,
      closedAt: now,
      requirements,
      evidence,
    };
  });

  if (response && response.conflict) {
    return e.json(409, {
      code: "REVISION_CONFLICT",
      message: "La preinspección cambió durante el cierre",
      serverRevision: response.serverRevision,
    });
  }

  return e.json(200, response);
}, $apis.requireAuth("users"));
