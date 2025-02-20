import PropTypes from "prop-types";
import GameModeIcons from "../About/utils/GameModeIcons.js";
import { GsapFadeScrub } from "../utils/useGsap.js";
import landingPageStyles from "../../css/landingPage.module.css";

export default function DescriptionContainer({ title, description }) {
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
            <p>Keep scrolling to learn more!</p>
          </div>
        </GsapFadeScrub>
      </div>
    </div>
  );
}

DescriptionContainer.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
};
