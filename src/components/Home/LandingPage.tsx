import { lazy, Suspense, useEffect, useRef } from "react";
import { NavLink } from "react-router";
import { GsapFadeScrub } from "../utils/useGsap";
import ParallaxSection from "./ParallaxSection";
import MechanicsSection from "./MechanicsSection";
import CharactersDeckSection from "./CharactersDeckSection";
import {
  DirectionDeckSection,
  EpisodeDeckSection,
} from "./DirectionEpisodeDeckSection";
import ReviewsSection from "./ReviewsSection";
import TestimonialsSection from "./TestimonialsSection";
import SmoshSection from "./SmoshSection";
import LikeHateSection from "./LikeHateSection";
import BoxHero from "./BoxHero";
import landingPageStyles from "../../css/landingPage.module.css";
import DescriptionContainer from "./DescriptionContainer";
import StepText from "./utils/StepText";
import useNearViewport from "../utils/useNearViewport";

// (the photo carousel at the bottom, and the carousel library with it, load a screen and a half before
// it comes on screen, so its pictures are in when it does)
const CarouselSection = lazy(() => import("../utils/CarouselSection"));

interface LandingPageProps {
  setTrailerPlaying: (playing: boolean) => void; // the trailer's playing, in the hero's box
}

const LandingPage = ({ setTrailerPlaying }: LandingPageProps) => {
  useEffect(() => () => setTrailerPlaying(false), [setTrailerPlaying]);
  const carouselRef = useRef<HTMLDivElement>(null);
  const carouselNear = useNearViewport(carouselRef, { rootMargin: "150% 0px" });

  return (
    <div className="content">
      <ParallaxSection />

      <BoxHero onOpen={setTrailerPlaying} />

      <DescriptionContainer
        title={
          // (the hero's line again, as the wall parts: the page's one h1 is the hero's)
          <p className={`${landingPageStyles.subtitle}`}>
            A party game where <br />{" "}
            <span className="fantasyEmphasis">fantasy</span> meets reality TV.
          </p>
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
        <h2>How to play</h2>
        <p>(in 4 easy steps)</p>
      </GsapFadeScrub>

      <div
        id={`${landingPageStyles.characterContainer}`}
        className={`${landingPageStyles.mainpageContainer}`}
      >
        <CharactersDeckSection />
        <div className={`${landingPageStyles.characterTextContainer}`}>
          <GsapFadeScrub fadeIn>
            <StepText doodles={[{ src: "/images/icons/pointer.svg", at: "aboveStart" }]}>
              <p className={landingPageStyles.stepEyebrow}>Step 1.</p>
              <h3>Choose from 25 unique characters!</h3>
              <p>
                Mythological creatures with modern day jobs just like us humans.
                <br />
                <NavLink to="/characters">See all 25 characters</NavLink>
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
              { src: "/images/icons/planet.svg", at: "besideStart" },
              { src: "/images/icons/lovekey.svg", at: "aboveEnd" },
              { src: "/images/icons/cake.svg", at: "belowStart", along: 0.25 },
            ]}
          >
            <p className={landingPageStyles.stepEyebrow}>Step 2.</p>
            <h3>Follow chaotic stage directions</h3>
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
            <h3>Complete character arcs for extra points!</h3>
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
              { src: "/images/icons/scroll.svg", at: "aboveEnd" },
              { src: "/images/icons/flag.svg", at: "belowEnd" },
            ]}
          >
            <p className={landingPageStyles.stepEyebrow}>Step 4.</p>
            <h3>Crazy locations never before seen on TV</h3>
            <p>
              Every episode of the reality TV show occurs in a random exotic
              location carefully hand-picked for maximum excitement!
            </p>
          </StepText>
        </GsapFadeScrub>
      </div>

      <ReviewsSection />

      <TestimonialsSection />

      <div
        ref={carouselRef}
        className={`${landingPageStyles.mainpageContainer} ${landingPageStyles.carouselContainer}`}
      >
        {carouselNear && (
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
        )}
      </div>
    </div>
  );
};

export default LandingPage;
