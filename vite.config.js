import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'SPMO QR Scanner',
        short_name: 'QR Scanner',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#4DBA87',
        icons: [
          {
            src: 'favicon.ico',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'favicon.ico',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
