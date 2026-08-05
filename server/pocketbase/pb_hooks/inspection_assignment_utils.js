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

function requireManager(event) {
  if (!event.auth || event.auth.collection().name !== "users") {
    throw new UnauthorizedError("Se necesita una cuenta IsiVoltPro válida");
  }
  if (!event.auth.getBool("active")) {
    throw new ForbiddenError("La cuenta está desactivada");
  }
  if (recordApplications(event.auth).preinspectionsBt === false) {
    throw new ForbiddenError("El acceso a Preinspecciones BT está desactivado");
  }
  const role = event.auth.getString("role");
  if (role !== "admin" && role !== "coordinator") {
    throw new ForbiddenError("Solo administración o coordinación puede asignar expedientes");
  }
  const companyId = event.auth.getString("company");
  if (!companyId) {
    throw new ForbiddenError("La cuenta no tiene empresa asignada");
  }
  return {
    userId: event.auth.id,
    companyId: companyId,
    role: role,
  };
}

function findInspection(app, companyId, inspectionId) {
  const records = app.findAllRecords(
    "inspections",
    $dbx.and(
      $dbx.hashExp({ company: companyId }),
      $dbx.hashExp({ inspectionId: inspectionId }),
    ),
  );
  if (!records.length) {
    throw new NotFoundError("No se ha encontrado la preinspección");
  }
  return records[0];
}

function serializeUser(record) {
  if (!record) return null;
  return {
    id: record.id,
    email: record.email(),
    name: record.getString("name"),
    phone: record.getString("phone"),
    specialty: record.getString("specialty"),
    role: record.getString("role"),
    active: record.getBool("active"),
    invitationStatus: record.getString("invitationStatus"),
  };
}

function isAssignable(record, companyId) {
  if (!record || record.getString("company") !== companyId) return false;
  if (!record.getBool("active")) return false;
  if (recordApplications(record).preinspectionsBt === false) return false;
  const role = record.getString("role");
  return role === "inspector" || role === "coordinator";
}

function findAssignableUser(app, userId, companyId) {
  if (!userId) return null;
  let record;
  try {
    record = app.findRecordById("users", userId);
  } catch (error) {
    throw new BadRequestError("El técnico seleccionado no existe");
  }
  if (!isAssignable(record, companyId)) {
    throw new BadRequestError("El técnico no está activo o no tiene acceso a Preinspecciones BT");
  }
  return record;
}

function listAssignableUsers(app, companyId) {
  const companyUsers = app.findAllRecords("users", $dbx.hashExp({ company: companyId }));
  const assignable = [];
  for (let index = 0; index < companyUsers.length; index += 1) {
    if (isAssignable(companyUsers[index], companyId)) {
      assignable.push(companyUsers[index]);
    }
  }
  assignable.sort((first, second) => {
    const firstKey = (first.getString("name") + " " + first.email()).toLowerCase();
    const secondKey = (second.getString("name") + " " + second.email()).toLowerCase();
    return firstKey < secondKey ? -1 : firstKey > secondKey ? 1 : 0;
  });
  return assignable;
}

function assignedUser(app, inspection) {
  const userId = inspection.getString("assignedUser");
  if (!userId) return null;
  try {
    return app.findRecordById("users", userId);
  } catch (error) {
    return null;
  }
}

function serializeAssignment(app, inspection) {
  return {
    inspectionId: inspection.getString("inspectionId"),
    assignedUserId: inspection.getString("assignedUser"),
    assignedUser: serializeUser(assignedUser(app, inspection)),
    status: inspection.getString("status"),
    revision: inspection.getInt("revision"),
    updated: inspection.getString("updated"),
  };
}

function audit(app, auth, inspection, previousUserId, nextUserId, revision) {
  const events = app.findCollectionByNameOrId("inspection_events");
  const event = new Record(events);
  event.set("company", auth.companyId);
  event.set("inspection", inspection.id);
  event.set("inspectionId", inspection.getString("inspectionId"));
  event.set("user", auth.userId);
  event.set("eventType", "ASSIGNED");
  event.set("revision", revision);
  event.set("details", {
    previousAssignedUserId: previousUserId || null,
    assignedUserId: nextUserId || null,
    assignedByRole: auth.role,
  });
  event.set("clientCreatedAt", new Date().toISOString());
  app.save(event);
}

module.exports = {
  applications: applications,
  recordApplications: recordApplications,
  audit: audit,
  findAssignableUser: findAssignableUser,
  findInspection: findInspection,
  listAssignableUsers: listAssignableUsers,
  requireManager: requireManager,
  serializeAssignment: serializeAssignment,
  serializeUser: serializeUser,
};
