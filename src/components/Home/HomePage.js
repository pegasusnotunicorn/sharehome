import React, { useEffect, useRef, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

//custom files
import GameModeIcons from "../About/utils/GameModeIcons.js";
import { CharacterSpotlight } from '../utils/CharacterSpotlight.js';
import { GsapFadeDelay, GsapFadeScrub, GsapWiggle } from "../utils/useGsap.js";
import useWindowDimensions from '../utils/useWindowDimensions.js';
import DefaultButton from '../utils/DefaultButton.js';
import EmailForm from '../utils/EmailForm.js';

// sections
import CarouselSection from "../utils/CarouselSection.js";
import ParallaxSection from "./ParallaxSection.js";
import CharactersDeckSection from "./CharactersDeckSection.js";
import { EventsDeckSection, GoalsDeckSection } from "./EventsGoalsDeckSection.js";
import LikeHateSection from "./LikeHateSection.js";
import { EmojiSection } from "../utils/EmojiSection.js";

import homeStyles from '../../css/homePage.module.css';
import '../../css/utils/colors.css';

const HomePage = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const navbarButton = useRef(null);

  useEffect(() => {
    document.title = "Love, Career & Magic — a SHAREHOME game";

    if (navbarButton.current) {
      navbarButton.current.onclick = ref.current;
    }
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

  // <DefaultButton shadowless icon="email_white" ref={navbarButton} className={`${homeStyles.topMailButton} GTMtoggleEmailButton` } text={t('email form.joinbutton')}/>

  return (
    <div className="content">

      <ParallaxSection />

      <div ref={topLogoRef} id={`${homeStyles.heroContainer}`} className={`${homeStyles.mainContentWrapper} noselect`}>
        <GsapFadeDelay delay={0} className={`${homeStyles.heroImage}`} >
          <img alt="Box and components of the card game." src="/images/mainbox.jpg" />
        </GsapFadeDelay>
        <GsapFadeDelay delay={1500} className={`${homeStyles.titleWrapper} ${homeStyles.topOne}`} >
          <div onClick={scrollToDescription} className={`${homeStyles.lcmContainer} ${homeStyles.topOne}`}>
            <div className={`${homeStyles.lcmMaskWrapper} floating noselect`}>
              <div className={`${homeStyles.lcmMask}`}></div>
            </div>
            <h4 className={`${homeStyles.mobileTagLine} is-hidden-desktop`}>{t('main page.mobile tag line')}</h4>
          </div>
        </GsapFadeDelay>
        <GsapFadeDelay delay={1500} className={homeStyles.scrollContainer}>
          <EmailForm className="mainpageEmail" hideTitle isActiveAndDesktop />
          <GsapFadeScrub scrub startScreenTop fadeOut >
            <div className={homeStyles.scrollHorizontalContainer}>
              <div id={homeStyles.animatedScroll} className={homeStyles.scrollVerticalContainer}></div>
              <div className={homeStyles.scrollVerticalContainer}></div>
            </div>
            <div className={homeStyles.scrollHorizontalContainer}>
              <p onClick={scrollToDescription} className="noselect">Scroll to learn how to play!</p>
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
            <div className={`${homeStyles.descriptionTextWrapper} subcontentWrapper min-width`}>
              <p>{t('main page.description.subtitle2')}</p>
              <p>{t('main page.description.subtitle3')}</p>
              <EmailForm className="mainpageEmail" hideTitle />
              <DefaultButton shadowless animated icon="arrowRightWhite" className="kickstarterButton" href="https://bit.ly/lovecareermagic" text={t('navbar.kickstarter')}/>
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
          <div><img src="/images/illustrations/laughing.png" alt="Laughing icon" />{t('main page.mechanics.laughing')}</div>
          <div><img src="/images/illustrations/party.png" alt="Party icon" />{t('main page.mechanics.party')}</div>
          <div><img src="/images/illustrations/stories.png" alt="Stories icon" />{t('main page.mechanics.stories')}</div>
          <div><img src="/images/illustrations/improv.png" alt="Improv icon" />{t('main page.mechanics.improv')}</div>
          <div><img src="/images/illustrations/acting.png" alt="Roleplay icon" />{t('main page.mechanics.roleplay')}</div>
        </div>
        <div className={`${homeStyles.rulebookWrapper}`}>
          <DefaultButton inverted borderedBlack shadowless icon="faq" navlink="/howtoplay" text={t('main page.mechanics.howtoplay')}/>
          <DefaultButton shadowless icon="rulebookWhite" href="/rulebook.pdf" text={t('main page.mechanics.rulebook')}/>
        </div>
      </GsapFadeScrub>

      <CarouselSection totalPictures={8} directory="/images/photoshoot/game/pictures"/>

      <div id={`${homeStyles.spotlightContainer}`} className={`${homeStyles.mainpageContainer}`}>
        <CharacterSpotlight invert allCharsButton sectionTitle={t('main page.spotlight.description')} />
      </div>

      <EmojiSection />

      <div id={`${homeStyles.finalContainer}`} className={`${homeStyles.mainpageContainer}`}>
        <GsapFadeScrub fadeIn className={`subcontentWrapper`}>
          <h1>{t('main page.final.description')}</h1>
          <div className={`${homeStyles.finalButtonsWrapper}`}>
            <DefaultButton shadowless animated icon="arrowRightWhite" className="kickstarterButton" href="https://bit.ly/lovecareermagic" text={t('navbar.kickstarter')}/>
            <DefaultButton inverted borderedBlack shadowless icon="favorite" href="https://sysifuscorp.com" text={t('main page.final.otherworks')}/>
          </div>
        </GsapFadeScrub>
        <GsapFadeDelay delay={0} className={`${homeStyles.titleWrapper}`} >
          <div className={`${homeStyles.lcmContainer}`}>
            <div className={`${homeStyles.lcmMaskWrapper} floating noselect`}>
              <div onClick={scrollToTop} className={`${homeStyles.lcmMask}`}></div>
            </div>
            <p className={`${homeStyles.sharehomegame}`}>a SHAREHOME game</p>
          </div>
        </GsapFadeDelay>
      </div>

    </div>
  );
});

export default HomePage;
