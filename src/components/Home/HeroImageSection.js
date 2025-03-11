import PropTypes from "prop-types";
import DefaultButton from "../utils/DefaultButton.js";
import landingPageStyles from "../../css/landingPage.module.css";
import useWindowDimensions from "../utils/useWindowDimensions.js";
import useWindowScroll from "../utils/useWindowScroll.js";

export default function HeroImageSection({
  videoModalVisible,
  playVideo,
  boxArtOverride,
  titleOverride,
}) {
  const { isDesktop } = useWindowDimensions();
  const scrollPosition = useWindowScroll();
  const isPageAtTop = scrollPosition === 0;

  const titleSrc = titleOverride ?? "/images/title";
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
        <img
          alt="Page title"
          src={`${titleSrc}.webp`}
          draggable={false}
          className={`${landingPageStyles.heroTitle} noselect`}
        />
        <img
          alt="Box and components of the card game."
          src={`${imageSrcResponsive}.webp`}
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
          {isPageAtTop && (
            <img
              alt="or just keep scrolling"
              src="/images/just_keep_scrolling.webp"
              draggable={false}
              className={`${landingPageStyles.justKeepScrolling} noselect`}
            />
          )}
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
  boxArtOverride: PropTypes.string,
  textImageOverride: PropTypes.string,
};
