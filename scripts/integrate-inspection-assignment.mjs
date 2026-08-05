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
  'import "./desktop-workspace.css";',
  'import InspectionAssignmentControl from "../admin/InspectionAssignmentControl.jsx";\nimport "./desktop-workspace.css";',
  "importar el selector de asignación",
);

replaceOnce(
  "function DetailPanel({ inspection, onContinue, onEdit, onDocuments, onReport, onDelete }) {",
  "function DetailPanel({ inspection, firebaseUser, onContinue, onEdit, onDocuments, onReport, onDelete }) {",
  "pasar el usuario a la ficha lateral",
);

replaceOnce(
  '      </dl>\n\n      <section className="isivolt-detail-actions">',
  '      </dl>\n\n      <InspectionAssignmentControl firebaseUser={firebaseUser} inspection={inspection} />\n\n      <section className="isivolt-detail-actions">',
  "montar el selector en el detalle",
);

replaceOnce(
  '<DetailPanel inspection={selectedInspection} onContinue={onContinue} onEdit={onEdit} onDocuments={onDocuments} onReport={onReport} onDelete={onDelete} />',
  '<DetailPanel inspection={selectedInspection} firebaseUser={user} onContinue={onContinue} onEdit={onEdit} onDocuments={onDocuments} onReport={onReport} onDelete={onDelete} />',
  "conectar la cuenta del administrador",
);

fs.writeFileSync(filePath, source);
console.log("Asignación de expedientes integrada correctamente");
