# Firma y publicación Android · Preinspecciones BT

La APK de depuración sirve para pruebas internas. Para distribuir IsiVoltPro Preinspecciones BT de forma estable se debe generar una APK o un AAB **release firmado** con una clave privada permanente.

## Principios de seguridad

- El archivo `.jks` no se guarda en GitHub ni dentro del repositorio.
- Las contraseñas no se escriben en workflows, documentación, commits ni logs.
- La misma clave debe conservarse durante toda la vida de la aplicación Android.
- Debe existir una copia cifrada fuera del mini PC y fuera de GitHub.
- Perder la clave puede impedir actualizar instalaciones existentes.

## Secretos de GitHub necesarios

En `Settings → Secrets and variables → Actions` crear estos secretos:

```text
ANDROID_KEYSTORE_BASE64
ANDROID_KEYSTORE_PASSWORD
ANDROID_KEY_ALIAS
ANDROID_KEY_PASSWORD
```

Y, cuando el servidor esté disponible, esta variable de repositorio:

```text
BT_SYNC_API_URL=https://bt-api.isivoltpro.com
```

`BT_SYNC_API_URL` es una variable pública de compilación; no contiene credenciales.

## Crear el almacén de claves

Ejemplo ejecutado únicamente en un equipo seguro:

```bash
keytool -genkeypair \
  -v \
  -keystore isivoltpro-preinspecciones-bt-release.jks \
  -alias isivoltpro-bt \
  -keyalg RSA \
  -keysize 4096 \
  -validity 10000
```

Elegir contraseñas únicas y conservar:

- el archivo `.jks`;
- la contraseña del almacén;
- el alias;
- la contraseña de la clave.

## Convertir el archivo para GitHub Actions

Linux:

```bash
base64 -w 0 isivoltpro-preinspecciones-bt-release.jks > keystore.base64.txt
```

PowerShell:

```powershell
[Convert]::ToBase64String(
  [IO.File]::ReadAllBytes("isivoltpro-preinspecciones-bt-release.jks")
) | Set-Content -NoNewline keystore.base64.txt
```

Copiar el contenido de `keystore.base64.txt` al secreto `ANDROID_KEYSTORE_BASE64` y eliminar después el archivo de texto sin cifrar.

## Ejecutar la compilación firmada

El workflow se llama:

```text
Build signed Android release
```

Desde GitHub Actions:

1. Seleccionar el workflow.
2. Pulsar `Run workflow`.
3. Elegir la rama validada.
4. Indicar un tag, por ejemplo `v1.5.8-beta.1`.
5. Mantener desactivada la publicación mientras se realizan pruebas.
6. Activar `publish_draft_release` únicamente cuando se quiera crear una release borrador.

El flujo:

- valida que existen los cuatro secretos;
- ejecuta las pruebas y compilación web;
- sincroniza Capacitor;
- restaura temporalmente el keystore;
- construye APK y AAB release;
- verifica la firma de la APK;
- genera `SHA256SUMS.txt`;
- publica los archivos como artefacto privado de GitHub Actions;
- puede crear una GitHub Release en borrador;
- elimina el keystore temporal aunque el trabajo falle.

## Archivos resultantes

```text
IsiVoltPro-Preinspecciones-BT-<version>.apk
IsiVoltPro-Preinspecciones-BT-<version>.aab
SHA256SUMS.txt
```

La APK permite instalación directa controlada. El AAB es el formato preparado para Google Play cuando se decida utilizar esa vía.

## Control de versiones

Antes de una distribución real se deben actualizar conjuntamente:

```gradle
versionCode 15
versionName "1.5.9"
```

Reglas:

- `versionCode` siempre aumenta.
- `versionName` identifica la versión visible.
- El tag de la release debe coincidir con `versionName`.
- No reutilizar un tag ni sobrescribir una versión ya distribuida.

## Prueba mínima antes de entregar

Instalar la APK release en un móvil de pruebas y comprobar:

1. acceso con la cuenta IsiVoltPro;
2. apertura de inspecciones locales existentes;
3. creación y guardado offline;
4. fotografía, firma y generación de informe;
5. sincronización móvil–PC cuando el servidor esté activo;
6. cierre GPS en una instalación controlada;
7. actualización sobre una versión anterior sin perder datos.

No publicar una release definitiva mientras la PR conectada siga pendiente de la prueba real del mini PC.
