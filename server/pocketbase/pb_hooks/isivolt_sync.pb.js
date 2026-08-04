const ISIVOLT_SYNC_CONTRACT_VERSION = 2;
const VALID_INSPECTION_STATUS = [
  "DRAFT",
  "ASSIGNED",
  "IN_PROGRESS",
  "PENDING_REVIEW",
  "PENDING_ON_SITE_CLOSE",
  "CLOSED",
  "REOPENED",
  "CANCELLED",
];

function bindSyncBody(e) {
  const body = new DynamicModel({
    contractVersion: 0,
    inspectionId: "",
    revision: 0,
    baseRevision: 0,
    deviceId: "",
    sentAt: "",
    metadata: {},
    inspection: {},
  });
  e.bindBody(body);
  return body;
}

function requireActiveUser(e) {
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
  };
}

function validateSyncBody(body) {
  if (Number(body.contractVersion || 0) !== ISIVOLT_SYNC_CONTRACT_VERSION) {
    throw new BadRequestError("Versión de sincronización no compatible", {
      code: "SYNC_CONTRACT_MISMATCH",
      expectedVersion: ISIVOLT_SYNC_CONTRACT_VERSION,
    });
  }
  if (!String(body.inspectionId || "").trim()) {
    throw new BadRequestError("Falta inspectionId", { code: "INSPECTION_ID_REQUIRED" });
  }
  if (Number(body.revision || 0) < 1) {
    throw new BadRequestError("La revisión local no es válida", { code: "INVALID_LOCAL_REVISION" });
  }
  if (Number(body.baseRevision || 0) < 0) {
    throw new BadRequestError("La revisión base no es válida", { code: "INVALID_BASE_REVISION" });
  }
  if (!body.inspection || typeof body.inspection !== "object") {
    throw new BadRequestError("El contenido de la preinspección no es válido", { code: "INVALID_INSPECTION_PAYLOAD" });
  }
}

function normalizeStatus(value) {
  const status = String(value || "DRAFT").toUpperCase();
  return VALID_INSPECTION_STATUS.includes(status) ? status : "DRAFT";
}

function serializeInspection(record) {
  return {
    id: record.id,
    inspectionId: record.getString("inspectionId"),
    status: record.getString("status"),
    revision: record.getInt("revision"),
    localRevision: record.getInt("localRevision"),
    payload: record.get("payload"),
    sourceDeviceId: record.getString("sourceDeviceId"),
    clientUpdatedAt: record.getString("clientUpdatedAt"),
    lastSyncedAt: record.getString("lastSyncedAt"),
    deletedAt: record.getString("deletedAt"),
    created: record.getString("created"),
    updated: record.getString("updated"),
  };
}

routerAdd("POST", "/api/isivolt/v1/inspections/sync", (e) => {
  const auth = requireActiveUser(e);
  const body = bindSyncBody(e);
  validateSyncBody(body);

  const inspectionId = String(body.inspectionId).trim();
  const baseRevision = Number(body.baseRevision || 0);
  const localRevision = Number(body.revision || 1);
  const deviceId = String(body.deviceId || "").slice(0, 160);
  const now = new Date().toISOString();
  const metadata = body.metadata && typeof body.metadata === "object" ? body.metadata : {};
  const status = normalizeStatus(metadata.status);
  const clientUpdatedAt = String(metadata.updatedAt || body.sentAt || now);
  let result = null;

  e.app.runInTransaction((txApp) => {
    const records = txApp.findRecordsByFilter(
      "inspections",
      "inspectionId = {:inspectionId} && company = {:company}",
      "",
      1,
      0,
      { inspectionId, company: auth.companyId },
    );
    const existing = records.length ? records[0] : null;
    const currentServerRevision = existing ? existing.getInt("revision") : 0;

    if (baseRevision !== currentServerRevision) {
      result = {
        conflict: true,
        serverRevision: currentServerRevision,
        serverInspection: existing ? serializeInspection(existing) : null,
      };
      return;
    }

    const collection = txApp.findCollectionByNameOrId("inspections");
    const record = existing || new Record(collection);
    const nextServerRevision = currentServerRevision + 1;

    record.set("inspectionId", inspectionId);
    record.set("company", auth.companyId);
    record.set("ownerUser", existing ? existing.getString("ownerUser") : auth.userId);
    record.set("status", status);
    record.set("revision", nextServerRevision);
    record.set("localRevision", localRevision);
    record.set("payload", body.inspection);
    record.set("sourceDeviceId", deviceId);
    record.set("clientUpdatedAt", clientUpdatedAt);
    record.set("lastSyncedAt", now);
    record.set("deletedAt", metadata.deletedAt || "");
    txApp.save(record);

    const eventCollection = txApp.findCollectionByNameOrId("inspection_events");
    const event = new Record(eventCollection);
    event.set("company", auth.companyId);
    event.set("inspection", record.id);
    event.set("inspectionId", inspectionId);
    event.set("user", auth.userId);
    event.set("deviceId", deviceId);
    event.set("eventType", existing ? "UPDATED" : "CREATED");
    event.set("revision", nextServerRevision);
    event.set("details", {
      baseRevision,
      localRevision,
      contractVersion: Number(body.contractVersion),
    });
    event.set("clientCreatedAt", String(body.sentAt || now));
    txApp.save(event);

    result = {
      conflict: false,
      recordId: record.id,
      revision: nextServerRevision,
      localRevision,
      syncedAt: now,
    };
  });

  if (result?.conflict) {
    return e.json(409, {
      code: "REVISION_CONFLICT",
      message: "Existe una revisión más reciente en el servidor",
      serverRevision: result.serverRevision,
      serverInspection: result.serverInspection,
    });
  }

  return e.json(200, result);
}, $apis.requireAuth("users"));

routerAdd("GET", "/api/isivolt/v1/inspections", (e) => {
  const auth = requireActiveUser(e);
  const requestInfo = e.requestInfo();
  const since = String(requestInfo.query.since || "").trim();
  const filter = since
    ? "company = {:company} && updated > {:since}"
    : "company = {:company}";
  const params = since
    ? { company: auth.companyId, since }
    : { company: auth.companyId };

  const records = e.app.findRecordsByFilter(
    "inspections",
    filter,
    "updated",
    250,
    0,
    params,
  );

  return e.json(200, {
    items: records.map(serializeInspection),
    serverTime: new Date().toISOString(),
    nextCursor: "",
  });
}, $apis.requireAuth("users"));
