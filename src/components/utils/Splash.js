import React from 'react';
import { useTranslation } from 'react-i18next';

export const Splash = (props) => {
  const { t } = useTranslation();

  return (
    <div className="subcontentWrapper">
      <div className="couchContainer">
        <a href="./images/illustrations/splash.jpg" target="_blank">
          <img className="couch" style={{width:"100%"}} src="/images/illustrations/small_splash.jpg" alt={t('main page.splashalt')}></img>
        </a>
      </div>
    </div>
  );
}
