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
  let hash = (window.location.hash || "#ingresar").replace(/^#/, "");
  const isLogged = localStorage.getItem("isLoggedIn") === "true";

  // 1️⃣ Si NO hay sesión, mostrar siempre el login (independiente del hash actual)
  if (!isLogged) {
    window.location.hash = "#ingresar";
    root.render(<PortalClientesAuth />);
    return;
  }

  // 2️⃣ Si SÍ hay sesión, asegurar que no se quede en #ingresar
  if (hash === "ingresar" || !hash) {
    window.location.hash = "#home";
    hash = "home";
  }

  // 3️⃣ Renderizar la portada del portal
  root.render(<PortadaPortalClientes />);
};

  render();
  window.addEventListener("hashchange", render);
}

boot();
