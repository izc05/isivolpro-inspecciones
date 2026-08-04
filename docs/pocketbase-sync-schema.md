# PocketBase · Esquema inicial para Preinspecciones BT

Este documento define el primer esquema de servidor para sincronizar la APK Android y la aplicación web para PC.

## Principios

- Ninguna colección técnica tendrá acceso público sin autenticar.
- Todos los registros estarán asociados a una empresa (`company`).
- Las reglas de acceso deberán impedir que un usuario consulte datos de otra empresa.
- El servidor será la referencia compartida, pero el móvil conservará una copia local.
- La eliminación será inicialmente lógica mediante `deletedAt`, para evitar pérdidas durante sincronizaciones retrasadas.
- Fotografías y documentos se incorporarán después de validar los datos estructurados.

## 1. `companies`

Colección base de empresas.

| Campo | Tipo | Requerido | Descripción |
|---|---|---:|---|
| `name` | text | sí | Nombre comercial |
| `legalName` | text | no | Razón social |
| `taxId` | text | no | CIF/NIF |
| `active` | bool | sí | Empresa habilitada |
| `plan` | select | sí | `demo`, `pro`, `enterprise` |
| `settings` | json | no | Configuración general |
| `closurePolicy` | json | no | Reglas de cierre por defecto |

## 2. `users`

Se recomienda utilizar una colección de autenticación de PocketBase.

| Campo | Tipo | Requerido | Descripción |
|---|---|---:|---|
| `email` | email | sí | Usuario de acceso |
| `name` | text | sí | Nombre visible |
| `company` | relation | sí | Empresa |
| `role` | select | sí | `admin`, `coordinator`, `inspector`, `viewer` |
| `active` | bool | sí | Cuenta habilitada |
| `applications` | json | no | Aplicaciones IsiVoltPro habilitadas |
| `firebaseUid` | text | no | Enlace transitorio con la cuenta Firebase actual |

Durante la transición, Firebase puede seguir autenticando la APK. El backend deberá validar un intercambio seguro antes de crear una sesión PocketBase; no se confiará en un UID recibido sin verificación.

## 3. `installations`

| Campo | Tipo | Requerido | Descripción |
|---|---|---:|---|
| `company` | relation | sí | Empresa propietaria |
| `clientName` | text | no | Cliente o titular |
| `name` | text | sí | Nombre de la instalación |
| `address` | text | no | Dirección |
| `city` | text | no | Localidad |
| `province` | text | no | Provincia |
| `latitude` | number | no | Coordenada de referencia |
| `longitude` | number | no | Coordenada de referencia |
| `allowedRadiusMeters` | number | no | Radio específico para cierre |
| `closurePolicy` | json | no | Reglas que sobrescriben las de empresa |
| `active` | bool | sí | Instalación activa |

## 4. `inspections`

Primera colección sincronizable.

| Campo | Tipo | Requerido | Descripción |
|---|---|---:|---|
| `inspectionId` | text único | sí | UUID estable compartido entre dispositivos |
| `company` | relation | sí | Empresa propietaria |
| `installation` | relation | no | Instalación asociada |
| `ownerUser` | relation | sí | Usuario creador |
| `assignedUser` | relation | no | Inspector asignado |
| `status` | select | sí | Estado de negocio |
| `revision` | number | sí | Revisión incremental |
| `payload` | json | sí | Datos estructurados de la preinspección |
| `sourceDeviceId` | text | no | Último dispositivo que modificó |
| `clientUpdatedAt` | date | sí | Fecha declarada por el cliente |
| `lastSyncedAt` | date | no | Última sincronización confirmada |
| `closedAt` | date | no | Fecha de cierre |
| `closedBy` | relation | no | Usuario que cerró |
| `deletedAt` | date | no | Eliminación lógica |

### Índices

- Único: `inspectionId`.
- Compuesto recomendado: `company + updated`.
- Compuesto recomendado: `company + assignedUser + status`.

### Regla de conflicto inicial

El cliente enviará `revision`.

- Si coincide con la revisión del servidor, se acepta el cambio y se incrementa.
- Si es inferior, el servidor devuelve conflicto y no sobrescribe automáticamente.
- Si el registro no existe, se crea con revisión `1`.

No se utilizará únicamente “la fecha más reciente gana”, porque la hora del móvil puede ser incorrecta.

## 5. `inspection_events`

Registro inmutable de auditoría.

| Campo | Tipo | Requerido | Descripción |
|---|---|---:|---|
| `company` | relation | sí | Empresa |
| `inspection` | relation | sí | Preinspección |
| `inspectionId` | text | sí | UUID estable para búsquedas |
| `user` | relation | no | Usuario responsable |
| `deviceId` | text | no | Dispositivo |
| `eventType` | select | sí | Tipo de evento |
| `revision` | number | no | Revisión relacionada |
| `details` | json | no | Información adicional |
| `clientCreatedAt` | date | no | Fecha en el dispositivo |

Eventos iniciales:

- `CREATED`
- `UPDATED`
- `SYNCED`
- `ASSIGNED`
- `STATUS_CHANGED`
- `CONFLICT_DETECTED`
- `CLOSE_ATTEMPTED`
- `CLOSED_ON_SITE`
- `CLOSE_REJECTED`
- `ADMIN_OVERRIDE`
- `REOPENED`
- `DELETED`

## 6. `inspection_closures`

Se añadirá cuando la sincronización básica esté validada.

| Campo | Tipo | Requerido | Descripción |
|---|---|---:|---|
| `inspection` | relation | sí | Preinspección |
| `closedBy` | relation | sí | Usuario |
| `deviceId` | text | sí | Dispositivo Android |
| `latitude` | number | no | Coordenada capturada |
| `longitude` | number | no | Coordenada capturada |
| `accuracyMeters` | number | no | Precisión indicada por Android |
| `installationLatitude` | number | no | Coordenada usada para validar |
| `installationLongitude` | number | no | Coordenada usada para validar |
| `distanceMeters` | number | no | Distancia calculada |
| `allowedRadiusMeters` | number | no | Radio aplicado |
| `result` | select | sí | Resultado de validación |
| `overrideReason` | text | no | Motivo de excepción |
| `capturedAtDevice` | date | sí | Momento de captura |
| `receivedAtServer` | date | sí | Momento de recepción |

## 7. Adjuntos posteriores

Después del primer hito se añadirá `inspection_files` para:

- fotografías;
- firmas;
- esquemas y documentos;
- miniaturas;
- huella SHA-256;
- tamaño y tipo MIME;
- relación con bloque, punto o cuadro.

## Orden de creación

1. `companies`.
2. `users` de autenticación.
3. `installations`.
4. `inspections`.
5. `inspection_events`.
6. Pruebas APK–PC con datos sin archivos.
7. `inspection_closures`.
8. `inspection_files`.

## Condición para pasar al cierre GPS

No se implementará el cierre presencial hasta demostrar que:

1. un registro creado en Android aparece en el PC;
2. una modificación del PC vuelve al Android;
3. un conflicto de revisión no elimina datos;
4. una cola offline se reintenta al recuperar conexión.
