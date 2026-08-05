routerAdd("POST", "/api/isivolt/v1/inspections/{inspectionId}/close", (e) => {
  const sync = require(`${__hooks}/sync_core_utils.js`);
  const closure = require(`${__hooks}/closure_utils.js`);
  const auth = sync.requireUser(e, { write: true });
  const inspectionId = String(e.request.pathValue("inspectionId") || "").trim();
  const body = e.requestInfo().body || {};

  if (!inspectionId) {
    throw new BadRequestError("Falta inspectionId");
  }

  const deviceId = String(body.deviceId || "").trim().slice(0, 160);
  if (!deviceId) {
    throw new BadRequestError("Falta deviceId");
  }

  const inspection = sync.findInspection(e.app, auth.companyId, inspectionId);
  if (!inspection) {
    throw new NotFoundError("No se ha encontrado la preinspección");
  }
  sync.assertCanWriteInspection(inspection, auth);

  const currentStatus = inspection.getString("status");
  if (currentStatus === "CLOSED") {
    throw new BadRequestError("La preinspección ya está cerrada");
  }
  if (currentStatus === "CANCELLED") {
    throw new BadRequestError("No se puede cerrar una preinspección cancelada");
  }

  const currentRevision = inspection.getInt("revision");
  if (Number(body.baseRevision || 0) !== currentRevision) {
    return e.json(409, {
      code: "REVISION_CONFLICT",
      message: "La preinspección ha cambiado antes del cierre",
      serverRevision: currentRevision,
    });
  }

  const company = e.app.findRecordById("companies", auth.companyId);
  const payload = closure.readPayload(inspection);
  const installationId = inspection.getString("installation");
  let installationRecord = null;
  if (installationId) {
    try {
      installationRecord = e.app.findRecordById("installations", installationId);
    } catch (error) {
      installationRecord = null;
    }
  }
  const trustedInstallation = closure.buildTrustedInspectionInstallation(inspection);
  const installation = installationRecord || trustedInstallation;
  const companyPolicy = closure.readPolicy(company, "closurePolicy");
  const installationPolicy = installationRecord
    ? closure.readPolicy(installationRecord, "closurePolicy")
    : trustedInstallation
      ? trustedInstallation.closurePolicy
      : {};
  const policy = closure.mergePolicy(companyPolicy, installationPolicy);

  const requestedPlatform = String(body.platform || "web").toLowerCase();
  const platform = ["android", "ios", "web"].indexOf(requestedPlatform) >= 0
    ? requestedPlatform
    : "web";
  const uploadedPhotoCount = closure.countUploadedPhotos(
    e.app,
    inspection.id,
    auth.companyId,
  );
  const requirements = closure.checkRequirements(
    payload,
    policy,
    platform,
    uploadedPhotoCount,
  );
  const location = closure.validateLocation(policy, installation, body.evidence || {});
  const overrideReason = String(body.overrideReason || "").trim();
  const wantsOverride = Boolean(overrideReason);

  if (wantsOverride) {
    if (!policy.allowAdminOverride || auth.role !== "admin") {
      throw new ForbiddenError("No tiene permiso para autorizar un cierre excepcional");
    }
  } else {
    if (!requirements.valid) {
      return e.json(422, {
        code: "CLOSURE_REQUIREMENTS_NOT_MET",
        message: "Faltan requisitos obligatorios para cerrar",
        requirements: requirements,
      });
    }
    if (!location.valid) {
      return e.json(422, {
        code: location.code,
        message: "La ubicación no permite cerrar la preinspección",
        location: location,
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
    sync.assertCanWriteInspection(txInspection, auth);
    const txRevision = txInspection.getInt("revision");
    if (txRevision !== currentRevision) {
      response = {
        conflict: true,
        serverRevision: txRevision,
      };
      return;
    }

    const txStatus = txInspection.getString("status");
    if (txStatus === "CLOSED" || txStatus === "CANCELLED") {
      throw new BadRequestError("El estado actual no permite cerrar la preinspección");
    }

    const nextRevision = txRevision + 1;
    txInspection.set("status", "CLOSED");
    txInspection.set("revision", nextRevision);
    txInspection.set("closedAt", now);
    txInspection.set("closedBy", auth.userId);
    txInspection.set("lastSyncedAt", now);
    txApp.save(txInspection);

    const closureCollection = txApp.findCollectionByNameOrId("inspection_closures");
    const closureRecord = new Record(closureCollection);
    const evidence = location.evidence || {};
    closureRecord.set("company", auth.companyId);
    closureRecord.set("inspection", txInspection.id);
    closureRecord.set("inspectionId", inspectionId);
    closureRecord.set("closedBy", auth.userId);
    closureRecord.set("deviceId", deviceId);
    closureRecord.set("platform", platform);
    closureRecord.set("latitude", closure.nullable(evidence.latitude));
    closureRecord.set("longitude", closure.nullable(evidence.longitude));
    closureRecord.set("accuracyMeters", closure.nullable(evidence.accuracyMeters));
    closureRecord.set("installationLatitude", closure.nullable(evidence.installationLatitude));
    closureRecord.set("installationLongitude", closure.nullable(evidence.installationLongitude));
    closureRecord.set("distanceMeters", closure.nullable(evidence.distanceMeters));
    closureRecord.set("allowedRadiusMeters", closure.nullable(evidence.allowedRadiusMeters));
    closureRecord.set("maximumAccuracyMeters", closure.nullable(evidence.maximumAccuracyMeters));
    closureRecord.set("result", finalResult);
    closureRecord.set("requirements", requirements);
    closureRecord.set("evidence", evidence);
    closureRecord.set("overrideReason", wantsOverride ? overrideReason : "");
    closureRecord.set("capturedAtDevice", capturedAtDevice);
    closureRecord.set("receivedAtServer", now);
    closureRecord.set("serverRevision", nextRevision);
    txApp.save(closureRecord);

    const eventCollection = txApp.findCollectionByNameOrId("inspection_events");
    const event = new Record(eventCollection);
    event.set("company", auth.companyId);
    event.set("inspection", txInspection.id);
    event.set("inspectionId", inspectionId);
    event.set("user", auth.userId);
    event.set("deviceId", deviceId);
    event.set("eventType", wantsOverride ? "ADMIN_OVERRIDE" : "CLOSED_ON_SITE");
    event.set("revision", nextRevision);
    event.set("details", {
      platform: platform,
      result: finalResult,
      requirements: requirements,
      evidence: evidence,
      overrideReason: wantsOverride ? overrideReason : null,
      role: auth.role,
      assignedUserId: txInspection.getString("assignedUser") || null,
    });
    event.set("clientCreatedAt", capturedAtDevice);
    txApp.save(event);

    response = {
      conflict: false,
      closureId: closureRecord.id,
      inspectionId: inspectionId,
      status: "CLOSED",
      result: finalResult,
      revision: nextRevision,
      closedAt: now,
      requirements: requirements,
      evidence: evidence,
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
