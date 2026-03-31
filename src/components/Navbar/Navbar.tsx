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

interface NavbarMainProps {
  videoModalVisible?: boolean;
}

export const NavbarMain = ({ videoModalVisible }: NavbarMainProps) => {
  const location = useLocation();
  const isLandingPage =
    location.pathname === "/" || location.pathname.includes("ttrpg");
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

  return (
    <>
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
                text="Expansion update!"
              />
            )}
            <button
              className="hamburger noselect"
              onClick={() => toggleNav()}
              type="button"
              aria-label="Toggle navigation"
            >
              <span className="hamburger-box">
                <span className="hamburger-inner" />
              </span>
            </button>
          </div>
        </GsapFadeScrub>

        {/* Slide-out menu */}
        <div className={`${styles.menu} ${isVisibleClass}`}>
          <button
            className={`hamburger noselect ${isVisibleClass}`}
            onClick={() => toggleNav()}
            type="button"
            aria-label="Close navigation"
          >
            <span className="hamburger-box">
              <span className="hamburger-inner" />
            </span>
          </button>

          <div className={styles.menuContent}>
            <div className={`${styles.menuSection} ${styles.navLinks} ${mobileShowLeftClass}`}>
              <div className={styles.navLinkList}>
                <NavLink onClick={() => toggleNav()} to="/" className={`${styles.navLink} noselect`}>
                  Home
                </NavLink>
                <NavLink onClick={() => toggleNav()} to="/howtoplay" className={`${styles.navLink} noselect`}>
                  How to play
                </NavLink>
                <NavLink onClick={() => toggleNav()} to="/characters" className={`${styles.navLink} noselect`}>
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
                <NavLink onClick={() => toggleNav()} to="/contact" className={`${styles.navLink} noselect`}>
                  About / contact
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
              <EmailForm hideTitle={false} isActiveAndDesktop={isActiveAndDesktop} />
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
