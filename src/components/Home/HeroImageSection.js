import PropTypes from "prop-types";
import DefaultButton from "../utils/DefaultButton.js";
import landingPageStyles from "../../css/landingPage.module.css";
import useWindowDimensions from "../utils/useWindowDimensions.js";
import { GsapFadeScrub } from "../utils/useGsap.js";

export default function HeroImageSection({
  videoModalVisible,
  playVideo,
  titleOverride,
}) {
  const { isDesktop } = useWindowDimensions();

  const imageSrcResponsive = isDesktop
    ? `/images/click_to_learn_desktop`
    : "/images/click_to_learn_mobile";

  return (
    <div
      id={`${landingPageStyles.heroContainer}`}
      className={`${landingPageStyles.mainContentWrapper} noselect`}
    >
      <div
        id={`${landingPageStyles.heroBgImage}`}
        className={landingPageStyles.screenHeight}
      />
      <div
        className={`${landingPageStyles.screenHeight} ${landingPageStyles.heroImagesWrapper}`}
      >
        <div className={landingPageStyles.heroTitleWrapper}>
          <h2 className={landingPageStyles.heroTitle}>
            {titleOverride ?? "A party game where fantasy meets reality TV!"}
          </h2>
          <img
            alt="Page title fukidashi"
            src="images/fukidashi.webp"
            draggable={false}
            className={`${landingPageStyles.fukidashi} noselect`}
          />
        </div>
        <div className={landingPageStyles.heroImageWrapper}>
          <img
            alt="Box and components of the card game."
            src={`${imageSrcResponsive}.webp`}
            draggable={false}
            className={`${landingPageStyles.heroImage} noselect openYouTubeModalButton`}
            onClick={playVideo}
          />
          <img
            alt="Click the box to learn more!"
            src="/images/box_transparent.webp"
            draggable={false}
            className={`${landingPageStyles.heroImage} noselect openYouTubeModalButton ${landingPageStyles.monsterBurstAnimation}`}
            onClick={playVideo}
          />
        </div>
        <div
          style={{
            display: videoModalVisible ? "none" : "flex",
          }}
          className={landingPageStyles.heroBottomWrapper}
        >
          <GsapFadeScrub fadeOut>
            <img
              alt="or just keep scrolling"
              src="/images/just_keep_scrolling.webp"
              draggable={false}
              className={`${landingPageStyles.justKeepScrolling} noselect`}
            />
          </GsapFadeScrub>
          <DefaultButton
            shadowless
            animated
            icon="forward"
            className="is-red"
            navlink="/buy"
            text="Buy now"
            size="large"
          />
        </div>
      </div>
    </div>
  );
}

HeroImageSection.propTypes = {
  videoModalVisible: PropTypes.bool.isRequired,
  playVideo: PropTypes.func.isRequired,
  titleOverride: PropTypes.string,
};
