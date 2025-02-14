import { useEffect, useRef, forwardRef } from "react";
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
  const { videoModalVisible, setVideoModalVisible } = props;
  const navbarButton = useRef(null);

  useEffect(() => {
    document.title = "Love, Career & Magic - 12m game for 2-6 players";

    if (navbarButton.current) {
      navbarButton.current.onclick = ref.current;
    }
  }, [ref]);

  let { width } = useWindowDimensions();
  const isDesktop = width > 1000;
  const iframeWidth = isDesktop ? 1000 : width - 100;
  const iframeHeight = isDesktop
    ? (iframeWidth * 9) / 16
    : (iframeWidth * 16) / 9;

  const youTubeVideoCode = isDesktop ? "EoQ2VTipXPA" : "fNq9hS6DsTU";
  const enableCC = isDesktop
    ? "&cc_load_policy=1&iv_load_policy=1"
    : "&cc_load_policy=3&iv_load_policy=3";

  return (
    <div className="content">
      <ParallaxSection />

      <div
        style={{ display: videoModalVisible ? "flex" : "none" }}
        id={`${homeStyles.videoModalWrapper}`}
        className={homeStyles.screenHeight}
        onClick={() => {
          setVideoModalVisible(false);
        }}
      >
        <LazyYoutube
          isLoaded={videoModalVisible}
          width={iframeWidth}
          height={iframeHeight}
          src={`https://www.youtube.com/embed/${youTubeVideoCode}?si=JyFz4WBy_u2p8ot1&rel=0&controls=0&rel=0&modestbranding=1&playlist=${youTubeVideoCode}${enableCC}&enablejsapi=1&autoplay=1&loop=1`}
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
        id={`${homeStyles.heroContainer}`}
        className={`${homeStyles.mainContentWrapper} noselect`}
      >
        <div
          id={`${homeStyles.heroBgImage}`}
          className={homeStyles.screenHeight}
        />
        <div className={homeStyles.screenHeight}>
          <img
            alt="Box and components of the card game."
            src="/images/click_to_learn.webp"
            draggable={false}
            className={`${homeStyles.heroImage} noselect openYouTubeModalButton`}
            onClick={() => {
              setVideoModalVisible(true);
            }}
          />
          <img
            alt="Click the box to learn more!"
            src="/images/box_transparent.webp"
            draggable={false}
            className={`${homeStyles.heroImage} noselect openYouTubeModalButton ${homeStyles.monsterBurstAnimation}`}
            onClick={() => {
              setVideoModalVisible(true);
            }}
          />
          <div className={homeStyles.heroBottomWrapper}>
            <DefaultButton
              shadowless
              animated
              icon="forward"
              className="is-red"
              navlink="/buy"
              text="Buy now"
              size="large"
            />
          </div>
        </div>
      </div>

      <div
        id={`${homeStyles.descriptionContainer}`}
        className={`${homeStyles.mainpageContainer}`}
      >
        <div className={`${homeStyles.descriptionWrapper}`}>
          <GsapFadeScrub fadeIn scrub>
            <div className={`subcontentWrapper`}>
              <h1 className={`${homeStyles.subtitle}`}>
                A party game where <br />{" "}
                <span class="fantasyEmphasis">fantasy</span> meets reality TV.
              </h1>
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
                Can you work together to secure a second season? Or will you be
                canceled halfway through?
              </p>
              <DefaultButton
                shadowless
                animated
                icon="forward"
                className="is-red"
                navlink="/buy"
                text="Buy now"
              />
              <DefaultButton
                shadowless
                icon="starWhite"
                className="is-blue"
                href="https://screentop.gg/@PegasusGames/lcm"
                text="Play online"
              />
            </div>
          </GsapFadeScrub>
        </div>
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
              loading="lazy"
              src="/images/illustrations/stories.webp"
              alt="Stories icon"
            />
            Storytelling
          </GsapFadeScrub>
          <GsapFadeScrub fadeIn>
            <img
              loading="lazy"
              src="/images/illustrations/improv.webp"
              alt="Improv icon"
            />
            TTRPGs
          </GsapFadeScrub>
          <GsapFadeScrub fadeIn>
            <img
              loading="lazy"
              src="/images/illustrations/laughing.webp"
              alt="Laughing icon"
            />
            Laughing
          </GsapFadeScrub>
          <GsapFadeScrub fadeIn>
            <img
              loading="lazy"
              src="/images/illustrations/party.webp"
              alt="Party icon"
            />
            Party games
          </GsapFadeScrub>
          <GsapFadeScrub fadeIn>
            <img
              loading="lazy"
              src="/images/illustrations/acting.webp"
              alt="Roleplay icon"
            />
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
              <img
                loading="lazy"
                src="/images/icons/pointer.svg"
                alt="point finger"
              />
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
            <img loading="lazy" src="/images/icons/cake.svg" alt="cake" />
          </GsapWiggle>
          <GsapWiggle
            id={`${homeStyles.eventsContainerSVGlovekey}`}
            className={`${homeStyles.eventsContainerSVG}`}
          >
            <img loading="lazy" src="/images/icons/lovekey.svg" alt="cake" />
          </GsapWiggle>
          <GsapWiggle
            id={`${homeStyles.eventsContainerSVGplanet}`}
            className={`${homeStyles.eventsContainerSVG}`}
          >
            <img loading="lazy" src="/images/icons/planet.svg" alt="cake" />
          </GsapWiggle>
          <div className={`${homeStyles.eventsTextContainer}`}>
            <h1>Follow chaotic stage directions</h1>
            <p>
              The executives of the show are trying to instill chaos into the
              narrative.Complete as many of their Direction Cards as you can to
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
            <img loading="lazy" src="/images/icons/flag.svg" alt="flag" />
          </GsapWiggle>
          <GsapWiggle
            id={`${homeStyles.goalsContainerSVGscroll}`}
            className={`${homeStyles.goalsContainerSVG}`}
          >
            <img loading="lazy" src="/images/icons/scroll.svg" alt="scroll" />
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
          <h1>
            Ready for <span class="fantasyEmphasis">Love, Career & Magic</span>?
          </h1>
          <div className={`${homeStyles.finalButtonsWrapper}`}>
            <DefaultButton
              shadowless
              animated
              icon="forward"
              className="is-red"
              navlink="/buy"
              text="Buy now"
            />
            <DefaultButton
              shadowless
              icon="watchWhite"
              className="is-blue"
              text="Watch video"
              onClick={() => {
                setVideoModalVisible(true);
              }}
            />
          </div>
        </div>
        <div className={`${homeStyles.titleWrapper} ${homeStyles.botOne}`}>
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
