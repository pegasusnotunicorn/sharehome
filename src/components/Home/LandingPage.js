import { useEffect, useState } from "react";
import GameModeIcons from "../About/utils/GameModeIcons.js";
import { GsapFadeScrub, GsapWiggle } from "../utils/useGsap.js";
import DefaultButton from "../utils/DefaultButton.js";
import { YoutubeModal } from "./YoutubeModal.js";
import CarouselSection from "../utils/CarouselSection.js";
import ParallaxSection from "./ParallaxSection.js";
import CharactersDeckSection from "./CharactersDeckSection.js";
import {
  EventsDeckSection,
  GoalsDeckSection,
} from "./EventsGoalsDeckSection.js";
import TestimonialsSection from "./TestimonialsSection.js";
import LikeHateSection from "./LikeHateSection.js";
import ShootingStarSection from "./ShootingStarSection.js";
import HeroImageSection from "./HeroImageSection.js";
import landingPageStyles from "../../css/landingPage.module.css";
import "../../css/utils/colors.css";

const LandingPage = () => {
  const [player, setPlayer] = useState(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);

  const playVideo = () => {
    if (player) {
      player.unMute();
      player.playVideo();
    }
    setVideoModalVisible(true);
  };

  const stopVideo = () => {
    if (player) {
      player.unMute();
      player.stopVideo();
    }
    setVideoModalVisible(false);
  };

  useEffect(() => {
    document.title = "Love, Career & Magic - 12m game for 2-6 players";
  }, []);

  return (
    <div className="content">
      <ParallaxSection />

      <YoutubeModal
        videoModalVisible={videoModalVisible}
        setPlayer={setPlayer}
        stopVideo={stopVideo}
      />

      <ShootingStarSection />

      <HeroImageSection
        videoModalVisible={videoModalVisible}
        playVideo={playVideo}
      />

      <div
        id={`${landingPageStyles.descriptionContainer}`}
        className={`${landingPageStyles.mainpageContainer}`}
      >
        <div className={`${landingPageStyles.descriptionWrapper}`}>
          <GsapFadeScrub fadeIn scrub>
            <div className={`subcontentWrapper`}>
              <h1 className={`${landingPageStyles.subtitle}`}>
                A party game where <br />{" "}
                <span className="fantasyEmphasis">fantasy</span> meets reality
                TV.
              </h1>
              <GameModeIcons
                className={`${landingPageStyles.gameDetails}`}
                playerCount="2 - 6 players"
                playTime="12 minutes"
              />
            </div>
            <div
              className={`${landingPageStyles.descriptionTextWrapper} subcontentWrapper min-width`}
            >
              <p>
                Can you work together to secure a second season? Or will you be
                canceled halfway through?
              </p>
              <p>Keep scrolling to learn how to play!</p>
            </div>
          </GsapFadeScrub>
        </div>
      </div>

      <div
        id={`${landingPageStyles.mechanicsContainer}`}
        className={`${landingPageStyles.mainpageContainer}`}
      >
        <GsapFadeScrub fadeIn>
          <h1>
            If you like any of these things, then you&apos;ll love this game!
          </h1>
        </GsapFadeScrub>
        <div className={`${landingPageStyles.mechanicsWrapper}`}>
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

      <TestimonialsSection />

      <GsapFadeScrub
        fadeIn
        scrubStartBot
        id={`${landingPageStyles.howToPlay}`}
        className={`${landingPageStyles.mainpageContainer}`}
      >
        <h1>How to play</h1>
        <p>(in 4 easy steps)</p>
      </GsapFadeScrub>

      <div
        id={`${landingPageStyles.characterContainer}`}
        className={`${landingPageStyles.mainpageContainer}`}
      >
        <CharactersDeckSection />
        <div className={`${landingPageStyles.characterTextContainer}`}>
          <GsapFadeScrub fadeIn>
            <GsapWiggle
              className={`${landingPageStyles.characterContainerSVG}`}
            >
              <img
                loading="lazy"
                src="/images/icons/pointer.svg"
                alt="point finger"
              />
            </GsapWiggle>
            <h1>Choose from 25 unique characters!</h1>
            <p>
              Mythological creatures with modern day jobs just like us humans.
              <br />
              <a href="/characters">Click here</a> to see all characters.
            </p>
          </GsapFadeScrub>
        </div>
      </div>

      <div
        id={`${landingPageStyles.eventsContainer}`}
        className={`${landingPageStyles.mainpageContainer}`}
      >
        <GsapFadeScrub
          fadeIn
          scrubStartCenter
          className={`${landingPageStyles.eventsLeftContainer}`}
        >
          <GsapWiggle
            id={`${landingPageStyles.eventsContainerSVGcake}`}
            className={`${landingPageStyles.eventsContainerSVG}`}
          >
            <img loading="lazy" src="/images/icons/cake.svg" alt="cake" />
          </GsapWiggle>
          <GsapWiggle
            id={`${landingPageStyles.eventsContainerSVGlovekey}`}
            className={`${landingPageStyles.eventsContainerSVG}`}
          >
            <img loading="lazy" src="/images/icons/lovekey.svg" alt="cake" />
          </GsapWiggle>
          <GsapWiggle
            id={`${landingPageStyles.eventsContainerSVGplanet}`}
            className={`${landingPageStyles.eventsContainerSVG}`}
          >
            <img loading="lazy" src="/images/icons/planet.svg" alt="cake" />
          </GsapWiggle>
          <div className={`${landingPageStyles.eventsTextContainer}`}>
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
        id={`${landingPageStyles.likehateContainer}`}
        className={`${landingPageStyles.mainpageContainer}`}
      />

      <div
        id={`${landingPageStyles.goalsContainer}`}
        className={`${landingPageStyles.mainpageContainer}`}
      >
        <GoalsDeckSection />
        <GsapFadeScrub
          fadeIn
          scrubStartCenter
          className={`${landingPageStyles.goalsRightContainer}`}
        >
          <GsapWiggle
            id={`${landingPageStyles.goalsContainerSVGflag}`}
            className={`${landingPageStyles.goalsContainerSVG}`}
          >
            <img loading="lazy" src="/images/icons/flag.svg" alt="flag" />
          </GsapWiggle>
          <GsapWiggle
            id={`${landingPageStyles.goalsContainerSVGscroll}`}
            className={`${landingPageStyles.goalsContainerSVG}`}
          >
            <img loading="lazy" src="/images/icons/scroll.svg" alt="scroll" />
          </GsapWiggle>
          <div className={`${landingPageStyles.goalsTextContainer}`}>
            <h1>Crazy locations never before seen on TV</h1>
            <p>
              Every episode of the reality TV show occurs in a random exotic
              location carefully hand-picked for maximum excitement!
            </p>
          </div>
        </GsapFadeScrub>
      </div>

      <div
        className={`${landingPageStyles.mainpageContainer} ${landingPageStyles.carouselContainer}`}
      >
        <div className={`${landingPageStyles.carouselTextContainer}`}>
          <h1>
            Ready for{" "}
            <span className="fantasyEmphasis">Love, Career & Magic</span>?
          </h1>
          <div className={`${landingPageStyles.finalButtonsWrapper}`}>
            <DefaultButton
              shadowless
              animated
              icon="forward"
              className="is-red is-large"
              navlink="/buy"
              text="Buy now"
              size="large"
            />
          </div>
        </div>
        <CarouselSection
          className={landingPageStyles.mainpageCarousel}
          totalPictures={15}
          directory="/images/photoshoot/playtest"
          filename="playtest"
          random
          loop
          delay={5000}
        />
      </div>

      <div
        id={`${landingPageStyles.finalContainer}`}
        className={`${landingPageStyles.mainpageContainer}`}
      >
        <div
          className={`${landingPageStyles.titleWrapper} ${landingPageStyles.botOne}`}
        >
          <div
            className={`${landingPageStyles.lcmMaskWrapper} floating noselect`}
          >
            <div className={`${landingPageStyles.lcmMask}`}></div>
          </div>
        </div>

        <div className={landingPageStyles.termsWrapper}>
          <div className={landingPageStyles.pegasusWrapper}>
            <img src="/images/pegasus_logo.png" alt="Pegasus Games logo" />
            <p>
              Designed by{" "}
              <a href="https://unicornwithwings.com">Pegasus Games</a>
            </p>
          </div>
          <p>
            <a href="/terms">Terms and conditions</a>
          </p>
        </div>
      </div>
    </div>
  );
};

LandingPage.displayName = "LandingPage";

export default LandingPage;
