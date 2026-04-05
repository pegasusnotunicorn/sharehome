import React from "react";
import GameModeIcons from "../About/utils/GameModeIcons";
import { GsapFadeScrub } from "../utils/useGsap";
import landingPageStyles from "../../css/landingPage.module.css";

interface DescriptionContainerProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
}

export default function DescriptionContainer({ title, description }: DescriptionContainerProps) {
  return (
    <div
      id={`${landingPageStyles.descriptionContainer}`}
      className={`${landingPageStyles.mainpageContainer}`}
    >
      <div className={`${landingPageStyles.descriptionWrapper}`}>
        <GsapFadeScrub fadeIn scrub>
          <div className={`subcontentWrapper`}>
            {title}
            <GameModeIcons
              className={`${landingPageStyles.gameDetails}`}
              playerCount="2 - 6 players"
              playTime="12 minutes"
            />
          </div>
          <div
            className={`${landingPageStyles.descriptionTextWrapper} subcontentWrapper min-width`}
          >
            {description}
            <p className={landingPageStyles.heroDescription}>
              Keep scrolling to learn more!
            </p>
          </div>
        </GsapFadeScrub>
      </div>
    </div>
  );
}
