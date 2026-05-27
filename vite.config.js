import { defineConfig } from "vite";

export default defineConfig({
  envPrefix: ["VITE_", "REACT_APP_"],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      "/.netlify/functions": "http://localhost:8888",
    },
  },
  build: { outDir: "dist" },
});
