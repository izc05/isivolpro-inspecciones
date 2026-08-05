# IsiVoltPro Preinspecciones BT 1.5.8 · Beta conectada

Estado: **notas preparadas, release no publicada**.

Esta versión reúne el funcionamiento local-first existente con la arquitectura necesaria para continuar una preinspección entre Android y PC mediante un servidor PocketBase autohospedado.

## Novedades principales

### Identidad del producto

- Nuevo nombre visible: **IsiVoltPro Preinspecciones BT**.
- Metadatos coherentes en web, PWA, Capacitor y Android.
- Versión visible alineada con `1.5.8`.
- Acceso desde la app hacia la ficha del ecosistema IsiVoltPro.
- Eliminación de teléfono y correo de demostración obsoletos.

### Continuidad Android–PC

- `inspectionId` estable para expedientes nuevos y antiguos.
- Revisiones locales y de servidor separadas.
- Envío y descarga bidireccional.
- Cola offline con reintentos al recuperar conexión.
- Conflictos visibles cuando dos dispositivos modifican la misma revisión.
- Protección frente a sobrescritura de una inspección abierta o con cambios pendientes.

### Fotografías, firmas y documentos

- Sincronización de archivos guardados en IndexedDB.
- Subida multipart y descarga mediante token temporal.
- Identificadores estables para evitar duplicados.
- Verificación SHA-256 después de descargar.
- Recuperación de referencias locales obsoletas.
- Archivos privados y aislados por empresa.

### Cierre presencial

- Cierre desde APK Android configurable por empresa.
- Coordenadas y radio protegidos por el servidor.
- Validación de distancia y precisión GPS.
- Requisitos configurables de firma y fotografías.
- Confirmación de que las fotografías existen realmente en PocketBase.
- Revalidación obligatoria de revisión y reglas en el servidor.
- Excepción exclusiva de administrador con motivo y auditoría.

### Servidor y despliegue

- Colecciones PocketBase para empresas, usuarios, instalaciones, inspecciones, archivos, cierres y eventos.
- Inicio de sesión único mediante intercambio Firebase–PocketBase.
- Instalador Ubuntu y unidad systemd endurecida.
- Servicio limitado a `127.0.0.1:8091`.
- Plantilla para Cloudflare Tunnel.
- Preflight de permisos, variables, servicio, salud local, HTTPS y espacio disponible.

### Distribución Android

- Workflow preparado para APK y AAB release firmados.
- Keystore únicamente en almacenamiento temporal de GitHub Actions.
- Verificación de firma con `apksigner`.
- Checksums SHA-256.
- Artefactos versionados y GitHub Release opcional en borrador.

## Validación automatizada

La rama ha superado:

- 54 pruebas de sincronización, archivos, administración, conflictos y GPS;
- validación estricta de migraciones y hooks PocketBase;
- compilación web de producción;
- sincronización Capacitor Android;
- APK Android de depuración;
- APK release sin firma para validar el empaquetado;
- AAB release;
- comprobaciones de identidad y herramientas de despliegue.

## Cambios de seguridad

- Configuración protegida para coordenadas y políticas de cierre.
- Archivos sin acceso público.
- Separación por empresa.
- Keystore y contraseñas fuera del repositorio.
- Auditoría automática de dependencias de producción.
- Separación de herramientas de compilación respecto al runtime.

## Compatibilidad y datos locales

La actualización está diseñada para conservar:

- inspecciones existentes en almacenamiento local;
- fotografías y documentos guardados en IndexedDB;
- configuración de empresa;
- plan Demo/Pro;
- copias JSON existentes.

La conservación debe confirmarse mediante la prueba de actualización incluida en `docs/beta-acceptance-plan.md`.

## Pendiente antes de publicar

- Desplegar PocketBase en el mini PC.
- Crear empresa y usuario reales de prueba.
- Publicar `bt-api.isivoltpro.com` y `bt.isivoltpro.com`.
- Ejecutar la prueba E2E móvil–PC.
- Validar fotografía sincronizada y cierre GPS real.
- Revisar visualmente el dock en varios móviles.
- Crear y custodiar el keystore definitivo.
- Generar y probar la primera APK release firmada.
- Confirmar actualización sin pérdida de datos.

## Aviso de alcance

IsiVoltPro Preinspecciones BT es una herramienta de apoyo para recopilar, revisar y documentar información técnica. No sustituye una inspección reglamentaria oficial, un certificado, la normativa aplicable ni el criterio del profesional habilitado.
