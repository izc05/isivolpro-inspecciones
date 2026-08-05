import React from "react";
import { createRoot } from "react-dom/client";
import IsiVoltProInspecciones from "./App.jsx";
import AuthGate from "./components/auth/AuthGate.jsx";
import EcosystemDock from "./components/EcosystemDock.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./styles.css";
import "./ecosystem-dock.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <AuthGate>
        <IsiVoltProInspecciones />
        <EcosystemDock />
      </AuthGate>
    </AuthProvider>
  </React.StrictMode>
);
