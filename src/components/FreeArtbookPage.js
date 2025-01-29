import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import EmailForm from "./utils/EmailForm.js";
import CustomHelmet from "./utils/CustomHelmet.js";

const FreeArtbookPage = (props) => {
  const { t } = useTranslation();

  //custom meta tags for this page
  const title = "Love, Career & Magic — Free Digital Artbook!";
  const splashImage = `https://lovecareermagic.com/images/artbook/mockup2.webp`;
  const description = t("free artbook page.description");

  //change title of page
  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className="content max-width">
      <CustomHelmet
        title={title}
        splashImage={splashImage}
        description={description}
      />

      <div className="subcontentWrapper margin-top min-width">
        <div className="characterContent">
          <h2 className="subtitle">{t("free artbook page.title")}</h2>
          <p>{t("free artbook page.description")}</p>
          <EmailForm className="artbookEmail" hideTitle isActiveAndDesktop />
        </div>
      </div>

      <div className="subcontentWrapper">
        <div className="couchContainer">
          <img
            className="couch"
            style={{ width: "100%" }}
            src="/images/artbook/mockup2.webp"
            alt={t("free artbook page.description")}
          ></img>
          <img
            className="couch"
            style={{ width: "100%" }}
            src="/images/artbook/mockup1.webp"
            alt={t("free artbook page.description")}
          ></img>
          <p style={{ marginTop: "1em" }}>
            <NavLink to="/">{t("error page.link")}</NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FreeArtbookPage;
