import React, { useEffect } from 'react';
import { CornerLeftDown } from 'react-feather';
import { useTranslation } from 'react-i18next';

//custom files
import Card from './Card/Card.js';
import { Title } from './utils/Title.js';

import '../css/contact.css';

const ContactPage = (props) => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "Love, Career & Magic — Contact Us";
  });

  return (
    <div className="content max-width">
      <Title />
      <div className="subcontentWrapper">
        <h2 className="subtitle">{t("contact page.title")}</h2>
        <p>{t("contact page.email")}<a className="email" href="mailto:hello@sharehomethegame.com">hello@sharehomethegame.com</a></p>
      </div>
      <div className="subcontentWrapper">
        <div className="madeby">
          <p>
            {t("contact page.description 1")}<a href="https://unicornwithwings.com">Pegasus Games</a>{t("contact page.description 2")}
          </p>
          <p>
            {t("contact page.description 3")}<br/>{t("contact page.description 4")}
          </p>
        </div>
        <div className="madeby">
          <p><CornerLeftDown style={{verticalAlign:"text-top", marginRight:"10px"}} />{t("contact page.made by")}</p>
          <Card
            type="member"
            personName="Wonmin Lee"
            showFront={true}
            mainStyle={{
              width:"300px",
              height:"200px",
              fontSize:"9px",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
