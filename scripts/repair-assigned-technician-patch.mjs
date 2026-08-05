import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.join(root, "scripts/add-assigned-technician-visibility.mjs");
let source = fs.readFileSync(target, "utf8");

const startMarker = '  if (!source.includes("technician?.specialty].join")) {';
const endMarker = '  source = source.replace("  }, [inspections, query, statusFilter, regulationFilter]);"';
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker, start);
if (start < 0 || end < 0) {
  throw new Error("No se encontró el bloque de búsqueda que debe repararse");
}

const replacement = [
  '  if (!source.includes("technician?.specialty].join")) {',
  '    const originalHaystack = \'      const haystack = [inspectionTitle(inspection), inspectionSubtitle(inspection), data.ownerName, data.orderNumber, data.cups].join(" ").toLowerCase();\';',
  '    const visibleHaystack = lines(',
  '      "      const technician = assignedTechnician(inspection);",',
  '      \'      const haystack = [inspectionTitle(inspection), inspectionSubtitle(inspection), data.ownerName, data.orderNumber, data.cups, technician?.name, technician?.email, technician?.specialty].join(" ").toLowerCase();\',',
  '    );',
  '    if (!source.includes(originalHaystack)) throw new Error("No se encontró el buscador de expedientes");',
  '    source = source.replace(originalHaystack, visibleHaystack);',
  '  }',
].join("\n") + "\n";

source = source.slice(0, start) + replacement + source.slice(end);
fs.writeFileSync(target, source);
console.log("Sintaxis del parche de técnico asignado reparada");
