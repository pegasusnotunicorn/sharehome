import { defineConfig } from "vite";

export default defineConfig({
  server: { port: 3000, open: true },
  build: { outDir: "dist" },
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.js$/,
    exclude: [],
  },
});
