import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: 'https://github.com/bitexoft/q-banking-scrum.git',
})
// https://vite.dev/config
