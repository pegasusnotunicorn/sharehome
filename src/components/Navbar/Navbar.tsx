import { useState, useCallback } from "react";
import { NavLink, useLocation } from "react-router";
import { GsapFadeScrub } from "../utils/useGsap";
import ShootingStar from "./ShootingStar";
import EmailForm from "../utils/EmailForm";
import useWindowDimensions from "../utils/useWindowDimensions";
import DefaultButton from "../utils/DefaultButton";
import styles from "../../css/navbar.module.css";
import shootingStarStyles from "../../css/utils/shootingStar.module.css";
import "../../css/utils/hamburger.css";
import useWindowScroll from "../utils/useWindowScroll";
import CharacterPinPopup from "../CharacterPinPopup";
import { usePinPopup } from "../utils/usePinPopup";
import { SOCIAL_LINKS, SocialIcon, SocialIconDefs } from "../utils/SocialIcons";

interface NavbarMainProps {
  videoModalVisible?: boolean;
}

export const NavbarMain = ({ videoModalVisible }: NavbarMainProps) => {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  const isBuyPage = location.pathname === "/buy";

  const [visible, setVisibility] = useState(false);
  const isVisibleClass = visible ? "is-active" : "";

  const { isDesktop } = useWindowDimensions();
  const [mailButtonVisible, setMailButtonVisible] = useState(true);
  const mailButtonVisibleClass = mailButtonVisible ? "is-active" : "";

  const [mobileShowMail, setMobileShowMail] = useState(false);
  const mobileShowLeftClass = mobileShowMail ? "" : "is-active";
  const mobileShowRightClass = !mobileShowMail ? "" : "is-active";

  const toggleNav = useCallback(
    (mailButton?: boolean) => {
      setVisibility(!visible);

      if (isDesktop) {
        setMailButtonVisible(!mailButtonVisible);
      } else {
        if (mailButton === true) {
          setMobileShowMail(true);
          setVisibility(true);
        } else {
          setMailButtonVisible(true);
          setMobileShowMail(false);
        }
      }
    },
    [isDesktop, mailButtonVisible, visible],
  );

  const scrollPosition = useWindowScroll();
  const isActiveAndDesktop = isDesktop && visible;
  const isAtTop = scrollPosition === 0;
  const isLandingPageAtTop = isLandingPage && isAtTop;

  const { showPopup, closePopup, dismissPopup } = usePinPopup({});
  const getNavLinkClassName = ({ isActive }: { isActive: boolean }) =>
    `${styles.navLink} noselect ${isActive ? styles.navLinkActive : ""}`;

  return (
    <>
      <SocialIconDefs className={styles.navSocialDefs} />
      {!videoModalVisible && showPopup && (
        <CharacterPinPopup closePopup={closePopup} dismissPopup={dismissPopup} />
      )}

      <div className={`${styles.navbar} ${isVisibleClass}`}>
        {/* Top bar: logo + action buttons + hamburger */}
        <GsapFadeScrub
          scrubStartCenter
          scrub
          fadeIn
          className={`${styles.topBar} noselect`}
        >
          <NavLink to="/" className={styles.logo} />
          <div className={styles.navSocialBar}>
            {SOCIAL_LINKS.map(
              ({
                href,
                label,
                iconId,
                external = true,
                brandColor,
                hoverBackground,
                hoverIconColor = "#fff",
              }) => (
              <a
                key={label}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                aria-label={label}
                className={styles.navSocialIcon}
                style={{
                  ["--social-brand-color" as string]: brandColor,
                  ["--social-brand-background" as string]: hoverBackground ?? brandColor,
                  ["--social-brand-icon-color" as string]: hoverIconColor,
                }}
              >
                <SocialIcon className={styles.navSocialSvg} iconId={iconId} />
              </a>
              ),
            )}
          </div>
          <div className={styles.topBarActions}>
            {!isBuyPage && (!isLandingPage || isDesktop) && !isLandingPageAtTop && (
              <DefaultButton
                animated
                compact
                icon="forward"
                variant="primary"
                color="red"
                className={`${mailButtonVisibleClass} ${styles.buyButton}`}
                navlink="/buy"
                text="Buy now!"
              />
            )}
            {(!isBuyPage || isDesktop) && ((!isLandingPage || isDesktop) && (!isLandingPage || !isAtTop)) && (
              <DefaultButton
                compact
                icon="star"
                variant="primary"
                color="yellow"
                className={styles.expansionButton}
                href="https://www.kickstarter.com/projects/pegasusgamesnyc/love-career-and-magic-the-second-season"
                text={<span>Expansion<span className={styles.hideOnSmallPhone}> update</span>!</span>}
              />
            )}
            <button
              className={`hamburger noselect ${styles.navToggle} ${isVisibleClass}`}
              onClick={() => toggleNav()}
              type="button"
              aria-label={visible ? "Close navigation" : "Toggle navigation"}
            >
              <span className="hamburger-box">
                <span className="hamburger-inner" />
              </span>
            </button>
          </div>
        </GsapFadeScrub>

        {/* Slide-out menu */}
        <div className={`${styles.menu} ${isVisibleClass}`}>
          <div className={styles.menuContent}>
            <div className={`${styles.menuSection} ${styles.navLinks} ${mobileShowLeftClass}`}>
              <div className={styles.navLinkList}>
                <NavLink onClick={() => toggleNav()} to="/" className={getNavLinkClassName}>
                  Home
                </NavLink>
                <NavLink
                  onClick={() => toggleNav()}
                  to="/howtoplay"
                  className={getNavLinkClassName}
                >
                  How to play
                </NavLink>
                <NavLink
                  onClick={() => toggleNav()}
                  to="/characters"
                  className={getNavLinkClassName}
                >
                  Characters
                </NavLink>
                <a
                  onClick={() => toggleNav()}
                  href="https://screentop.gg/@PegasusGames/lcm"
                  className={`${styles.navLink} noselect`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Play online
                </a>
                <NavLink
                  onClick={() => toggleNav()}
                  to="/contact"
                  className={getNavLinkClassName}
                >
                  Contact us
                </NavLink>
                <a
                  href="https://pegasusgames.medium.com/"
                  rel="noopener noreferrer"
                  target="_blank"
                  className={`${styles.navLink} noselect`}
                >
                  Blog
                </a>
              </div>
            </div>

            <div className={`${styles.menuSection} ${styles.menuDivider}`} />

            <div className={`${styles.menuSection} ${styles.emailSection} ${mobileShowRightClass}`}>
              <ShootingStar className={shootingStarStyles.leftStar} isActive={visible} orientation="right" mirror />
              <ShootingStar className={shootingStarStyles.rightStar} isActive={visible} orientation="left" delay="2" />
              <ShootingStar className={shootingStarStyles.leftStar} isActive={visible} orientation="up" delay="4" />
              <ShootingStar className={shootingStarStyles.leftStar} isActive={visible} orientation="down" delay="6" />
              <EmailForm
                hideTitle={false}
                isActiveAndDesktop={isActiveAndDesktop}
                titleIcon="/images/icons/email2.svg"
              />
              <img
                loading="lazy"
                className={styles.illustration}
                src="/images/bizz_fukidashi.webp"
                alt="Navbar illustration"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NavbarMain;
