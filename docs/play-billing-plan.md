# Plan Google Play Billing - IsiVoltPro

## Productos sugeridos

- `isivoltpro_pro_monthly`
- `isivoltpro_pro_yearly`

## Flujo previsto

1. El usuario inicia sesion con Firebase Auth.
2. La app carga `users/{uid}` desde Firestore.
3. El usuario pulsa Activar Pro.
4. Se lanza la compra con Google Play Billing o RevenueCat.
5. La compra se valida de forma segura.
6. Solo despues de validar, se actualiza Firestore:
   - `plan: "pro"`
   - `proActive: true`
   - `subscriptionProvider`
   - `subscriptionProductId`
   - `subscriptionStatus`
   - `subscriptionExpiresAt`
7. La app refresca el perfil y muestra Pro activo.

El flujo no debe subir inspecciones, fotos, informes, mediciones ni datos tecnicos a Firebase.

## Seguridad

No se debe activar Pro solo desde el movil. Cualquier campo de licencia puede manipularse si se actualiza directamente desde cliente. Por eso las reglas de Firestore bloquean cambios en:

- `plan`
- `proActive`
- `role`
- `subscriptionProvider`
- `subscriptionProductId`
- `subscriptionStatus`
- `subscriptionExpiresAt`
- `createdAt`

## Recomendacion

Para una primera version comercial, RevenueCat suele reducir trabajo y errores porque gestiona compras, restauracion, estados de suscripcion y validacion multiplataforma. Si solo se va a vender en Android, Google Play Billing directo tambien es valido, pero conviene validarlo con backend seguro antes de marcar `proActive=true`.
