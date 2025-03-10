import { useEffect, useState } from "react";
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
import DescriptionContainer from "./DescriptionContainer.js";

export default function TTRPGPage({ videoModalVisible, setVideoModalVisible }) {
  const [player, setPlayer] = useState(null);

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
    document.title = "Teach TTRPGs in just 12m";
  }, []);

  return (
    <div className="content">
      <ParallaxSection />

      <YoutubeModal
        videoModalVisible={videoModalVisible}
        setPlayer={setPlayer}
        stopVideo={stopVideo}
        // desktopCodeOverride="88Q0Z88Q0Z"
        // mobileCodeOverride="88Q0Z88Q0Z"
      />

      <ShootingStarSection />

      <HeroImageSection
        videoModalVisible={videoModalVisible}
        playVideo={playVideo}
        textImageOverride="/images/click_to_learn_ttrpg"
      />

      <DescriptionContainer
        title={
          <h1 className={`${landingPageStyles.subtitle}`}>
            A TTRPG you can finish
            <br /> in just <span className="fantasyEmphasis">12 minutes</span>!
          </h1>
        }
        description={
          <ul className={`${landingPageStyles.bulletWrapper}`}>
            <li>No need for a dedicated DM or prep work.</li>
            <li>No wasting time with characters or dice.</li>
            <li>Teach the game in 1 minute.</li>
            <li>Fun for newcomers and veterans.</li>
            <li>No age limits.</li>
          </ul>
        }
      />

      <TestimonialsSection />

      <GsapFadeScrub
        fadeIn
        scrubStartBot
        id={`${landingPageStyles.howToPlay}`}
        className={`${landingPageStyles.mainpageContainer}`}
      >
        <div className={`${landingPageStyles.carouselTextContainer}`}>
          <h1>The perfect gateway to TTRPGs</h1>
          <p>
            Getting your board game friends to try a full-length campaign?
            Nearly impossible.
          </p>
          <p>
            Getting them to try a 12 min game? Super easy, barely an
            inconvenience.
          </p>
          <p>
            Give them a taste of roleplaying—
            <b>without the huge time commitment</b>.
          </p>
        </div>
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
            <h1>No wasting time</h1>
            <p className={landingPageStyles.textWrapper}>
              There is no required reading, no character sheets you have to
              build, no waiting around for dice rolling and skill checks.
              Everything you need to play is written on the provided cards.
            </p>
            <p>
              You just pick up and <b>start playing immediately</b>.
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
            <h1>No dedicated DM required</h1>
            <p className={landingPageStyles.textWrapper}>
              There is no "main" campaign. The Direction Cards provide a simple
              framework for everyone to roleplay together. No single person is
              shouldering the burden of having to come up with a story.
            </p>
            <p>
              Everyone is a character and <b>everyone is a part of the story</b>
              .
            </p>
          </div>
        </GsapFadeScrub>
        <EventsDeckSection />
      </div>

      <LikeHateSection
        id={`${landingPageStyles.likehateContainer}`}
        className={`${landingPageStyles.mainpageContainer}`}
        title={<h1>Easy to learn, endless replayability</h1>}
        description={
          <>
            <p>
              Randomized character traits provide the motivations and growth
              arcs for your characters. You just fill in the gaps and let the
              story unfold.
            </p>
            <p>
              Every game is different and{" "}
              <b>fun for both newcomers and veterans alike</b>.
            </p>
          </>
        }
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
            <h1>Fun for all ages</h1>
            <p>
              If you can read and talk, then you can play this game. The game is
              as kid friendly or adult oriented as you make it.
            </p>
            <p>
              You decides where the story goes <b>as a group</b>.
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
}
