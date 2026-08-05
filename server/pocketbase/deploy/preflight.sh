#!/usr/bin/env bash
set -Eeuo pipefail

APP_USER="${APP_USER:-isivoltpro}"
APP_GROUP="${APP_GROUP:-isivoltpro}"
APP_DIR="${APP_DIR:-/opt/isivoltpro/pocketbase-bt}"
ENV_FILE="${ENV_FILE:-/etc/isivoltpro/pocketbase-bt.env}"
SERVICE_NAME="${SERVICE_NAME:-isivoltpro-pocketbase-bt.service}"
LOCAL_URL="${LOCAL_URL:-http://127.0.0.1:8091}"
PUBLIC_URL="${PUBLIC_URL:-}"
STATIC_ONLY=false

usage() {
  cat <<'EOF'
Comprobación operativa de PocketBase para IsiVoltPro Preinspecciones BT.

Uso:
  sudo bash server/pocketbase/deploy/preflight.sh
  sudo PUBLIC_URL=https://bt-api.isivoltpro.com bash server/pocketbase/deploy/preflight.sh
  sudo bash server/pocketbase/deploy/preflight.sh --static

Opciones:
  --static   Comprueba archivos, permisos y configuración sin exigir servicio activo.
  --help     Muestra esta ayuda.

Variables opcionales:
  APP_USER, APP_GROUP, APP_DIR, ENV_FILE, SERVICE_NAME, LOCAL_URL, PUBLIC_URL
EOF
}

for argument in "$@"; do
  case "${argument}" in
    --static) STATIC_ONLY=true ;;
    --help|-h) usage; exit 0 ;;
    *) echo "Opción desconocida: ${argument}" >&2; usage >&2; exit 2 ;;
  esac
done

if [[ "${EUID}" -ne 0 ]]; then
  echo "Ejecuta esta comprobación con sudo." >&2
  exit 1
fi

passes=0
warnings=0
failures=0

pass() {
  passes=$((passes + 1))
  printf '✓ %s\n' "$1"
}

warn() {
  warnings=$((warnings + 1))
  printf '⚠ %s\n' "$1" >&2
}

fail() {
  failures=$((failures + 1))
  printf '✗ %s\n' "$1" >&2
}

require_command() {
  if command -v "$1" >/dev/null 2>&1; then
    pass "Comando disponible: $1"
  else
    fail "Falta el comando requerido: $1"
  fi
}

check_owner_mode() {
  local path="$1"
  local expected_owner="$2"
  local expected_mode="$3"
  local actual_owner actual_mode

  if [[ ! -e "${path}" ]]; then
    fail "No existe ${path}"
    return
  fi

  actual_owner="$(stat -c '%U:%G' "${path}")"
  actual_mode="$(stat -c '%a' "${path}")"

  if [[ "${actual_owner}" == "${expected_owner}" ]]; then
    pass "Propietario correcto en ${path}: ${actual_owner}"
  else
    fail "Propietario incorrecto en ${path}: ${actual_owner}; esperado ${expected_owner}"
  fi

  if [[ "${actual_mode}" == "${expected_mode}" ]]; then
    pass "Permisos correctos en ${path}: ${actual_mode}"
  else
    fail "Permisos incorrectos en ${path}: ${actual_mode}; esperado ${expected_mode}"
  fi
}

printf 'IsiVoltPro · Preflight PocketBase BT\n'
printf 'Servicio: %s\nDirectorio: %s\n\n' "${SERVICE_NAME}" "${APP_DIR}"

for command_name in stat grep curl systemctl ss; do
  require_command "${command_name}"
done

if getent group "${APP_GROUP}" >/dev/null 2>&1; then
  pass "Grupo de servicio existente: ${APP_GROUP}"
else
  fail "No existe el grupo ${APP_GROUP}"
fi

if id "${APP_USER}" >/dev/null 2>&1; then
  pass "Usuario de servicio existente: ${APP_USER}"
else
  fail "No existe el usuario ${APP_USER}"
fi

if [[ -x "${APP_DIR}/pocketbase" ]]; then
  pass "Binario PocketBase instalado y ejecutable"
else
  fail "No existe un binario ejecutable en ${APP_DIR}/pocketbase"
fi

for directory in pb_data pb_hooks pb_migrations; do
  if [[ -d "${APP_DIR}/${directory}" ]]; then
    pass "Directorio presente: ${APP_DIR}/${directory}"
  else
    fail "Falta el directorio ${APP_DIR}/${directory}"
  fi
done

if [[ -d "${APP_DIR}/pb_data" ]]; then
  check_owner_mode "${APP_DIR}/pb_data" "${APP_USER}:${APP_GROUP}" "750"
fi

if [[ -f "${ENV_FILE}" ]]; then
  check_owner_mode "${ENV_FILE}" "root:root" "600"
  firebase_key="$(grep -E '^FIREBASE_WEB_API_KEY=' "${ENV_FILE}" | tail -n 1 | cut -d= -f2- || true)"
  firebase_key="${firebase_key%$'\r'}"
  if [[ -n "${firebase_key}" && "${firebase_key}" != "valor_real" && "${firebase_key}" != "CHANGE_ME" ]]; then
    pass "FIREBASE_WEB_API_KEY está configurada"
  else
    fail "FIREBASE_WEB_API_KEY está vacía o conserva un valor de ejemplo"
  fi
  unset firebase_key
else
  fail "No existe el archivo de variables ${ENV_FILE}"
fi

service_file="/etc/systemd/system/${SERVICE_NAME}"
if [[ -f "${service_file}" ]]; then
  pass "Unidad systemd instalada: ${service_file}"
  if grep -Fq -- '--http=127.0.0.1:8091' "${service_file}"; then
    pass "PocketBase está configurado para escuchar solo en 127.0.0.1:8091"
  else
    fail "La unidad no limita PocketBase a 127.0.0.1:8091"
  fi
  if grep -Fq 'NoNewPrivileges=true' "${service_file}" && grep -Fq 'ProtectSystem=strict' "${service_file}"; then
    pass "Endurecimiento básico de systemd activado"
  else
    warn "Faltan una o más protecciones recomendadas de systemd"
  fi
else
  fail "No existe la unidad ${service_file}"
fi

if [[ "${STATIC_ONLY}" == false ]]; then
  if systemctl is-enabled --quiet "${SERVICE_NAME}"; then
    pass "Servicio habilitado al arrancar"
  else
    fail "El servicio no está habilitado"
  fi

  if systemctl is-active --quiet "${SERVICE_NAME}"; then
    pass "Servicio activo"
  else
    fail "El servicio no está activo"
  fi

  if ss -ltnH | grep -Eq '(^|[[:space:]])(0\.0\.0\.0|\[::\]):8091([[:space:]]|$)'; then
    fail "El puerto 8091 está expuesto en todas las interfaces"
  elif ss -ltnH | grep -Eq '127\.0\.0\.1:8091([[:space:]]|$)'; then
    pass "El puerto 8091 escucha únicamente en la interfaz local"
  else
    fail "No se detecta PocketBase escuchando en 127.0.0.1:8091"
  fi

  if curl --fail --silent --show-error --max-time 10 "${LOCAL_URL%/}/api/health" >/dev/null; then
    pass "API local saludable: ${LOCAL_URL%/}/api/health"
  else
    fail "La API local no responde correctamente"
  fi

  if [[ -n "${PUBLIC_URL}" ]]; then
    if [[ "${PUBLIC_URL}" != https://* ]]; then
      fail "PUBLIC_URL debe utilizar HTTPS"
    elif curl --fail --silent --show-error --max-time 15 "${PUBLIC_URL%/}/api/health" >/dev/null; then
      pass "API pública saludable mediante HTTPS: ${PUBLIC_URL%/}"
    else
      fail "La API pública no responde correctamente: ${PUBLIC_URL%/}"
    fi
  else
    warn "No se comprobó Cloudflare Tunnel; indica PUBLIC_URL para validarlo"
  fi
else
  warn "Modo estático: no se comprobaron servicio, puerto ni endpoints"
fi

available_kb="$(df -Pk "${APP_DIR}" 2>/dev/null | awk 'NR==2 {print $4}' || true)"
if [[ "${available_kb}" =~ ^[0-9]+$ ]]; then
  if (( available_kb >= 1048576 )); then
    pass "Espacio libre superior a 1 GiB en el volumen de datos"
  else
    warn "Queda menos de 1 GiB libre en el volumen de datos"
  fi
fi

printf '\nResultado: %d correctas · %d avisos · %d fallos\n' "${passes}" "${warnings}" "${failures}"

if (( failures > 0 )); then
  echo "Preflight NO superado." >&2
  exit 1
fi

echo "Preflight superado."
