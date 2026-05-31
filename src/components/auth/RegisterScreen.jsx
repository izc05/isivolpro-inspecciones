import React, { useState } from "react";
import { LockKeyhole, Mail, User } from "lucide-react";
import { registerWithEmail } from "../../services/authService";
import { getFirebaseAuthMessage } from "../../services/firebaseErrorMessages";
import { useAuth } from "../../context/AuthContext";
import { AuthInput, AuthShell } from "./LoginScreen";

export default function RegisterScreen({ onShowLogin }) {
  const { firebaseConfigured, closeAuth } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    if (!firebaseConfigured) return setMessage("Firebase no está configurado.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setMessage("Introduce un email válido.");
    if (password.length < 6) return setMessage("La contraseña debe tener mínimo 6 caracteres.");
    if (password !== repeatPassword) return setMessage("Las contraseñas no coinciden.");
    if (!accepted) return setMessage("Debes aceptar la política de privacidad.");

    try {
      setLoading(true);
      await registerWithEmail(email.trim(), password, name.trim());
      setMessage("Cuenta creada correctamente.");
      closeAuth();
    } catch (error) {
      console.error(error);
      setMessage(getFirebaseAuthMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Crear cuenta" subtitle="IsiVoltPro" message={message}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <AuthInput icon={User} value={name} onChange={setName} placeholder="Nombre" />
        <AuthInput icon={Mail} type="email" value={email} onChange={setEmail} placeholder="Email" />
        <AuthInput icon={LockKeyhole} type="password" value={password} onChange={setPassword} placeholder="Contraseña" />
        <AuthInput icon={LockKeyhole} type="password" value={repeatPassword} onChange={setRepeatPassword} placeholder="Repetir contraseña" />
        <label className="flex items-start gap-3 rounded-2xl bg-slate-50 border border-slate-100 p-3 text-xs font-bold text-slate-600">
          <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1" />
          Acepto la política de privacidad y las condiciones de uso.
        </label>
        <button type="submit" disabled={loading} className="w-full rounded-2xl bg-[#FFC928] text-[#071E3D] py-4 font-black shadow-lg shadow-yellow-200 active:scale-95 transition disabled:opacity-60">
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>
      <button type="button" onClick={onShowLogin} className="w-full mt-3 rounded-2xl bg-slate-100 py-3 text-sm font-black text-slate-700">
        Ya tengo cuenta
      </button>
    </AuthShell>
  );
}
