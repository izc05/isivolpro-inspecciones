routerAdd("GET", "/api/isivolt/v1/admin/inspections/{inspectionId}/assignment", (e) => {
  const assignment = require(`${__hooks}/inspection_assignment_utils.js`);
  const auth = assignment.requireManager(e);
  const inspectionId = String(e.request.pathValue("inspectionId") || "").trim();
  if (!inspectionId) {
    throw new BadRequestError("Falta el identificador de la preinspección");
  }
  const inspection = assignment.findInspection(e.app, auth.companyId, inspectionId);
  const users = assignment.listAssignableUsers(e.app, auth.companyId);
  const technicians = [];
  for (let index = 0; index < users.length; index += 1) {
    technicians.push(assignment.serializeUser(users[index]));
  }
  return e.json(200, {
    assignment: assignment.serializeAssignment(e.app, inspection),
    technicians: technicians,
  });
}, $apis.requireAuth("users"));

routerAdd("PUT", "/api/isivolt/v1/admin/inspections/{inspectionId}/assignment", (e) => {
  const assignment = require(`${__hooks}/inspection_assignment_utils.js`);
  const auth = assignment.requireManager(e);
  const inspectionId = String(e.request.pathValue("inspectionId") || "").trim();
  if (!inspectionId) {
    throw new BadRequestError("Falta el identificador de la preinspección");
  }
  const body = e.requestInfo().body || {};
  const assignedUserId = String(body.assignedUserId || "").trim();
  let response = null;

  e.app.runInTransaction((txApp) => {
    const inspection = assignment.findInspection(txApp, auth.companyId, inspectionId);
    const currentStatus = inspection.getString("status");
    if (currentStatus === "CLOSED" || currentStatus === "CANCELLED") {
      throw new BadRequestError("No se puede reasignar una preinspección cerrada o cancelada");
    }

    const previousUserId = inspection.getString("assignedUser");
    const nextUser = assignedUserId
      ? assignment.findAssignableUser(txApp, assignedUserId, auth.companyId)
      : null;
    const nextUserId = nextUser ? nextUser.id : "";
    const now = new Date().toISOString();
    const nextRevision = Math.max(1, inspection.getInt("revision")) + 1;

    inspection.set("assignedUser", nextUserId);
    if (nextUserId && currentStatus === "DRAFT") {
      inspection.set("status", "ASSIGNED");
    } else if (!nextUserId && currentStatus === "ASSIGNED") {
      inspection.set("status", "DRAFT");
    }
    inspection.set("revision", nextRevision);
    inspection.set("clientUpdatedAt", now);
    inspection.set("lastSyncedAt", now);
    txApp.save(inspection);

    assignment.audit(txApp, auth, inspection, previousUserId, nextUserId, nextRevision);
    response = assignment.serializeAssignment(txApp, inspection);
  });

  return e.json(200, { assignment: response });
}, $apis.requireAuth("users"));
