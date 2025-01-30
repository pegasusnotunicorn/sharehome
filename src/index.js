import React from "react";
import ReactDOM from "react-dom";
import WebFont from "webfontloader";

import "./css/index.css";
import "./css/utils/translations/eng.css";
import "./css/utils/translations/jap.css";
import "./css/utils/fonts.css";
import Router from "./Router.js";

//load font first
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

ReactDOM.render(<Router />, document.getElementById("sharehome"));
