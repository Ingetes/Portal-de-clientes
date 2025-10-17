import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PortadaPortalClientes from './PortadaPortalClientes.jsx' // 👈 nombre y ruta correctos

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PortadaPortalClientes />
  </React.StrictMode>
)
