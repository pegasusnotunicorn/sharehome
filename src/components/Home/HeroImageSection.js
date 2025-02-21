import PropTypes from "prop-types";
import DefaultButton from "../utils/DefaultButton.js";
import landingPageStyles from "../../css/landingPage.module.css";

export default function HeroImageSection({
  videoModalVisible,
  playVideo,
  boxArtOverride,
  textImageOverride,
}) {
  return (
    <div
      id={`${landingPageStyles.heroContainer}`}
      className={`${landingPageStyles.mainContentWrapper} noselect`}
    >
      <div
        id={`${landingPageStyles.heroBgImage}`}
        className={landingPageStyles.screenHeight}
      />
      <div className={landingPageStyles.screenHeight}>
        <img
          alt="Box and components of the card game."
          src={textImageOverride ?? "/images/click_to_learn.webp"}
          draggable={false}
          className={`${landingPageStyles.heroImage} noselect openYouTubeModalButton`}
          onClick={playVideo}
        />
        <img
          alt="Click the box to learn more!"
          src={boxArtOverride ?? "/images/box_transparent.webp"}
          draggable={false}
          className={`${landingPageStyles.heroImage} noselect openYouTubeModalButton ${landingPageStyles.monsterBurstAnimation}`}
          onClick={playVideo}
        />
        <div
          style={{
            display: videoModalVisible ? "none" : "flex",
          }}
          className={landingPageStyles.heroBottomWrapper}
        >
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
};
