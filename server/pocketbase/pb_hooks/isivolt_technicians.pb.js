routerAdd("GET", "/api/isivolt/v1/admin/technicians", (e) => {
  const tech = require(`${__hooks}/technician_access_utils.js`);
  const auth = tech.requireAdmin(e);
  const records = tech.listForCompany(e.app, auth.companyId);
  const technicians = [];
  for (let index = 0; index < records.length; index += 1) {
    technicians.push(tech.serialize(records[index]));
  }
  return e.json(200, { technicians: technicians });
}, $apis.requireAuth("users"));

routerAdd("POST", "/api/isivolt/v1/admin/technicians", (e) => {
  const tech = require(`${__hooks}/technician_access_utils.js`);
  const auth = tech.requireAdmin(e);
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

  const email = tech.normalizeEmail(body.email);
  const name = tech.normalizeText(body.name, 160);
  if (!email || email.indexOf("@") <= 0) {
    throw new BadRequestError("El correo del técnico no es válido");
  }
  if (!name) {
    throw new BadRequestError("El nombre del técnico es obligatorio");
  }

  const existing = tech.findByEmail(e.app, email);
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
  record.set("role", tech.role(body.role));
  record.set("active", body.active === undefined ? true : Boolean(body.active));
  record.set("applications", tech.applications(body.applications));
  record.set("firebaseUid", "");
  record.set("phone", tech.normalizeText(body.phone, 40));
  record.set("specialty", tech.normalizeText(body.specialty, 160));
  record.set("invitationStatus", body.active === false ? "disabled" : "pending");
  record.set("invitedBy", auth.userId);
  record.set("invitedAt", new Date().toISOString());
  e.app.save(record);

  tech.audit(e.app, auth, record, "INVITED", {
    email: email,
    role: record.getString("role"),
    applications: tech.applications(record.get("applications")),
  });

  return e.json(201, { technician: tech.serialize(record) });
}, $apis.requireAuth("users"));

routerAdd("PUT", "/api/isivolt/v1/admin/technicians/{userId}", (e) => {
  const tech = require(`${__hooks}/technician_access_utils.js`);
  const auth = tech.requireAdmin(e);
  const userId = String(e.request.pathValue("userId") || "").trim();
  const record = tech.findById(e.app, userId, auth.companyId);
  const body = new DynamicModel({
    name: "",
    phone: "",
    specialty: "",
    role: "",
    active: nullBool(),
    applications: nullObject(),
  });
  e.bindBody(body);

  const previousActive = record.getBool("active");
  const previousApplications = tech.applications(record.get("applications"));
  const nextName = tech.normalizeText(body.name, 160);
  if (nextName) record.set("name", nextName);
  record.set("phone", tech.normalizeText(body.phone, 40));
  record.set("specialty", tech.normalizeText(body.specialty, 160));
  if (String(body.role || "").trim()) {
    record.set("role", tech.role(body.role));
  }
  if (body.active !== null && body.active !== undefined) {
    record.set("active", Boolean(body.active));
  }
  if (body.applications !== null && body.applications !== undefined) {
    record.set("applications", tech.applications(body.applications));
  }
  record.set("invitationStatus", tech.invitationStatus(record));
  e.app.save(record);

  const currentActive = record.getBool("active");
  const currentApplications = tech.applications(record.get("applications"));
  let eventType = "UPDATED";
  if (previousActive !== currentActive) {
    eventType = currentActive ? "ACTIVATED" : "DEACTIVATED";
  } else if (JSON.stringify(previousApplications) !== JSON.stringify(currentApplications)) {
    eventType = "ACCESS_CHANGED";
  }
  tech.audit(e.app, auth, record, eventType, {
    active: currentActive,
    role: record.getString("role"),
    applications: currentApplications,
  });

  return e.json(200, { technician: tech.serialize(record) });
}, $apis.requireAuth("users"));
