import { createElement } from "react";
import ReactDOM from "react-dom/client";

import "./css/index.css";
import "./css/utils/fonts.css";
import Router from "./Router";

// Initialize createRoot and render the app
const container = document.getElementById("sharehome")!;
const root = ReactDOM.createRoot(container);

root.render(createElement(Router));
