import { GsapFadeScrub } from "../utils/useGsap";
import { srcSet } from "../utils/imageCopies";
import landingPageStyles from "../../css/landingPage.module.css";

// an illustration, at the size it's shown (each one's label is under it, so they've no alt text of
// their own; "improv" is the roleplaying friends, for TTRPGs, and "acting" the stage, for improv)
const art = (name: string) => {
  const src = `/images/illustrations/${name}.webp`;
  return { src, srcSet: srcSet(src), sizes: "(max-width: 900px) 125px, 200px" };
};

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
            {...art("improv")}
            alt=""
          />
          <span className={landingPageStyles.mechanicsLabelTtrpg}>
            TTRPGs
          </span>
        </GsapFadeScrub>
        <GsapFadeScrub fadeIn>
          <img
            loading="lazy"
            {...art("laughing")}
            alt=""
          />
          <span className={landingPageStyles.mechanicsLabelLaughing}>
            Laughing
          </span>
        </GsapFadeScrub>
        <GsapFadeScrub fadeIn>
          <img
            loading="lazy"
            {...art("stories")}
            alt=""
          />
          <span className={landingPageStyles.mechanicsLabelStorytelling}>
            Storytelling
          </span>
        </GsapFadeScrub>
        <GsapFadeScrub fadeIn>
          <img
            loading="lazy"
            {...art("party")}
            alt=""
          />
          <span className={landingPageStyles.mechanicsLabelPartyGames}>
            Party games
          </span>
        </GsapFadeScrub>
        <GsapFadeScrub fadeIn className="is-hidden-mobile">
          <img
            loading="lazy"
            {...art("acting")}
            alt=""
          />
          <span className={landingPageStyles.mechanicsLabelImprov}>
            Improv
          </span>
        </GsapFadeScrub>
      </div>
    </div>
  );
}
