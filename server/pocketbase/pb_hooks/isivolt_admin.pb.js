const ADMIN_CLOSURE_DEFAULTS = {
  allowCloseFromWeb: false,
  requireMobileClose: true,
  requireLocation: true,
  allowedRadiusMeters: 100,
  maximumAccuracyMeters: 50,
  requireInspectorSignature: true,
  requireClientSignature: false,
  minimumPhotoCount: 1,
  requireServerSyncBeforeClose: true,
  allowAdminOverride: true,
};

function adminObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function adminFinite(value) {
  const number = Number(value);
  return isFinite(number) ? number : null;
}

function adminClamp(value, fallback, minimum, maximum) {
  const number = adminFinite(value);
  if (number === null) return fallback;
  return Math.min(maximum, Math.max(minimum, number));
}

function adminBoolean(value, fallback) {
  return value === undefined || value === null ? fallback : Boolean(value);
}

function normalizeAdminClosurePolicy(value) {
  const source = adminObject(value);
  return {
    allowCloseFromWeb: adminBoolean(source.allowCloseFromWeb, ADMIN_CLOSURE_DEFAULTS.allowCloseFromWeb),
    requireMobileClose: adminBoolean(source.requireMobileClose, ADMIN_CLOSURE_DEFAULTS.requireMobileClose),
    requireLocation: adminBoolean(source.requireLocation, ADMIN_CLOSURE_DEFAULTS.requireLocation),
    allowedRadiusMeters: adminClamp(source.allowedRadiusMeters, ADMIN_CLOSURE_DEFAULTS.allowedRadiusMeters, 1, 10000),
    maximumAccuracyMeters: adminClamp(source.maximumAccuracyMeters, ADMIN_CLOSURE_DEFAULTS.maximumAccuracyMeters, 1, 1000),
    requireInspectorSignature: adminBoolean(source.requireInspectorSignature, ADMIN_CLOSURE_DEFAULTS.requireInspectorSignature),
    requireClientSignature: adminBoolean(source.requireClientSignature, ADMIN_CLOSURE_DEFAULTS.requireClientSignature),
    minimumPhotoCount: Math.round(adminClamp(source.minimumPhotoCount, ADMIN_CLOSURE_DEFAULTS.minimumPhotoCount, 0, 100)),
    requireServerSyncBeforeClose: adminBoolean(source.requireServerSyncBeforeClose, ADMIN_CLOSURE_DEFAULTS.requireServerSyncBeforeClose),
    allowAdminOverride: adminBoolean(source.allowAdminOverride, ADMIN_CLOSURE_DEFAULTS.allowAdminOverride),
  };
}

function adminUser(e, requireAdmin) {
  if (!e.auth || e.auth.collection().name !== "users") {
    throw new UnauthorizedError("Se necesita una cuenta IsiVoltPro válida");
  }
  if (!e.auth.getBool("active")) {
    throw new ForbiddenError("La cuenta está desactivada");
  }
  const companyId = e.auth.getString("company");
  if (!companyId) {
    throw new ForbiddenError("La cuenta no tiene empresa asignada");
  }
  const role = e.auth.getString("role");
  if (requireAdmin && role !== "admin") {
    throw new ForbiddenError("Solo un administrador puede modificar esta configuración", {
      code: "ADMIN_ROLE_REQUIRED",
    });
  }
  return {
    userId: e.auth.id,
    companyId: companyId,
    role: role,
  };
}

function findCompanyInspection(app, inspectionId, companyId) {
  const records = app.findRecordsByFilter(
    "inspections",
    "inspectionId = {:inspectionId} && company = {:company}",
    "",
    1,
    0,
    { inspectionId: inspectionId, company: companyId },
  );
  if (!records.length) throw new NotFoundError("No se ha encontrado la preinspección");
  return records[0];
}

function serializeClosureConfig(inspection, companyPolicy) {
  const inspectionPolicy = normalizeAdminClosurePolicy(inspection.get("closurePolicy"));
  const merged = normalizeAdminClosurePolicy(companyPolicy);
  const rawInspectionPolicy = adminObject(inspection.get("closurePolicy"));
  const keys = Object.keys(rawInspectionPolicy);
  for (let index = 0; index < keys.length; index += 1) {
    const key = keys[index];
    merged[key] = inspectionPolicy[key];
  }

  return {
    inspectionId: inspection.getString("inspectionId"),
    serverRevision: inspection.getInt("revision"),
    latitude: inspection.get("closureLatitude"),
    longitude: inspection.get("closureLongitude"),
    allowedRadiusMeters: inspection.get("closureRadiusMeters") || merged.allowedRadiusMeters,
    policy: merged,
    configuredBy: inspection.getString("closureConfiguredBy"),
    configuredAt: inspection.getString("closureConfiguredAt"),
  };
}

routerAdd("GET", "/api/isivolt/v1/admin/closure-policy", (e) => {
  const auth = adminUser(e, false);
  const company = e.app.findRecordById("companies", auth.companyId);
  return e.json(200, {
    policy: normalizeAdminClosurePolicy(company.get("closurePolicy")),
  });
}, $apis.requireAuth("users"));

routerAdd("PUT", "/api/isivolt/v1/admin/closure-policy", (e) => {
  const auth = adminUser(e, true);
  const body = new DynamicModel({ policy: {} });
  e.bindBody(body);
  const policy = normalizeAdminClosurePolicy(body.policy);
  const company = e.app.findRecordById("companies", auth.companyId);
  company.set("closurePolicy", policy);
  e.app.save(company);
  return e.json(200, { policy: policy });
}, $apis.requireAuth("users"));

routerAdd("GET", "/api/isivolt/v1/inspections/{inspectionId}/closure-config", (e) => {
  const auth = adminUser(e, false);
  const inspectionId = String(e.request.pathValue("inspectionId") || "").trim();
  const inspection = findCompanyInspection(e.app, inspectionId, auth.companyId);
  const company = e.app.findRecordById("companies", auth.companyId);
  return e.json(200, serializeClosureConfig(inspection, company.get("closurePolicy")));
}, $apis.requireAuth("users"));

routerAdd("PUT", "/api/isivolt/v1/inspections/{inspectionId}/closure-config", (e) => {
  const auth = adminUser(e, true);
  const inspectionId = String(e.request.pathValue("inspectionId") || "").trim();
  const body = new DynamicModel({
    baseRevision: 0,
    latitude: null,
    longitude: null,
    allowedRadiusMeters: null,
    policy: {},
  });
  e.bindBody(body);

  const latitude = adminFinite(body.latitude);
  const longitude = adminFinite(body.longitude);
  if (latitude === null || latitude < -90 || latitude > 90) {
    throw new BadRequestError("La latitud no es válida", { code: "INVALID_CLOSURE_LATITUDE" });
  }
  if (longitude === null || longitude < -180 || longitude > 180) {
    throw new BadRequestError("La longitud no es válida", { code: "INVALID_CLOSURE_LONGITUDE" });
  }

  const radius = adminClamp(body.allowedRadiusMeters, 100, 1, 10000);
  const policy = normalizeAdminClosurePolicy(body.policy);
  const inspection = findCompanyInspection(e.app, inspectionId, auth.companyId);
  const currentRevision = inspection.getInt("revision");
  if (Number(body.baseRevision || 0) !== currentRevision) {
    return e.json(409, {
      code: "REVISION_CONFLICT",
      message: "La preinspección ha cambiado antes de guardar la configuración",
      serverRevision: currentRevision,
    });
  }

  const now = new Date().toISOString();
  let response = null;
  e.app.runInTransaction((txApp) => {
    const txInspection = txApp.findRecordById("inspections", inspection.id);
    const txRevision = txInspection.getInt("revision");
    if (txRevision !== currentRevision) {
      response = { conflict: true, serverRevision: txRevision };
      return;
    }

    const nextRevision = txRevision + 1;
    txInspection.set("closureLatitude", latitude);
    txInspection.set("closureLongitude", longitude);
    txInspection.set("closureRadiusMeters", radius);
    txInspection.set("closurePolicy", policy);
    txInspection.set("closureConfiguredBy", auth.userId);
    txInspection.set("closureConfiguredAt", now);
    txInspection.set("revision", nextRevision);
    txInspection.set("lastSyncedAt", now);
    txApp.save(txInspection);

    const eventCollection = txApp.findCollectionByNameOrId("inspection_events");
    const event = new Record(eventCollection);
    event.set("company", auth.companyId);
    event.set("inspection", txInspection.id);
    event.set("inspectionId", inspectionId);
    event.set("user", auth.userId);
    event.set("eventType", "STATUS_CHANGED");
    event.set("revision", nextRevision);
    event.set("details", {
      action: "CLOSURE_CONFIGURED",
      latitude: latitude,
      longitude: longitude,
      allowedRadiusMeters: radius,
      policy: policy,
    });
    event.set("clientCreatedAt", now);
    txApp.save(event);

    response = serializeClosureConfig(txInspection, policy);
  });

  if (response && response.conflict) {
    return e.json(409, {
      code: "REVISION_CONFLICT",
      message: "La preinspección cambió durante la configuración",
      serverRevision: response.serverRevision,
    });
  }

  return e.json(200, response);
}, $apis.requireAuth("users"));
