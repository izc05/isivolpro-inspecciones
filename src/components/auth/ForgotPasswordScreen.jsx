import React, { useState } from "react";
import { Mail } from "lucide-react";
import { resetPassword } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { AuthInput, AuthShell } from "./LoginScreen";

export default function ForgotPasswordScreen({ onShowLogin }) {
  const { firebaseConfigured } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    if (!firebaseConfigured) return setMessage("Firebase no está configurado.");
    if (!email.trim()) return setMessage("Introduce tu email.");
    try {
      setLoading(true);
      await resetPassword(email.trim());
      setMessage("Email de recuperación enviado.");
    } catch (error) {
      console.error(error);
      setMessage("No se pudo enviar la recuperación. Revisa el email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Recuperar contraseña" subtitle="IsiVoltPro" message={message}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <AuthInput icon={Mail} type="email" value={email} onChange={setEmail} placeholder="Email" />
        <button type="submit" disabled={loading} className="w-full rounded-2xl bg-[#FFC928] text-[#071E3D] py-4 font-black shadow-lg shadow-yellow-200 active:scale-95 transition disabled:opacity-60">
          {loading ? "Enviando recuperación..." : "Enviar recuperación"}
        </button>
      </form>
      <button type="button" onClick={onShowLogin} className="w-full mt-3 rounded-2xl bg-slate-100 py-3 text-sm font-black text-slate-700">
        Volver al login
      </button>
    </AuthShell>
  );
}
