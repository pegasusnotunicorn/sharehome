import { useState, useCallback } from "react";
import { NavLink, useLocation } from "react-router";
import { GsapFadeScrub } from "../utils/useGsap.js";
import ShootingStar from "./ShootingStar.js";
import EmailForm from "../utils/EmailForm.js";
import useWindowDimensions from "../utils/useWindowDimensions.js";
import DefaultButton from "../utils/DefaultButton.js";
import navStyles from "../../css/navbar.module.css";
import shootingStarStyles from "../../css/utils/shootingStar.module.css";
import hamburgerStyles from "../../css/utils/hamburger.module.css";
import useWindowScroll from "../utils/useWindowScroll.js";
import CharacterPinPopup from "../CharacterPinPopup.js";
import { usePinPopup } from "../utils/usePinPopup.js";

//main navbar for page navigation on the website
export const NavbarMain = ({ videoModalVisible }) => {
  const location = useLocation();
  const isLandingPage =
    location.pathname === "/" || location.pathname.includes("ttrpg");

  const [visible, setVisibility] = useState(false);

  const isVisibleClass = visible ? "is-active" : ""; //class to append if visible

  //toggle email logic
  const { isDesktop } = useWindowDimensions();
  const [mailButtonVisible, setMailButtonVisible] = useState(true);
  const mailButtonVisibleClass = mailButtonVisible ? "is-active" : ""; //class to append if visible

  const [mobileShowMail, setMobileShowMail] = useState(false);
  const mobileShowLeftClass = mobileShowMail ? "" : "is-active"; //class to append if visible
  const mobileShowRightClass = !mobileShowMail ? "" : "is-active"; //class to append if visible

  //toggle nav / mail buttons
  const toggleNav = useCallback(
    (mailButton) => {
      setVisibility(!visible);

      //desktop
      if (isDesktop) {
        setMailButtonVisible(!mailButtonVisible);
      }
      //mobile
      else {
        //hide the email form if mobile
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

  // if landing and the scroll is all the way at the time, don't show
  const scrollPosition = useWindowScroll();

  const isActiveAndDesktop = isDesktop && visible;
  const isAtTop = scrollPosition === 0;
  const isLandingPageAtTop = isLandingPage && isAtTop;

  const { showPopup, closePopup, dismissPopup } = usePinPopup({});

  //navbar open
  return (
    <>
      {!videoModalVisible && showPopup && (
        <CharacterPinPopup closePopup={closePopup} dismissPopup={dismissPopup} />
      )}

      <div className={`${navStyles.navbarClass} ${isVisibleClass}`}>
        <GsapFadeScrub
          scrubStartCenter
          scrub
          fadeIn
          className={`${navStyles.fixedButtonsWrapper} noselect ${
            isAtTop ? navStyles.isLandingPageAtTop : ""
          }`}
        >
          <NavLink to="/" className={navStyles.navbarFloatLeft}></NavLink>
          <div className={navStyles.navbarFloatRight}>
            {(!isLandingPage || isDesktop) && !isLandingPageAtTop && (
              <DefaultButton
                shadowless
                animated
                icon="forward"
                id="emailToggleButtonMobile"
                className={`${mailButtonVisibleClass} is-red ${navStyles.navbarBuyButton}`}
                navlink="/buy"
                text="Buy now!"
              />
            )}
            {!isAtTop && (
              <DefaultButton
                className={`${navStyles["free-pin-btn"]} topNavbarButton is-green`}
                href="https://www.kickstarter.com/projects/pegasusgamesnyc/love-career-and-magic-the-second-season"
                text="Expansion update!"
                shadowless
              />
            )}
            <button
              className={`${navStyles.navbarOpenClose} hamburger hamburger--slider noselect`}
              onClick={toggleNav}
              type="button"
              aria-label="Toggle navigation"
            >
              <span className="hamburger-box">
                <span className="hamburger-inner"></span>
              </span>
            </button>
          </div>
        </GsapFadeScrub>

        <div className={`${navStyles.navbarMain} ${isVisibleClass}`}>
          <button
            className={`${navStyles.navbarOpenClose} hamburger hamburger--slider noselect ${isVisibleClass}`}
            onClick={toggleNav}
            type="button"
            aria-label="Toggle navigation"
          >
            <span className="hamburger-box">
              <span className="hamburger-inner"></span>
            </span>
          </button>
          <div className={navStyles.navbarChildrenWrapper}>
            <div
              className={`${navStyles.navbarChildren} ${navStyles.navbarLeftWrapper} ${mobileShowLeftClass}`}
            >
              <div className={navStyles.navbarButtonWrapper}>
                <NavLink
                  onClick={toggleNav}
                  to="/"
                  className={`${navStyles.navbarButton} noselect`}
                >
                  Home
                </NavLink>
                <NavLink
                  onClick={toggleNav}
                  to="/howtoplay"
                  className={`${navStyles.navbarButton} noselect`}
                >
                  How to play
                </NavLink>
                <NavLink
                  onClick={toggleNav}
                  to="/characters"
                  className={`${navStyles.navbarButton} noselect`}
                >
                  Characters
                </NavLink>
                <a
                  aria-label="Play online"
                  onClick={toggleNav}
                  href="https://screentop.gg/@PegasusGames/lcm"
                  className={`${navStyles.navbarButton} noselect`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Play online
                </a>
                <NavLink
                  onClick={toggleNav}
                  to="/contact"
                  className={`${navStyles.navbarButton} noselect`}
                >
                  About / contact
                </NavLink>
                <a
                  aria-label="Blog"
                  href="https://pegasusgames.medium.com/"
                  rel="noopener noreferrer"
                  target="_blank"
                  className={`${navStyles.navbarButton} noselect`}
                >
                  Blog
                </a>
              </div>
            </div>
            <div className={`${navStyles.navbarChildren} ${navStyles.navbarCenterBorder}`}></div>
            <div
              className={`${navStyles.navbarChildren} ${navStyles.navbarRightWrapper} ${mobileShowRightClass}`}
            >
              <ShootingStar
                className={shootingStarStyles.leftStar}
                isActive={visible}
                orientation="right"
                mirror
              />
              <ShootingStar
                className={shootingStarStyles.rightStar}
                isActive={visible}
                orientation="left"
                delay="2"
              />
              <ShootingStar
                className={shootingStarStyles.leftStar}
                isActive={visible}
                orientation="up"
                delay="4"
              />
              <ShootingStar
                className={shootingStarStyles.leftStar}
                isActive={visible}
                orientation="down"
                delay="6"
              />
              <EmailForm
                hideTitle={false}
                isActiveAndDesktop={isActiveAndDesktop}
              />
              <img
                loading="lazy"
                className={navStyles.artbookMockup}
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
