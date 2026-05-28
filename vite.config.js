import { defineConfig } from "vite";

export default defineConfig({
  envPrefix: ["VITE_", "REACT_APP_"],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 3000,
    open: true,
    strictPort: true,
    proxy: {
      "/.netlify/functions": {
        target: "http://localhost:8888",
        changeOrigin: true,
      },
    },
  },
  build: { outDir: "dist" },
});
