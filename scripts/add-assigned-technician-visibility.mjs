import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lines = (...items) => items.join("\n");

function load(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function save(relativePath, content) {
  fs.writeFileSync(path.join(root, relativePath), content);
}

function replaceExact(source, search, replacement, label) {
  if (source.includes(replacement)) return source;
  if (!source.includes(search)) throw new Error(`No se encontró ${label}`);
  return source.replace(search, replacement);
}

function insertBefore(source, marker, insertion, uniqueNeedle, label) {
  if (source.includes(uniqueNeedle)) return source;
  const index = source.indexOf(marker);
  if (index < 0) throw new Error(`No se encontró ${label}`);
  return source.slice(0, index) + insertion + source.slice(index);
}

// PocketBase response contract.
{
  const file = "server/pocketbase/pb_hooks/sync_core_utils.js";
  let source = load(file);
  const serializeMarker = source.includes("function serializeInspection(record, auth, app)")
    ? "function serializeInspection(record, auth, app)"
    : "function serializeInspection(record, auth)";
  const helper = lines(
    "function serializeAssignedUser(app, userId) {",
    "  const normalizedId = String(userId || \"\").trim();",
    "  if (!app || !normalizedId) return null;",
    "  try {",
    "    const user = app.findRecordById(\"users\", normalizedId);",
    "    return {",
    "      id: user.id,",
    "      name: user.getString(\"name\"),",
    "      email: user.getString(\"email\"),",
    "      specialty: user.getString(\"specialty\"),",
    "      role: user.getString(\"role\") || \"inspector\",",
    "      active: user.getBool(\"active\"),",
    "    };",
    "  } catch (error) {",
    "    return null;",
    "  }",
    "}",
    "",
    "",
  );
  source = insertBefore(source, serializeMarker, helper, "function serializeAssignedUser(app, userId)", "serializeAssignedUser");
  source = source.replace("function serializeInspection(record, auth) {", "function serializeInspection(record, auth, app) {");
  source = replaceExact(
    source,
    lines("    assignedUserId: assignedUserId,", "    permissions:"),
    lines("    assignedUserId: assignedUserId,", "    assignedUser: serializeAssignedUser(app, assignedUserId),", "    permissions:"),
    "assignedUser dentro de serializeInspection",
  );
  source = replaceExact(
    source,
    lines("  applications: applications,", "  assertCanWriteInspection:"),
    lines("  applications: applications,", "  recordApplications: recordApplications,", "  assertCanWriteInspection:"),
    "export de recordApplications",
  );
  save(file, source);
}

{
  const file = "server/pocketbase/pb_hooks/isivolt_sync.pb.js";
  let source = load(file);
  source = source.replaceAll("sync.serializeInspection(existing, auth)", "sync.serializeInspection(existing, auth, txApp)");
  source = source.replaceAll("sync.serializeInspection(records[index], auth)", "sync.serializeInspection(records[index], auth, e.app)");
  save(file, source);
}

// Remote merge keeps the visible technician summary.
{
  const file = "src/sync/remoteMerge.js";
  let source = load(file);
  const helper = lines(
    "function getRemoteAssignedUser(remote) {",
    "  const source = remote?.assignedUser && typeof remote.assignedUser === \"object\" && !Array.isArray(remote.assignedUser)",
    "    ? remote.assignedUser",
    "    : null;",
    "  if (!source || !String(source.id || remote?.assignedUserId || \"\").trim()) return null;",
    "  return {",
    "    id: String(source.id || remote.assignedUserId || \"\"),",
    "    name: String(source.name || \"\").trim(),",
    "    email: String(source.email || \"\").trim().toLowerCase(),",
    "    specialty: String(source.specialty || \"\").trim(),",
    "    role: String(source.role || \"inspector\"),",
    "    active: source.active !== false,",
    "  };",
    "}",
    "",
    "",
  );
  source = insertBefore(source, "function getRemoteAccess(remote)", helper, "function getRemoteAssignedUser(remote)", "getRemoteAssignedUser");
  source = replaceExact(
    source,
    lines("    assignedUserId: String(remote?.assignedUserId || \"\"),", "    permissions: getRemotePermissions(remote),"),
    lines("    assignedUserId: String(remote?.assignedUserId || \"\"),", "    assignedUser: getRemoteAssignedUser(remote),", "    permissions: getRemotePermissions(remote),"),
    "assignedUser dentro de getRemoteAccess",
  );
  source = replaceExact(
    source,
    lines("    assignedUserId: access.assignedUserId,", "    permissions: access.permissions,", "    updatedAt:"),
    lines("    assignedUserId: access.assignedUserId,", "    assignedUser: access.assignedUser,", "    permissions: access.permissions,", "    updatedAt:"),
    "assignedUser dentro de metadatos",
  );
  source = replaceExact(
    source,
    lines("    assignedUserId: access.assignedUserId,", "    permissions: access.permissions,", "    sync,"),
    lines("    assignedUserId: access.assignedUserId,", "    assignedUser: access.assignedUser,", "    permissions: access.permissions,", "    sync,"),
    "assignedUser dentro del registro local",
  );
  save(file, source);
}

// Assignment control notifies the desktop immediately.
{
  const file = "src/admin/InspectionAssignmentControl.jsx";
  let source = load(file);
  source = source.replace(
    "export default function InspectionAssignmentControl({ firebaseUser, inspection }) {",
    "export default function InspectionAssignmentControl({ firebaseUser, inspection, onAssignmentChange }) {",
  );
  source = replaceExact(
    source,
    lines("      setAssignment(next);", "      setMessage(selectedId ?"),
    lines("      setAssignment(next);", "      onAssignmentChange?.(next);", "      setMessage(selectedId ?"),
    "callback de asignación",
  );
  save(file, source);
}

// Desktop workspace presentation.
{
  const file = "src/desktop/DesktopWorkspace.jsx";
  let source = load(file);
  const helpers = lines(
    "function assignedTechnician(inspection) {",
    "  const source = inspection?.assignedUser || inspection?.sync?.assignedUser;",
    "  return source && typeof source === \"object\" ? source : null;",
    "}",
    "",
    "function assignedTechnicianName(inspection) {",
    "  const technician = assignedTechnician(inspection);",
    "  return normalizeText(technician?.name) || normalizeText(technician?.email) || \"Sin asignar\";",
    "}",
    "",
    "",
  );
  source = insertBefore(source, "function StatCard(", helpers, "function assignedTechnician(inspection)", "helpers del técnico asignado");
  source = replaceExact(
    source,
    lines("            <th>Estado</th>", "            <th>Avance</th>"),
    lines("            <th>Estado</th>", "            <th>Técnico</th>", "            <th>Avance</th>"),
    "cabecera Técnico",
  );
  source = replaceExact(
    source,
    lines(
      "                <td><span className={status.className}>{status.label}</span></td>",
      "                <td>",
      "                  <div className=\"isivolt-progress-cell\">",
    ),
    lines(
      "                <td><span className={status.className}>{status.label}</span></td>",
      "                <td>",
      "                  <strong>{assignedTechnicianName(inspection)}</strong>",
      "                  <span>{normalizeText(assignedTechnician(inspection)?.specialty) || \"Sin especialidad\"}</span>",
      "                </td>",
      "                <td>",
      "                  <div className=\"isivolt-progress-cell\">",
    ),
    "celda Técnico",
  );
  source = source.replace(
    "function DetailPanel({ inspection, firebaseUser, readOnly = false, canManageAssignments = false, onContinue, onEdit, onDocuments, onReport, onDelete }) {",
    "function DetailPanel({ inspection, firebaseUser, readOnly = false, canManageAssignments = false, onAssignmentChange, onContinue, onEdit, onDocuments, onReport, onDelete }) {",
  );
  source = replaceExact(
    source,
    lines("  const canAssign = !readOnly && (canManageAssignments || permissions.canAssign === true);", "", "  return ("),
    lines("  const canAssign = !readOnly && (canManageAssignments || permissions.canAssign === true);", "  const technician = assignedTechnician(inspection);", "", "  return ("),
    "variable technician en detalle",
  );
  source = replaceExact(
    source,
    lines(
      "        <div><dt>Tipo</dt><dd>{normalizeText(data.inspectionType) || \"Sin indicar\"}</dd></div>",
      "        <div><dt>Última edición</dt>",
    ),
    lines(
      "        <div><dt>Tipo</dt><dd>{normalizeText(data.inspectionType) || \"Sin indicar\"}</dd></div>",
      "        <div><dt>Técnico</dt><dd>{assignedTechnicianName(inspection)}{technician?.specialty ? ` · ${technician.specialty}` : \"\"}</dd></div>",
      "        <div><dt>Última edición</dt>",
    ),
    "técnico en el detalle",
  );
  source = replaceExact(
    source,
    "      {canAssign && <InspectionAssignmentControl firebaseUser={firebaseUser} inspection={inspection} />}",
    "      {canAssign && <InspectionAssignmentControl firebaseUser={firebaseUser} inspection={inspection} onAssignmentChange={(assignment) => onAssignmentChange?.(inspection.id, assignment)} />}",
    "callback del selector",
  );
  source = replaceExact(
    source,
    lines("  const [settingsFocus, setSettingsFocus] = useState(false);", "  const syncSession"),
    lines("  const [settingsFocus, setSettingsFocus] = useState(false);", "  const [assignmentOverrides, setAssignmentOverrides] = useState({});", "  const syncSession"),
    "estado de asignaciones",
  );
  source = replaceExact(
    source,
    lines(
      "  const selectedInspection = inspections.find((inspection) => inspection.id === selectedId) || inspections[0] || null;",
      "  const filteredInspections = useMemo(() => {",
      "    const normalizedQuery = query.trim().toLowerCase();",
      "    return inspections.filter((inspection) => {",
    ),
    lines(
      "  const displayInspections = useMemo(() => inspections.map((inspection) => {",
      "    const assignment = assignmentOverrides[inspection.id];",
      "    if (!assignment) return inspection;",
      "    return {",
      "      ...inspection,",
      "      assignedUserId: assignment.assignedUserId || \"\",",
      "      assignedUser: assignment.assignedUser || null,",
      "      sync: {",
      "        ...(inspection.sync || {}),",
      "        assignedUserId: assignment.assignedUserId || \"\",",
      "        assignedUser: assignment.assignedUser || null,",
      "        serverRevision: Math.max(Number(inspection?.sync?.serverRevision || 0), Number(assignment.revision || 0)),",
      "      },",
      "    };",
      "  }), [inspections, assignmentOverrides]);",
      "",
      "  const selectedInspection = displayInspections.find((inspection) => inspection.id === selectedId) || displayInspections[0] || null;",
      "  const filteredInspections = useMemo(() => {",
      "    const normalizedQuery = query.trim().toLowerCase();",
      "    return displayInspections.filter((inspection) => {",
    ),
    "colección visible de expedientes",
  );
  if (!source.includes("technician?.specialty].join")) {
    const originalHaystack = "      const haystack = [inspectionTitle(inspection), inspectionSubtitle(inspection), data.ownerName, data.orderNumber, data.cups].join(\" \ ").toLowerCase();".replace("\\ ", "");
    const visibleHaystack = lines(
      "      const technician = assignedTechnician(inspection);",
      "      const haystack = [inspectionTitle(inspection), inspectionSubtitle(inspection), data.ownerName, data.orderNumber, data.cups, technician?.name, technician?.email, technician?.specialty].join(\" \ ").toLowerCase();".replace("\\ ", ""),
    );
    if (!source.includes(originalHaystack)) throw new Error("No se encontró el buscador de expedientes");
    source = source.replace(originalHaystack, visibleHaystack);
  }
  source = source.replace("  }, [inspections, query, statusFilter, regulationFilter]);", "  }, [displayInspections, query, statusFilter, regulationFilter]);");
  source = source.replace("    total: inspections.length,", "    total: displayInspections.length,");
  source = source.replace("    active: inspections.filter((inspection)", "    active: displayInspections.filter((inspection)");
  source = source.replace("    defects: inspections.reduce((sum, inspection)", "    defects: displayInspections.reduce((sum, inspection)");
  source = source.replace("    closed: inspections.filter((inspection)", "    closed: displayInspections.filter((inspection)");
  source = source.replace("    pendingSync: inspections.filter((inspection)", "    pendingSync: displayInspections.filter((inspection)");
  source = source.replace("  }), [inspections]);", "  }), [displayInspections]);");
  const assignmentHandler = lines(
    "  const handleAssignmentChange = (localId, assignment) => {",
    "    setAssignmentOverrides((current) => ({ ...current, [localId]: assignment }));",
    "  };",
    "",
    "",
  );
  source = insertBefore(source, "  const isWorkspaceScreen =", assignmentHandler, "const handleAssignmentChange = (localId, assignment)", "handleAssignmentChange");
  source = replaceExact(
    source,
    "              <DetailPanel inspection={selectedInspection} firebaseUser={user} readOnly={readOnlyWorkspace} canManageAssignments={canManageAssignments}",
    "              <DetailPanel inspection={selectedInspection} firebaseUser={user} readOnly={readOnlyWorkspace} canManageAssignments={canManageAssignments} onAssignmentChange={handleAssignmentChange}",
    "callback en DetailPanel",
  );
  source = source.replace(
    "{activeSection === \"reports\" && <ReportsOverview inspections={inspections} onReport={onReport} />}",
    "{activeSection === \"reports\" && <ReportsOverview inspections={displayInspections} onReport={onReport} />}",
  );
  save(file, source);
}

// Regression tests for remote technician visibility.
{
  const file = "src/sync/remoteMerge.test.js";
  let source = load(file);
  source = replaceExact(
    source,
    lines("  assignedUserId = \"technician-1\",", "  permissions = {"),
    lines("  assignedUserId = \"technician-1\",", "  assignedUser = { id: \"technician-1\", name: \"Ana Técnica\", email: \"ana@example.com\", specialty: \"Electricidad\", role: \"inspector\", active: true },", "  permissions = {"),
    "fixture assignedUser",
  );
  source = replaceExact(
    source,
    lines("    assignedUserId,", "    permissions,"),
    lines("    assignedUserId,", "    assignedUser,", "    permissions,"),
    "assignedUser en respuesta remota",
  );
  source = replaceExact(
    source,
    lines("  assert.equal(result.inspections[0].assignedUserId, \"technician-1\");", "  assert.equal(result.inspections[0].permissions.isAssigned, true);"),
    lines(
      "  assert.equal(result.inspections[0].assignedUserId, \"technician-1\");",
      "  assert.equal(result.inspections[0].assignedUser.name, \"Ana Técnica\");",
      "  assert.equal(result.inspections[0].assignedUser.specialty, \"Electricidad\");",
      "  assert.equal(result.inspections[0].sync.assignedUser.name, \"Ana Técnica\");",
      "  assert.equal(result.inspections[0].permissions.isAssigned, true);",
    ),
    "aserciones de técnico inicial",
  );
  source = replaceExact(
    source,
    lines("    assignedUserId: \"technician-2\",", "    permissions: {"),
    lines("    assignedUserId: \"technician-2\",", "    assignedUser: { id: \"technician-2\", name: \"Luis Coordinador\", email: \"luis@example.com\", specialty: \"Coordinación\", role: \"coordinator\", active: true },", "    permissions: {"),
    "fixture de reasignación",
  );
  source = replaceExact(
    source,
    lines("  assert.equal(result.inspections[0].assignedUserId, \"technician-2\");", "  assert.equal(result.inspections[0].permissions.canAssign, true);"),
    lines(
      "  assert.equal(result.inspections[0].assignedUserId, \"technician-2\");",
      "  assert.equal(result.inspections[0].assignedUser.name, \"Luis Coordinador\");",
      "  assert.equal(result.inspections[0].sync.assignedUser.role, \"coordinator\");",
      "  assert.equal(result.inspections[0].permissions.canAssign, true);",
    ),
    "aserciones de reasignación",
  );
  save(file, source);
}

console.log("Visibilidad del técnico asignado preparada de forma idempotente");
