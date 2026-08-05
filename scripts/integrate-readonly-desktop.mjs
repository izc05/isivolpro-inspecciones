import fs from "node:fs";

const filePath = new URL("../src/desktop/DesktopWorkspace.jsx", import.meta.url);
let source = fs.readFileSync(filePath, "utf8");

function replaceOnce(search, replacement, label) {
  if (source.includes(replacement)) return;
  if (!source.includes(search)) {
    throw new Error(`No se encontró el bloque para ${label}`);
  }
  source = source.replace(search, replacement);
}

replaceOnce(
  'import InspectionAssignmentControl from "../admin/InspectionAssignmentControl.jsx";\nimport "./desktop-workspace.css";',
  'import InspectionAssignmentControl from "../admin/InspectionAssignmentControl.jsx";\nimport { readSyncSession } from "../sync/syncAuth.js";\nimport "./desktop-workspace.css";',
  "importar la sesión de sincronización",
);

replaceOnce(
  "function EmptyWorkspace({ onCreate }) {",
  "function EmptyWorkspace({ onCreate, canCreate = true }) {",
  "adaptar el estado vacío",
);

replaceOnce(
  `      <button type="button" className="isivolt-button isivolt-button--primary" onClick={onCreate}>
        <Plus size={17} /> Nueva preinspección
      </button>`,
  `      {canCreate ? (
        <button type="button" className="isivolt-button isivolt-button--primary" onClick={onCreate}>
          <Plus size={17} /> Nueva preinspección
        </button>
      ) : (
        <span className="isivolt-readonly-label"><ShieldCheck size={15} /> Acceso de solo consulta</span>
      )}`,
  "ocultar la creación en solo consulta",
);

replaceOnce(
  "function DetailPanel({ inspection, firebaseUser, onContinue, onEdit, onDocuments, onReport, onDelete }) {",
  "function DetailPanel({ inspection, firebaseUser, readOnly = false, onContinue, onEdit, onDocuments, onReport, onDelete }) {",
  "pasar el modo de consulta al detalle",
);

replaceOnce(
  '  const closed = normalizedStatus(inspection) === "closed";',
  `  const closed = normalizedStatus(inspection) === "closed";
  const permissions = inspection?.permissions || inspection?.sync?.permissions || {};
  const canEdit = !readOnly && permissions.canEdit !== false;
  const canAssign = !readOnly && permissions.canAssign === true;`,
  "calcular permisos del expediente",
);

replaceOnce(
  "      <InspectionAssignmentControl firebaseUser={firebaseUser} inspection={inspection} />",
  "      {canAssign && <InspectionAssignmentControl firebaseUser={firebaseUser} inspection={inspection} />}",
  "limitar el selector de técnico",
);

replaceOnce(
  `<section className="isivolt-detail-actions">
        <h3>Continuar trabajo</h3>
        <div className="isivolt-quick-actions">
          <button type="button" onClick={() => onEdit(inspection.id)}><Building2 size={17} /><span>Datos</span></button>
          <button type="button" onClick={() => onContinue(inspection.id)}><BookOpenCheck size={17} /><span>Checklist</span></button>
          <button type="button" onClick={() => onDocuments(inspection.id)}><FileCheck2 size={17} /><span>Documentos</span></button>
          <button type="button" onClick={() => onReport(inspection.id)}><FileText size={17} /><span>Informe</span></button>
        </div>
      </section>`,
  `<section className="isivolt-detail-actions">
        <h3>{canEdit ? "Continuar trabajo" : "Consulta del expediente"}</h3>
        {!canEdit && <p className="isivolt-readonly-notice"><ShieldCheck size={15} /> Puede revisar e imprimir, pero no modificar este expediente.</p>}
        <div className="isivolt-quick-actions">
          {canEdit && <button type="button" onClick={() => onEdit(inspection.id)}><Building2 size={17} /><span>Datos</span></button>}
          {canEdit && <button type="button" onClick={() => onContinue(inspection.id)}><BookOpenCheck size={17} /><span>Checklist</span></button>}
          {canEdit && <button type="button" onClick={() => onDocuments(inspection.id)}><FileCheck2 size={17} /><span>Documentos</span></button>}
          <button type="button" onClick={() => onReport(inspection.id)}><FileText size={17} /><span>Informe</span></button>
        </div>
      </section>`,
  "adaptar acciones del expediente",
);

replaceOnce(
  `<div className="isivolt-detail-panel__footer">
        <button type="button" className="isivolt-button isivolt-button--primary" onClick={() => onContinue(inspection.id)}>
          {closed ? "Revisar expediente" : "Continuar preinspección"} <ArrowUpRight size={16} />
        </button>
        <button type="button" className="isivolt-button isivolt-button--danger-ghost" onClick={() => onDelete(inspection.id)}>
          Eliminar
        </button>
      </div>`,
  `<div className="isivolt-detail-panel__footer">
        <button type="button" className="isivolt-button isivolt-button--primary" onClick={() => canEdit ? onContinue(inspection.id) : onReport(inspection.id)}>
          {canEdit ? (closed ? "Revisar expediente" : "Continuar preinspección") : "Abrir informe"} <ArrowUpRight size={16} />
        </button>
        {canEdit && <button type="button" className="isivolt-button isivolt-button--danger-ghost" onClick={() => onDelete(inspection.id)}>
          Eliminar
        </button>}
      </div>`,
  "proteger el pie del expediente",
);

replaceOnce(
  '  const [settingsFocus, setSettingsFocus] = useState(false);',
  `  const [settingsFocus, setSettingsFocus] = useState(false);
  const syncSession = readSyncSession();
  const currentRole = normalizeText(syncSession?.record?.role).toLowerCase();
  const readOnlyWorkspace = currentRole === "viewer";
  const canCreate = !readOnlyWorkspace;
  const visibleNavItems = NAV_ITEMS.filter((item) => item.id !== "admin" || currentRole === "admin");`,
  "leer el rol de la cuenta",
);

replaceOnce(
  "          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (",
  "          {visibleNavItems.map(({ id, label, icon: Icon }) => (",
  "ocultar navegación administrativa",
);

replaceOnce(
  '            <strong>{NAV_ITEMS.find((item) => item.id === activeSection)?.label || "Inicio"}</strong>',
  '            <strong>{visibleNavItems.find((item) => item.id === activeSection)?.label || "Inicio"}</strong>',
  "adaptar la ruta visible",
);

replaceOnce(
  '<button type="button" className="isivolt-button isivolt-button--primary" onClick={onCreate}><Plus size={17} /> Nueva preinspección</button>',
  '{canCreate && <button type="button" className="isivolt-button isivolt-button--primary" onClick={onCreate}><Plus size={17} /> Nueva preinspección</button>}',
  "ocultar el alta global",
);

replaceOnce(
  '{filteredInspections.length === 0 ? <EmptyWorkspace onCreate={onCreate} /> : <InspectionTable',
  '{filteredInspections.length === 0 ? <EmptyWorkspace onCreate={onCreate} canCreate={canCreate} /> : <InspectionTable',
  "pasar permiso al estado vacío",
);

replaceOnce(
  '<DetailPanel inspection={selectedInspection} firebaseUser={user} onContinue={onContinue}',
  '<DetailPanel inspection={selectedInspection} firebaseUser={user} readOnly={readOnlyWorkspace} onContinue={onContinue}',
  "pasar modo consulta al detalle",
);

replaceOnce(
  '{activeSection === "admin" && (',
  '{activeSection === "admin" && currentRole === "admin" && (',
  "proteger el contenido administrativo",
);

fs.writeFileSync(filePath, source);
console.log("Escritorio con permisos por rol integrado correctamente");
