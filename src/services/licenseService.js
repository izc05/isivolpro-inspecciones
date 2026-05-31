import { doc, getDoc } from "firebase/firestore";
import { db, firebaseConfigured } from "../firebase/firebaseConfig";

function requireDb() {
  if (!firebaseConfigured || !db) {
    throw new Error("Firebase no está configurado. Revisa el archivo .env local.");
  }
  return db;
}

export async function getUserLicense(uid) {
  const firestore = requireDb();
  const snapshot = await getDoc(doc(firestore, "users", uid));
  if (!snapshot.exists()) return { plan: "demo", proActive: false };
  const profile = snapshot.data();
  return {
    plan: profile.proActive ? "pro" : "demo",
    proActive: Boolean(profile.proActive),
    subscriptionProvider: profile.subscriptionProvider || null,
    subscriptionStatus: profile.subscriptionStatus || "none",
    subscriptionProductId: profile.subscriptionProductId || null,
    subscriptionExpiresAt: profile.subscriptionExpiresAt || null,
  };
}

export async function isProUser(uid) {
  const license = await getUserLicense(uid);
  return Boolean(license.proActive);
}

export async function setDemoPlan(uid) {
  throw new Error(
    `Cambio de licencia bloqueado en cliente para ${uid}. Ajusta el plan manualmente desde Firebase Console o desde un backend seguro.`
  );
}

export async function setProPlanManual(uid) {
  throw new Error(
    `Función de desarrollo bloqueada en cliente para ${uid}. Cambia proActive manualmente desde Firebase Console.`
  );
}
