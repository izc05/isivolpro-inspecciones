import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function write(relativePath, content) {
  fs.writeFileSync(path.join(root, relativePath), content);
}

function replaceOnce(source, search, replacement, label) {
  if (source.includes(replacement)) return source;
  if (!source.includes(search)) throw new Error(`No se encontró el punto de inserción: ${label}`);
  return source.replace(search, replacement);
}

function insertBefore(source, marker, insertion, label) {
  if (source.includes(insertion.trim())) return source;
  const index = source.indexOf(marker);
  if (index < 0) throw new Error(`No se encontró el marcador: ${label}`);
  return source.slice(0, index) + insertion + source.slice(index);
}

// PocketBase: include a safe assigned-technician summary in every synchronized record.
{
  const file = "server/pocketbase/pb_hooks/sync_core_utils.js";
  let source = read(file);
  source = insertBefore(
    source,
    "function serializeInspection(record, auth)",
    `function serializeAssignedUser(app, userId) {\n  const normalizedId = String(userId || \"\").trim();\n  if (!app || !normalizedId) return null;\n  try {\n    const user = app.findRecordById(\"users\", normalizedId);\n    return {\n      id: user.id,\n      name: user.getString(\"name\"),\n      email: user.getString(\"email\"),\n      specialty: user.getString(\"specialty\"),\n      role: user.getString(\"role\") || \"inspector\",\n      active: user.getBool(\"active\"),\n    };\n  } catch (error) {\n    return null;\n  }\n}\n\n`,
    "serializeAssignedUser",
  );
  source = source.replace("function serializeInspection(record, auth) {", "function serializeInspection(record, auth, app) {");
  source = replaceOnce(
    source,
    "    assignedUserId: assignedUserId,\n    permissions:",
    "    assignedUserId: assignedUserId,\n    assignedUser: serializeAssignedUser(app, assignedUserId),\n    permissions:",
    "assignedUser en serializeInspection",
  );
  write(file, source);
}

{
  const file = "server/pocketbase/pb_hooks/isivolt_sync.pb.js";
  let source = read(file);
  source = source.replaceAll("sync.serializeInspection(existing, auth)", "sync.serializeInspection(existing, auth, txApp)");
  source = source.replaceAll("sync.serializeInspection(records[index], auth)", "sync.serializeInspection(records[index], auth, e.app)");
  write(file, source);
}

// Client merge: preserve the technician summary locally and in sync metadata.
{
  const file = "src/sync/remoteMerge.js";
  let source = read(file);
  source = insertBefore(
    source,
    "function getRemoteAccess(remote)",
    `function getRemoteAssignedUser(remote) {\n  const source = remote?.assignedUser && typeof remote.assignedUser === \"object\" && !Array.isArray(remote.assignedUser)\n    ? remote.assignedUser\n    : null;\n  if (!source || !String(source.id || remote?.assignedUserId || \"\").trim()) return null;\n  return {\n    id: String(source.id || remote.assignedUserId || \"\"),\n    name: String(source.name || \"\").trim(),\n    email: String(source.email || \"\").trim().toLowerCase(),\n    specialty: String(source.specialty || \"\").trim(),\n    role: String(source.role || \"inspector\"),\n    active: source.active !== false,\n  };\n}\n\n`,
    "getRemoteAssignedUser",
  );
  source = replaceOnce(
    source,
    "    assignedUserId: String(remote?.assignedUserId || \"\"),\n    permissions: getRemotePermissions(remote),",
    "    assignedUserId: String(remote?.assignedUserId || \"\"),\n    assignedUser: getRemoteAssignedUser(remote),\n    permissions: getRemotePermissions(remote),",
    "assignedUser en getRemoteAccess",
  );
  source = replaceOnce(
    source,
    "    assignedUserId: access.assignedUserId,\n    permissions: access.permissions,\n    updatedAt:",
    "    assignedUserId: access.assignedUserId,\n    assignedUser: access.assignedUser,\n    permissions: access.permissions,\n    updatedAt:",
    "assignedUser en metadatos",
  );
  source = replaceOnce(
    source,
    "    assignedUserId: access.assignedUserId,\n    permissions: access.permissions,\n    sync,",
    "    assignedUserId: access.assignedUserId,\n    assignedUser: access.assignedUser,\n    permissions: access.permissions,\n    sync,",
    "assignedUser en registro local",
  );
  write(file, source);
}

// Assignment control: notify the desktop immediately after a successful change.
{
  const file = "src/admin/InspectionAssignmentControl.jsx";
  let source = read(file);
  source = source.replace(
    "export default function InspectionAssignmentControl({ firebaseUser, inspection }) {",
    "export default function InspectionAssignmentControl({ firebaseUser, inspection, onAssignmentChange }) {",
  );
  source = replaceOnce(
    source,
    "      setAssignment(next);\n      setMessage(selectedId ?",
    "      setAssignment(next);\n      onAssignmentChange?.(next);\n      setMessage(selectedId ?",
    "callback de asignación",
  );
  write(file, source);
}

// Desktop: show the assigned technician in the table, search and detail panel.
{
  const file = "src/desktop/DesktopWorkspace.jsx";
  let source = read(file);
  source = insertBefore(
    source,
    "function StatCard(",
    `function assignedTechnician(inspection) {\n  const source = inspection?.assignedUser || inspection?.sync?.assignedUser;\n  return source && typeof source === \"object\" ? source : null;\n}\n\nfunction assignedTechnicianName(inspection) {\n  const technician = assignedTechnician(inspection);\n  return normalizeText(technician?.name) || normalizeText(technician?.email) || \"Sin asignar\";\n}\n\n`,
    "assignedTechnician helpers",
  );
  source = replaceOnce(
    source,
    "            <th>Estado</th>\n            <th>Avance</th>",
    "            <th>Estado</th>\n            <th>Técnico</th>\n            <th>Avance</th>",
    "cabecera Técnico",
  );
  source = replaceOnce(
    source,
    "                <td><span className={status.className}>{status.label}</span></td>\n                <td>\n                  <div className=\"isivolt-progress-cell\">",
    "                <td><span className={status.className}>{status.label}</span></td>\n                <td>\n                  <strong>{assignedTechnicianName(inspection)}</strong>\n                  <span>{normalizeText(assignedTechnician(inspection)?.specialty) || \"Sin especialidad\"}</span>\n                </td>\n                <td>\n                  <div className=\"isivolt-progress-cell\">",
    "celda Técnico",
  );
  source = source.replace(
    "function DetailPanel({ inspection, firebaseUser, readOnly = false, canManageAssignments = false, onContinue, onEdit, onDocuments, onReport, onDelete }) {",
    "function DetailPanel({ inspection, firebaseUser, readOnly = false, canManageAssignments = false, onAssignmentChange, onContinue, onEdit, onDocuments, onReport, onDelete }) {",
  );
  source = replaceOnce(
    source,
    "  const canAssign = !readOnly && (canManageAssignments || permissions.canAssign === true);\n\n  return (",
    "  const canAssign = !readOnly && (canManageAssignments || permissions.canAssign === true);\n  const technician = assignedTechnician(inspection);\n\n  return (",
    "técnico en detalle",
  );
  source = replaceOnce(
    source,
    "        <div><dt>Tipo</dt><dd>{normalizeText(data.inspectionType) || \"Sin indicar\"}</dd></div>\n        <div><dt>Última edición</dt>",
    "        <div><dt>Tipo</dt><dd>{normalizeText(data.inspectionType) || \"Sin indicar\"}</dd></div>\n        <div><dt>Técnico</dt><dd>{assignedTechnicianName(inspection)}{technician?.specialty ? ` · ${technician.specialty}` : \"\"}</dd></div>\n        <div><dt>Última edición</dt>",
    "técnico en rejilla de detalle",
  );
  source = replaceOnce(
    source,
    "      {canAssign && <InspectionAssignmentControl firebaseUser={firebaseUser} inspection={inspection} />}",
    "      {canAssign && <InspectionAssignmentControl firebaseUser={firebaseUser} inspection={inspection} onAssignmentChange={(assignment) => onAssignmentChange?.(inspection.id, assignment)} />}",
    "callback del selector",
  );
  source = replaceOnce(
    source,
    "  const [settingsFocus, setSettingsFocus] = useState(false);\n  const syncSession",
    "  const [settingsFocus, setSettingsFocus] = useState(false);\n  const [assignmentOverrides, setAssignmentOverrides] = useState({});\n  const syncSession",
    "estado de asignaciones",
  );
  source = replaceOnce(
    source,
    "  const selectedInspection = inspections.find((inspection) => inspection.id === selectedId) || inspections[0] || null;\n  const filteredInspections = useMemo(() => {\n    const normalizedQuery = query.trim().toLowerCase();\n    return inspections.filter((inspection) => {",
    "  const displayInspections = useMemo(() => inspections.map((inspection) => {\n    const assignment = assignmentOverrides[inspection.id];\n    if (!assignment) return inspection;\n    return {\n      ...inspection,\n      assignedUserId: assignment.assignedUserId || \"\",\n      assignedUser: assignment.assignedUser || null,\n      sync: {\n        ...(inspection.sync || {}),\n        assignedUserId: assignment.assignedUserId || \"\",\n        assignedUser: assignment.assignedUser || null,\n        serverRevision: Math.max(Number(inspection?.sync?.serverRevision || 0), Number(assignment.revision || 0)),\n      },\n    };\n  }), [inspections, assignmentOverrides]);\n\n  const selectedInspection = displayInspections.find((inspection) => inspection.id === selectedId) || displayInspections[0] || null;\n  const filteredInspections = useMemo(() => {\n    const normalizedQuery = query.trim().toLowerCase();\n    return displayInspections.filter((inspection) => {",
    "inspecciones visibles",
  );
  source = replaceOnce(
    source,
    "      const haystack = [inspectionTitle(inspection), inspectionSubtitle(inspection), data.ownerName, data.orderNumber, data.cups].join(\" \ ").toLowerCase();",
    "      const technician = assignedTechnician(inspection);\n      const haystack = [inspectionTitle(inspection), inspectionSubtitle(inspection), data.ownerName, data.orderNumber, data.cups, technician?.name, technician?.email, technician?.specialty].join(\" \ ").toLowerCase();",
    "búsqueda por técnico",
  );
  source = source.replace("  }, [inspections, query, statusFilter, regulationFilter]);", "  }, [displayInspections, query, statusFilter, regulationFilter]);");
  source = source.replace("    total: inspections.length,", "    total: displayInspections.length,");
  source = source.replaceAll("inspections.filter((inspection)", "displayInspections.filter((inspection)");
  source = source.replace("    defects: inspections.reduce((sum, inspection)", "    defects: displayInspections.reduce((sum, inspection)");
  source = source.replace("  }), [inspections]);", "  }), [displayInspections]);");
  source = insertBefore(
    source,
    "  const isWorkspaceScreen =",
    `  const handleAssignmentChange = (localId, assignment) => {\n    setAssignmentOverrides((current) => ({ ...current, [localId]: assignment }));\n  };\n\n`,
    "handleAssignmentChange",
  );
  source = replaceOnce(
    source,
    "              <DetailPanel inspection={selectedInspection} firebaseUser={user} readOnly={readOnlyWorkspace} canManageAssignments={canManageAssignments}",
    "              <DetailPanel inspection={selectedInspection} firebaseUser={user} readOnly={readOnlyWorkspace} canManageAssignments={canManageAssignments} onAssignmentChange={handleAssignmentChange}",
    "callback en DetailPanel",
  );
  source = source.replace(
    "{activeSection === \"reports\" && <ReportsOverview inspections={inspections} onReport={onReport} />}",
    "{activeSection === \"reports\" && <ReportsOverview inspections={displayInspections} onReport={onReport} />}",
  );
  write(file, source);
}

// Tests: prove that the visible technician survives remote download and later updates.
{
  const file = "src/sync/remoteMerge.test.js";
  let source = read(file);
  source = replaceOnce(
    source,
    "  assignedUserId = \"technician-1\",\n  permissions = {",
    "  assignedUserId = \"technician-1\",\n  assignedUser = { id: \"technician-1\", name: \"Ana Técnica\", email: \"ana@example.com\", specialty: \"Electricidad\", role: \"inspector\", active: true },\n  permissions = {",
    "fixture assignedUser",
  );
  source = replaceOnce(
    source,
    "    assignedUserId,\n    permissions,",
    "    assignedUserId,\n    assignedUser,\n    permissions,",
    "retorno assignedUser",
  );
  source = replaceOnce(
    source,
    "  assert.equal(result.inspections[0].assignedUserId, \"technician-1\");\n  assert.equal(result.inspections[0].permissions.isAssigned, true);",
    "  assert.equal(result.inspections[0].assignedUserId, \"technician-1\");\n  assert.equal(result.inspections[0].assignedUser.name, \"Ana Técnica\");\n  assert.equal(result.inspections[0].assignedUser.specialty, \"Electricidad\");\n  assert.equal(result.inspections[0].sync.assignedUser.name, \"Ana Técnica\");\n  assert.equal(result.inspections[0].permissions.isAssigned, true);",
    "aserciones assignedUser inicial",
  );
  source = replaceOnce(
    source,
    "    assignedUserId: \"technician-2\",\n    permissions: {",
    "    assignedUserId: \"technician-2\",\n    assignedUser: { id: \"technician-2\", name: \"Luis Coordinador\", email: \"luis@example.com\", specialty: \"Coordinación\", role: \"coordinator\", active: true },\n    permissions: {",
    "assignedUser actualizado",
  );
  source = replaceOnce(
    source,
    "  assert.equal(result.inspections[0].assignedUserId, \"technician-2\");\n  assert.equal(result.inspections[0].permissions.canAssign, true);",
    "  assert.equal(result.inspections[0].assignedUserId, \"technician-2\");\n  assert.equal(result.inspections[0].assignedUser.name, \"Luis Coordinador\");\n  assert.equal(result.inspections[0].sync.assignedUser.role, \"coordinator\");\n  assert.equal(result.inspections[0].permissions.canAssign, true);",
    "aserciones assignedUser actualizado",
  );
  write(file, source);
}

console.log("Visibilidad del técnico asignado preparada de forma idempotente");
