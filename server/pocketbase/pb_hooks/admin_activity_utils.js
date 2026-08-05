const ACCESS_LABELS = {
  INVITED: "Acceso creado",
  UPDATED: "Acceso actualizado",
  ACTIVATED: "Acceso activado",
  DEACTIVATED: "Acceso suspendido",
  ACCESS_CHANGED: "Permisos modificados",
  LINKED: "Cuenta vinculada",
};

const INSPECTION_LABELS = {
  CREATED: "Preinspección creada",
  UPDATED: "Preinspección actualizada",
  SYNCED: "Preinspección sincronizada",
  ASSIGNED: "Asignación modificada",
  STATUS_CHANGED: "Estado modificado",
  CONFLICT_DETECTED: "Conflicto detectado",
  CLOSE_ATTEMPTED: "Cierre iniciado",
  CLOSED_ON_SITE: "Cierre presencial confirmado",
  CLOSE_REJECTED: "Cierre rechazado",
  ADMIN_OVERRIDE: "Excepción administrativa",
  REOPENED: "Preinspección reabierta",
  DELETED: "Preinspección eliminada",
};

function objectValue(value) {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (error) {
      return {};
    }
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    try {
      const parsed = JSON.parse(JSON.stringify(value));
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (error) {
      return value;
    }
  }
  return {};
}

function applicationsEnabled(record) {
  if (!record) return true;
  try {
    const result = new DynamicModel({ preinspectionsBt: true });
    record.unmarshalJSONField("applications", result);
    return result.preinspectionsBt !== false;
  } catch (error) {
    return objectValue(record.get("applications")).preinspectionsBt !== false;
  }
}

function eventDetails(record) {
  if (!record) return {};
  try {
    const result = new DynamicModel({
      assignedUserId: "",
      previousAssignedUserId: "",
      baseRevision: 0,
      localRevision: 0,
      contractVersion: 0,
      role: "",
      status: "",
      previousStatus: "",
      reason: "",
      platform: "",
      result: "",
    });
    record.unmarshalJSONField("details", result);
    const fallback = objectValue(record.get("details"));
    return Object.assign({}, fallback, {
      assignedUserId: String(result.assignedUserId || fallback.assignedUserId || ""),
      previousAssignedUserId: String(result.previousAssignedUserId || fallback.previousAssignedUserId || ""),
      baseRevision: Number(result.baseRevision || fallback.baseRevision || 0),
      localRevision: Number(result.localRevision || fallback.localRevision || 0),
      contractVersion: Number(result.contractVersion || fallback.contractVersion || 0),
      role: String(result.role || fallback.role || ""),
      status: String(result.status || fallback.status || ""),
      previousStatus: String(result.previousStatus || fallback.previousStatus || ""),
      reason: String(result.reason || fallback.reason || ""),
      platform: String(result.platform || fallback.platform || ""),
      result: String(result.result || fallback.result || ""),
    });
  } catch (error) {
    return objectValue(record.get("details"));
  }
}

function requireAdmin(event) {
  if (!event.auth || event.auth.collection().name !== "users") {
    throw new UnauthorizedError("Se necesita una cuenta IsiVoltPro válida");
  }
  if (!event.auth.getBool("active")) throw new ForbiddenError("La cuenta está desactivada");
  if (!applicationsEnabled(event.auth)) {
    throw new ForbiddenError("El acceso a Preinspecciones BT está desactivado");
  }
  if (event.auth.getString("role") !== "admin") {
    throw new ForbiddenError("Solo un administrador puede consultar el historial de actividad");
  }
  const companyId = event.auth.getString("company");
  if (!companyId) throw new ForbiddenError("La cuenta no tiene empresa asignada");
  return { userId: event.auth.id, companyId: companyId };
}

function findOptional(app, collection, recordId) {
  const id = String(recordId || "").trim();
  if (!id) return null;
  try {
    return app.findRecordById(collection, id);
  } catch (error) {
    return null;
  }
}

function userSummary(app, recordId) {
  const record = findOptional(app, "users", recordId);
  if (!record) return null;
  return {
    id: record.id,
    name: record.getString("name"),
    role: record.getString("role"),
    specialty: record.getString("specialty"),
    active: record.getBool("active"),
  };
}

function inspectionTitle(record, fallbackId) {
  if (!record) return String(fallbackId || "Preinspección");
  try {
    const payload = new DynamicModel({ data: {} });
    record.unmarshalJSONField("payload", payload);
    const data = objectValue(payload.data);
    return String(data.name || data.ownerName || data.address || record.getString("inspectionId") || fallbackId || "Preinspección");
  } catch (error) {
    return record.getString("inspectionId") || String(fallbackId || "Preinspección");
  }
}

function accessItem(app, record) {
  const type = record.getString("eventType");
  return {
    id: "access:" + record.id,
    category: "access",
    eventType: type,
    label: ACCESS_LABELS[type] || "Actividad de acceso",
    occurredAt: record.getString("occurredAt") || record.getString("created"),
    actor: userSummary(app, record.getString("actorUser")),
    targetUser: userSummary(app, record.getString("targetUser")),
    inspection: null,
    details: eventDetails(record),
  };
}

function inspectionItem(app, record) {
  const type = record.getString("eventType");
  const details = eventDetails(record);
  const inspectionRecord = findOptional(app, "inspections", record.getString("inspection"));
  const inspectionId = record.getString("inspectionId");
  const assignedUserId = String(details.assignedUserId || "");
  return {
    id: "inspection:" + record.id,
    category: "inspection",
    eventType: type,
    label: INSPECTION_LABELS[type] || "Actividad de expediente",
    occurredAt: record.getString("clientCreatedAt") || record.getString("created"),
    actor: userSummary(app, record.getString("user")),
    targetUser: assignedUserId ? userSummary(app, assignedUserId) : null,
    inspection: {
      id: inspectionRecord ? inspectionRecord.id : record.getString("inspection"),
      inspectionId: inspectionId,
      title: inspectionTitle(inspectionRecord, inspectionId),
      status: inspectionRecord ? inspectionRecord.getString("status") : "",
    },
    revision: record.getInt("revision"),
    deviceId: record.getString("deviceId"),
    details: details,
  };
}

function normalizedLimit(value) {
  const parsed = Number(value || 100);
  if (!isFinite(parsed)) return 100;
  return Math.max(20, Math.min(250, Math.floor(parsed)));
}

function listActivity(app, companyId, limit) {
  const items = [];
  const accessRecords = app.findAllRecords(
    "technician_access_events",
    $dbx.hashExp({ company: companyId }),
  );
  for (let index = 0; index < accessRecords.length; index += 1) {
    items.push(accessItem(app, accessRecords[index]));
  }

  const inspectionRecords = app.findAllRecords(
    "inspection_events",
    $dbx.hashExp({ company: companyId }),
  );
  for (let index = 0; index < inspectionRecords.length; index += 1) {
    items.push(inspectionItem(app, inspectionRecords[index]));
  }

  items.sort((first, second) => {
    const firstDate = String(first.occurredAt || "");
    const secondDate = String(second.occurredAt || "");
    return firstDate > secondDate ? -1 : firstDate < secondDate ? 1 : 0;
  });
  return items.slice(0, normalizedLimit(limit));
}

module.exports = {
  accessItem: accessItem,
  eventDetails: eventDetails,
  inspectionItem: inspectionItem,
  listActivity: listActivity,
  normalizedLimit: normalizedLimit,
  objectValue: objectValue,
  requireAdmin: requireAdmin,
};
