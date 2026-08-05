const ALLOWED_ROLES = ["inspector", "coordinator", "viewer"];

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

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeText(value, maximum) {
  return String(value || "").trim().slice(0, maximum);
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
  if (recordApplications(event.auth).preinspectionsBt === false) {
    throw new ForbiddenError("El acceso a Preinspecciones BT está desactivado");
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
    applications: recordApplications(record),
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
  recordApplications: recordApplications,
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
