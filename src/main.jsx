import React from "react";
import { createRoot } from "react-dom/client";
import IsiVoltProInspecciones from "./App.jsx";
import AuthGate from "./components/auth/AuthGate.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <AuthGate>
        <IsiVoltProInspecciones />
      </AuthGate>
    </AuthProvider>
  </React.StrictMode>
);
