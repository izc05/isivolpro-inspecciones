import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.join(root, "src/desktop/DesktopWorkspace.jsx");
let source = fs.readFileSync(target, "utf8");

const importLine = 'import AdminActivityPanel from "../admin/AdminActivityPanel.jsx";';
if (!source.includes(importLine)) {
  const marker = 'import TechnicianAdminPanel from "../admin/TechnicianAdminPanel.jsx";';
  if (!source.includes(marker)) throw new Error("No se encontró el import de TechnicianAdminPanel");
  source = source.replace(marker, `${marker}\n${importLine}`);
}

const mountLine = '              <AdminActivityPanel firebaseUser={user} />';
if (!source.includes(mountLine)) {
  const marker = '              <TechnicianAdminPanel firebaseUser={user} />';
  if (!source.includes(marker)) throw new Error("No se encontró el montaje de TechnicianAdminPanel");
  source = source.replace(marker, `${marker}\n${mountLine}`);
}

fs.writeFileSync(target, source);
console.log("Panel de actividad administrativa montado de forma idempotente");
