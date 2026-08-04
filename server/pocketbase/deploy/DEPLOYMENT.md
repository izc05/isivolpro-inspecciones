# Despliegue en mini PC · Preinspecciones BT

Este procedimiento despliega el servidor de sincronización en Ubuntu sin abrir puertos del router.

## Resultado esperado

```text
APK Android ─┐
             ├─ HTTPS · bt-api.isivoltpro.com
PC / web ────┘              │
                       Cloudflare Tunnel
                             │
                    127.0.0.1:8091
                             │
                         PocketBase
```

## 1. Preparar una copia del repositorio

Trabajar inicialmente con la rama:

```bash
git clone https://github.com/izc05/isivolpro-inspecciones.git
cd isivolpro-inspecciones
git switch feat/apk-pc-sync-gps-close
```

## 2. Descargar PocketBase oficial

Consultar la versión oficial publicada y descargar el ZIP Linux AMD64 desde el repositorio oficial de PocketBase.

Ejemplo, sustituyendo `VERSION`:

```bash
VERSION="0.x.x"
curl -fL "https://github.com/pocketbase/pocketbase/releases/download/v${VERSION}/pocketbase_${VERSION}_linux_amd64.zip" -o /tmp/pocketbase.zip
unzip -j /tmp/pocketbase.zip pocketbase -d /tmp/pocketbase-bin
chmod +x /tmp/pocketbase-bin/pocketbase
```

La rama incluye una validación automática que aplica las migraciones y arranca el runtime oficial antes de considerar la integración válida.

## 3. Instalar el servicio

```bash
sudo POCKETBASE_BINARY=/tmp/pocketbase-bin/pocketbase \
  bash server/pocketbase/deploy/install-local.sh
```

El instalador prepara:

```text
/opt/isivoltpro/pocketbase-bt/
├── pocketbase
├── pb_data/
├── pb_hooks/
└── pb_migrations/
```

Y crea:

```text
/etc/isivoltpro/pocketbase-bt.env
/etc/systemd/system/isivoltpro-pocketbase-bt.service
```

## 4. Configurar Firebase para la cuenta única

Editar:

```bash
sudo nano /etc/isivoltpro/pocketbase-bt.env
```

Añadir la clave web pública del proyecto Firebase usado por la APK:

```text
FIREBASE_WEB_API_KEY=valor_real
```

Proteger el archivo:

```bash
sudo chown root:root /etc/isivoltpro/pocketbase-bt.env
sudo chmod 600 /etc/isivoltpro/pocketbase-bt.env
```

Esta clave permite al servidor verificar el token de inicio de sesión. Las inspecciones, fotografías y mediciones no se envían a Firebase.

## 5. Crear el primer superusuario PocketBase

```bash
cd /opt/isivoltpro/pocketbase-bt
sudo -u isivoltpro ./pocketbase superuser create administrador@dominio.es 'CONTRASEÑA-MUY-SEGURA'
```

No reutilizar la contraseña de Firebase ni la del correo.

## 6. Iniciar y comprobar el servicio

```bash
sudo systemctl enable --now isivoltpro-pocketbase-bt.service
sudo systemctl status isivoltpro-pocketbase-bt.service
curl -fsSL http://127.0.0.1:8091/api/health
```

La respuesta debe indicar que la API está saludable.

Logs:

```bash
sudo journalctl -u isivoltpro-pocketbase-bt.service -n 100 --no-pager
sudo journalctl -u isivoltpro-pocketbase-bt.service -f
```

## 7. Crear empresa y administrador IsiVoltPro

Copiar el ejemplo fuera del repositorio:

```bash
cp server/pocketbase/deploy/bootstrap.env.example /tmp/isivolt-bootstrap.env
chmod 600 /tmp/isivolt-bootstrap.env
nano /tmp/isivolt-bootstrap.env
```

Completar todos los valores y ejecutar:

```bash
set -a
source /tmp/isivolt-bootstrap.env
set +a
node scripts/bootstrap-pocketbase.mjs
unset POCKETBASE_SUPERUSER_PASSWORD
```

El script:

- crea o actualiza la empresa;
- habilita `preinspecciones-bt`;
- crea o actualiza el usuario administrador;
- activa la política segura de cierre presencial;
- no muestra ni guarda en GitHub la contraseña generada para el usuario interno.

El primer acceso con Firebase vinculará el UID al usuario por coincidencia exacta de correo.

## 8. Publicar mediante Cloudflare Tunnel

Añadir al túnel existente, antes de la regla final `http_status:404`:

```yaml
- hostname: bt-api.isivoltpro.com
  service: http://127.0.0.1:8091
```

Plantilla disponible:

```text
server/pocketbase/deploy/cloudflared-ingress.example.yml
```

Reiniciar el túnel correspondiente y comprobar:

```bash
curl -fsSL https://bt-api.isivoltpro.com/api/health
```

No publicar el puerto `8091` en el router.

## 9. Configurar web y APK

Crear el archivo de entorno de compilación:

```bash
cp .env.sync.example .env.production.local
```

Contenido:

```text
VITE_SYNC_API_URL=https://bt-api.isivoltpro.com
```

Después:

```bash
npm ci
npm run test:integration
npm run cap:android
```

Para Android release será necesario configurar posteriormente la firma de la APK/AAB.

## 10. Ejecutar la prueba E2E real

Obtener temporalmente un token Firebase válido de la cuenta de prueba y ejecutar:

```bash
SYNC_API_URL=https://bt-api.isivoltpro.com \
FIREBASE_ID_TOKEN='TOKEN_TEMPORAL' \
npm run smoke:sync-server
```

La prueba verifica:

1. intercambio Firebase–PocketBase;
2. alta desde un dispositivo;
3. descarga como PC;
4. actualización desde otro dispositivo;
5. rechazo de una revisión antigua con conflicto `409`.

No conservar el token en el historial del terminal.

## 11. Copias de seguridad

Respaldar como mínimo:

```text
/opt/isivoltpro/pocketbase-bt/pb_data
/etc/isivoltpro/pocketbase-bt.env
```

El archivo de variables debe cifrarse o almacenarse en un gestor seguro. La copia de `pb_data` contiene datos técnicos y debe tratarse como información confidencial.

## Criterio para fusionar a `main`

No fusionar la PR hasta completar:

- servidor activo en el mini PC;
- Cloudflare Tunnel funcionando por HTTPS;
- empresa y administrador creados;
- APK y PC usando la misma cuenta;
- prueba E2E real superada;
- copia de seguridad inicial realizada;
- prueba de cierre GPS en una instalación real controlada.
