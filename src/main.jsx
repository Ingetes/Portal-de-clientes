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

  // --- Cerrar sesión automática cada vez que se recargue la página ---
localStorage.removeItem("isLoggedIn");

const render = () => {
  // Leer hash actual sin "#"
  let hash = (window.location.hash || "").replace(/^#/, "");
  const isLogged = localStorage.getItem("isLoggedIn") === "true";

  // 1️⃣ Si no hay sesión, mostrar siempre el login
  if (!isLogged) {
    // Asegura que se mantenga el hash correcto
    if (hash !== "ingresar") {
      window.location.hash = "#ingresar";
    }
    root.render(<PortalClientesAuth />);
    return;
  }

  // 2️⃣ Si hay sesión, evita mostrar login
  if (hash === "ingresar" || hash === "") {
    window.location.hash = "#home";
    hash = "home";
  }

  // 3️⃣ Muestra el portal con sesión activa
  root.render(<PortadaPortalClientes />);
};

  render();
  window.addEventListener("hashchange", render);
}

boot();
