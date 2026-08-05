# Validación · Permisos por rol y expediente

Estado: **SUPERADA**

PocketBase probado: **v0.39.10**

Se ha comprobado:

- administrador y coordinador ven todos los expedientes de su empresa;
- el perfil Solo consulta ve todos, pero no puede sincronizar cambios;
- cada técnico recibe únicamente expedientes asignados o creados por él;
- un técnico no puede modificar el expediente de otro técnico;
- una preinspección nueva creada por técnico se autoasigna al creador;
- una cuenta sin acceso a Preinspecciones BT queda bloqueada;
- lectura nativa de campos JSON mediante unmarshalJSONField;
- la respuesta de descarga incluye permisos y asignación;
- el hook principal carga sus ayudantes dentro de cada handler, compatible con PocketBase moderno;
- auditoría de runtime, pruebas, compilación web y APK Android debug superadas.
