import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { firebaseConfigured } from "../firebase/firebaseConfig";
import { listenAuthState, logout as logoutService } from "../services/authService";
import { createUserProfile, getUserProfile } from "../services/userService";

const DEMO_ACCESS_KEY = "isivolt_demo_access_enabled";
const LICENSE_CACHE_KEY = "isivolt_license_cache";
const PLAN_STORAGE_KEY = "subscriptionPlan";
const AUTH_BOOT_TIMEOUT_MS = 1800;
const FIRESTORE_TIMEOUT_MS = 5000;
const AUTH_PERF_LOGS = import.meta.env.DEV && import.meta.env.VITE_AUTH_PERF_LOGS === "true";

const AuthContext = createContext(null);

const initialCache = readLicenseCache();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(() => initialCache?.profile || null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [authView, setAuthView] = useState(null);
  const [demoAccess, setDemoAccess] = useState(() => localStorage.getItem(DEMO_ACCESS_KEY) === "true" || Boolean(initialCache?.profile));
  const [authError, setAuthError] = useState("");
  const [offlineNotice, setOfflineNotice] = useState("");
  const [sessionMessage, setSessionMessage] = useState("Cargando sesión...");
  const [profileStatus, setProfileStatus] = useState(initialCache?.profile ? "cache" : "idle");
  const [lastSync, setLastSync] = useState(initialCache?.profile?.lastSync || initialCache?.cachedAt || "");

  useEffect(() => {
    startPerf("Firebase onAuthStateChanged");
    setSessionMessage("Cargando sesión...");
    let authResolved = false;
    let cancelled = false;

    const bootTimer = window.setTimeout(() => {
      if (authResolved || cancelled) return;
      setLoading(false);
      setSessionMessage("Comprobando cuenta...");
      setProfileStatus((current) => (current === "idle" ? "pending" : current));
      if (initialCache?.profile) {
        setOfflineNotice("Comprobando cuenta en segundo plano. Usando última sesión conocida.");
      }
    }, AUTH_BOOT_TIMEOUT_MS);

    const unsubscribe = listenAuthState((nextUser) => {
      if (!authResolved) {
        authResolved = true;
        endPerf("Firebase onAuthStateChanged");
      }
      window.clearTimeout(bootTimer);
      if (cancelled) return;

      setLoading(false);
      setUser(nextUser);
      setAuthError("");

      if (!nextUser) {
        setSessionMessage("Cargando sesión...");
        setProfileStatus("idle");
        setProfile(null);
        setOfflineNotice("");
        localStorage.setItem(PLAN_STORAGE_KEY, "demo");
        return;
      }

      setDemoAccess(true);
      localStorage.setItem(DEMO_ACCESS_KEY, "true");
      setSessionMessage("Comprobando cuenta...");

      const cached = readLicenseCache();
      if (cached?.uid === nextUser.uid && cached.profile) {
        setProfile(cached.profile);
        setLastSync(cached.profile.lastSync || cached.cachedAt || "");
        setProfileStatus("cache");
        localStorage.setItem(PLAN_STORAGE_KEY, cached.profile.proActive ? "pro" : "demo");
      } else {
        setProfile(buildFallbackProfile(nextUser));
        setProfileStatus("pending");
        localStorage.setItem(PLAN_STORAGE_KEY, "demo");
      }

      loadProfileInBackground(nextUser);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(bootTimer);
      unsubscribe?.();
    };
  }, []);

  const loadProfileInBackground = async (nextUser) => {
    if (!nextUser) return null;
    setProfileLoading(true);
    setProfileStatus((current) => (current === "synced" ? "synced" : "pending"));
    startPerf("Firestore getUserProfile");
    try {
      let nextProfile = await withTimeout(getUserProfile(nextUser.uid), FIRESTORE_TIMEOUT_MS, "Timeout cargando perfil de Firestore");
      endPerf("Firestore getUserProfile");
      if (!nextProfile) {
        startPerf("Firestore createUserProfile");
        nextProfile = await withTimeout(createUserProfile(nextUser, {}), FIRESTORE_TIMEOUT_MS, "Timeout creando perfil de Firestore");
        endPerf("Firestore createUserProfile");
      }

      startPerf("Firebase getUserLicense/plan");
      const cachedProfile = cacheProfile(nextProfile, nextUser);
      endPerf("Firebase getUserLicense/plan");
      setProfile(cachedProfile);
      setLastSync(cachedProfile.lastSync);
      setProfileStatus("synced");
      setOfflineNotice("");
      localStorage.setItem(PLAN_STORAGE_KEY, cachedProfile.proActive ? "pro" : "demo");
      return cachedProfile;
    } catch (error) {
      endPerf("Firestore getUserProfile");
      endPerf("Firestore createUserProfile");
      console.error("Error cargando perfil Firebase", error);
      const cached = readLicenseCache();
      if (cached?.uid === nextUser.uid && cached.profile) {
        setProfile(cached.profile);
        setLastSync(cached.profile.lastSync || cached.cachedAt || "");
        setProfileStatus("cache");
        setOfflineNotice("Sin conexión. Usando última sesión conocida.");
        localStorage.setItem(PLAN_STORAGE_KEY, cached.profile.proActive ? "pro" : "demo");
        return cached.profile;
      }

      const fallbackProfile = buildFallbackProfile(nextUser);
      setProfile(fallbackProfile);
      setProfileStatus("error");
      setOfflineNotice("Sin conexión o Firestore lento. Usando modo Demo local.");
      setAuthError("Error de conexión. No se pudo cargar el perfil.");
      localStorage.setItem(PLAN_STORAGE_KEY, "demo");
      return fallbackProfile;
    } finally {
      setProfileLoading(false);
    }
  };

  const plan = profile?.proActive ? "pro" : "demo";
  const isPro = plan === "pro";
  const isDemo = !isPro;

  const continueDemo = () => {
    setDemoAccess(true);
    setAuthView(null);
    setOfflineNotice("");
    localStorage.setItem(DEMO_ACCESS_KEY, "true");
    localStorage.setItem(PLAN_STORAGE_KEY, "demo");
  };

  const openAuth = (view = "login") => setAuthView(view);
  const closeAuth = () => setAuthView(null);

  const logout = async () => {
    await logoutService();
    setUser(null);
    setProfile(null);
    setLastSync("");
    setProfileStatus("idle");
    setOfflineNotice("");
    setAuthView("login");
    localStorage.setItem(PLAN_STORAGE_KEY, "demo");
  };

  const refreshProfile = async () => {
    if (!user) return null;
    return loadProfileInBackground(user);
  };

  const value = useMemo(() => ({
    firebaseConfigured,
    user,
    profile,
    loading,
    profileLoading,
    authView,
    authError,
    offlineNotice,
    sessionMessage,
    profileStatus,
    lastSync,
    demoAccess,
    plan,
    isPro,
    isDemo,
    continueDemo,
    openAuth,
    closeAuth,
    logout,
    refreshProfile,
    setAuthView,
    setAuthError,
  }), [user, profile, loading, profileLoading, authView, authError, offlineNotice, sessionMessage, profileStatus, lastSync, demoAccess, plan, isPro, isDemo]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}

function cacheProfile(profile, user) {
  const cachedProfile = normalizeProfileForCache(profile, user);
  if (!cachedProfile?.uid) return cachedProfile;
  localStorage.setItem(LICENSE_CACHE_KEY, JSON.stringify({
    uid: cachedProfile.uid,
    profile: cachedProfile,
    cachedAt: cachedProfile.lastSync,
  }));
  return cachedProfile;
}

function normalizeProfileForCache(profile, user) {
  const lastSync = new Date().toISOString();
  return {
    uid: profile?.uid || user?.uid || "",
    email: profile?.email || user?.email || "",
    displayName: profile?.displayName || user?.displayName || "",
    plan: profile?.proActive ? "pro" : "demo",
    proActive: Boolean(profile?.proActive),
    role: profile?.role || "inspector",
    subscriptionProvider: profile?.subscriptionProvider || null,
    subscriptionProductId: profile?.subscriptionProductId || null,
    subscriptionStatus: profile?.subscriptionStatus || "none",
    subscriptionExpiresAt: profile?.subscriptionExpiresAt || null,
    lastSync,
  };
}

function buildFallbackProfile(user) {
  return {
    uid: user?.uid || "",
    email: user?.email || "",
    displayName: user?.displayName || "",
    plan: "demo",
    proActive: false,
    role: "inspector",
    subscriptionProvider: null,
    subscriptionProductId: null,
    subscriptionStatus: "none",
    subscriptionExpiresAt: null,
    lastSync: "",
  };
}

function readLicenseCache() {
  try {
    return JSON.parse(localStorage.getItem(LICENSE_CACHE_KEY) || "null");
  } catch {
    return null;
  }
}

function withTimeout(promise, timeoutMs, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), timeoutMs);
    }),
  ]);
}

function safeTimeEnd(label) {
  try {
    console.timeEnd(label);
  } catch {
    // console.timeEnd can throw in some browsers if the timer was already ended.
  }
}

function startPerf(label) {
  if (AUTH_PERF_LOGS) console.time(label);
}

function endPerf(label) {
  if (AUTH_PERF_LOGS) safeTimeEnd(label);
}
