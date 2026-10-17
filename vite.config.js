import { defineConfig } from "vite";

// Rowdies-Bold (every page's title is set in it) is preloaded, so the title doesn't wait on the CSS
// before its download even starts; the home page's hero also preloads GochiHand (index.html). Their built
// names carry a hash, so they're found in the bundle.
const PRELOAD_FONTS = ["Rowdies-Bold"];
const HOME_FONT = "GochiHand-Regular";
// The home page's own code, for index.html to fetch along with the app's (on the home page only),
// rather than once the app's has run: its chunk, the chunks it needs that the app's doesn't, and its CSS
const homeFiles = (bundle) => {
  const chunks = Object.values(bundle).filter((c) => c.type === "chunk");
  const home = chunks.find((c) => c.isDynamicEntry && Object.keys(c.modules).some((id) => id.endsWith("/Home/LandingPage.tsx")));
  if (!home) return { js: [], css: [] };
  const entry = new Set(chunks.filter((c) => c.isEntry).flatMap((c) => [c.fileName, ...c.imports]));
  const js = [], css = new Set();
  const add = (c) => {
    if (!c || entry.has(c.fileName) || js.includes(c.fileName)) return;
    js.push(c.fileName);
    c.viteMetadata?.importedCss?.forEach((f) => css.add(f));
    c.imports.forEach((f) => add(bundle[f]));
  };
  add(home);
  return { js, css: [...css] };
};
const preloadFonts = () => ({
  name: "preload-fonts",
  apply: "build",
  transformIndexHtml(html, ctx) {
    const names = Object.keys(ctx.bundle || {});
    const font = (name) => names.find((f) => f.includes(`/${name}-`) && f.endsWith(".woff2"));
    const files = PRELOAD_FONTS.map(font).filter(Boolean);
    const home = homeFiles(ctx.bundle || {});
    const list = (a) => JSON.stringify(a.map((f) => `/${f}`));
    return {
      html: html
        .replaceAll('"__HOME_FONT__"', JSON.stringify(font(HOME_FONT) ? `/${font(HOME_FONT)}` : ""))
        .replaceAll('"__HOME_JS__"', list(home.js))
        .replaceAll('"__HOME_CSS__"', list(home.css)),
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
