import { GsapFadeScrub } from "../utils/useGsap.js";
import landingPageStyles from "../../css/landingPage.module.css";

export default function MechanicsSection() {
  return (
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
  );
}
