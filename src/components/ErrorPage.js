import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

//custom files
import { Splash } from './utils/Splash.js';

const ErrorPage = (props) => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "Love, Career & Magic — Something went wrong!";
  });

  return (
    <div className="content max-width">

      <div className="subcontentWrapper min-width">
        <div className="characterContent">
          <h2 className="subtitle">{t("error page.title")}</h2>
          <p>{t("error page.description")}</p>
          <p><NavLink to="/">{t("error page.link")}</NavLink></p>
        </div>
      </div>

      <Splash />
    </div>
  )
}

export default ErrorPage;
