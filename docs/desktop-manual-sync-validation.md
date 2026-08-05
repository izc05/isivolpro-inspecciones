# Validación · Sincronización manual desde PC

Estado: **SUPERADA**

Se ha comprobado:

- el botón Sincronizar del escritorio ejecuta el mismo motor usado por APK y sincronización automática;
- no se crea una segunda cola ni un flujo paralelo de datos;
- el botón abre el inicio de sesión cuando no existe una cuenta autenticada;
- queda desactivado cuando PocketBase no está configurado o mientras ya existe una sincronización en curso;
- muestra los estados Sincronizando, Todo al día, Sin conexión, Conflicto y Error;
- permite reintentar errores, conflictos y trabajo pendiente sin conexión;
- el estado real del puente se devuelve a la cabecera del escritorio;
- el control se compacta en resoluciones de escritorio pequeñas;
- parche ejecutado dos veces sin duplicaciones;
- auditoría, pruebas, compilación web y APK Android debug superadas.
