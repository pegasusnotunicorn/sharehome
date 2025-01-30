import ReactDOM from "react-dom/client"; // Change from "react-dom" to "react-dom/client"
import WebFont from "webfontloader";

import "./css/index.css";
import "./css/utils/fonts.css";
import Router from "./Router.js";

// Load fonts
WebFont.load({
  custom: {
    families: [
      "Rowdies-Light",
      "Rowdies-Regular",
      "Rowdies-Bold",
      "NotoSansJP Light",
      "NotoSansJP Bold",
    ],
  },
});

// Initialize createRoot and render the app
const container = document.getElementById("sharehome");
const root = ReactDOM.createRoot(container);

root.render(<Router />);
