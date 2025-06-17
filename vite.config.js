import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Tambah baris 'base' ini. Gantikan 'kitty-vite-app'
  // dengan nama repository GitHub anda.
  base: '/kitty-vite/', 
})
