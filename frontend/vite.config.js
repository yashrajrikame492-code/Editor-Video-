import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'blnpb-59-152-57-58.run.pinggy-free.link',
      '.pinggy-free.link',
      '.pinggy.link',
      '.pinggy.io',
      'dove-relearn-unaware.ngrok-free.dev',
      '.ngrok-free.dev',
      '.ngrok.io'
    ]
  }
})
