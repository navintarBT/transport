import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'ClearWay — ສະຫຼຸບຍອດສາຂາ',
        short_name: 'ClearWay',
        description: 'ເບິ່ງສະຫຼຸບຍອດຂາຍ, ລາຍງານການເງິນ, ແລະ ສະຖານະພັດສະດຸແຍກຕາມສາຂາ',
        theme_color: '#4F46E5',
        background_color: '#F8FAFC',
        display: 'standalone',
        start_url: '/',
      },
    }),
  ],
})
