const TECHNICIAN_ALLOWED_ROLES = ["inspector", "coordinator", "viewer"];

function technicianObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function technicianEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function technicianText(value, maximum) {
  return String(value || "").trim().slice(0, maximum);
}

function technicianApplications(value) {
  const source = technicianObject(value);
  return {
    preinspectionsBt: source.preinspectionsBt === undefined ? true : Boolean(source.preinspectionsBt),
  };
}

function technicianRole(value) {
  const role = String(value || "inspector").trim().toLowerCase();
  return TECHNICIAN_ALLOWED_ROLES.indexOf(role) >= 0 ? role : "inspector";
}

function requireTechnicianAdmin(e) {
  if (!e.auth || e.auth.collection().name !== "users") {
    throw new UnauthorizedError("Se necesita una cuenta IsiVoltPro válida");
  }
  if (!e.auth.getBool("active")) {
    throw new ForbiddenError("La cuenta está desactivada");
  }
  if (e.auth.getString("role") !== "admin") {
    throw new ForbiddenError("Solo un administrador puede gestionar accesos técnicos", {
      code: "ADMIN_ROLE_REQUIRED",
    });
  }
  const companyId = e.auth.getString("company");
  if (!companyId) {
    throw new ForbiddenError("La cuenta no tiene empresa asignada");
  }
  return {
    userId: e.auth.id,
    companyId: companyId,
  };
}

function technicianInvitationStatus(record) {
  if (!record.getBool("active")) return "disabled";
  if (record.getString("firebaseUid")) return "linked";
  return "pending";
}

function serializeTechnician(record) {
  return {
    id: record.id,
    email: record.email(),
    name: record.getString("name"),
    phone: record.getString("phone"),
    specialty: record.getString("specialty"),
    role: record.getString("role"),
    active: record.getBool("active"),
    applications: technicianApplications(record.get("applications")),
    linked: Boolean(record.getString("firebaseUid")),
    invitationStatus: technicianInvitationStatus(record),
    invitedAt: record.getString("invitedAt"),
    lastAccessAt: record.getString("lastAccessAt"),
    created: record.getString("created"),
    updated: record.getString("updated"),
  };
}

function technicianFindById(app, userId, companyId) {
  const record = app.findRecordById("users", userId);
  if (record.getString("company") !== companyId || record.getString("role") === "admin") {
    throw new NotFoundError("No se ha encontrado el acceso técnico");
  }
  return record;
}

function technicianAccessEvent(app, auth, target, eventType, details) {
  const collection = app.findCollectionByNameOrId("technician_access_events");
  const event = new Record(collection);
  event.set("company", auth.companyId);
  event.set("targetUser", target.id);
  event.set("actorUser", auth.userId);
  event.set("eventType", eventType);
  event.set("details", technicianObject(details));
  event.set("occurredAt", new Date().toISOString());
  app.save(event);
}

function technicianFindByEmail(app, email) {
  try {
    return app.findAuthRecordByEmail("users", email);
  } catch (error) {
    return null;
  }
}

routerAdd("GET", "/api/isivolt/v1/admin/technicians", (e) => {
  const auth = requireTechnicianAdmin(e);
  const records = e.app.findRecordsByFilter(
    "users",
    "company = {:company} && role != 'admin'",
    "name,email",
    500,
    0,
    { company: auth.companyId },
  );
  const technicians = [];
  for (let index = 0; index < records.length; index += 1) {
    technicians.push(serializeTechnician(records[index]));
  }
  return e.json(200, { technicians: technicians });
}, $apis.requireAuth("users"));

routerAdd("POST", "/api/isivolt/v1/admin/technicians", (e) => {
  const auth = requireTechnicianAdmin(e);
  const body = new DynamicModel({
    email: "",
    name: "",
    phone: "",
    specialty: "",
    role: "inspector",
    active: true,
    applications: {},
  });
  e.bindBody(body);

  const email = technicianEmail(body.email);
  const name = technicianText(body.name, 160);
  if (!email || email.indexOf("@") <= 0) {
    throw new BadRequestError("El correo del técnico no es válido", {
      code: "INVALID_TECHNICIAN_EMAIL",
    });
  }
  if (!name) {
    throw new BadRequestError("El nombre del técnico es obligatorio", {
      code: "TECHNICIAN_NAME_REQUIRED",
    });
  }

  const existing = technicianFindByEmail(e.app, email);
  if (existing) {
    return e.json(409, {
      code: existing.getString("company") === auth.companyId
        ? "TECHNICIAN_ALREADY_EXISTS"
        : "EMAIL_ALREADY_PROVISIONED",
      message: existing.getString("company") === auth.companyId
        ? "Ese correo ya tiene acceso en la empresa"
        : "Ese correo ya está vinculado a otra empresa",
    });
  }

  const users = e.app.findCollectionByNameOrId("users");
  const record = new Record(users);
  record.setEmail(email);
  record.setRandomPassword();
  record.setVerified(false);
  record.set("name", name);
  record.set("company", auth.companyId);
  record.set("role", technicianRole(body.role));
  record.set("active", body.active === undefined ? true : Boolean(body.active));
  record.set("applications", technicianApplications(body.applications));
  record.set("firebaseUid", "");
  record.set("phone", technicianText(body.phone, 40));
  record.set("specialty", technicianText(body.specialty, 160));
  record.set("invitationStatus", body.active === false ? "disabled" : "pending");
  record.set("invitedBy", auth.userId);
  record.set("invitedAt", new Date().toISOString());
  e.app.save(record);

  technicianAccessEvent(e.app, auth, record, "INVITED", {
    email: email,
    role: record.getString("role"),
    applications: technicianApplications(record.get("applications")),
  });

  return e.json(201, { technician: serializeTechnician(record) });
}, $apis.requireAuth("users"));

routerAdd("PUT", "/api/isivolt/v1/admin/technicians/{userId}", (e) => {
  const auth = requireTechnicianAdmin(e);
  const userId = String(e.request.pathValue("userId") || "").trim();
  const record = technicianFindById(e.app, userId, auth.companyId);
  const body = new DynamicModel({
    name: "",
    phone: "",
    specialty: "",
    role: "",
    active: null,
    applications: null,
  });
  e.bindBody(body);

  const previousActive = record.getBool("active");
  const previousApplications = technicianApplications(record.get("applications"));
  const nextName = technicianText(body.name, 160);
  if (nextName) record.set("name", nextName);
  record.set("phone", technicianText(body.phone, 40));
  record.set("specialty", technicianText(body.specialty, 160));
  if (String(body.role || "").trim()) {
    record.set("role", technicianRole(body.role));
  }
  if (body.active !== null && body.active !== undefined) {
    record.set("active", Boolean(body.active));
  }
  if (body.applications !== null && body.applications !== undefined) {
    record.set("applications", technicianApplications(body.applications));
  }
  record.set("invitationStatus", technicianInvitationStatus(record));
  e.app.save(record);

  const currentActive = record.getBool("active");
  const currentApplications = technicianApplications(record.get("applications"));
  let eventType = "UPDATED";
  if (previousActive !== currentActive) {
    eventType = currentActive ? "ACTIVATED" : "DEACTIVATED";
  } else if (JSON.stringify(previousApplications) !== JSON.stringify(currentApplications)) {
    eventType = "ACCESS_CHANGED";
  }
  technicianAccessEvent(e.app, auth, record, eventType, {
    active: currentActive,
    role: record.getString("role"),
    applications: currentApplications,
  });

  return e.json(200, { technician: serializeTechnician(record) });
}, $apis.requireAuth("users"));
