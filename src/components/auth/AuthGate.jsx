import React from "react";
import { useAuth } from "../../context/AuthContext";
import ForgotPasswordScreen from "./ForgotPasswordScreen";
import LoginScreen from "./LoginScreen";
import RegisterScreen from "./RegisterScreen";

export default function AuthGate({ children }) {
  const { loading, profileLoading, authView, setAuthView, demoAccess, continueDemo, user, offlineNotice, sessionMessage } = useAuth();
  const [showOfflineNotice, setShowOfflineNotice] = React.useState(false);

  React.useEffect(() => {
    if (!offlineNotice || !user) {
      setShowOfflineNotice(false);
      return undefined;
    }
    setShowOfflineNotice(true);
    const timer = window.setTimeout(() => setShowOfflineNotice(false), 6500);
    return () => window.clearTimeout(timer);
  }, [offlineNotice, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071E3D] text-white flex items-center justify-center p-5">
        <div className="w-full max-w-xs rounded-[2rem] bg-white/10 border border-white/10 p-6 text-center">
          <p className="font-black text-yellow-300">{sessionMessage || "Cargando sesión..."}</p>
          <p className="text-sm text-white/70 mt-2">Preparando IsiVolt Pro</p>
        </div>
      </div>
    );
  }

  if (authView === "register") {
    return <RegisterScreen onShowLogin={() => setAuthView("login")} />;
  }

  if (authView === "forgot") {
    return <ForgotPasswordScreen onShowLogin={() => setAuthView("login")} />;
  }

  if (!user && (!demoAccess || authView === "login")) {
    return (
      <LoginScreen
        onShowRegister={() => setAuthView("register")}
        onShowForgot={() => setAuthView("forgot")}
        onContinueDemo={continueDemo}
      />
    );
  }

  return (
    <>
      {showOfflineNotice && (
        <div className="fixed top-3 left-3 right-3 z-[300] mx-auto max-w-md rounded-2xl bg-yellow-50 border border-yellow-100 p-3 text-xs font-black text-yellow-900 shadow-xl flex items-start justify-between gap-3">
          <span>{offlineNotice}</span>
          <button type="button" className="text-yellow-950/60" onClick={() => setShowOfflineNotice(false)} aria-label="Ocultar aviso">OK</button>
        </div>
      )}
      {user && profileLoading && !showOfflineNotice && (
        <div className="fixed top-3 left-3 right-3 z-[300] mx-auto max-w-md rounded-2xl bg-blue-50 border border-blue-100 p-3 text-xs font-black text-blue-900 shadow-xl">
          Comprobando cuenta...
        </div>
      )}
      {children}
    </>
  );
}
