#!/usr/bin/env bash
set -Eeuo pipefail

APP_USER="${APP_USER:-isivoltpro}"
APP_GROUP="${APP_GROUP:-isivoltpro}"
APP_DIR="${APP_DIR:-/opt/isivoltpro/pocketbase-bt}"
ENV_DIR="${ENV_DIR:-/etc/isivoltpro}"
SERVICE_NAME="${SERVICE_NAME:-isivoltpro-pocketbase-bt.service}"
POCKETBASE_BINARY="${POCKETBASE_BINARY:-}"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$(cd -- "${SCRIPT_DIR}/.." && pwd)"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Ejecuta este script con sudo." >&2
  exit 1
fi

if [[ -z "${POCKETBASE_BINARY}" || ! -f "${POCKETBASE_BINARY}" ]]; then
  echo "Indica un ejecutable PocketBase ya descargado y verificado:" >&2
  echo "sudo POCKETBASE_BINARY=/ruta/pocketbase $0" >&2
  exit 1
fi

if ! id "${APP_USER}" >/dev/null 2>&1; then
  useradd --system --home-dir "${APP_DIR}" --shell /usr/sbin/nologin "${APP_USER}"
fi

install -d -o "${APP_USER}" -g "${APP_GROUP}" -m 0750 "${APP_DIR}"
install -d -o "${APP_USER}" -g "${APP_GROUP}" -m 0750 "${APP_DIR}/pb_data"
install -d -o "${APP_USER}" -g "${APP_GROUP}" -m 0750 "${APP_DIR}/pb_hooks"
install -d -o "${APP_USER}" -g "${APP_GROUP}" -m 0750 "${APP_DIR}/pb_migrations"
install -d -o root -g root -m 0755 "${ENV_DIR}"

install -o "${APP_USER}" -g "${APP_GROUP}" -m 0750 "${POCKETBASE_BINARY}" "${APP_DIR}/pocketbase"
cp -a "${SERVER_DIR}/pb_hooks/." "${APP_DIR}/pb_hooks/"
cp -a "${SERVER_DIR}/pb_migrations/." "${APP_DIR}/pb_migrations/"
chown -R "${APP_USER}:${APP_GROUP}" "${APP_DIR}/pb_hooks" "${APP_DIR}/pb_migrations"

if [[ ! -f "${ENV_DIR}/pocketbase-bt.env" ]]; then
  install -o root -g root -m 0600 "${SCRIPT_DIR}/pocketbase-bt.env.example" "${ENV_DIR}/pocketbase-bt.env"
  echo "Se ha creado ${ENV_DIR}/pocketbase-bt.env. Añade FIREBASE_WEB_API_KEY antes de iniciar el servicio."
fi

install -o root -g root -m 0644 "${SCRIPT_DIR}/isivoltpro-pocketbase-bt.service" "/etc/systemd/system/${SERVICE_NAME}"
systemctl daemon-reload

sudo -u "${APP_USER}" "${APP_DIR}/pocketbase" migrate up --dir "${APP_DIR}/pb_migrations"

echo "Instalación preparada. Revisa ${ENV_DIR}/pocketbase-bt.env y después ejecuta:"
echo "  sudo systemctl enable --now ${SERVICE_NAME}"
echo "  sudo systemctl status ${SERVICE_NAME}"
