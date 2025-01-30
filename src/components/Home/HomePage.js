import { useEffect, useRef, forwardRef, useState } from "react";
import GameModeIcons from "../About/utils/GameModeIcons.js";
import { CharacterSpotlight } from "../utils/CharacterSpotlight.js";
import { GsapFadeScrub, GsapWiggle } from "../utils/useGsap.js";
import useWindowDimensions from "../utils/useWindowDimensions.js";
import DefaultButton from "../utils/DefaultButton.js";
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
import { LazyYoutube } from "./LazyLoadYouTube.js";

const HomePage = forwardRef((props, ref) => {
  const navbarButton = useRef(null);

  useEffect(() => {
    document.title = "Love, Career & Magic — a reality TV board game";

    if (navbarButton.current) {
      navbarButton.current.onclick = ref.current;
    }
  }, [ref]);

  //emphasis
  let subtitle =
    "A collaborative storytelling game\n set in a <span class='fantasyEmphasis'>fantastical</span> modern world";
  let { width } = useWindowDimensions();
  if (width <= 900) {
    subtitle = subtitle.replace("\n", "");
  }

  const iframeWidth = width > 900 ? 1000 : 400;
  const iframeHeight = iframeWidth * 0.5625;

  //click logo to scroll to description
  const descriptionSectionRef = useRef(null);
  const topLogoRef = useRef(null);
  const scrollToDescription = () =>
    descriptionSectionRef.current.scrollIntoView({ behavior: "smooth" });
  const scrollToTop = () =>
    topLogoRef.current.scrollIntoView({ behavior: "smooth" });

  const [videoModalVisible, setVideoModalVisible] = useState(false);

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
        <LazyYoutube
          isLoaded={videoModalVisible}
          width={iframeWidth}
          height={iframeHeight}
          src="https://www.youtube.com/embed/videoseries?si=s6rFntDA-CQjC-GY&list=PLSLy9oTFPgBYp0dmBjwxEpp7pwrsj7tql&cc_load_policy=1&enablejsapi=1"
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
        <div
          id={`${homeStyles.heroImageWrapper}`}
          className={homeStyles.screenHeight}
        >
          <img
            alt="Box and components of the card game."
            src="/images/box_white_outline.webp"
            className={`${homeStyles.heroImage}`}
            onClick={() => {
              setVideoModalVisible(true);
            }}
          />
          <div className={homeStyles.heroBottomWrapper}>
            <div className={homeStyles.scrollHorizontalContainer}>
              <DefaultButton
                shadowless
                animated
                icon="forward"
                className="is-blue"
                href="https://buy.stripe.com/bIYg0Q1e08Z86Fa8wy"
                text="Buy now"
              />
              <DefaultButton
                shadowless
                icon="watchWhite"
                id="videoModalToggleButton"
                onClick={() => {
                  setVideoModalVisible(true);
                }}
                text="Watch video"
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
                playerCount="2 - 6 players"
                playTime="12 minutes"
              />
            </div>
            <div
              className={`${homeStyles.descriptionTextWrapper} subcontentWrapper min-width`}
            >
              <p>
                Play as a mythological creature in a reality TV show, complete
                chaotic character arcs, and achieve high ratings for the season!
              </p>
              <DefaultButton
                shadowless
                animated
                icon="forward"
                className="is-blue"
                href="https://buy.stripe.com/bIYg0Q1e08Z86Fa8wy"
                text="Buy now"
              />
              <DefaultButton
                shadowless
                borderedBlack
                icon="star"
                className="is-inverted"
                href="https://screentop.gg/@PegasusGames/lcm"
                text="Play online"
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
            Watch an entire game in just 12 minutes!
          </h1>
          <p>
            Click below to check out the YouTube playlist of playthrough videos.
          </p>
          <div className={`${homeStyles.finalButtonsWrapper}`}>
            <DefaultButton
              shadowless
              icon="watchWhite"
              href="https://www.youtube.com/playlist?list=PLSLy9oTFPgBYp0dmBjwxEpp7pwrsj7tql"
              text="Watch videos"
            />
          </div>
        </div>
        <CarouselSection
          className={homeStyles.mainpageCarousel}
          totalPictures={27}
          directory="/images/photoshoot/playtest"
          filename="playtest"
          random
          href="https://www.youtube.com/playlist?list=PLSLy9oTFPgBYp0dmBjwxEpp7pwrsj7tql"
        />
      </div>

      <div
        id={`${homeStyles.mechanicsContainer}`}
        className={`${homeStyles.mainpageContainer}`}
      >
        <GsapFadeScrub fadeIn>
          <h1>
            If you like any of these things, then you&apos;ll love this game!
          </h1>
        </GsapFadeScrub>
        <div className={`${homeStyles.mechanicsWrapper}`}>
          <GsapFadeScrub fadeIn>
            <img
              src="/images/illustrations/laughing.webp"
              alt="Laughing icon"
            />
            Laughing
          </GsapFadeScrub>
          <GsapFadeScrub fadeIn>
            <img src="/images/illustrations/party.webp" alt="Party icon" />
            Party games
          </GsapFadeScrub>
          <GsapFadeScrub fadeIn>
            <img src="/images/illustrations/stories.webp" alt="Stories icon" />
            Storytelling
          </GsapFadeScrub>
          <GsapFadeScrub fadeIn>
            <img src="/images/illustrations/improv.webp" alt="Improv icon" />
            TTRPGs
          </GsapFadeScrub>
          <GsapFadeScrub fadeIn>
            <img src="/images/illustrations/acting.webp" alt="Roleplay icon" />
            Improv
          </GsapFadeScrub>
        </div>
      </div>

      <GsapFadeScrub
        fadeIn
        scrubStartBot
        id={`${homeStyles.howToPlay}`}
        className={`${homeStyles.mainpageContainer}`}
      >
        <h1>How to play</h1>
        <p>(in 4 easy steps)</p>
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
              <p className="is-hidden-mobile">CLICK ME</p>
            </GsapWiggle>
            <h1>Choose from 25 unique characters!</h1>
            <p>
              Mythological creatures with modern day jobs just like us humans.
            </p>
            <div className={`${homeStyles.buttonWrapper}`}>
              <DefaultButton
                shadowless
                icon="people_white"
                navlink="/characters"
                text="View all characters"
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
            <h1>Follow chaotic stage directions</h1>
            <p>
              The executives of the show are trying to instill chaos into the
              narrative. Complete as many of their Direction Cards as you can to
              earn points!
            </p>
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
            <h1>Crazy locations never before seen on TV</h1>
            <p>
              Every episode of the reality TV show occurs in a random exotic
              location carefully hand-picked for maximum excitement!
            </p>
          </div>
        </GsapFadeScrub>
      </div>
      <div
        id={`${homeStyles.spotlightContainer}`}
        className={`${homeStyles.mainpageContainer}`}
      >
        <CharacterSpotlight
          invert
          allCharsButton
          sectionTitle="Character spotlight"
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
          <h1>Ready for some Love, Career & Magic?</h1>
          <div className={`${homeStyles.finalButtonsWrapper}`}>
            <DefaultButton
              shadowless
              animated
              icon="forward"
              className="is-blue"
              href="https://buy.stripe.com/bIYg0Q1e08Z86Fa8wy"
              text="Buy now"
            />
            <DefaultButton
              shadowless
              borderedBlack
              icon="star"
              className="is-inverted"
              href="https://screentop.gg/@PegasusGames/lcm"
              text="Play online"
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

HomePage.displayName = "HomePage";

export default HomePage;
