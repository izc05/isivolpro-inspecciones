# Validación · Distribución Android release

Estado: **SUPERADA**

Se ha comprobado automáticamente:

- configuración Gradle compatible con firma condicional mediante variables de entorno;
- ausencia de almacenes de claves dentro del repositorio;
- pruebas de sincronización, PocketBase y compilación web;
- sincronización del proyecto Capacitor Android;
- construcción de APK release sin firma para validar el empaquetado;
- construcción de AAB release;
- workflow firmado con secretos, comprobación de firma y checksums SHA-256;
- eliminación del keystore temporal aunque el trabajo termine con error;
- documentación de custodia, versión, instalación y prueba mínima.

La firma real no se ejecuta en esta validación porque requiere los secretos privados del propietario.
