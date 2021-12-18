import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

//custom files
import GameModeIcons from "./About/utils/GameModeIcons.js";
import { CustomForm } from './utils/MailchimpForm.js';
import { SwiperCharacters } from './utils/SwiperCharacters.js';
import { CharacterSpotlight } from './utils/CharacterSpotlight.js';

import homeStyles from '../css/pages/home.module.css';
import '../css/utils/colors.css';
import '../css/utils/fireworks.css';

const HomePage = (props) => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "Love, Career & Magic — SHAREHOME";
  });

  // <div className="pyro">
  //   <div className="before"></div>
  //   <div className="after"></div>
  // </div>

  return (
    <div className="content">

      <div className={`${homeStyles.mainContentWrapper} noselect`}>
        <img className={`${homeStyles.backgroundImage} nopointerevent`} draggable="false" src="/images/splash.jpg" alt={t('main page.splashalt')}></img>
        <div className={`${homeStyles.lcmContainer}`}>
          <img className={`${homeStyles.lcmImage} ${homeStyles.floating}`} draggable="false" src="/images/lcm.png" alt="Love, Career, & Magic"></img>
          <p className={`${homeStyles.sharehomegame}`}>a sharehome game</p>
        </div>
        <div className={`${homeStyles.gamedetailContainer}`}>
          <h3 className={`${homeStyles.subtitle}`}>{t('main page.subtitle')}</h3>
          <GameModeIcons
            className={`${homeStyles.gameDetails}`}
            playerCount={t('main page.player count')}
            playTime={t('main page.play time')}
          />
        </div>
      </div>

      <div id={`${homeStyles.sharehomeContainer}`} className={`${homeStyles.mainpageContainer}`}>
        <div className={`subcontentWrapper`}>
          <h1>
            {t('main page.subtitle1')}
          </h1>
          <p>
            {t('main page.subtitle2')}
          </p>
          <p>
            {t('main page.subtitle3')}
          </p>
        </div>
      </div>

      <div id={`${homeStyles.characterContainer}`} className={`${homeStyles.mainpageContainer} redBackground`}>
        <div className={`subcontentWrapper`}>
          <h1>{t('main page.charactersSection')}</h1>
          <p>
            {t('main page.moretocome')}
            <br />
            <NavLink to="/characters">{t('main page.clicktoseemore')}</NavLink>
          </p>
        </div>
        <div className={`${homeStyles.swiperContainer}`}>
          <SwiperCharacters />
        </div>
      </div>

      <div id={`${homeStyles.emailContainer}`} className={`${homeStyles.mainpageContainer}`}>
        <CustomForm
          sidebar={false}
          moduleStyles={homeStyles}
        />
      </div>

      <div id={`${homeStyles.spotlightContainer}`} className={`${homeStyles.mainpageContainer} greenBackground`}>
        <div className={`subcontentWrapper`}>
          <h1>{t('main page.spotlightCharacter')}</h1>
        </div>
        <CharacterSpotlight />
      </div>

      <div id={`${homeStyles.finalContainer}`} className={`${homeStyles.mainpageContainer}`}>
        <div className={`subcontentWrapper`}>
          <h1>{t('main page.final text')}</h1>
          <p className={`${homeStyles.smallText}`}><a target="_blank" rel="noreferrer" href="https://sysifuscorp.com">{t('main page.otherworks')}</a></p>
        </div>
      </div>

    </div>
  );
}

export default HomePage;
