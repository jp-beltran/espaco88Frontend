import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Configurações do servidor de desenvolvimento
  server: {
    port: 5173,
    host: true, // Permite acesso externo
    cors: true, // Habilita CORS

    // Proxy para desenvolvimento (opcional - para testar com backend local)
    proxy: {
      // Descomente as linhas abaixo se quiser usar proxy local para debug
      // '/api': {
      //   target: 'http://localhost:5000',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api/, '')
      // }
    },
  },

  // Configurações de build
  build: {
    outDir: "dist",
    sourcemap: false, // Desabilitar sourcemaps em produção
    minify: "terser",

    // Otimizações de build
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar dependências grandes em chunks separados
          vendor: ["react", "react-dom"],
          antd: ["antd"],
          icons: ["@ant-design/icons"],
          animations: ["framer-motion"],
          axios: ["axios"],
          router: ["react-router-dom"],
          dayjs: ["dayjs"],
        },
      },
    },

    // Configurações de chunk size
    chunkSizeWarningLimit: 1000,
  },

  // Configurações de otimização de dependências
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "antd",
      "@ant-design/icons",
      "axios",
      "react-router-dom",
      "framer-motion",
      "dayjs",
    ],
    exclude: ["@vite/client", "@vite/env"],
  },

  // Variáveis de ambiente
  define: {
    // Garantir que as variáveis de ambiente sejam definidas
    "process.env": process.env,
  },

  // Configurações CSS
  css: {
    devSourcemap: true, // Sourcemaps CSS apenas em dev
    preprocessorOptions: {
      // Configurações para preprocessadores CSS se necessário
    },
  },

  // Configurações de preview (build local)
  preview: {
    port: 4173,
    host: true,
    cors: true,
  },

  // Configurações avançadas
  esbuild: {
    // Remover console.log em produção
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
  },

  // Configurações de resolução de módulos
  resolve: {
    alias: {
      // Aliases para imports mais limpos (opcional)
      "@": "/src",
      "@components": "/src/components",
      "@pages": "/src/Pages",
      "@services": "/src/Services",
      "@types": "/src/Types",
    },
  },
});
