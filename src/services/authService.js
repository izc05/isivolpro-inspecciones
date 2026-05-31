import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, firebaseConfigured } from "../firebase/firebaseConfig";
import { createUserProfile } from "./userService";

function requireAuth() {
  if (!firebaseConfigured || !auth) {
    throw new Error("Firebase no está configurado. Revisa el archivo .env local.");
  }
  return auth;
}

export async function registerWithEmail(email, password, displayName) {
  const authInstance = requireAuth();
  const credential = await createUserWithEmailAndPassword(authInstance, email, password);
  await createUserProfile(credential.user);
  return credential.user;
}

export async function loginWithEmail(email, password) {
  const authInstance = requireAuth();
  const credential = await signInWithEmailAndPassword(authInstance, email, password);
  return credential.user;
}

export async function logout() {
  const authInstance = requireAuth();
  await signOut(authInstance);
}

export async function resetPassword(email) {
  const authInstance = requireAuth();
  await sendPasswordResetEmail(authInstance, email);
}

export function getCurrentUser() {
  return auth?.currentUser || null;
}

export function listenAuthState(callback) {
  if (!firebaseConfigured || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
