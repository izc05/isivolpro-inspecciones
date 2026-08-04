# Servidor PocketBase · IsiVoltPro Preinspecciones BT

Esta carpeta contiene la primera base del servidor que conectará la APK Android con la aplicación web para PC.

## Contenido

```text
server/pocketbase/
├── pb_migrations/
│   └── 1785880000_create_isivolt_sync_core.js
├── pb_hooks/
│   └── isivolt_sync.pb.js
└── README.md
```

## Funciones incluidas

- Empresas separadas mediante `company`.
- Usuarios autenticados con roles.
- Instalaciones con coordenadas y política de cierre.
- Preinspecciones con revisión de servidor.
- Auditoría de altas y modificaciones.
- Ruta protegida para enviar una preinspección.
- Ruta protegida para recuperar preinspecciones modificadas.
- Respuesta `409 REVISION_CONFLICT` cuando otro dispositivo ha actualizado antes el registro.

## Rutas iniciales

```text
POST /api/isivolt/v1/inspections/sync
GET  /api/isivolt/v1/inspections?since=<fecha ISO>
```

Todas requieren un token válido de la colección de autenticación `users`.

## Preparación en el mini PC

La carpeta de ejecución deberá quedar así:

```text
/opt/isivoltpro/pocketbase-bt/
├── pocketbase
├── pb_data/
├── pb_hooks/
└── pb_migrations/
```

Copiar desde este repositorio:

```bash
sudo mkdir -p /opt/isivoltpro/pocketbase-bt
sudo cp -r server/pocketbase/pb_hooks /opt/isivoltpro/pocketbase-bt/
sudo cp -r server/pocketbase/pb_migrations /opt/isivoltpro/pocketbase-bt/
```

El ejecutable de PocketBase debe descargarse desde su distribución oficial y guardarse como:

```text
/opt/isivoltpro/pocketbase-bt/pocketbase
```

## Aplicar la migración

Desde la carpeta del servidor:

```bash
cd /opt/isivoltpro/pocketbase-bt
./pocketbase migrate up
```

Después iniciar temporalmente para la primera configuración:

```bash
./pocketbase serve --http=127.0.0.1:8091
```

El servicio solamente debe escuchar en `127.0.0.1`. El acceso externo se realizará mediante Cloudflare Tunnel y HTTPS.

## Primer usuario y empresa

La migración crea las colecciones, pero no crea una empresa ni usuarios automáticamente.

El orden inicial será:

1. Crear el primer superusuario de PocketBase.
2. Entrar al panel de administración local.
3. Crear una empresa en `companies`.
4. Crear un usuario en `users` y relacionarlo con esa empresa.
5. Marcar `active = true`.
6. Asignar el rol `admin`.
7. Habilitar la aplicación `preinspecciones-bt` dentro de `applications`.

## Configuración de la aplicación

La versión web y la APK recibirán la URL mediante:

```text
VITE_SYNC_API_URL=https://bt-api.isivoltpro.com
```

El cliente utiliza estas rutas personalizadas y no escribe directamente en las colecciones técnicas.

## Revisión y conflictos

Cada dispositivo mantiene:

- `localRevision`: número de cambios locales.
- `serverRevision`: última revisión confirmada por el servidor.

Al sincronizar envía:

```json
{
  "revision": 12,
  "baseRevision": 4
}
```

El servidor acepta la modificación solamente cuando `baseRevision` coincide con la revisión actual del registro. Si el servidor ya está en la revisión 5, devuelve:

```json
{
  "code": "REVISION_CONFLICT",
  "serverRevision": 5
}
```

Así no se sobrescribe silenciosamente el trabajo realizado desde otro dispositivo.

## Seguridad inicial

- No publicar directamente el puerto 8091 en el router.
- Utilizar HTTPS mediante Cloudflare Tunnel.
- Mantener `pb_data` fuera del repositorio.
- Realizar copias periódicas de `pb_data`.
- Configurar correctamente los proxies de confianza antes de utilizar la IP real para auditoría.
- No permitir escrituras directas en `inspections` ni `inspection_events`.
- Rotar credenciales y tokens si un dispositivo se pierde.

## Validación en el repositorio

```bash
npm run test:server
npm run test:sync
npm run build
```

## Pendientes inmediatos

1. Ejecutar la migración contra una instancia real de PocketBase de desarrollo.
2. Crear una empresa y un usuario de prueba.
3. Configurar el intercambio entre la cuenta Firebase actual y la sesión PocketBase.
4. Enviar la primera preinspección sin fotografías.
5. Recuperarla desde la versión web para PC.
6. Añadir sincronización automática al recuperar conexión.
7. Incorporar archivos y firmas en una fase posterior.
