import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 👇 Cambia el nombre base a tu repo exacto
export default defineConfig({
  plugins: [react()],
  base: '/Portal-de-clientes/', 
})
