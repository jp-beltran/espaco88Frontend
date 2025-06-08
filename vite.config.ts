import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Configurações para produção
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    minify: "esbuild", // Mudança aqui: esbuild é mais rápido e já vem com o Vite
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          antd: ["antd"],
          router: ["react-router-dom"],
          motion: ["framer-motion"],
        },
      },
    },
  },

  // Configurações do servidor de preview (ESSENCIAL para Railway)
  preview: {
    host: "0.0.0.0",
    port: process.env.PORT ? parseInt(process.env.PORT) : 4173,
    strictPort: true,
  },

  // Configurações de desenvolvimento
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
