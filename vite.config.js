import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Portal-de-clientes/'   // 👈 igual al nombre del repo
})
