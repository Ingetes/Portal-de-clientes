import React from "react";
import { createRoot } from "react-dom/client";
import PortalClientesAuth from "./portal_de_acceso_clientes.jsx";
import PortadaPortalClientes from "./PortadaPortalClientes.jsx";

function AppRouter() {
  const [hash, setHash] = React.useState(window.location.hash || "");

  React.useEffect(() => {
    const onHash = () => setHash(window.location.hash || "");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Cuando tengas #home => renderiza el Home
  if (hash === "#home") return <PortadaPortalClientes />;
  // Default => Login
  return <PortalClientesAuth />;
}

createRoot(document.getElementById("root")).render(<AppRouter />);
