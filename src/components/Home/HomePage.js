import { useEffect, useState } from "react";
import GameModeIcons from "../About/utils/GameModeIcons.js";
import { CharacterSpotlight } from "../utils/CharacterSpotlight.js";
import { GsapFadeScrub, GsapWiggle } from "../utils/useGsap.js";
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

const HomePage = () => {
  const [player, setPlayer] = useState(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);

  const playVideo = () => {
    if (player) {
      player.playVideo();
    }
    setVideoModalVisible(true);
  };

  const stopVideo = () => {
    if (player) {
      player.stopVideo();
    }
    setVideoModalVisible(false);
  };

  useEffect(() => {
    const button = document.querySelector(".lty-playbtn");

    if (!button) return;

    function createObserver() {
      let observer;

      let options = {
        rootMargin: "-50%",
        threshold: 1,
      };

      observer = new IntersectionObserver(() => button.click(), options);
      observer.observe(button);
    }
    return createObserver();
  }, []);

  useEffect(() => {
    document.title = "Love, Career & Magic - 12m game for 2-6 players";
  }, []);

  return (
    <div className="content">
      <ParallaxSection />

      <LazyYoutube
        videoModalVisible={videoModalVisible}
        setPlayer={setPlayer}
        stopVideo={stopVideo}
      />

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
            onClick={playVideo}
          />
          <img
            alt="Click the box to learn more!"
            src="/images/box_transparent.webp"
            draggable={false}
            className={`${homeStyles.heroImage} noselect openYouTubeModalButton ${homeStyles.monsterBurstAnimation}`}
            onClick={playVideo}
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
                <span className="fantasyEmphasis">fantasy</span> meets reality
                TV.
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
              <p className="is-hidden-desktop">
                Keep scrolling to learn how to play!
              </p>
              <div className={homeStyles.descriptionButtonWrapper}>
                <DefaultButton
                  shadowless
                  animated
                  icon="forward"
                  className="is-red is-hidden-mobile"
                  navlink="/buy"
                  text="Buy now"
                />
                <DefaultButton
                  shadowless
                  icon="starWhite"
                  className="is-blue is-hidden-mobile"
                  href="https://screentop.gg/@PegasusGames/lcm"
                  text="Play online"
                />
              </div>
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
              src="/images/illustrations/improv.webp"
              alt="TTRPG icon"
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
              src="/images/illustrations/stories.webp"
              alt="Storytelling icon"
            />
            Storytelling
          </GsapFadeScrub>
          <GsapFadeScrub fadeIn>
            <img
              loading="lazy"
              src="/images/illustrations/party.webp"
              alt="Party games icon"
            />
            Party games
          </GsapFadeScrub>
          <GsapFadeScrub fadeIn className="is-hidden-mobile">
            <img
              loading="lazy"
              src="/images/illustrations/acting.webp"
              alt="Improv icon"
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
            Ready for{" "}
            <span className="fantasyEmphasis">Love, Career & Magic</span>?
          </h1>
          <div className={`${homeStyles.finalButtonsWrapper}`}>
            <DefaultButton
              shadowless
              icon="starWhite"
              className="is-blue"
              href="https://screentop.gg/@PegasusGames/lcm"
              text="Play online"
            />
            <DefaultButton
              shadowless
              icon="watchWhite"
              className="is-green"
              text="Watch video"
              onClick={playVideo}
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
};

HomePage.displayName = "HomePage";

export default HomePage;
