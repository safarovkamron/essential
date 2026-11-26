import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Разрешаем открывать приложение через туннель cloudflared (для проверки в Telegram).
    allowedHosts: ['.trycloudflare.com'],
  },
});
