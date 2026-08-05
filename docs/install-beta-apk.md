# Instalar la APK beta aislada

La variante interna utiliza este identificador Android:

```text
com.isivoltpro.inspecciones.beta
```

Por tanto puede convivir con la aplicación instalada actualmente, cuyo identificador es:

```text
com.isivoltpro.inspecciones
```

## Qué permite probar

- nombre e identidad `IsiVoltPro BT Beta`;
- navegación y adaptación móvil;
- dock de acceso al ecosistema;
- expedientes REBT 1973/2002 y mixtos;
- trabajo sin conexión;
- fotografías, firmas e informes;
- permisos Android y captura GPS;
- sincronización cuando el servidor esté disponible.

## Qué no permite comprobar

Al utilizar un paquete separado, la beta tiene almacenamiento propio. No comparte automáticamente:

- inspecciones guardadas en la aplicación actual;
- fotografías de IndexedDB;
- sesión iniciada;
- configuración local.

La conservación de datos durante una actualización debe comprobarse más adelante instalando una **release firmada con el identificador definitivo** sobre una versión anterior firmada con la misma clave.

## Descargar desde GitHub Actions

1. Abrir el repositorio `isivolpro-inspecciones`.
2. Entrar en `Actions`.
3. Seleccionar `Build isolated beta APK`.
4. Abrir la ejecución correcta.
5. Descargar el artefacto cuyo nombre empieza por:

```text
isivoltpro-preinspecciones-bt-1.5.8-beta-
```

El ZIP contiene:

```text
IsiVoltPro-Preinspecciones-BT-1.5.8-14-beta-<commit>.apk
SHA256SUMS.txt
BETA_BUILD_INFO.txt
```

## Verificar el archivo

Linux:

```bash
sha256sum -c SHA256SUMS.txt
```

PowerShell:

```powershell
Get-FileHash .\IsiVoltPro-Preinspecciones-BT-*.apk -Algorithm SHA256
```

Comparar el resultado con `SHA256SUMS.txt`.

## Instalar en Android

1. Copiar el APK al móvil.
2. Abrir el archivo.
3. Autorizar temporalmente la instalación desde esa aplicación, si Android lo solicita.
4. Confirmar que aparece como `IsiVoltPro BT Beta`.
5. Mantener instalada la aplicación actual para comparar ambas.

También puede instalarse mediante ADB:

```bash
adb install IsiVoltPro-Preinspecciones-BT-1.5.8-14-beta-<commit>.apk
```

## Seguridad

Esta APK:

- está firmada con una clave de depuración temporal;
- es únicamente para pruebas internas;
- no debe publicarse en Play Store;
- no debe enviarse como versión estable a clientes;
- puede requerir una instalación limpia cuando cambie la firma de depuración.

## Desinstalar la beta

Desde Android, desinstalar `IsiVoltPro BT Beta` sin tocar la aplicación principal.

Mediante ADB:

```bash
adb uninstall com.isivoltpro.inspecciones.beta
```

La desinstalación elimina únicamente los datos de la variante beta aislada.
