import React from "react";

const ECOSYSTEM_URL = "https://www.isivoltpro.com/aplicaciones/inspecciones-bt";

export default function EcosystemDock() {
  return (
    <a
      className="ecosystem-dock"
      href={ECOSYSTEM_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Abrir la ficha de IsiVoltPro Preinspecciones BT en el ecosistema"
      title="Volver al ecosistema IsiVoltPro"
    >
      <span className="ecosystem-dock__mark" aria-hidden="true">IV</span>
      <span className="ecosystem-dock__copy">
        <strong>IsiVoltPro</strong>
        <small>Preinspecciones BT · Beta</small>
      </span>
      <span className="ecosystem-dock__arrow" aria-hidden="true">↗</span>
    </a>
  );
}
