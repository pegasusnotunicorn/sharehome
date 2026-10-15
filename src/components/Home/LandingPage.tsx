import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "react-router";
import { GsapFadeScrub } from "../utils/useGsap";
import DefaultButton from "../utils/DefaultButton";
import ParallaxSection from "./ParallaxSection";
import MechanicsSection from "./MechanicsSection";
import CharactersDeckSection from "./CharactersDeckSection";
import {
  DirectionDeckSection,
  EpisodeDeckSection,
} from "./DirectionEpisodeDeckSection";
import TestimonialsSection from "./TestimonialsSection";
import SmoshSection from "./SmoshSection";
import LikeHateSection from "./LikeHateSection";
import BoxHero from "./BoxHero";
import landingPageStyles from "../../css/landingPage.module.css";
import DescriptionContainer from "./DescriptionContainer";
import StepText from "./utils/StepText";

// (the photo carousel at the bottom, and the carousel library with it, load after the page is up)
const CarouselSection = lazy(() => import("../utils/CarouselSection"));

interface LandingPageProps {
  setTrailerPlaying: (playing: boolean) => void; // the trailer's playing, in the hero's box
}

const LandingPage = ({ setTrailerPlaying }: LandingPageProps) => {
  useEffect(() => () => setTrailerPlaying(false), [setTrailerPlaying]);
  // the card parallax waits for the hero's 3D box, so they don't share a slow connection
  const [heroSettled, setHeroSettled] = useState(false);

  useEffect(() => {
    document.title = "Love, Career & Magic - 12m game for 2-6 players";
  }, []);

  return (
    <div className="content">
      <ParallaxSection hold={!heroSettled} />

      <BoxHero onOpen={setTrailerPlaying} onSettled={() => setHeroSettled(true)} />

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

      <SmoshSection />

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
            <StepText doodles={[{ src: "/images/icons/pointer.svg", alt: "pointing finger", at: "aboveStart" }]}>
              <p className={landingPageStyles.stepEyebrow}>Step 1.</p>
              <h1>Choose from 25 unique characters!</h1>
              <p>
                Mythological creatures with modern day jobs just like us humans.
                <br />
                <Link to="/characters">Click here</Link> to see all characters.
              </p>
            </StepText>
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
          <StepText
            className={landingPageStyles.eventsTextContainer}
            doodles={[
              { src: "/images/icons/planet.svg", alt: "planet", at: "besideStart" },
              { src: "/images/icons/lovekey.svg", alt: "heart and key", at: "aboveEnd" },
              { src: "/images/icons/cake.svg", alt: "cake", at: "belowStart", along: 0.25 },
            ]}
          >
            <p className={landingPageStyles.stepEyebrow}>Step 2.</p>
            <h1>Follow chaotic stage directions</h1>
            <p>
              The executives of the show are trying to instill chaos into the
              narrative.
              <br />
              Complete as many of their Direction Cards as you can to
              earn points!
            </p>
          </StepText>
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
          <StepText
            className={landingPageStyles.goalsTextContainer}
            doodles={[
              { src: "/images/icons/scroll.svg", alt: "scroll", at: "aboveEnd" },
              { src: "/images/icons/flag.svg", alt: "flag", at: "belowEnd" },
            ]}
          >
            <p className={landingPageStyles.stepEyebrow}>Step 4.</p>
            <h1>Crazy locations never before seen on TV</h1>
            <p>
              Every episode of the reality TV show occurs in a random exotic
              location carefully hand-picked for maximum excitement!
            </p>
          </StepText>
        </GsapFadeScrub>
      </div>

      <TestimonialsSection />

      <div
        className={`${landingPageStyles.mainpageContainer} ${landingPageStyles.carouselContainer}`}
      >
        <Suspense fallback={null}>
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
        </Suspense>
      </div>
    </div>
  );
};

export default LandingPage;
