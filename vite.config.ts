import { defineConfig, type ServerOptions } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'
import path from "path"

const target = process.env.VITE_API_URL;
const server: ServerOptions = target
  ? {
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/api/, ''),
        },
      },
    }
  : {};

export default defineConfig({
  plugins: [ react(), tailwindcss() ],
  server,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  }
});
