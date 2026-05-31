import React, { useState } from "react";
import { AlertTriangle, LockKeyhole, Mail, Zap } from "lucide-react";
import { loginWithEmail } from "../../services/authService";
import { getFirebaseAuthMessage } from "../../services/firebaseErrorMessages";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen({ onShowRegister, onShowForgot, onContinueDemo }) {
  const { firebaseConfigured, closeAuth, setAuthError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setAuthError("");
    if (!firebaseConfigured) {
      setMessage("Firebase no está configurado. Puedes continuar en modo Demo.");
      return;
    }
    try {
      setLoading(true);
      await loginWithEmail(email.trim(), password);
      closeAuth();
    } catch (error) {
      console.error(error);
      setMessage(getFirebaseAuthMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="IsiVolt Pro" subtitle="Acceso de técnico" message={message}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <AuthInput icon={Mail} type="email" value={email} onChange={setEmail} placeholder="Email" />
        <AuthInput icon={LockKeyhole} type="password" value={password} onChange={setPassword} placeholder="Contraseña" />
        <button type="submit" disabled={loading} className="w-full rounded-2xl bg-[#FFC928] text-[#071E3D] py-4 font-black shadow-lg shadow-yellow-200 active:scale-95 transition disabled:opacity-60">
          {loading ? "Iniciando sesión..." : "Entrar"}
        </button>
      </form>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <button type="button" onClick={onShowRegister} className="rounded-2xl bg-slate-100 py-3 text-sm font-black text-slate-700">Crear cuenta</button>
        <button type="button" onClick={onShowForgot} className="rounded-2xl bg-slate-100 py-3 text-sm font-black text-slate-700">Olvidé mi contraseña</button>
      </div>
      <button type="button" onClick={onContinueDemo} className="w-full mt-3 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-black text-slate-600">
        Continuar en modo Demo
      </button>
      {!firebaseConfigured && (
        <p className="mt-3 flex items-start gap-2 rounded-2xl bg-yellow-50 border border-yellow-100 p-3 text-xs font-bold text-yellow-900">
          <AlertTriangle className="w-4 h-4 shrink-0" /> Falta configurar Firebase en el archivo .env local.
        </p>
      )}
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, message, children }) {
  return (
    <div className="min-h-screen bg-[#071E3D] text-white flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-[1.5rem] bg-[#FFC928] text-[#071E3D] flex items-center justify-center shadow-xl">
            <Zap className="w-9 h-9 fill-current" />
          </div>
          <h1 className="mx-auto max-w-[16rem] text-3xl font-black leading-tight mt-4 break-words">{title}</h1>
          <p className="text-yellow-300 font-black uppercase tracking-widest text-xs mt-1">{subtitle}</p>
        </div>
        <div className="bg-white text-slate-900 rounded-[2rem] p-5 shadow-2xl">
          {message && <div className="mb-3 rounded-2xl bg-yellow-50 border border-yellow-100 p-3 text-sm font-bold text-yellow-900">{message}</div>}
          {children}
        </div>
      </div>
    </div>
  );
}

export function AuthInput({ icon: Icon, value, onChange, type = "text", placeholder }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:ring-2 focus-within:ring-[#FFC928]">
      <Icon className="w-5 h-5 text-slate-400" />
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none text-sm font-bold text-slate-900 placeholder:text-slate-400"
      />
    </label>
  );
}
