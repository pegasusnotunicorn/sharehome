import { defineConfig } from "vite";

export default defineConfig({
  envPrefix: ["VITE_", "REACT_APP_"],
  server: { port: 3000, open: true },
  build: { outDir: "dist" },
});
