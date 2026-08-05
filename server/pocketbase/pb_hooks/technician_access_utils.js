const ALLOWED_ROLES = ["inspector", "coordinator", "viewer"];

function objectValue(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeText(value, maximum) {
  return String(value || "").trim().slice(0, maximum);
}

function applications(value) {
  let enabled;
  if (value && typeof value.get === "function") {
    enabled = value.get("preinspectionsBt");
  } else {
    enabled = objectValue(value).preinspectionsBt;
  }
  return {
    preinspectionsBt: enabled === undefined || enabled === null ? true : Boolean(enabled),
  };
}

function role(value) {
  const normalized = String(value || "inspector").trim().toLowerCase();
  return ALLOWED_ROLES.indexOf(normalized) >= 0 ? normalized : "inspector";
}

function requireAdmin(event) {
  if (!event.auth || event.auth.collection().name !== "users") {
    throw new UnauthorizedError("Se necesita una cuenta IsiVoltPro válida");
  }
  if (!event.auth.getBool("active")) {
    throw new ForbiddenError("La cuenta está desactivada");
  }
  if (event.auth.getString("role") !== "admin") {
    throw new ForbiddenError("Solo un administrador puede gestionar accesos técnicos");
  }
  const companyId = event.auth.getString("company");
  if (!companyId) {
    throw new ForbiddenError("La cuenta no tiene empresa asignada");
  }
  return {
    userId: event.auth.id,
    companyId: companyId,
  };
}

function invitationStatus(record) {
  if (!record.getBool("active")) return "disabled";
  if (record.getString("firebaseUid")) return "linked";
  return "pending";
}

function serialize(record) {
  return {
    id: record.id,
    email: record.email(),
    name: record.getString("name"),
    phone: record.getString("phone"),
    specialty: record.getString("specialty"),
    role: record.getString("role"),
    active: record.getBool("active"),
    applications: applications(record.get("applications")),
    linked: Boolean(record.getString("firebaseUid")),
    invitationStatus: invitationStatus(record),
    invitedAt: record.getString("invitedAt"),
    lastAccessAt: record.getString("lastAccessAt"),
    created: record.getString("created"),
    updated: record.getString("updated"),
  };
}

function findById(app, userId, companyId) {
  const record = app.findRecordById("users", userId);
  if (record.getString("company") !== companyId || record.getString("role") === "admin") {
    throw new NotFoundError("No se ha encontrado el acceso técnico");
  }
  return record;
}

function audit(app, auth, target, eventType, details) {
  const collection = app.findCollectionByNameOrId("technician_access_events");
  const event = new Record(collection);
  event.set("company", auth.companyId);
  event.set("targetUser", target.id);
  event.set("actorUser", auth.userId);
  event.set("eventType", eventType);
  event.set("details", objectValue(details));
  event.set("occurredAt", new Date().toISOString());
  app.save(event);
}

function findByEmail(app, email) {
  try {
    return app.findAuthRecordByEmail("users", email);
  } catch (error) {
    return null;
  }
}

function listForCompany(app, companyId) {
  const companyRecords = app.findAllRecords(
    "users",
    $dbx.hashExp({ company: companyId }),
  );
  const records = [];
  for (let index = 0; index < companyRecords.length; index += 1) {
    if (companyRecords[index].getString("role") !== "admin") {
      records.push(companyRecords[index]);
    }
  }
  records.sort((first, second) => {
    const firstKey = (first.getString("name") + " " + first.email()).toLowerCase();
    const secondKey = (second.getString("name") + " " + second.email()).toLowerCase();
    return firstKey < secondKey ? -1 : firstKey > secondKey ? 1 : 0;
  });
  return records;
}

module.exports = {
  applications: applications,
  audit: audit,
  findByEmail: findByEmail,
  findById: findById,
  invitationStatus: invitationStatus,
  listForCompany: listForCompany,
  normalizeEmail: normalizeEmail,
  normalizeText: normalizeText,
  objectValue: objectValue,
  requireAdmin: requireAdmin,
  role: role,
  serialize: serialize,
};
