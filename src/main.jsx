import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PortalAccesoClientes from './portal_de_acceso_clientes.jsx' // 👈 nombre y ruta correctos

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PortalAccesoClientes />
  </React.StrictMode>
)
