# Validación · Evidencias protegidas por rol y asignación

Estado: **SUPERADA**

PocketBase probado: **v0.39.10**

Se ha comprobado:

- el técnico asignado puede subir y consultar sus fotografías y documentos;
- otro técnico de la misma empresa no puede listar, abrir ni subir evidencias de ese expediente;
- el perfil Solo consulta puede revisar y descargar evidencias autorizadas, pero no subirlas;
- administración puede consultar y subir evidencias en cualquier expediente de su empresa;
- las descargas protegidas requieren un token temporal de PocketBase;
- eventos y cierres heredan las mismas reglas de visibilidad por expediente;
- el hook de subida vuelve a validar la asignación y el permiso de escritura;
- auditoría del runtime, pruebas, compilación web y APK Android debug superadas.
