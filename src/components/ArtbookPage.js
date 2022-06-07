import React, { useEffect } from 'react';
import { Helmet } from "react-helmet";
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import DefaultButton from './utils/DefaultButton.js';

const StickersPage = (props) => {
  const { t } = useTranslation();

  //custom meta tags for this page
  const title = "Love, Career & Magic — Free stickers!";
  const splashImage = `https://sharehomethegame.com/images/freesticker.jpg`;
  const description = t("artbook page.description");

  //change title of page
  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className="content max-width">

      <Helmet>
        <meta name="description" data-react-helmet="true" content={ description } />

        <meta itemprop="name" data-react-helmet="true" content={ description } />
        <meta itemprop="description" data-react-helmet="true" content={ description } />
        <meta itemprop="image" data-react-helmet="true" content={ splashImage } />

        <meta property="og:title" data-react-helmet="true" content={ title } />
        <meta property="og:description" data-react-helmet="true" content={ description } />
        <meta property="og:image" data-react-helmet="true" content={ splashImage } />
        <meta property="og:url" data-react-helmet="true" content={ window.location.href } />

        <meta name="twitter:title" data-react-helmet="true" content={ title }></meta>
        <meta name="twitter:description" data-react-helmet="true" content={ description } />
        <meta name="twitter:image" data-react-helmet="true" content={ splashImage } />
      </Helmet>

      <div className="subcontentWrapper margin-top min-width">
        <div className="characterContent">
          <h2 className="subtitle">{t("artbook page.title")}</h2>
          <p>{t("artbook page.description")}</p>
          <DefaultButton shadowless icon="rulebookWhite" href="/artbook v1.pdf" text={t("artbook page.button")}/>
        </div>
      </div>

      <div className="subcontentWrapper">
        <div className="couchContainer">
          <img className="couch" style={{width:"100%"}} src="/images/illustrations/splash.jpg" alt={t('artbook page.description')}></img>
          <p style={{marginTop:"1em"}}><NavLink to="/">{t("error page.link")}</NavLink></p>
        </div>
      </div>

    </div>
  )
}

export default StickersPage;
