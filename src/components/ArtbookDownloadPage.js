import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import CustomHelmet from './utils/CustomHelmet.js';
import DefaultButton from './utils/DefaultButton.js';

const ArtbookDownloadPage = (props) => {
  const { t } = useTranslation();

  //custom meta tags for this page
  const title = "Love, Career & Magic — Digital Artbook!";
  const splashImage = `https://lovecareermagic.com/images/artbook/mockup2.jpg`;
  const description = t("artbook download page.description");

  //change title of page
  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className="content max-width">

      <CustomHelmet title={title} splashImage={splashImage} description={description} />

      <div className="subcontentWrapper margin-top min-width">
        <div className="characterContent">
          <h2 className="subtitle">{t("artbook download page.title")}</h2>
          <p>{t("artbook download page.description")}</p>
          <DefaultButton shadowless icon="rulebookWhite" href="/artbook v1.pdf" className="artbookDownload" text={t("artbook download page.button")}/>
        </div>
      </div>

      <div className="subcontentWrapper">
        <div className="couchContainer">
          <img className="couch" style={{width:"100%"}} src="/images/artbook/mockup2.jpg" alt={t('artbook page.description')}></img>
          <img className="couch" style={{width:"100%"}} src="/images/artbook/mockup1.jpg" alt={t('artbook page.description')}></img>
          <p style={{marginTop:"1em"}}><NavLink to="/">{t("error page.link")}</NavLink></p>
        </div>
      </div>

    </div>
  )
}

export default ArtbookDownloadPage;
