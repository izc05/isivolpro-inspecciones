import fs from "node:fs";

function read(path) {
  return fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

function write(path, content) {
  fs.writeFileSync(new URL(`../${path}`, import.meta.url), content);
}

let api = read("src/sync/syncApiClient.js");
const technicianMethods = `    listTechnicians(options = {}) {
      return request("/api/isivolt/v1/admin/technicians", {
        signal: options.signal,
      });
    },

    createTechnician(technician, options = {}) {
      return request("/api/isivolt/v1/admin/technicians", {
        method: "POST",
        body: technician,
        signal: options.signal,
      });
    },

    updateTechnician(userId, technician, options = {}) {
      if (!userId) throw new Error("userId es obligatorio para actualizar el acceso técnico");
      return request(\`/api/isivolt/v1/admin/technicians/\${encodeURIComponent(userId)}\`, {
        method: "PUT",
        body: technician,
        signal: options.signal,
      });
    },

`;
if (!api.includes("listTechnicians(options")) {
  const marker = "    closeInspection(inspectionId, closure, options = {}) {";
  if (!api.includes(marker)) throw new Error("No se encontró el punto de extensión de syncApiClient");
  api = api.replace(marker, technicianMethods + marker);
}
write("src/sync/syncApiClient.js", api);

let desktop = read("src/desktop/DesktopWorkspace.jsx");
const technicianImport = 'import TechnicianAdminPanel from "../admin/TechnicianAdminPanel.jsx";';
if (!desktop.includes(technicianImport)) {
  const marker = 'import "./desktop-workspace.css";';
  if (!desktop.includes(marker)) throw new Error("No se encontró el CSS del escritorio");
  desktop = desktop.replace(marker, `${technicianImport}\n${marker}`);
}
const oldAdmin = '{activeSection === "admin" && <AdminOverview plan={plan} generatedReportsCount={generatedReportsCount} onOpenSettings={() => setSettingsFocus(true)} onExportBackup={onExportBackup} onImportBackup={onImportBackup} />}';
const newAdmin = `{activeSection === "admin" && (
            <>
              <AdminOverview plan={plan} generatedReportsCount={generatedReportsCount} onOpenSettings={() => setSettingsFocus(true)} onExportBackup={onExportBackup} onImportBackup={onImportBackup} />
              <TechnicianAdminPanel firebaseUser={user} />
            </>
          )}`;
if (desktop.includes(oldAdmin)) desktop = desktop.replace(oldAdmin, newAdmin);
if (!desktop.includes("<TechnicianAdminPanel firebaseUser={user}")) {
  throw new Error("No se pudo montar TechnicianAdminPanel");
}
write("src/desktop/DesktopWorkspace.jsx", desktop);

let syncHook = read("server/pocketbase/pb_hooks/isivolt_sync.pb.js");
const companyAccessMarker = `  const companyId = e.auth.getString("company");
  if (!companyId) {
    throw new ForbiddenError("La cuenta no tiene una empresa asignada");
  }

  return {`;
const companyAccessReplacement = `  const companyId = e.auth.getString("company");
  if (!companyId) {
    throw new ForbiddenError("La cuenta no tiene una empresa asignada");
  }
  const applications = e.auth.get("applications");
  if (applications && typeof applications === "object" && applications.preinspectionsBt === false) {
    throw new ForbiddenError("El acceso a Preinspecciones BT está desactivado", {
      code: "PREINSPECTIONS_ACCESS_DISABLED",
    });
  }

  return {`;
if (!syncHook.includes("PREINSPECTIONS_ACCESS_DISABLED")) {
  if (!syncHook.includes(companyAccessMarker)) throw new Error("No se encontró requireActiveUser");
  syncHook = syncHook.replace(companyAccessMarker, companyAccessReplacement);
}

const oldLinkBlock = `  if (!linkedUid) {
    record.set("firebaseUid", firebaseUser.uid);
    if (!record.getString("name") && firebaseUser.displayName) {
      record.set("name", firebaseUser.displayName);
    }
    e.app.save(record);
  }

  return $apis.recordAuthResponse(e, record, "firebase");`;
const newLinkBlock = `  const firstLink = !linkedUid;
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

  return $apis.recordAuthResponse(e, record, "firebase");`;
if (!syncHook.includes('record.set("lastAccessAt", accessNow)')) {
  if (!syncHook.includes(oldLinkBlock)) throw new Error("No se encontró el bloque de vinculación Firebase");
  syncHook = syncHook.replace(oldLinkBlock, newLinkBlock);
}
write("server/pocketbase/pb_hooks/isivolt_sync.pb.js", syncHook);

const required = [
  [api, "listTechnicians(options"],
  [api, "createTechnician(technician"],
  [desktop, "TechnicianAdminPanel"],
  [syncHook, "PREINSPECTIONS_ACCESS_DISABLED"],
  [syncHook, 'record.set("invitationStatus", "linked")'],
];
for (const [source, fragment] of required) {
  if (!source.includes(fragment)) throw new Error(`Integración incompleta: ${fragment}`);
}
console.log("Acceso de técnicos integrado correctamente");
