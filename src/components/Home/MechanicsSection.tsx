import { GsapFadeScrub } from "../utils/useGsap";
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
          <span className={landingPageStyles.mechanicsLabelTtrpg}>
            TTRPGs
          </span>
        </GsapFadeScrub>
        <GsapFadeScrub fadeIn>
          <img
            loading="lazy"
            src="/images/illustrations/laughing.webp"
            alt="Laughing icon"
          />
          <span className={landingPageStyles.mechanicsLabelLaughing}>
            Laughing
          </span>
        </GsapFadeScrub>
        <GsapFadeScrub fadeIn>
          <img
            loading="lazy"
            src="/images/illustrations/stories.webp"
            alt="Storytelling icon"
          />
          <span className={landingPageStyles.mechanicsLabelStorytelling}>
            Storytelling
          </span>
        </GsapFadeScrub>
        <GsapFadeScrub fadeIn>
          <img
            loading="lazy"
            src="/images/illustrations/party.webp"
            alt="Party games icon"
          />
          <span className={landingPageStyles.mechanicsLabelPartyGames}>
            Party games
          </span>
        </GsapFadeScrub>
        <GsapFadeScrub fadeIn className="is-hidden-mobile">
          <img
            loading="lazy"
            src="/images/illustrations/acting.webp"
            alt="Improv icon"
          />
          <span className={landingPageStyles.mechanicsLabelImprov}>
            Improv
          </span>
        </GsapFadeScrub>
      </div>
    </div>
  );
}
