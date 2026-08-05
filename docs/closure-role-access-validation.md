# Validación · Cierre presencial por rol y asignación

Estado: **SUPERADA**

PocketBase probado: **v0.39.10**

Se ha comprobado:

- el técnico asignado puede cerrar su propia preinspección;
- otro técnico de la misma empresa no puede cerrarla;
- el perfil Solo consulta no puede cerrar expedientes;
- una excepción de cierre solo puede autorizarla un administrador;
- un expediente ya cerrado o cancelado queda bloqueado;
- la revisión se comprueba de nuevo dentro de la transacción;
- los valores false y 0 de la política se distinguen de opciones ausentes;
- la política y el expediente se leen con unmarshalJSONField;
- los cierres y eventos quedan auditados y visibles según los permisos del expediente;
- auditoría del runtime, pruebas, compilación web y APK Android debug superadas.
