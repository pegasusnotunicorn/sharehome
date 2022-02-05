import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Parallax } from "react-scroll-parallax";

//custom files
import GameModeIcons from "./About/utils/GameModeIcons.js";
import { CustomForm } from './utils/MailchimpForm.js';
import { SwiperCharacters } from './utils/SwiperCharacters.js';
import { CharacterSpotlight } from './utils/CharacterSpotlight.js';
import VisibilityTrigger from "./utils/VisibilityTrigger.js";
import ParallaxSection from "./utils/ParallaxSection.js";
import useWindowDimensions from './utils/useWindowDimensions.js';

import homeStyles from '../css/home.module.css';
import '../css/utils/colors.css';

const HomePage = (props) => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "Love, Career & Magic — SHAREHOME";
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }, []);

  //emphasis
  let subtitle = t('main page.hero.subtitle');
  let { width } = useWindowDimensions();
  if (width <= 900) {
    subtitle = subtitle.replace("\n", "");
  }

  return (
    <div className="content">

      <div id={`${homeStyles.heroContainer}`} className={`${homeStyles.mainContentWrapper} noselect`}>
        <Parallax opacity={[1,0, "easeInExpo"]}>
          <VisibilityTrigger className={`${homeStyles.titleWrapper}`} once >
            <div className={`${homeStyles.lcmContainer}`}>
              <NavLink draggable={false} className="noselect" to="/">
                <img className={`${homeStyles.lcmImage} floating noselect`} draggable="false" src="/images/lcm.png" alt="Love, Career, & Magic"></img>
              </NavLink>
              <p className={`${homeStyles.sharehomegame}`}>a SHAREHOME game</p>
            </div>
          </VisibilityTrigger>
        </Parallax>
        <ParallaxSection />
      </div>

      <div id={`${homeStyles.descriptionContainer}`} className={`${homeStyles.mainpageContainer}`}>
        <div className={`${homeStyles.descriptionWrapper}`}>
          <div className={`subcontentWrapper`}>
            <VisibilityTrigger translateY>
              <h1 dangerouslySetInnerHTML={{__html: subtitle }} className={`${homeStyles.subtitle}`}></h1>
            </VisibilityTrigger>
            <VisibilityTrigger translateY>
              <GameModeIcons
                className={`${homeStyles.gameDetails}`}
                playerCount={t('main page.hero.player count')}
                playTime={t('main page.hero.play time')}
                />
            </VisibilityTrigger>
          </div>
          <div className={`subcontentWrapper min-width`}>
            <VisibilityTrigger translateY>
              <p>{t('main page.description.subtitle2')}</p>
            </VisibilityTrigger>
            <VisibilityTrigger translateY>
              <p>{t('main page.description.subtitle3')}</p>
            </VisibilityTrigger>
          </div>
        </div>
      </div>

      <div id={`${homeStyles.characterContainer}`} className={`${homeStyles.mainpageContainer}`}>
        <div className={`subcontentWrapper`}>
          <VisibilityTrigger translateY>
            <h1>{t('main page.character.description')}</h1>
          </VisibilityTrigger>
          <VisibilityTrigger translateY>
            <p className={`${homeStyles.noMargin}`}>
              {t('main page.character.moretocome')}
              <br />
              <NavLink to="/characters">{t('main page.character.clicktoseemore')}</NavLink>
            </p>
          </VisibilityTrigger>
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

      <div id={`${homeStyles.mechanicsContainer}`} className={`${homeStyles.mainpageContainer}`}>
        <div className={`subcontentWrapper min-width`}>
          <VisibilityTrigger translateY>
            <h1>{t('main page.mechanics.description')}</h1>
          </VisibilityTrigger>
            <div className={`${homeStyles.mechanicsWrapper}`}>
              <VisibilityTrigger translateY>
                <div><img src="/images/laughing.png" alt="Laughing icon" />{t('main page.mechanics.laughing')}</div>
              </VisibilityTrigger>
              <VisibilityTrigger translateY>
                <div><img src="/images/party.png" alt="Party icon" />{t('main page.mechanics.party')}</div>
              </VisibilityTrigger>
              <VisibilityTrigger translateY>
                <div><img src="/images/stories.png" alt="Stories icon" />{t('main page.mechanics.stories')}</div>
              </VisibilityTrigger>
              <VisibilityTrigger translateY>
                <div><img src="/images/improv.png" alt="Improv icon" />{t('main page.mechanics.improv')}</div>
              </VisibilityTrigger>
              <VisibilityTrigger translateY>
                <div><img src="/images/acting.png" alt="Acting icon" />{t('main page.mechanics.acting')}</div>
              </VisibilityTrigger>
            </div>
        </div>
      </div>

      <div id={`${homeStyles.spotlightContainer}`} className={`${homeStyles.mainpageContainer}`}>
        <div className={`subcontentWrapper`}>
          <VisibilityTrigger translateY>
            <h1>{t('main page.spotlight.description')}</h1>
          </VisibilityTrigger>
        </div>
        <CharacterSpotlight />
      </div>

      <div id={`${homeStyles.finalContainer}`} className={`${homeStyles.mainpageContainer}`}>
        <div className={`subcontentWrapper`}>
          <VisibilityTrigger translateY>
            <h1>{t('main page.final.description')}</h1>
          </VisibilityTrigger>
          <VisibilityTrigger translateY>
            <p className={`${homeStyles.smallText}`}><a target="_blank" rel="noreferrer" href="https://sysifuscorp.com">{t('main page.final.otherworks')}</a></p>
          </VisibilityTrigger>
        </div>
      </div>

    </div>
  );
}

export default HomePage;
