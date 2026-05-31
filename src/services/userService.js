import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db, firebaseConfigured } from "../firebase/firebaseConfig";

function requireDb() {
  if (!firebaseConfigured || !db) {
    throw new Error("Firebase no está configurado. Revisa el archivo .env local.");
  }
  return db;
}

export async function createUserProfile(user) {
  const firestore = requireDb();
  const ref = doc(firestore, "users", user.uid);
  const existing = await getDoc(ref);
  if (existing.exists()) return existing.data();

  const profile = {
    uid: user.uid,
    email: user.email || "",
    plan: "demo",
    proActive: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    subscriptionProvider: null,
    subscriptionProductId: null,
    subscriptionStatus: "none",
    subscriptionExpiresAt: null,
  };

  await setDoc(ref, profile);
  return profile;
}

export async function getUserProfile(uid) {
  const firestore = requireDb();
  const snapshot = await getDoc(doc(firestore, "users", uid));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function updateUserProfile(uid, data) {
  const firestore = requireDb();
  const allowed = ["email"];
  const safeData = Object.fromEntries(Object.entries(data || {}).filter(([key]) => allowed.includes(key)));
  await updateDoc(doc(firestore, "users", uid), { ...safeData, updatedAt: serverTimestamp() });
}
