const CONTRACT_VERSION = 2;
const VALID_STATUS = [
  "DRAFT",
  "ASSIGNED",
  "IN_PROGRESS",
  "PENDING_REVIEW",
  "PENDING_ON_SITE_CLOSE",
  "CLOSED",
  "REOPENED",
  "CANCELLED",
];

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
      const serialized = JSON.parse(JSON.stringify(value));
      if (serialized && typeof serialized === "object" && !Array.isArray(serialized)) {
        return serialized;
      }
    } catch (error) {
      return value;
    }
    return value;
  }
  return {};
}

function booleanSetting(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  if (value === false || value === 0 || String(value).toLowerCase() === "false") return false;
  if (value === true || value === 1 || String(value).toLowerCase() === "true") return true;
  return Boolean(value);
}

function applications(value) {
  const source = objectValue(value);
  let enabled = source.preinspectionsBt;
  if (enabled === undefined && value && typeof value.get === "function") {
    enabled = value.get("preinspectionsBt");
  }
  return {
    preinspectionsBt: booleanSetting(enabled, true),
  };
}

function recordApplications(record) {
  if (!record) return { preinspectionsBt: true };
  try {
    const result = new DynamicModel({ preinspectionsBt: true });
    record.unmarshalJSONField("applications", result);
    return {
      preinspectionsBt: booleanSetting(result.preinspectionsBt, true),
    };
  } catch (error) {
    return recordApplications(record);
  }
}

function requireUser(event, options) {
  const settings = objectValue(options);
  if (!event.auth || event.auth.collection().name !== "users") {
    throw new UnauthorizedError("Se necesita una cuenta IsiVoltPro válida");
  }
  if (!event.auth.getBool("active")) {
    throw new ForbiddenError("La cuenta está desactivada");
  }
  if (recordApplications(event.auth).preinspectionsBt === false) {
    throw new ForbiddenError("El acceso a Preinspecciones BT está desactivado");
  }
  const companyId = event.auth.getString("company");
  if (!companyId) {
    throw new ForbiddenError("La cuenta no tiene una empresa asignada");
  }
  const role = event.auth.getString("role") || "viewer";
  if (settings.write === true && role === "viewer") {
    throw new ForbiddenError("La cuenta tiene acceso de solo consulta");
  }
  return {
    userId: event.auth.id,
    companyId: companyId,
    role: role,
    canViewAll: role === "admin" || role === "coordinator" || role === "viewer",
    canWrite: role !== "viewer",
    canAssign: role === "admin" || role === "coordinator",
  };
}

function canAccessInspection(record, auth) {
  if (!record || record.getString("company") !== auth.companyId) return false;
  if (auth.canViewAll) return true;
  return record.getString("assignedUser") === auth.userId
    || record.getString("ownerUser") === auth.userId;
}

function assertCanWriteInspection(record, auth) {
  if (!auth.canWrite) {
    throw new ForbiddenError("La cuenta tiene acceso de solo consulta");
  }
  if (!canAccessInspection(record, auth)) {
    throw new ForbiddenError("La preinspección no está asignada a este técnico");
  }
  if (auth.role === "inspector") {
    const status = record.getString("status");
    if (status === "CLOSED" || status === "CANCELLED") {
      throw new ForbiddenError("Un técnico no puede modificar un expediente cerrado o cancelado");
    }
  }
}

function findInspection(app, companyId, inspectionId) {
  const records = app.findAllRecords(
    "inspections",
    $dbx.and(
      $dbx.hashExp({ company: companyId }),
      $dbx.hashExp({ inspectionId: inspectionId }),
    ),
  );
  return records.length ? records[0] : null;
}

function listVisibleInspections(app, auth, since) {
  const companyRecords = app.findAllRecords(
    "inspections",
    $dbx.hashExp({ company: auth.companyId }),
  );
  const visible = [];
  const sinceTimestamp = String(since || "").trim();
  for (let index = 0; index < companyRecords.length; index += 1) {
    const record = companyRecords[index];
    if (!canAccessInspection(record, auth)) continue;
    if (sinceTimestamp && record.getString("updated") <= sinceTimestamp) continue;
    visible.push(record);
  }
  visible.sort((first, second) => {
    const firstUpdated = first.getString("updated");
    const secondUpdated = second.getString("updated");
    return firstUpdated < secondUpdated ? -1 : firstUpdated > secondUpdated ? 1 : 0;
  });
  return visible.slice(0, 250);
}

function validateBody(body) {
  const payload = objectValue(body);
  if (Number(payload.contractVersion || 0) !== CONTRACT_VERSION) {
    throw new BadRequestError("Versión de sincronización no compatible");
  }
  if (!String(payload.inspectionId || "").trim()) {
    throw new BadRequestError("Falta inspectionId");
  }
  if (Number(payload.revision || 0) < 1) {
    throw new BadRequestError("La revisión local no es válida");
  }
  if (Number(payload.baseRevision || 0) < 0) {
    throw new BadRequestError("La revisión base no es válida");
  }
  if (!payload.inspection || typeof payload.inspection !== "object" || Array.isArray(payload.inspection)) {
    throw new BadRequestError("El contenido de la preinspección no es válido");
  }
  return payload;
}

function normalizeStatus(value) {
  const status = String(value || "DRAFT").toUpperCase();
  return VALID_STATUS.indexOf(status) >= 0 ? status : "DRAFT";
}

function serializeInspection(record, auth) {
  const assignedUserId = record.getString("assignedUser");
  const ownerUserId = record.getString("ownerUser");
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
    ownerUserId: ownerUserId,
    assignedUserId: assignedUserId,
    permissions: {
      canEdit: auth ? auth.canWrite && canAccessInspection(record, auth) : false,
      canAssign: auth ? auth.canAssign : false,
      isOwner: auth ? ownerUserId === auth.userId : false,
      isAssigned: auth ? assignedUserId === auth.userId : false,
    },
    closureConfig: {
      latitude: record.get("closureLatitude"),
      longitude: record.get("closureLongitude"),
      allowedRadiusMeters: record.get("closureRadiusMeters"),
      policy: record.get("closurePolicy"),
      configuredBy: record.getString("closureConfiguredBy"),
      configuredAt: record.getString("closureConfiguredAt"),
    },
    created: record.getString("created"),
    updated: record.getString("updated"),
  };
}

function verifyFirebaseIdToken(idToken) {
  const apiKey = String($os.getenv("FIREBASE_WEB_API_KEY") || "").trim();
  if (!apiKey) {
    throw new InternalServerError("Falta FIREBASE_WEB_API_KEY en el servidor");
  }
  if (!String(idToken || "").trim()) {
    throw new BadRequestError("Falta el token de Firebase");
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
    throw new InternalServerError("No se pudo validar la cuenta Firebase");
  }

  const responseJson = response && response.json ? response.json : {};
  const responseUsers = responseJson && Array.isArray(responseJson.users) ? responseJson.users : [];
  if (!response || response.statusCode !== 200 || !responseUsers.length) {
    throw new UnauthorizedError("La sesión Firebase no es válida o ha caducado");
  }

  const firebaseUser = responseUsers[0];
  if (firebaseUser.disabled) {
    throw new ForbiddenError("La cuenta Firebase está desactivada");
  }

  return {
    uid: String(firebaseUser.localId || ""),
    email: String(firebaseUser.email || "").trim().toLowerCase(),
    displayName: String(firebaseUser.displayName || "").trim(),
    emailVerified: Boolean(firebaseUser.emailVerified),
  };
}

function findProvisionedUser(app, firebaseUser) {
  let records = app.findAllRecords("users", $dbx.hashExp({ firebaseUid: firebaseUser.uid }));
  if (records.length) return records[0];
  if (!firebaseUser.email) return null;
  records = app.findAllRecords("users", $dbx.hashExp({ email: firebaseUser.email }));
  return records.length ? records[0] : null;
}

module.exports = {
  CONTRACT_VERSION: CONTRACT_VERSION,
  applications: applications,
  assertCanWriteInspection: assertCanWriteInspection,
  canAccessInspection: canAccessInspection,
  findInspection: findInspection,
  findProvisionedUser: findProvisionedUser,
  listVisibleInspections: listVisibleInspections,
  normalizeStatus: normalizeStatus,
  objectValue: objectValue,
  requireUser: requireUser,
  serializeInspection: serializeInspection,
  validateBody: validateBody,
  verifyFirebaseIdToken: verifyFirebaseIdToken,
};
