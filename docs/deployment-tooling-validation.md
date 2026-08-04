# Validación · Herramientas de despliegue del mini PC

Estado: **SUPERADA**

Se ha comprobado automáticamente:

- sintaxis estricta de migraciones y hooks PocketBase;
- sintaxis de todos los scripts shell de despliegue;
- instalador con migraciones y archivo de variables protegido;
- unidad systemd limitada a `127.0.0.1:8091` y endurecida;
- plantilla Firebase sin credenciales reales;
- plantilla Cloudflare Tunnel con regla final `http_status:404`;
- preflight operativo para servicio, permisos, salud local y HTTPS público;
- documentación del procedimiento y criterio para no fusionar antes de la prueba real.

Esta validación certifica las herramientas del repositorio. No sustituye la ejecución del preflight en el mini PC real.
