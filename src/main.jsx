// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

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
    // hash sin el “#”; si no hay, por defecto “home”
    let hash = (window.location.hash || "#home").replace(/^#/, "");
    const isLogged = localStorage.getItem("isLoggedIn") === "true";

    // 1) Si no hay sesión → mostrar login (salvo que ya la tenga)
    if (!isLogged) {
      // Si el usuario intenta ir a algo distinto a ingresar, mantenlo en login
      if (hash !== "ingresar") {
        window.location.hash = "#ingresar";
        hash = "ingresar";
      }
      root.render(<PortalClientesAuth />);
      return;
    }

    // 2) Con sesión:
    //    - si pide “ingresar”, lo mandamos a home (no tiene sentido ver login)
    if (hash === "ingresar" || hash === "") {
      window.location.hash = "#home";
      hash = "home";
    }

    // 3) Para cualquier otro hash con sesión activa, mostramos la portada
    root.render(<PortadaPortalClientes />);
  };

  render();
  window.addEventListener("hashchange", render);
}

boot();
