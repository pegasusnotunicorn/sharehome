import DefaultButton from "../utils/DefaultButton";
import landingPageStyles from "../../css/landingPage.module.css";
import useWindowDimensions from "../utils/useWindowDimensions";
import { GsapFadeScrub } from "../utils/useGsap";

interface HeroImageSectionProps {
  videoModalVisible: boolean;
  playVideo: () => void;
  titleOverride?: string;
}

export default function HeroImageSection({
  videoModalVisible,
  playVideo,
  titleOverride,
}: HeroImageSectionProps) {
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
            loading="eager"
            fetchPriority="high"
            draggable={false}
            className={`${landingPageStyles.heroImage} noselect openYouTubeModalButton`}
            onClick={playVideo}
          />
          <img
            alt="Click the box to learn more!"
            src="/images/box_transparent.webp"
            loading="eager"
            fetchPriority="high"
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
          <GsapFadeScrub scrub fadeOut>
            <img
              alt="or just keep scrolling"
              src="/images/just_keep_scrolling.webp"
              draggable={false}
              className={`${landingPageStyles.justKeepScrolling} noselect`}
            />
          </GsapFadeScrub>
          <div className={landingPageStyles.heroBottomButtons}>
            <DefaultButton
              animated
              icon="forward"
              variant="primary"
              color="red"
              size={isDesktop ? "large" : "default"}
              compact={!isDesktop}
              navlink="/buy"
              text="Buy now"
            />
            {!isDesktop && (
              <DefaultButton
                icon="star"
                variant="primary"
                color="yellow"
                size="default"
                compact
                className={landingPageStyles.expansionButton}
                href="https://www.kickstarter.com/projects/pegasusgamesnyc/love-career-and-magic-the-second-season"
                text={<span>Expansion<span className={landingPageStyles.hideOnSmallPhone}> update</span>!</span>}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
