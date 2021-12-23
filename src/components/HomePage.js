import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useWindowDimensions from './utils/useWindowDimensions.js';

//custom files
import GameModeIcons from "./About/utils/GameModeIcons.js";
import { CustomForm } from './utils/MailchimpForm.js';
import { SwiperCharacters } from './utils/SwiperCharacters.js';
import { CharacterSpotlight } from './utils/CharacterSpotlight.js';
import { DeckAnimation } from './utils/DeckAnimation.js';
import { ShapesContainer } from "./utils/ShapesContainer.js";

import homeStyles from '../css/pages/home.module.css';
import '../css/utils/colors.css';

const HomePage = (props) => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const staticShapeCount = (width < 900) ? 10 : (width < 1200) ? 15 : 25;

  useEffect(() => {
    document.title = "Love, Career & Magic — SHAREHOME";
  });

  return (
    <div className="content">
      <div id={`${homeStyles.heroContainer}`} className={`${homeStyles.mainContentWrapper} noselect`}>
        <div id={`${homeStyles.mainContentInnerLeft}`} className={`${homeStyles.mainContentInner}`}>
          { DeckAnimation }
        </div>
        <div id={`${homeStyles.mainContentInnerRight}`} className={`${homeStyles.mainContentInner}`}>
          <div className={`${homeStyles.lcmContainer}`}>
            <NavLink draggable={false} className="noselect" to="/">
              <img className={`${homeStyles.lcmImage} floating noselect`} draggable="false" src="/images/lcm.png" alt="Love, Career, & Magic"></img>
            </NavLink>
            <p className={`${homeStyles.sharehomegame}`}>a sharehome game</p>
          </div>
        </div>
        <div className={`${homeStyles.gamedetailContainer}`}>
            <h3 className={`${homeStyles.subtitle}`}>{t('main page.hero.subtitle')}</h3>
            <GameModeIcons
              className={`${homeStyles.gameDetails}`}
              playerCount={t('main page.hero.player count')}
              playTime={t('main page.hero.play time')}
            />
          </div>

          <ShapesContainer count={staticShapeCount} dontScroll={true} />
      </div>

      <div id={`${homeStyles.descriptionContainer}`} className={`${homeStyles.mainpageContainer} blueBackground`}>
        <div className={`subcontentWrapper min-width`}>
          <h1>
            {t('main page.description.subtitle1')}
          </h1>
          <p>
            {t('main page.description.subtitle2')}
          </p>
          <p>
            {t('main page.description.subtitle3')}
          </p>
        </div>
        <div className={`subcontentWrapper min-width`}>
          <img className={`${homeStyles.backgroundImage} floating nopointerevent`} draggable="false" src="/images/splash.jpg" alt={t('main page.description.splashalt')}></img>
        </div>
      </div>

      <div id={`${homeStyles.emailContainer}`} className={`${homeStyles.mainpageContainer}`}>
        <CustomForm
          sidebar={false}
          moduleStyles={homeStyles}
        />
      </div>

      <div id={`${homeStyles.characterContainer}`} className={`${homeStyles.mainpageContainer} redBackground`}>
        <div className={`subcontentWrapper`}>
          <h1>{t('main page.character.description')}</h1>
          <p className={`${homeStyles.noMargin}`}>
            {t('main page.character.moretocome')}
            <br />
            <NavLink to="/characters">{t('main page.character.clicktoseemore')}</NavLink>
          </p>
        </div>
        <div className={`${homeStyles.swiperContainer}`}>
          <SwiperCharacters />
        </div>
      </div>

      <div id={`${homeStyles.mechanicsContainer}`} className={`${homeStyles.mainpageContainer}`}>
        <div className={`subcontentWrapper min-width`}>
          <h1>{t('main page.mechanics.description')}</h1>
          <div class={`${homeStyles.mechanicsWrapper}`}>
            <div><img src="/images/laughing.png" alt="Laughing icon" />{t('main page.mechanics.laughing')}</div>
            <div><img src="/images/party.png" alt="Party icon" />{t('main page.mechanics.party')}</div>
            <div><img src="/images/stories.png" alt="Stories icon" />{t('main page.mechanics.stories')}</div>
            <div><img src="/images/improv.png" alt="Improv icon" />{t('main page.mechanics.improv')}</div>
            <div><img src="/images/acting.png" alt="Acting icon" />{t('main page.mechanics.acting')}</div>
          </div>
        </div>
      </div>

      <div id={`${homeStyles.spotlightContainer}`} className={`${homeStyles.mainpageContainer} greenBackground`}>
        <div className={`subcontentWrapper`}>
          <h1>{t('main page.spotlight.description')}</h1>
        </div>
        <CharacterSpotlight />
      </div>

      <div id={`${homeStyles.finalContainer}`} className={`${homeStyles.mainpageContainer}`}>
        <div className={`subcontentWrapper`}>
          <h1>{t('main page.final.description')}</h1>
          <p className={`${homeStyles.smallText}`}><a target="_blank" rel="noreferrer" href="https://sysifuscorp.com">{t('main page.final.otherworks')}</a></p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
