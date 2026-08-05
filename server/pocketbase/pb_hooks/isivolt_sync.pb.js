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
  const applications = e.auth.get("applications");
  if (applications && typeof applications === "object" && applications.preinspectionsBt === false) {
    throw new ForbiddenError("El acceso a Preinspecciones BT está desactivado", {
      code: "PREINSPECTIONS_ACCESS_DISABLED",
    });
  }

  return {
    userId: e.auth.id,
    companyId: companyId,
  };
}

function verifyFirebaseIdToken(idToken) {
  const apiKey = String($os.getenv("FIREBASE_WEB_API_KEY") || "").trim();
  if (!apiKey) {
    throw new InternalServerError("Falta FIREBASE_WEB_API_KEY en el servidor");
  }
  if (!String(idToken || "").trim()) {
    throw new BadRequestError("Falta el token de Firebase", { code: "FIREBASE_TOKEN_REQUIRED" });
  }

  let response;
  try {
    response = $http.send({
      method: "POST",
      url: "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" + encodeURIComponent(apiKey),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: String(idToken) }),
      timeout: 15,
    });
  } catch (error) {
    throw new InternalServerError("No se pudo validar la cuenta Firebase", {
      code: "FIREBASE_LOOKUP_UNAVAILABLE",
      detail: String(error),
    });
  }

  const responseJson = response && response.json ? response.json : {};
  const responseUsers = responseJson && Array.isArray(responseJson.users) ? responseJson.users : [];
  if (!response || response.statusCode !== 200 || !responseUsers.length) {
    throw new UnauthorizedError("La sesión Firebase no es válida o ha caducado", {
      code: "INVALID_FIREBASE_TOKEN",
    });
  }

  const firebaseUser = responseUsers[0];
  if (firebaseUser.disabled) {
    throw new ForbiddenError("La cuenta Firebase está desactivada", {
      code: "FIREBASE_USER_DISABLED",
    });
  }

  return {
    uid: String(firebaseUser.localId || ""),
    email: String(firebaseUser.email || "").trim().toLowerCase(),
    displayName: String(firebaseUser.displayName || "").trim(),
    emailVerified: Boolean(firebaseUser.emailVerified),
  };
}

function findProvisionedSyncUser(app, firebaseUser) {
  let records = app.findRecordsByFilter(
    "users",
    "firebaseUid = {:uid}",
    "",
    1,
    0,
    { uid: firebaseUser.uid },
  );
  if (records.length) return records[0];

  if (!firebaseUser.email) return null;
  records = app.findRecordsByFilter(
    "users",
    "email = {:email}",
    "",
    1,
    0,
    { email: firebaseUser.email },
  );
  return records.length ? records[0] : null;
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
  return VALID_INSPECTION_STATUS.indexOf(status) >= 0 ? status : "DRAFT";
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
    closureConfig: {
      latitude: record.get("closureLatitude"),
      longitude: record.get("closureLongitude"),
      allowedRadiusMeters: record.get("closureRadiusMeters"),
      policy: record.get("closurePolicy"),
      configuredBy: record.getString("closureConfiguredBy"),
      configuredAt: record.getString("closureConfiguredAt")
    },
    created: record.getString("created"),
    updated: record.getString("updated"),
  };
}

routerAdd("POST", "/api/isivolt/v1/auth/firebase", (e) => {
  const body = new DynamicModel({ idToken: "" });
  e.bindBody(body);
  const firebaseUser = verifyFirebaseIdToken(body.idToken);
  const record = findProvisionedSyncUser(e.app, firebaseUser);

  if (!record) {
    throw new ForbiddenError("La cuenta todavía no está habilitada en IsiVoltPro", {
      code: "SYNC_USER_NOT_PROVISIONED",
      email: firebaseUser.email,
    });
  }
  if (!record.getBool("active")) {
    throw new ForbiddenError("La cuenta de sincronización está desactivada", {
      code: "SYNC_USER_DISABLED",
    });
  }

  const linkedUid = record.getString("firebaseUid");
  if (linkedUid && linkedUid !== firebaseUser.uid) {
    throw new ForbiddenError("La cuenta está vinculada a otro usuario Firebase", {
      code: "FIREBASE_UID_MISMATCH",
    });
  }
  const firstLink = !linkedUid;
  if (!linkedUid) {
    record.set("firebaseUid", firebaseUser.uid);
    if (!record.getString("name") && firebaseUser.displayName) {
      record.set("name", firebaseUser.displayName);
    }
  }
  const accessNow = new Date().toISOString();
  record.set("lastAccessAt", accessNow);
  record.set("invitationStatus", "linked");
  e.app.save(record);

  if (firstLink) {
    try {
      const eventCollection = e.app.findCollectionByNameOrId("technician_access_events");
      const accessEvent = new Record(eventCollection);
      accessEvent.set("company", record.getString("company"));
      accessEvent.set("targetUser", record.id);
      accessEvent.set("actorUser", record.id);
      accessEvent.set("eventType", "LINKED");
      accessEvent.set("details", { email: firebaseUser.email });
      accessEvent.set("occurredAt", accessNow);
      e.app.save(accessEvent);
    } catch (error) {
      console.warn("No se pudo registrar la vinculación del técnico", error);
    }
  }

  return $apis.recordAuthResponse(e, record, "firebase");
});

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
      { inspectionId: inspectionId, company: auth.companyId },
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
      baseRevision: baseRevision,
      localRevision: localRevision,
      contractVersion: Number(body.contractVersion),
    });
    event.set("clientCreatedAt", String(body.sentAt || now));
    txApp.save(event);

    result = {
      conflict: false,
      recordId: record.id,
      revision: nextServerRevision,
      localRevision: localRevision,
      syncedAt: now,
    };
  });

  if (result && result.conflict) {
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
    ? { company: auth.companyId, since: since }
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
