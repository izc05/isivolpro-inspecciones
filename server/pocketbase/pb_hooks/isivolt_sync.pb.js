routerAdd("POST", "/api/isivolt/v1/auth/firebase", (e) => {
  const sync = require(`${__hooks}/sync_core_utils.js`);
  const body = e.requestInfo().body || {};
  const firebaseUser = sync.verifyFirebaseIdToken(body.idToken);
  const record = sync.findProvisionedUser(e.app, firebaseUser);

  if (!record) {
    throw new ForbiddenError("La cuenta todavía no está habilitada en IsiVoltPro");
  }
  if (!record.getBool("active")) {
    throw new ForbiddenError("La cuenta de sincronización está desactivada");
  }
  if (sync.recordApplications(record).preinspectionsBt === false) {
    throw new ForbiddenError("El acceso a Preinspecciones BT está desactivado");
  }

  const linkedUid = record.getString("firebaseUid");
  if (linkedUid && linkedUid !== firebaseUser.uid) {
    throw new ForbiddenError("La cuenta está vinculada a otro usuario Firebase");
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
  const sync = require(`${__hooks}/sync_core_utils.js`);
  const auth = sync.requireUser(e, { write: true });
  const body = sync.validateBody(e.requestInfo().body || {});

  const inspectionId = String(body.inspectionId).trim();
  const baseRevision = Number(body.baseRevision || 0);
  const localRevision = Number(body.revision || 1);
  const deviceId = String(body.deviceId || "").slice(0, 160);
  const now = new Date().toISOString();
  const metadata = sync.objectValue(body.metadata);
  const status = sync.normalizeStatus(metadata.status);
  const clientUpdatedAt = String(metadata.updatedAt || body.sentAt || now);
  let result = null;

  e.app.runInTransaction((txApp) => {
    const existing = sync.findInspection(txApp, auth.companyId, inspectionId);
    if (existing) {
      sync.assertCanWriteInspection(existing, auth);
    }

    const currentServerRevision = existing ? existing.getInt("revision") : 0;
    if (baseRevision !== currentServerRevision) {
      result = {
        conflict: true,
        serverRevision: currentServerRevision,
        serverInspection: existing ? sync.serializeInspection(existing, auth) : null,
      };
      return;
    }

    const collection = txApp.findCollectionByNameOrId("inspections");
    const record = existing || new Record(collection);
    const nextServerRevision = currentServerRevision + 1;

    record.set("inspectionId", inspectionId);
    record.set("company", auth.companyId);
    record.set("ownerUser", existing ? existing.getString("ownerUser") : auth.userId);
    if (!existing && auth.role === "inspector") {
      record.set("assignedUser", auth.userId);
    }
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
      role: auth.role,
      assignedUserId: record.getString("assignedUser") || null,
    });
    event.set("clientCreatedAt", String(body.sentAt || now));
    txApp.save(event);

    result = {
      conflict: false,
      recordId: record.id,
      revision: nextServerRevision,
      localRevision: localRevision,
      assignedUserId: record.getString("assignedUser"),
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
  const sync = require(`${__hooks}/sync_core_utils.js`);
  const auth = sync.requireUser(e, { write: false });
  const requestInfo = e.requestInfo();
  const since = String(requestInfo.query.since || "").trim();
  const records = sync.listVisibleInspections(e.app, auth, since);
  const items = [];
  for (let index = 0; index < records.length; index += 1) {
    items.push(sync.serializeInspection(records[index], auth));
  }

  return e.json(200, {
    items: items,
    serverTime: new Date().toISOString(),
    nextCursor: "",
    permissions: {
      role: auth.role,
      canViewAll: auth.canViewAll,
      canWrite: auth.canWrite,
      canAssign: auth.canAssign,
    },
  });
}, $apis.requireAuth("users"));
