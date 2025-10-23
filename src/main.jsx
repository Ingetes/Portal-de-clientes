// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";

import PortalClientesAuth from "./portal_de_acceso_clientes.jsx";
import PortadaPortalClientes from "./PortadaPortalClientes.jsx";

// Monta React cuando #root exista y decide qué pintar según el hash.
function boot() {
  const container = document.getElementById("root");
  if (!container) {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
    return;
  }

  const root = createRoot(container);

  const render = () => {
    const hash = (window.location.hash || "").replace(/^#/, "");
    if (hash === "home") {
      root.render(<PortadaPortalClientes />);
    } else {
      // "#ingresar" (y cualquier otro hash distinto de "home") muestra el login
      root.render(<PortalClientesAuth />);
    }
  };

  render();
  window.addEventListener("hashchange", render);
}

boot();
