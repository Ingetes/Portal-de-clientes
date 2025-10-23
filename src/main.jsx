// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";

import PortalClientesAuth from "./portal_de_acceso_clientes.jsx";
import PortadaPortalClientes from "./PortadaPortalClientes.jsx";

// Monta React únicamente cuando #root exista.
// Además, vuelve a renderizar al cambiar el hash (#home, #ingresar, etc.)
function boot() {
  const container = document.getElementById("root");
  if (!container) {
    // Si todavía no existe, esperamos al DOM y reintentamos una sola vez
    document.addEventListener("DOMContentLoaded", boot, { once: true });
    return;
  }

  const root = createRoot(container);

  const render = () => {
    // normalizamos el hash: "#home" -> "home", "#ingresar" -> "ingresar"
    const hash = (window.location.hash || "").replace(/^#/, "");

    // Si estás en #home mostramos la portada; en cualquier otro caso, el login
    if (hash === "home") {
      root.render(<PortadaPortalClientes />);
    } else {
      // incluye "#ingresar" (y cualquier otro hash)
      root.render(<PortalClientesAuth />);
    }
  };

  render();
  window.addEventListener("hashchange", render);
}

// Arrancamos
boot();
