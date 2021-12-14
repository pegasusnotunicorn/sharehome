import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

//custom files
import { CustomForm } from './utils/MailchimpForm.js';
import { Title } from './utils/Title.js';
import { Splash } from './utils/Splash.js';
import GameModeIcons from "./About/utils/GameModeIcons.js";

// import { Printer, Gift, Smile } from 'react-feather';

import '../css/home.css';
import '../css/colors.css';

const HomePage = (props) => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "Love, Career & Magic — SHAREHOME";
  });

  const addons = (<GameModeIcons
    className="gameDetails"
    playerCount={t('main page.player count')}
    playTime={t('main page.play time')}
  />);


  return (
    <div className="content">
      <Title
        addons={addons}
      />

      <div className="subcontentWrapper">

        <hr></hr>

        <h2>
          {t('main page.subtitle1')}
        </h2>

        <h3>
          {t('main page.subtitle2')}
        </h3>

        <h3>
          {t('main page.subtitle3')}
        </h3>

        <hr></hr>

        <CustomForm />
      </div>

      <Splash />
    </div>
  );
}

export default HomePage;
