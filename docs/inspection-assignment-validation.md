# Validación · Asignación de preinspecciones

Estado: **SUPERADA**

PocketBase probado: **v0.39.10**

Se ha comprobado:

- selector de técnico dentro de la ficha de escritorio;
- estado sin asignar y listado de técnicos activos con acceso BT;
- asignación por administrador;
- reasignación por coordinador;
- rechazo del perfil Solo consulta;
- desasignación del expediente;
- cambio automático DRAFT → ASSIGNED y ASSIGNED → DRAFT;
- bloqueo de expedientes cerrados o cancelados;
- incremento de revisión del servidor;
- tres eventos ASSIGNED auditados en PocketBase real;
- parche visual idempotente;
- pruebas, auditoría de runtime, compilación web y APK Android debug.
