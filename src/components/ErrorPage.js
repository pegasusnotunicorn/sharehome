import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

//custom files
import { Title } from './utils/Title.js';
import { Splash } from './utils/Splash.js';

const ErrorPage = (props) => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "Love, Career & Magic — Something went wrong!";
  });

  return (
    <div className="content max-width">
      <Title />
      <div className="subcontentWrapper">
        <h2 className="subtitle">{t("error page.title")}</h2>
        <p>{t("error page.description")}<NavLink to="/">{t("error page.link")}</NavLink></p>
      </div>

      <Splash />
    </div>
  )
}

export default ErrorPage;
