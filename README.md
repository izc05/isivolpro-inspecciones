# IsiVoltPro Preinspecciones BT

Aplicación web y Android para preparar, ejecutar y revisar preinspecciones eléctricas de baja tensión con funcionamiento local-first, mediciones, defectos, fotografías, firmas e informe profesional.

> La aplicación ayuda a recopilar y documentar información técnica. No sustituye una inspección reglamentaria oficial, un certificado ni el criterio del profesional habilitado.

## Estado

- Versión de aplicación: `1.5.8`.
- Web pública actual: `https://izc05.github.io/isivolpro-inspecciones/`.
- Rama conectada: `feat/apk-pc-sync-gps-close`.
- Pull request principal: `#3`.
- Servidor real y dominios BT: pendientes de despliegue en el mini PC.

La rama conectada mantiene la PR en borrador hasta superar una prueba real móvil–PC contra el servidor autohospedado.

## Funciones principales

- REBT 1973, REBT 2002 y expedientes mixtos.
- Datos de instalación y documentación disponible.
- Bloques de revisión, checklist y hojas de campo.
- Mediciones, observaciones y clasificación de defectos.
- Fotografías, documentos y firmas.
- Generación de informe PDF.
- Trabajo sin cobertura y persistencia local.
- Continuidad entre APK Android y navegador.
- Control de revisiones y conflictos.
- Cierre presencial configurable mediante GPS.

## Arquitectura

```text
APK Android ─┐
             ├─ Aplicación React + almacenamiento local
PC / web ────┘                │
                              │ sincronización opcional
                              ▼
                     PocketBase autohospedado
                              │
                    Cloudflare Tunnel HTTPS
```

### Cliente

- React 19.
- Vite 7.
- Capacitor 8.
- IndexedDB para fotografías y documentos.
- `localStorage` para expedientes y configuración compatible.
- jsPDF para informes.

### Identidad

- Firebase Authentication conserva el acceso existente.
- El servidor intercambia el token Firebase por una sesión PocketBase.
- El usuario no necesita una segunda contraseña para la aplicación.

### Servidor conectado

- PocketBase autohospedado.
- Empresas y usuarios aislados por organización.
- Inspecciones con `inspectionId` estable.
- Revisiones incompatibles convertidas en conflicto, sin sobrescritura silenciosa.
- Archivos privados, deduplicados y verificados mediante SHA-256.
- Auditoría de sincronización, cierre y excepciones administrativas.

## Privacidad local-first

Sin servidor configurado, la información técnica permanece en el dispositivo:

- expedientes y configuración en almacenamiento local;
- fotografías y documentos en IndexedDB;
- PDF generado localmente;
- copia manual mediante exportación JSON.

Firebase se utiliza para autenticación y licencia. Los datos técnicos del cliente no deben almacenarse en Firestore.

Más información: [`docs/local-first-privacy.md`](docs/local-first-privacy.md).

## Desarrollo

Requisitos:

- Node.js 22.
- npm.
- Java 21 para Android.
- Android SDK para generar APK o AAB.

```bash
npm ci
npm run dev
```

Acceso desde otros equipos de la red local:

```bash
npm run dev:pc
```

## Pruebas y compilación

```bash
npm run test:sync
npm run test:server
npm run test:integration
npm run build
```

Sincronizar Capacitor Android:

```bash
npm run cap:android
```

La rama conectada contiene marcadores generados únicamente después de controles automatizados:

- [`docs/final-connected-validation.md`](docs/final-connected-validation.md)
- [`docs/final-file-sync-validation.md`](docs/final-file-sync-validation.md)
- [`docs/deployment-tooling-validation.md`](docs/deployment-tooling-validation.md)
- [`docs/android-release-tooling-validation.md`](docs/android-release-tooling-validation.md)

## Despliegue PocketBase

El procedimiento preparado para Ubuntu está en:

[`server/pocketbase/deploy/DEPLOYMENT.md`](server/pocketbase/deploy/DEPLOYMENT.md)

Después de instalar se debe ejecutar:

```bash
sudo PUBLIC_URL=https://bt-api.isivoltpro.com \
  bash server/pocketbase/deploy/preflight.sh
```

El preflight comprueba permisos, variables, servicio systemd, escucha local, salud de PocketBase, HTTPS público y espacio disponible.

## Prueba real móvil–PC

Con el servidor activo:

```bash
SYNC_API_URL=https://bt-api.isivoltpro.com \
FIREBASE_ID_TOKEN='TOKEN_TEMPORAL' \
npm run smoke:sync-server
```

La validación final debe incluir además:

1. creación desde Android;
2. apertura desde PC con la misma cuenta;
3. fotografía sincronizada;
4. edición y retorno al móvil;
5. conflicto de revisión controlado;
6. cierre GPS en una instalación de prueba.

## Android release firmado

El workflow `Build signed Android release` prepara APK y AAB firmados sin guardar el keystore en el repositorio.

Documentación:

[`docs/android-release-signing.md`](docs/android-release-signing.md)

Secretos necesarios:

```text
ANDROID_KEYSTORE_BASE64
ANDROID_KEYSTORE_PASSWORD
ANDROID_KEY_ALIAS
ANDROID_KEY_PASSWORD
```

## Relación con el ecosistema IsiVoltPro

Ficha de producto prevista:

`https://www.isivoltpro.com/aplicaciones/inspecciones-bt`

La app incluye un acceso de regreso al portal y mantiene repositorios separados:

- portal público Astro;
- aplicación React/Capacitor;
- PocketBase desplegado en infraestructura propia.

## Próximos hitos

- Desplegar PocketBase en el mini PC.
- Crear la primera empresa y usuario reales.
- Publicar `bt-api.isivoltpro.com` y `bt.isivoltpro.com`.
- Ejecutar el E2E real móvil–PC.
- Generar la primera APK release firmada.
- Revisar visualmente el dock de ecosistema en móvil.
- Fusionar la PR únicamente tras completar las pruebas reales.
