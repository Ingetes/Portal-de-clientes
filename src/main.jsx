import "./index.css"; 
import React from "react";
import ReactDOM from "react-dom/client";

// Vistas
import PortadaPortalClientes from "./PortadaPortalClientes.jsx";
import PortalClientesAuth from "./portal_de_acceso_clientes.jsx";
import PortalAdminUsuarios from "./portal_administrador_de_usuarios.jsx";
import IngetesAdmin from "./ingetes_admin.jsx";

const routes = {
  "": PortadaPortalClientes,        // sin hash
  "#home": PortadaPortalClientes,   // home
  "#ingresar": PortalClientesAuth,  // login
  "#admin": PortalAdminUsuarios,    // admin de usuarios
  "#ingetes-admin": IngetesAdmin,   // backoffice demo
};

const root = ReactDOM.createRoot(document.getElementById("root"));

function mount() {
  const hash = window.location.hash || "#home";
  const View = routes[hash] || PortadaPortalClientes;
  root.render(<View />);
}

window.addEventListener("hashchange", mount);
mount(); // primer render
