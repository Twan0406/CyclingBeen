import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { prerender } from './scripts/prerenderPlugin'

export default defineConfig({
  plugins: [react(), tailwindcss(), prerender()],
})
