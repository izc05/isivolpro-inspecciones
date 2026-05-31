# Pruebas Firebase Auth - IsiVoltPro 1.5.0

## Configuracion previa

1. Crear proyecto Firebase.
2. Anadir una app web.
3. Copiar la configuracion web al archivo `.env` local usando las variables de `.env.example`.
4. Activar Authentication > Sign-in method > Email/Password.
5. Crear Cloud Firestore.
6. Publicar las reglas de `firestore.rules`.

## Checklist de pruebas

1. Abrir la app en navegador con `npm run dev`.
2. Entrar en Ajustes > Cuenta.
3. Pulsar Crear cuenta.
4. Registrar usuario nuevo con nombre, email, contrasena y politica aceptada.
5. Comprobar en Firebase Authentication que aparece el usuario.
6. Comprobar en Firestore que existe `users/{uid}`.
7. Revisar que el documento nace con datos minimos: `uid`, `email`, `plan: "demo"`, `proActive: false` y campos de suscripcion.
8. Cerrar sesion desde Ajustes > Cuenta.
9. Iniciar sesion con el mismo email y contrasena.
10. Probar "Olvide mi contrasena" y confirmar que Firebase envia el email.
11. Comprobar que el usuario Demo ve Plan actual: Demo.
12. Cambiar manualmente en Firestore `proActive` a `true` y `plan` a `"pro"`.
13. Volver a la app y pulsar Actualizar plan en Ajustes > Cuenta.
14. Comprobar que aparece Pro activo y que el limite Demo deja de aplicarse.
15. Probar sin conexion tras haber iniciado sesion anteriormente.
16. Comprobar que las inspecciones locales siguen visibles.
17. Comprobar Inicio, Mis inspecciones, Checklist, Medidas, Informe y Ajustes.
18. Generar un informe de prueba y revisar que la exportacion existente sigue funcionando.
19. Probar en APK Android despues de ejecutar `npm run cap:android`.

## Comprobacion de privacidad local-first

1. Confirmar que Firestore solo contiene la coleccion `users`.
2. Confirmar que no existen colecciones de inspecciones, fotos, informes, mediciones, documentos ni clientes.
3. Crear una inspeccion con foto y generar informe.
4. Confirmar que Firestore no cambia salvo el documento `users/{uid}`.
5. Confirmar que las inspecciones siguen en almacenamiento local y que la copia de seguridad se exporta manualmente.

## Nota importante

La app no permite activar Pro desde el cliente. Para pruebas internas, cambia los campos de licencia manualmente desde Firebase Console. En produccion deberan actualizarse desde un backend seguro, Google Play Billing validado o RevenueCat.
