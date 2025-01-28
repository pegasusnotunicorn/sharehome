import React, { useEffect, useRef, forwardRef, useState } from "react";
import { useTranslation } from "react-i18next";

//custom files
import GameModeIcons from "../About/utils/GameModeIcons.js";
import { CharacterSpotlight } from "../utils/CharacterSpotlight.js";
import { GsapFadeDelay, GsapFadeScrub, GsapWiggle } from "../utils/useGsap.js";
import useWindowDimensions from "../utils/useWindowDimensions.js";
import DefaultButton from "../utils/DefaultButton.js";
// import EmailForm from "../utils/EmailForm.js";

// sections
import CarouselSection from "../utils/CarouselSection.js";
import ParallaxSection from "./ParallaxSection.js";
import CharactersDeckSection from "./CharactersDeckSection.js";
import {
  EventsDeckSection,
  GoalsDeckSection,
} from "./EventsGoalsDeckSection.js";
import LikeHateSection from "./LikeHateSection.js";
import { EmojiSection } from "../utils/EmojiSection.js";

import homeStyles from "../../css/homePage.module.css";
import "../../css/utils/colors.css";
import ShootingStar from "../Navbar/ShootingStar.js";

const HomePage = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const navbarButton = useRef(null);

  useEffect(() => {
    document.title = "Love, Career & Magic — a reality TV board game";

    if (navbarButton.current) {
      navbarButton.current.onclick = ref.current;
    }
  }, [ref]);

  //emphasis
  let subtitle = t("main page.hero.subtitle");
  let { width } = useWindowDimensions();
  if (width <= 900) {
    subtitle = subtitle.replace("\n", "");
  }

  const iframeWidth = width > 900 ? 1000 : "100%";
  const iframeHeight = width > 1000 ? iframeWidth * 0.5625 : "500px";

  //click logo to scroll to description
  const descriptionSectionRef = useRef(null);
  const topLogoRef = useRef(null);
  const scrollToDescription = () =>
    descriptionSectionRef.current.scrollIntoView({ behavior: "smooth" });
  const scrollToTop = () =>
    topLogoRef.current.scrollIntoView({ behavior: "smooth" });

  //video modal logic
  const [videoModalVisible, setVideoModalVisible] = useState(false);

  //redirect to live KS
  // const redirectToKS = () => window.location.href = "http://bit.ly/lovecareermagic";

  //old buttons for KS
  // <DefaultButton shadowless animated icon="arrowRightWhite" className="kickstarterButton liveKS" href="https://bit.ly/lovecareerandmagic" text={t('navbar.kickstarter')}/>
  // <DefaultButton shadowless animated icon="arrowRightWhite" style={{marginBottom:"50px",width:"calc(100% - 2em)"}} className="liveKS" href="https://bit.ly/lovecareerandmagic" text={t('navbar.kickstarter')}/>
  // <DefaultButton shadowless animated icon="arrowRightWhite" className="liveKS" href="https://bit.ly/lovecareerandmagic" text={t('navbar.kickstarter')}/>

  // <DefaultButton shadowless icon="email_white" ref={navbarButton} className={`${homeStyles.topMailButton} GTMtoggleEmailButton` } text={t('email form.joinbutton')}/>
  // <DefaultButton shadowless animated icon="arrowRightWhite" className="kickstarterButton" href="https://bit.ly/lovecareerandmagic" text={t('navbar.kickstarter')}/>
  // <GsapFadeDelay delay={1500} className={`${homeStyles.titleWrapper} ${homeStyles.topOne}`} >
  //   <div className={`${homeStyles.lcmMaskWrapper} noselect`}>
  //     <div className={`${homeStyles.lcmMask}`}></div>
  //   </div>
  // </GsapFadeDelay>

  //how to play / rulebook PDF
  // <div className={`${homeStyles.rulebookSection} subcontentWrapper`}>
  //   <GsapFadeScrub fadeIn>
  //     <div className={`${homeStyles.rulebookWrapper}`}>
  //       <DefaultButton inverted borderedBlack shadowless icon="faq" navlink="/howtoplay" text={t('main page.mechanics.howtoplay')}/>
  //       <DefaultButton shadowless icon="rulebookWhite" href="/rulebook.pdf" text={t('main page.mechanics.rulebook')}/>
  //     </div>
  //   </GsapFadeScrub>
  // </div>

  return (
    <div className="content">
      <ParallaxSection />

      <div
        style={{ display: videoModalVisible ? "flex" : "none" }}
        id={`${homeStyles.videoModalWrapper}`}
        className={homeStyles.screenHeight}
        onClick={() => {
          setVideoModalVisible(false);
          // turn off the youtube iframe video if it's playing
          let iframe = document.querySelector("iframe");
          if (iframe) {
            iframe.contentWindow.postMessage(
              '{"event":"command","func":"stopVideo","args":""}',
              "*"
            );
          }
        }}
      >
        <iframe
          width={iframeWidth}
          height={iframeHeight}
          src="https://www.youtube.com/embed/videoseries?si=s6rFntDA-CQjC-GY&list=PLSLy9oTFPgBYp0dmBjwxEpp7pwrsj7tql&cc_load_policy=1&enablejsapi=1"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        />
      </div>

      <div id={`${homeStyles.shootingStarsContainer}`}>
        <div id={`${homeStyles.shootingStarsWrapper}`}>
          {Array.from({ length: 10 }).map((_, i) => (
            <ShootingStar
              key={i}
              className={i % 2 === 0 ? "leftStar" : "rightStar"}
              isActive
              orientation={["left", "up", "right", "down"][i % 4]}
              mirror={i % 2 === 0 ? "mirror" : ""}
              delay={i * 2}
            />
          ))}
        </div>
      </div>

      <div
        ref={topLogoRef}
        id={`${homeStyles.heroContainer}`}
        className={`${homeStyles.mainContentWrapper} noselect`}
      >
        <div
          id={`${homeStyles.heroBgImage}`}
          className={homeStyles.screenHeight}
        />
        <div className={homeStyles.screenHeight}>
          <GsapFadeDelay delay={0} className={`${homeStyles.heroImage}`}>
            <img
              id={`${homeStyles.jitterHeroImage}`}
              alt="Box and components of the card game."
              src="/images/box_white_outline.png"
              onClick={() => {
                setVideoModalVisible(true);
              }}
            />
          </GsapFadeDelay>
          <GsapFadeDelay delay={1500}>
            <div className={homeStyles.heroBottomWrapper}>
              <div className={homeStyles.scrollHorizontalContainer}>
                <DefaultButton
                  shadowless
                  animated
                  icon="forward"
                  className="is-blue"
                  href="https://buy.stripe.com/bIYg0Q1e08Z86Fa8wy"
                  text={t("navbar.buynow")}
                />
                <DefaultButton
                  shadowless
                  icon="watchWhite"
                  id="videoModalToggleButton"
                  onClick={() => {
                    setVideoModalVisible(true);
                  }}
                  text={t("navbar.watchtrailer")}
                />
              </div>
              <GsapFadeScrub scrub startScreenTop fadeOut>
                <div className={homeStyles.scrollHorizontalContainer}>
                  <div
                    id={homeStyles.animatedScroll}
                    className={homeStyles.scrollVerticalContainer}
                  ></div>
                  <div className={homeStyles.scrollVerticalContainer}></div>
                </div>
                <div className={homeStyles.scrollHorizontalContainer}>
                  <p onClick={scrollToDescription} className="noselect">
                    Scroll to learn how to play!
                  </p>
                </div>
              </GsapFadeScrub>
            </div>
          </GsapFadeDelay>
        </div>
        <div className={homeStyles.screenHeight}></div>
      </div>

      <div
        ref={descriptionSectionRef}
        id={`${homeStyles.descriptionContainer}`}
        className={`${homeStyles.mainpageContainer}`}
      >
        <div className={`${homeStyles.descriptionWrapper}`}>
          <GsapFadeScrub fadeIn scrub>
            <div className={`subcontentWrapper`}>
              <h1
                dangerouslySetInnerHTML={{ __html: subtitle }}
                className={`${homeStyles.subtitle}`}
              ></h1>
              <GameModeIcons
                className={`${homeStyles.gameDetails}`}
                playerCount={t("main page.hero.player count")}
                playTime={t("main page.hero.play time")}
              />
            </div>
            <div
              className={`${homeStyles.descriptionTextWrapper} subcontentWrapper min-width`}
            >
              <p>{t("main page.description.subtitle3")}</p>
              {/* <EmailForm
                className="mainpageEmail secondMainpageEmail"
                hideTitle
              /> */}
              <DefaultButton
                shadowless
                animated
                icon="forward"
                className="is-blue"
                href="https://buy.stripe.com/bIYg0Q1e08Z86Fa8wy"
                text={t("navbar.buynow")}
              />
              <DefaultButton
                shadowless
                borderedBlack
                icon="star"
                className="is-inverted"
                href="https://screentop.gg/@PegasusGames/lcm"
                text={t("navbar.playonline")}
              />
            </div>
          </GsapFadeScrub>
        </div>
      </div>

      <div
        id={`${homeStyles.carouselContainer}`}
        className={`${homeStyles.mainpageContainer}`}
      >
        <div className={`${homeStyles.carouselTextContainer}`}>
          <h1 className={homeStyles.mainpageCarouselTitle}>
            {t("main page.carousel.description")}
          </h1>
          <p>{t("main page.carousel.subdescription")}</p>
          <div className={`${homeStyles.finalButtonsWrapper}`}>
            <DefaultButton
              shadowless
              icon="watchWhite"
              href="https://www.youtube.com/playlist?list=PLSLy9oTFPgBYp0dmBjwxEpp7pwrsj7tql"
              text={t("main page.carousel.linkText")}
            />
          </div>
        </div>
        <CarouselSection
          className={homeStyles.mainpageCarousel}
          totalPictures={27}
          directory="/images/photoshoot/playtest"
          filename="playtest"
          random
        />
      </div>

      <div
        id={`${homeStyles.mechanicsContainer}`}
        className={`${homeStyles.mainpageContainer}`}
      >
        <GsapFadeScrub fadeIn>
          <h1>{t("main page.mechanics.description")}</h1>
        </GsapFadeScrub>
        <div className={`${homeStyles.mechanicsWrapper}`}>
          <GsapFadeScrub fadeIn>
            <img src="/images/illustrations/laughing.jpg" alt="Laughing icon" />
            {t("main page.mechanics.laughing")}
          </GsapFadeScrub>
          <GsapFadeScrub fadeIn>
            <img src="/images/illustrations/party.jpg" alt="Party icon" />
            {t("main page.mechanics.party")}
          </GsapFadeScrub>
          <GsapFadeScrub fadeIn>
            <img src="/images/illustrations/stories.jpg" alt="Stories icon" />
            {t("main page.mechanics.stories")}
          </GsapFadeScrub>
          <GsapFadeScrub fadeIn>
            <img src="/images/illustrations/improv.jpg" alt="Improv icon" />
            {t("main page.mechanics.improv")}
          </GsapFadeScrub>
          <GsapFadeScrub fadeIn>
            <img src="/images/illustrations/acting.jpg" alt="Roleplay icon" />
            {t("main page.mechanics.roleplay")}
          </GsapFadeScrub>
        </div>
      </div>

      <GsapFadeScrub
        fadeIn
        scrubStartBot
        id={`${homeStyles.howToPlay}`}
        className={`${homeStyles.mainpageContainer}`}
      >
        <h1>{t("main page.how to play.description")}</h1>
        <p>{t("main page.how to play.steps")}</p>
      </GsapFadeScrub>

      <div
        id={`${homeStyles.characterContainer}`}
        className={`${homeStyles.mainpageContainer}`}
      >
        <CharactersDeckSection />
        <div className={`${homeStyles.characterTextContainer}`}>
          <GsapFadeScrub fadeIn>
            <GsapWiggle className={`${homeStyles.characterContainerSVG}`}>
              <img src="/images/icons/pointer.svg" alt="point finger" />
              <p className="is-hidden-mobile">
                {t("main page.character.click me")}
              </p>
            </GsapWiggle>
            <h1>{t("main page.character.description")}</h1>
            <p>{t("main page.character.moretocome")}</p>
            <div className={`${homeStyles.buttonWrapper}`}>
              <DefaultButton
                shadowless
                icon="people_white"
                navlink="/characters"
                text={t("main page.character.clicktoseemore")}
              />
            </div>
          </GsapFadeScrub>
        </div>
      </div>

      <div
        id={`${homeStyles.eventsContainer}`}
        className={`${homeStyles.mainpageContainer}`}
      >
        <GsapFadeScrub
          fadeIn
          scrubStartCenter
          className={`${homeStyles.eventsLeftContainer}`}
        >
          <GsapWiggle
            id={`${homeStyles.eventsContainerSVGcake}`}
            className={`${homeStyles.eventsContainerSVG}`}
          >
            <img src="/images/icons/cake.svg" alt="cake" />
          </GsapWiggle>
          <GsapWiggle
            id={`${homeStyles.eventsContainerSVGlovekey}`}
            className={`${homeStyles.eventsContainerSVG}`}
          >
            <img src="/images/icons/lovekey.svg" alt="cake" />
          </GsapWiggle>
          <GsapWiggle
            id={`${homeStyles.eventsContainerSVGplanet}`}
            className={`${homeStyles.eventsContainerSVG}`}
          >
            <img src="/images/icons/planet.svg" alt="cake" />
          </GsapWiggle>
          <div className={`${homeStyles.eventsTextContainer}`}>
            <h1>{t("main page.events.description")}</h1>
            <p>{t("main page.events.subdescription")}</p>
          </div>
        </GsapFadeScrub>
        <EventsDeckSection />
      </div>

      <LikeHateSection
        id={`${homeStyles.likehateContainer}`}
        className={`${homeStyles.mainpageContainer}`}
      />

      <div
        id={`${homeStyles.goalsContainer}`}
        className={`${homeStyles.mainpageContainer}`}
      >
        <GoalsDeckSection />
        <GsapFadeScrub
          fadeIn
          scrubStartCenter
          className={`${homeStyles.goalsRightContainer}`}
        >
          <GsapWiggle
            id={`${homeStyles.goalsContainerSVGflag}`}
            className={`${homeStyles.goalsContainerSVG}`}
          >
            <img src="/images/icons/flag.svg" alt="flag" />
          </GsapWiggle>
          <GsapWiggle
            id={`${homeStyles.goalsContainerSVGscroll}`}
            className={`${homeStyles.goalsContainerSVG}`}
          >
            <img src="/images/icons/scroll.svg" alt="scroll" />
          </GsapWiggle>
          <div className={`${homeStyles.goalsTextContainer}`}>
            <h1>{t("main page.goals.description")}</h1>
            <p>{t("main page.goals.subdescription")}</p>
          </div>
        </GsapFadeScrub>
      </div>
      {/* 
      <div
        id={`${homeStyles.playthroughContainer}`}
        className={`${homeStyles.mainpageContainer}`}
      >
        <div className={`${homeStyles.playthroughTextContainer}`}>
          <h1>{t("main page.playthrough.description")}</h1>
          <a
            href="https://www.youtube.com/playlist?list=PLSLy9oTFPgBYp0dmBjwxEpp7pwrsj7tql"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("main page.playthrough.subdescription")}
          </a>
        </div>
        <div className={`${homeStyles.playthroughVideoContainer}`}>

        </div>
      </div> */}

      <div
        id={`${homeStyles.spotlightContainer}`}
        className={`${homeStyles.mainpageContainer}`}
      >
        <CharacterSpotlight
          invert
          allCharsButton
          sectionTitle={t("main page.spotlight.description")}
        />
      </div>

      <EmojiSection className={`${homeStyles.mainpageContainer}`} />

      <div
        id={`${homeStyles.finalContainer}`}
        className={`${homeStyles.mainpageContainer}`}
      >
        <div
          className={`${homeStyles.finalButtonsContainer} subcontentWrapper`}
        >
          <h1>{t("main page.final.description")}</h1>
          <div className={`${homeStyles.finalButtonsWrapper}`}>
            {/* <DefaultButton
              shadowless
              icon="email_white"
              ref={navbarButton}
              className={`${homeStyles.topMailButton} GTMtoggleEmailButton`}
              text={t("email form.joinbutton")}
            /> */}
            <DefaultButton
              shadowless
              animated
              icon="forward"
              className="is-blue"
              href="https://buy.stripe.com/bIYg0Q1e08Z86Fa8wy"
              text={t("navbar.buynow")}
            />
            {/* <DefaultButton
              inverted
              borderedBlack
              shadowless
              icon="favorite"
              href="https://sysifuscorp.com"
              text={t("main page.final.otherworks")}
            /> */}
            <DefaultButton
              shadowless
              borderedBlack
              icon="star"
              className="is-inverted"
              href="https://screentop.gg/@PegasusGames/lcm"
              text={t("navbar.playonline")}
            />
          </div>
        </div>
        <div
          onClick={scrollToTop}
          className={`${homeStyles.titleWrapper} ${homeStyles.botOne}`}
        >
          <div className={`${homeStyles.lcmMaskWrapper} floating noselect`}>
            <div className={`${homeStyles.lcmMask}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default HomePage;
