# Validación · Distribución Android release

Estado: **SUPERADA**

Se ha comprobado automáticamente:

- configuración Gradle compatible con firma condicional mediante variables de entorno;
- ausencia de almacenes de claves dentro del repositorio;
- auditoría high/critical limpia para dependencias de producción;
- pruebas de sincronización, PocketBase y compilación web;
- identidad coherente `IsiVoltPro Preinspecciones BT` en web, PWA, Capacitor y Android;
- acceso responsive y accesible desde la app hacia el ecosistema IsiVoltPro;
- comandos Gradle reproducibles en Windows, Linux y macOS;
- sincronización del proyecto Capacitor Android;
- construcción de APK release sin firma para validar el empaquetado;
- construcción de AAB release;
- validación de correspondencia entre tag, versionName y versionCode;
- workflow firmado con secretos, comprobación de firma y checksums SHA-256;
- eliminación del keystore temporal aunque el trabajo termine con error;
- notas de beta preparadas para una futura release borrador;
- documentación de custodia, versión, instalación y prueba mínima.

La firma real no se ejecuta en esta validación porque requiere los secretos privados del propietario.
