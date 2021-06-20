import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ErrorPage = (props) => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "SHAREHOME - Something went wrong!";
  });

  return (
    <div className="content max-width">
      <NavLink to="/"><div className="title noselect"></div></NavLink>
      <div className="subcontentWrapper">
        <h2 className="subtitle">{t("error page.title")}</h2>
        <p>{t("error page.description")}<NavLink to="/">{t("error page.link")}</NavLink></p>
      </div>

      <div className="couchContainer">
        <img className="couch" src="/images/couch.svg" alt="Commentator couch"></img>
      </div>
    </div>
  )
}

export default ErrorPage;
