export function getFirebaseAuthMessage(error) {
  const code = error?.code || "";
  if (code === "auth/email-already-in-use") return "Ese email ya tiene una cuenta. Prueba a iniciar sesión.";
  if (code === "auth/invalid-email") return "El email no es válido.";
  if (code === "auth/weak-password") return "La contraseña debe tener al menos 6 caracteres.";
  if (code === "auth/operation-not-allowed") return "Activa Email/Password en Firebase Console > Authentication.";
  if (code === "auth/network-request-failed") return "No hay conexión con Firebase. Revisa internet.";
  if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
    return "Email o contraseña incorrectos.";
  }
  if (code === "permission-denied") return "Firestore no permite crear el perfil. Revisa y publica las reglas.";
  return "No se pudo completar la operación. Revisa Firebase Console e inténtalo de nuevo.";
}
