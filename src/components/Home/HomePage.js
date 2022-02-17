import React, { useEffect, useRef, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

//custom files
import GameModeIcons from "../About/utils/GameModeIcons.js";
import { CharacterSpotlight } from '../utils/CharacterSpotlight.js';
import { GsapFadeDelay, GsapFadeScrub, GsapWiggle } from "../utils/useGsap.js";
import useWindowDimensions from '../utils/useWindowDimensions.js';
import DefaultButton from '../utils/DefaultButton.js';

// sections
import ParallaxSection from "./ParallaxSection.js";
import CharactersDeckSection from "./CharactersDeckSection.js";
import { EventsDeckSection, GoalsDeckSection } from "./EventsGoalsDeckSection.js";
import LikeHateSection from "./LikeHateSection.js";

import homeStyles from '../../css/homePage.module.css';
import '../../css/utils/colors.css';

const HomePage = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const navbarButton = useRef(null);

  useEffect(() => {
    document.title = "Love, Career & Magic — a SHAREHOME game";

    // //force top of page when refresh
    // window.onbeforeunload = function () {
    //   window.scrollTo(0, 0);
    // }
    navbarButton.current.onclick = ref.current;
  }, [ref]);

  //emphasis
  let subtitle = t('main page.hero.subtitle');
  let { width } = useWindowDimensions();
  if (width <= 900) {
    subtitle = subtitle.replace("\n", "");
  }

  //click logo to scroll to description
  const descriptionSectionRef = useRef(null);
  const topLogoRef = useRef(null);
  const scrollToDescription = () => descriptionSectionRef.current.scrollIntoView({behavior: 'smooth'});
  const scrollToTop = () => topLogoRef.current.scrollIntoView({behavior: 'smooth'});

  return (
    <div className="content">

      <ParallaxSection />

      <div ref={topLogoRef} id={`${homeStyles.heroContainer}`} className={`${homeStyles.mainContentWrapper} noselect`}>
        <GsapFadeDelay delay={0} className={`${homeStyles.titleWrapper}`} >
          <div className={`${homeStyles.lcmContainer}`}>
            <img onClick={scrollToDescription} className={`${homeStyles.lcmImage} floating noselect`} width="300" height="326" draggable="false" src="/images/lcm.png" alt="Love, Career, & Magic"></img>
            <p className={`${homeStyles.sharehomegame}`}>a SHAREHOME game</p>
          </div>
        </GsapFadeDelay>
        <GsapFadeDelay delay={1500} className={homeStyles.scrollContainer}>
          <GsapFadeScrub scrub startScreenTop fadeOut >
            <div className={homeStyles.scrollHorizontalContainer}>
              <div className={homeStyles.scrollVerticalContainer}></div>
              <div className={homeStyles.scrollVerticalContainer}></div>
            </div>
            <div className={homeStyles.scrollHorizontalContainer}>
              <p onClick={scrollToDescription} >SCROLL</p>
            </div>
          </GsapFadeScrub>
        </GsapFadeDelay>
      </div>

      <div ref={descriptionSectionRef} id={`${homeStyles.descriptionContainer}`} className={`${homeStyles.mainpageContainer}`}>
        <div className={`${homeStyles.descriptionWrapper}`}>
          <GsapFadeScrub fadeIn scrub >
            <div className={`subcontentWrapper`}>
              <h1 dangerouslySetInnerHTML={{__html: subtitle }} className={`${homeStyles.subtitle}`}></h1>
              <GameModeIcons
                className={`${homeStyles.gameDetails}`}
                playerCount={t('main page.hero.player count')}
                playTime={t('main page.hero.play time')}
                />
            </div>
            <div className={`subcontentWrapper min-width`}>
              <p>{t('main page.description.subtitle2')}</p>
              <p>{t('main page.description.subtitle3')}</p>
            </div>
          </GsapFadeScrub>
        </div>
      </div>

      <GsapFadeScrub fadeIn scrubStartBot id={`${homeStyles.howToPlay}`} className={`${homeStyles.mainpageContainer}`}>
        <h1>{t('main page.how to play.description')}</h1>
        <p>{t('main page.how to play.steps')}</p>
      </GsapFadeScrub>

      <div id={`${homeStyles.characterContainer}`} className={`${homeStyles.mainpageContainer}`}>
        <CharactersDeckSection />
        <div className={`${homeStyles.characterTextContainer}`}>
          <GsapFadeScrub fadeIn>
            <GsapWiggle className={`${homeStyles.characterContainerSVG}`}>
              <img src="/images/icons/pointer.svg" alt="point finger" />
              <p className="is-hidden-mobile">{t('main page.character.click me')}</p>
            </GsapWiggle>
            <h1>{t('main page.character.description')}</h1>
            <h3>{t('main page.character.moretocome')}</h3>
            <div className={`${homeStyles.buttonWrapper}`}>
              <DefaultButton shadowless icon="people_white" navlink="/characters" text={t('main page.character.clicktoseemore')}/>
            </div>
          </GsapFadeScrub>
        </div>
      </div>

      <div id={`${homeStyles.eventsContainer}`} className={`${homeStyles.mainpageContainer}`}>
        <GsapFadeScrub fadeIn scrubStartCenter className={`${homeStyles.eventsLeftContainer}`}>
          <GsapWiggle id={`${homeStyles.eventsContainerSVGcake}`} className={`${homeStyles.eventsContainerSVG}`}>
            <img src="/images/icons/cake.svg" alt="cake" />
          </GsapWiggle>
          <GsapWiggle id={`${homeStyles.eventsContainerSVGlovekey}`} className={`${homeStyles.eventsContainerSVG}`}>
            <img src="/images/icons/lovekey.svg" alt="cake" />
          </GsapWiggle>
          <GsapWiggle id={`${homeStyles.eventsContainerSVGplanet}`} className={`${homeStyles.eventsContainerSVG}`}>
            <img src="/images/icons/planet.svg" alt="cake" />
          </GsapWiggle>
          <div className={`${homeStyles.eventsTextContainer}`}>
            <h1>{t('main page.events.description')}</h1>
            <h3>{t('main page.events.subdescription')}</h3>
          </div>
        </GsapFadeScrub>
        <EventsDeckSection />
      </div>

      <LikeHateSection
        id={`${homeStyles.likehateContainer}`}
        className={`${homeStyles.mainpageContainer}`}
      />

      <div id={`${homeStyles.goalsContainer}`} className={`${homeStyles.mainpageContainer}`}>
        <GoalsDeckSection />
        <GsapFadeScrub fadeIn scrubStartCenter className={`${homeStyles.goalsRightContainer}`}>
          <GsapWiggle id={`${homeStyles.goalsContainerSVGflag}`} className={`${homeStyles.goalsContainerSVG}`}>
            <img src="/images/icons/flag.svg" alt="flag" />
          </GsapWiggle>
          <GsapWiggle id={`${homeStyles.goalsContainerSVGscroll}`} className={`${homeStyles.goalsContainerSVG}`}>
            <img src="/images/icons/scroll.svg" alt="scroll" />
          </GsapWiggle>
          <div className={`${homeStyles.goalsTextContainer}`}>
            <h1>{t('main page.goals.description')}</h1>
            <h3>{t('main page.goals.subdescription')}</h3>
          </div>
        </GsapFadeScrub>
      </div>

      <GsapFadeScrub fadeIn id={`${homeStyles.mechanicsContainer}`} className={`${homeStyles.mainpageContainer}`}>
        <h1>{t('main page.mechanics.description')}</h1>
        <div className={`${homeStyles.mechanicsWrapper}`}>
          <div><img src="/images/laughing.png" alt="Laughing icon" />{t('main page.mechanics.laughing')}</div>
          <div><img src="/images/party.png" alt="Party icon" />{t('main page.mechanics.party')}</div>
          <div><img src="/images/stories.png" alt="Stories icon" />{t('main page.mechanics.stories')}</div>
          <div><img src="/images/improv.png" alt="Improv icon" />{t('main page.mechanics.improv')}</div>
          <div><img src="/images/acting.png" alt="Acting icon" />{t('main page.mechanics.acting')}</div>
        </div>
      </GsapFadeScrub>

      <div id={`${homeStyles.spotlightContainer}`} className={`${homeStyles.mainpageContainer}`}>
        <CharacterSpotlight invert allCharsButton sectionTitle={t('main page.spotlight.description')} />
      </div>

      <div id={`${homeStyles.finalContainer}`} className={`${homeStyles.mainpageContainer}`}>
        <GsapFadeScrub fadeIn className={`subcontentWrapper`}>
          <h1>{t('main page.final.description')}</h1>
          <div className={`${homeStyles.finalButtonsWrapper}`}>
            <DefaultButton shadowless icon="email_white" ref={navbarButton} text={t('email form.joinbutton')}/>
            <DefaultButton inverted borderedBlack shadowless icon="favorite" href="https://sysifuscorp.com" text={t('main page.final.otherworks')}/>
          </div>
        </GsapFadeScrub>
        <GsapFadeScrub fadeIn className={`${homeStyles.titleWrapper}`} >
          <div className={`${homeStyles.lcmContainer}`}>
            <img onClick={scrollToTop} className={`${homeStyles.lcmImage} floating noselect`} draggable="false" src="/images/lcm.png" alt="Love, Career, & Magic"></img>
            <p className={`${homeStyles.sharehomegame}`}>a SHAREHOME game</p>
          </div>
        </GsapFadeScrub>
      </div>

    </div>
  );
});

export default HomePage;
