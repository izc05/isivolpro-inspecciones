# IsiVoltPro Preinspecciones BT · Sincronización APK–PC y cierre GPS

## Objetivo

Permitir que una preinspección creada o modificada desde la APK Android pueda abrirse, revisarse y continuar desde el PC con la misma cuenta, manteniendo funcionamiento offline en el móvil.

El cierre presencial será una política configurable por el administrador. Cuando esté activa, la preinspección solo podrá cerrarse desde la APK después de capturar la ubicación del dispositivo y validar que se encuentra dentro del radio permitido de la instalación.

## Decisiones de arquitectura

- La aplicación React + Capacitor sigue siendo una única base para Android y navegador.
- La APK conserva una copia local para trabajar sin cobertura.
- Los datos técnicos no se guardarán en Firebase.
- Firebase se mantiene inicialmente para autenticación, licencia y plan mientras se prepara la cuenta común del ecosistema.
- La sincronización técnica se construirá contra PocketBase autohospedado en el mini PC de IsiVoltPro.
- PocketBase almacenará los registros compartidos y los adjuntos; SQLite será su base de datos.
- El acceso exterior se publicará de forma segura mediante el dominio de IsiVoltPro y Cloudflare Tunnel.
- No se cambia el `appId` Android existente: `com.isivoltpro.inspecciones`.

## Flujo objetivo

```text
APK Android
  ↕ sincronización segura
PocketBase en mini PC
  ↕
Aplicación web para PC
```

1. El técnico descarga o crea una preinspección en la APK.
2. Los cambios se guardan primero localmente.
3. Cuando existe conexión, se envían al servidor.
4. El usuario entra desde el PC con la misma cuenta.
5. Abre la misma preinspección y continúa la revisión.
6. Los cambios del PC vuelven a sincronizarse con la APK.

## Primer hito funcional

El primer hito no incluirá todavía fotografías ni GPS:

1. Crear un identificador estable `inspectionId`.
2. Añadir metadatos de sincronización a cada preinspección.
3. Enviar una preinspección desde la APK al servidor.
4. Recuperarla desde la versión web para PC.
5. Modificarla desde el PC.
6. Descargar el cambio en la APK.
7. Evitar duplicados y no perder cambios locales.

### Metadatos mínimos

```json
{
  "inspectionId": "uuid",
  "companyId": "string",
  "ownerUserId": "string",
  "assignedUserId": "string|null",
  "status": "DRAFT",
  "syncStatus": "PENDING",
  "revision": 1,
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601",
  "lastSyncedAt": null,
  "deletedAt": null
}
```

## Estados de la preinspección

- `DRAFT`: borrador.
- `ASSIGNED`: asignada.
- `IN_PROGRESS`: en curso.
- `PENDING_REVIEW`: pendiente de revisión.
- `PENDING_ON_SITE_CLOSE`: preparada para cierre presencial.
- `CLOSED`: cerrada.
- `REOPENED`: reabierta.
- `CANCELLED`: cancelada.

## Estados de sincronización

- `LOCAL_ONLY`: solo existe en el dispositivo.
- `PENDING`: hay cambios pendientes de enviar.
- `SYNCING`: sincronización en curso.
- `SYNCED`: servidor y dispositivo coinciden.
- `CONFLICT`: existen cambios incompatibles.
- `ERROR`: la última sincronización falló.

## Colecciones iniciales de PocketBase

### `companies`

Empresa propietaria de los datos y de las reglas de trabajo.

### `users`

Usuario, empresa, rol y aplicaciones habilitadas.

### `installations`

Cliente, dirección, coordenadas y radio de cierre permitido.

### `inspections`

Cabecera, contenido técnico serializado, estado, revisión y metadatos de sincronización.

### `inspection_events`

Auditoría: creación, edición, sincronización, asignación, cierre, reapertura y excepciones.

Los adjuntos y fotografías se incorporarán después de validar correctamente la sincronización de datos estructurados.

## Reglas de cierre configurables

El administrador podrá definir por empresa o instalación:

- Permitir cierre desde PC.
- Exigir cierre desde APK.
- Exigir ubicación.
- Radio permitido en metros.
- Precisión GPS máxima aceptada.
- Firma del inspector obligatoria.
- Firma del cliente obligatoria u opcional.
- Número mínimo de fotografías.
- Exigir sincronización antes de cerrar.
- Permitir excepción administrativa.

## Registro del cierre presencial

```json
{
  "inspectionId": "uuid",
  "closedByUserId": "string",
  "deviceId": "string",
  "latitude": 0,
  "longitude": 0,
  "accuracyMeters": 0,
  "installationLatitude": 0,
  "installationLongitude": 0,
  "distanceMeters": 0,
  "allowedRadiusMeters": 100,
  "capturedAtDevice": "ISO-8601",
  "receivedAtServer": "ISO-8601|null",
  "result": "VALIDATED",
  "overrideReason": null
}
```

## Orden de implementación

1. Contrato común de estados, políticas y metadatos.
2. Adaptador de almacenamiento local sin romper los datos existentes.
3. PocketBase en desarrollo y colecciones mínimas.
4. Autenticación entre la app y PocketBase.
5. Sincronización de una preinspección sin fotografías.
6. Listado y edición desde PC.
7. Resolución básica de conflictos por revisión y fecha.
8. Fotografías, firmas y documentos.
9. Cola offline y reintentos automáticos.
10. Geolocalización mediante Capacitor.
11. Cierre presencial configurable.
12. Excepciones y auditoría administrativa.
13. Diseño común IsiVoltPro y selector de aplicaciones.
14. Integración en `www.isivoltpro.com` y publicación en `bt.isivoltpro.com`.

## Criterio de aceptación del primer hito

Una preinspección creada en Android aparece en el PC con el mismo `inspectionId`. Una modificación hecha desde el PC llega al móvil sin duplicar el registro y sin eliminar cambios locales no sincronizados.
