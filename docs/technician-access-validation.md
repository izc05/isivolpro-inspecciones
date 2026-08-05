# Validación · Acceso de técnicos desde Administración

Estado: **SUPERADA**

Versión oficial de PocketBase probada: **v0.39.10**

Se ha comprobado:

- panel de técnicos dentro de Administración para escritorio;
- alta por correo, nombre, teléfono y especialidad;
- perfiles Técnico, Coordinador y Solo consulta;
- acceso independiente a Preinspecciones BT;
- estado pendiente, vinculado o suspendido;
- contraseña privada gestionada por Firebase y nunca expuesta al administrador;
- enlace automático en el primer acceso con el mismo correo;
- comprobación del permiso de aplicación en cada sincronización;
- creación de contraseña interna aleatoria de PocketBase no devuelta por la API;
- auditoría de invitación, actualización, suspensión, activación y vinculación;
- rechazo de correos duplicados;
- prueba real de alta, listado, suspensión y reactivación en PocketBase;
- pruebas unitarias, auditoría del runtime, compilación web y APK Android debug.

El envío automático de correos queda fuera de este hito; el panel permite copiar instrucciones de acceso para enviarlas al técnico.
