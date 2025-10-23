// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";

import PortalClientesAuth from "./portal_de_acceso_clientes.jsx";
import PortadaPortalClientes from "./PortadaPortalClientes.jsx";

// contenedor raíz (asegúrate de tener <div id="root"></div> en index.html)
const root = createRoot(document.getElementById("root"));

function render() {
  // Si la URL tiene #home, mostramos la portada.
  // En cualquier otro caso, mostramos el login.
  if (window.location.hash === "#home") {
    root.render(<PortadaPortalClientes />);
  } else {
    root.render(<PortalClientesAuth />);
  }
}

// Render inicial
render();

// Re-render al cambiar el hash
window.addEventListener("hashchange", render);

// (opcional) Forzar render si el DOM se carga antes del script
document.addEventListener("DOMContentLoaded", render);

