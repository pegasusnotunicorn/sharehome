import { defineConfig } from "vite";

// The two fonts the first screen is set in, preloaded, so the text doesn't wait on the CSS before
// their download even starts (their built names carry a hash, so they're found in the bundle)
const PRELOAD_FONTS = ["Rowdies-Regular", "Roboto-Light"];
const preloadFonts = () => ({
  name: "preload-fonts",
  apply: "build",
  transformIndexHtml(html, ctx) {
    const names = Object.keys(ctx.bundle || {});
    const files = names.filter((f) =>
      PRELOAD_FONTS.some((name) => f.includes(`/${name}-`) && f.endsWith(".woff2"))
    );
    // the home hero's background texture, for index.html's home-only preload
    const homeBg = names.find((f) => f.includes("/bg_seamless-"));
    return {
      html: homeBg ? html.replaceAll("__HOME_BG__", `/${homeBg}`) : html,
      tags: files.map((f) => ({
        tag: "link",
        attrs: { rel: "preload", as: "font", type: "font/woff2", href: `/${f}`, crossorigin: "" },
        injectTo: "head",
      })),
    };
  },
});

export default defineConfig({
  envPrefix: ["VITE_", "REACT_APP_"],
  plugins: [preloadFonts()],
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
