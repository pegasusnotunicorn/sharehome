import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import '../css/pages/contactPage.css';

const ContactPage = (props) => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "Love, Career & Magic — Contact Us";
  });

  return (
    <div className="content">

      <div className="subcontentWrapper margin-top min-width">
        <div className="characterContent">
          <h2 className="subtitle">{t("contact page.title")}</h2>
          <p>{t("contact page.email")}<a className="email" href="mailto:hello@sharehomethegame.com">hello@sharehomethegame.com</a></p>
          <div className="socialIconsWrapper">
            <a href="https://instagram.com/sysifuscorp" target="_blank" rel="noreferrer"><img src="/images/icons/instagram.svg" alt="Instagram"/></a>
            <a href="https://www.reddit.com/user/sysifuscorp" target="_blank" rel="noreferrer"><img src="/images/icons/reddit.svg" alt="Reddit"/></a>
            <a href="https://discord.com/invite/nv89cRgEsS" target="_blank" rel="noreferrer"><img src="/images/icons/discord.svg" alt="Discord"/></a>
            <a href="https://twitter.com/sysifuscorp" target="_blank" rel="noreferrer"><img src="/images/icons/twitter.svg" alt="Twitter"/></a>
            <a href="https://www.facebook.com/sysifuscorp" target="_blank" rel="noreferrer"><img src="/images/icons/facebook.svg" alt="Facebook"/></a>
          </div>
        </div>
      </div>

      <div className="aboutMeWrapper">
        <div className="aboutMeVerticalWrapper">
          <img src="/images/wonmin.jpg" alt="Wonmin, the game designer" className="wonminImage"/>
        </div>
        <div className="aboutMeVerticalWrapper">
          <h2>{t("contact page.about me 1")}</h2>
          <p dangerouslySetInnerHTML={{__html: t("contact page.about me 2") }}></p>
          <p>{t("contact page.about me 3")}</p>
          <p dangerouslySetInnerHTML={{__html: t("contact page.about me 4") }}></p>
        </div>
      </div>
      <div className="madeby">
        <p>
          {t("contact page.description 1")}<a href="https://unicornwithwings.com">Pegasus Games</a>{t("contact page.description 2")}
        </p>
        <p>
          {t("contact page.description 3")}
        </p>
      </div>
    </div>
  );
}

export default ContactPage;
