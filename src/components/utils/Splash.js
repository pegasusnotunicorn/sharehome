import React from 'react';
import { useTranslation } from 'react-i18next';

export const Splash = (props) => {
  const { t } = useTranslation();

  return (
    <a href="./images/splash.jpg" target="_blank">
      <div className="couchContainer">
        <img className="couch" src="./images/splash.jpg" alt={t('main page.splashalt')}></img>
      </div>
    </a>
  );
}
