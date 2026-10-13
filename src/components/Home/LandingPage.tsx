import { useEffect } from "react";
import { GsapFadeScrub, GsapWiggle } from "../utils/useGsap";
import DefaultButton from "../utils/DefaultButton";
import CarouselSection from "../utils/CarouselSection";
import ParallaxSection from "./ParallaxSection";
import MechanicsSection from "./MechanicsSection";
import CharactersDeckSection from "./CharactersDeckSection";
import {
  DirectionDeckSection,
  EpisodeDeckSection,
} from "./DirectionEpisodeDeckSection";
import TestimonialsSection from "./TestimonialsSection";
import LikeHateSection from "./LikeHateSection";
import BoxHero from "./BoxHero";
import landingPageStyles from "../../css/landingPage.module.css";
import colorStyles from "../../css/utils/colors.module.css";
import DescriptionContainer from "./DescriptionContainer";

interface LandingPageProps {
  setTrailerPlaying: (playing: boolean) => void; // the trailer's playing, in the hero's box
}

const LandingPage = ({ setTrailerPlaying }: LandingPageProps) => {
  useEffect(() => () => setTrailerPlaying(false), [setTrailerPlaying]);

  useEffect(() => {
    document.title = "Love, Career & Magic - 12m game for 2-6 players";
  }, []);

  return (
    <div className="content">
      <ParallaxSection />

      <BoxHero onOpen={setTrailerPlaying} />

      <DescriptionContainer
        title={
          <h1 className={`${landingPageStyles.subtitle}`}>
            A party game where <br />{" "}
            <span className="fantasyEmphasis">fantasy</span> meets reality TV.
          </h1>
        }
        description={
          <p className={landingPageStyles.heroDescription}>
            Can you work together to secure a second season?
            <br />
            Or will you be canceled halfway through?
          </p>
        }
      />

      <MechanicsSection />

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
            <p className={landingPageStyles.stepEyebrow}>Step 1.</p>
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
            <p className={landingPageStyles.stepEyebrow}>Step 2.</p>
            <h1>Follow chaotic stage directions</h1>
            <p>
              The executives of the show are trying to instill chaos into the
              narrative.
              <br />
              Complete as many of their Direction Cards as you can to
              earn points!
            </p>
          </div>
        </GsapFadeScrub>
        <DirectionDeckSection />
      </div>

      <LikeHateSection
        id={`${landingPageStyles.likehateContainer}`}
        className={`${landingPageStyles.mainpageContainer}`}
        title={
          <>
            <p className={landingPageStyles.stepEyebrow}>Step 3.</p>
            <h1>Complete character arcs for extra points!</h1>
          </>
        }
        description={
          <p>
            Will you have the evil villain arc? Or the good person redemption
            arc?
          </p>
        }
      />

      <div
        id={`${landingPageStyles.goalsContainer}`}
        className={`${landingPageStyles.mainpageContainer}`}
      >
        <EpisodeDeckSection />
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
            <p className={landingPageStyles.stepEyebrow}>Step 4.</p>
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
        <CarouselSection
          className={landingPageStyles.mainpageCarousel}
          totalPictures={15}
          directory="/images/photoshoot/playtest"
          filename="playtest"
          random
          loop
          continuousAutoplay
          autoplaySpeed={5500}
          showNavigation={false}
        />
      </div>
    </div>
  );
};

export default LandingPage;
