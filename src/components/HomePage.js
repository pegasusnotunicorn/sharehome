import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { CustomForm } from './utils/MailchimpForm.js';
import GameModeIcons from "./About/utils/GameModeIcons.js";
import { useTranslation } from 'react-i18next';

// import { Printer, Gift, Smile } from 'react-feather';

import '../css/home.css';
import '../css/colors.css';

const HomePage = (props) => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "SHAREHOME - A custom party game";
  });

  return (
    <div className="content">
      <NavLink to="/"><div className="title noselect"></div></NavLink>
      <div className="subcontentWrapper">
        <h3>
          {t('main page.subtitle')}
        </h3>

        <GameModeIcons
          playerCount={t('main page.player count')}
          playTime={t('main page.play time')}
        />

        <CustomForm />
      </div>

      <div className="couchContainer">
        <img className="couch" src="/images/couch.svg" alt="Commentator couch"></img>
      </div>
    </div>
  );
}

export default HomePage;
