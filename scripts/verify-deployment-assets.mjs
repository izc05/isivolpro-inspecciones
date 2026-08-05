import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const deployDir = path.join(root, "server", "pocketbase", "deploy");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function requireText(content, expected, label) {
  if (!content.includes(expected)) {
    throw new Error(`${label}: falta ${JSON.stringify(expected)}`);
  }
}

function forbidText(content, forbidden, label) {
  if (content.includes(forbidden)) {
    throw new Error(`${label}: contiene un valor no permitido ${JSON.stringify(forbidden)}`);
  }
}

const requiredFiles = [
  "server/pocketbase/deploy/install-local.sh",
  "server/pocketbase/deploy/preflight.sh",
  "server/pocketbase/deploy/isivoltpro-pocketbase-bt.service",
  "server/pocketbase/deploy/pocketbase-bt.env.example",
  "server/pocketbase/deploy/bootstrap.env.example",
  "server/pocketbase/deploy/cloudflared-ingress.example.yml",
  "server/pocketbase/deploy/DEPLOYMENT.md",
];

for (const relativePath of requiredFiles) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Falta el archivo de despliegue ${relativePath}`);
  }
}

const installer = read("server/pocketbase/deploy/install-local.sh");
requireText(installer, "set -Eeuo pipefail", "Instalador");
requireText(installer, "./pocketbase migrate up", "Instalador");
requireText(installer, "systemctl daemon-reload", "Instalador");
requireText(installer, "-m 0600", "Instalador");

const preflight = read("server/pocketbase/deploy/preflight.sh");
requireText(preflight, "set -Eeuo pipefail", "Preflight");
requireText(preflight, "FIREBASE_WEB_API_KEY", "Preflight");
requireText(preflight, "systemctl is-active", "Preflight");
requireText(preflight, "127.0.0.1:8091", "Preflight");
requireText(preflight, "PUBLIC_URL", "Preflight");
requireText(preflight, "Preflight superado", "Preflight");

const service = read("server/pocketbase/deploy/isivoltpro-pocketbase-bt.service");
requireText(service, "--http=127.0.0.1:8091", "Unidad systemd");
requireText(service, "NoNewPrivileges=true", "Unidad systemd");
requireText(service, "ProtectSystem=strict", "Unidad systemd");
requireText(service, "ProtectHome=true", "Unidad systemd");
requireText(service, "ReadWritePaths=/opt/isivoltpro/pocketbase-bt/pb_data", "Unidad systemd");
forbidText(service, "--http=0.0.0.0", "Unidad systemd");

const environmentTemplate = read("server/pocketbase/deploy/pocketbase-bt.env.example");
requireText(environmentTemplate, "FIREBASE_WEB_API_KEY=", "Plantilla de variables");
forbidText(environmentTemplate, "AIza", "Plantilla de variables");

const bootstrapTemplate = read("server/pocketbase/deploy/bootstrap.env.example");
forbidText(bootstrapTemplate, "sk-", "Plantilla de bootstrap");
forbidText(bootstrapTemplate, "AIza", "Plantilla de bootstrap");

const cloudflare = read("server/pocketbase/deploy/cloudflared-ingress.example.yml");
requireText(cloudflare, "hostname: bt-api.isivoltpro.com", "Cloudflare Tunnel");
requireText(cloudflare, "service: http://127.0.0.1:8091", "Cloudflare Tunnel");
requireText(cloudflare, "service: http_status:404", "Cloudflare Tunnel");
forbidText(cloudflare, "http://0.0.0.0", "Cloudflare Tunnel");

const documentation = read("server/pocketbase/deploy/DEPLOYMENT.md");
requireText(documentation, "preflight.sh", "Documentación");
requireText(documentation, "No fusionar la PR", "Documentación");
requireText(documentation, "bt-api.isivoltpro.com", "Documentación");

const shellScripts = fs.readdirSync(deployDir).filter((name) => name.endsWith(".sh"));
if (!shellScripts.includes("install-local.sh") || !shellScripts.includes("preflight.sh")) {
  throw new Error("No se encontraron todos los scripts operativos esperados");
}

console.log(`Activos de despliegue verificados: ${requiredFiles.length} archivos y ${shellScripts.length} scripts shell.`);
