import { createElement } from "react";
import ReactDOM from "react-dom/client";

import "./css/index.css";
import "./css/utils/fonts.css";
import Router from "./Router";
import { session } from "./utils/safeStorage";

// A page's code that won't load is almost always an old tab after a new version went up (its files
// are gone): reload once to get the new one. (Not again within a minute, so it can't loop; and not at
// all if it can't note that it tried. Either way the error page offers a reload.)
const RELOADED_KEY = "chunk_reload_at";
window.addEventListener("vite:preloadError", () => {
  if (Date.now() - Number(session.get(RELOADED_KEY) || 0) < 60_000) return;
  if (session.set(RELOADED_KEY, String(Date.now()))) window.location.reload();
});

// Initialize createRoot and render the app
const container = document.getElementById("sharehome")!;
const root = ReactDOM.createRoot(container);

root.render(createElement(Router));
