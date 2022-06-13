import React, { useEffect } from 'react';
import { Helmet } from "react-helmet";
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import EmailForm from './utils/EmailForm.js';

const FreeArtbookPage = (props) => {
  const { t } = useTranslation();

  //custom meta tags for this page
  const title = "Love, Career & Magic — Free Digital Artbook!";
  const splashImage = `https://lovecareermagic.com/images/artbook/mockup2.jpg`;
  const description = t("free artbook page.description");

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
          <h2 className="subtitle">{t("free artbook page.title")}</h2>
          <p>{t("free artbook page.description")}</p>
          <EmailForm className="artbookEmail" hideTitle isActiveAndDesktop />
        </div>
      </div>

      <div className="subcontentWrapper">
        <div className="couchContainer">
          <img className="couch" style={{width:"100%"}} src="/images/artbook/mockup2.jpg" alt={t('free artbook page.description')}></img>
          <img className="couch" style={{width:"100%"}} src="/images/artbook/mockup1.jpg" alt={t('free artbook page.description')}></img>
          <p style={{marginTop:"1em"}}><NavLink to="/">{t("error page.link")}</NavLink></p>
        </div>
      </div>

    </div>
  )
}

export default FreeArtbookPage;
