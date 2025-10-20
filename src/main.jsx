import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";

// Vistas
import PortadaPortalClientes from "./PortadaPortalClientes.jsx";
import PortalClientesAuth from "./portal_de_acceso_clientes.jsx";
import PortalAdminUsuarios from "./portal_administrador_de_usuarios.jsx";
import IngetesAdmin from "./ingetes_admin.jsx";

const routes = {
  "": PortalClientesAuth,           // (sin hash) -> LOGIN
  "#ingresar": PortalClientesAuth,  // /#ingresar -> LOGIN
  "#home": PortadaPortalClientes,   // /#home     -> PORTADA
  "#admin": PortalAdminUsuarios,
  "#ingetes-admin": IngetesAdmin,
};

const root = ReactDOM.createRoot(document.getElementById("root"));

function normalizeHash() {
  if (!window.location.hash) {
    // si entra sin hash, fuerza /#ingresar (login)
    window.location.hash = "#ingresar";
    return "#ingresar";
  }
  return window.location.hash;
}

function mount() {
  const hash = normalizeHash();
  const View = routes[hash] || PortadaPortalClientes;
  root.render(<View />);
}

window.addEventListener("hashchange", mount);
mount();
