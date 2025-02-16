import { useState, useCallback } from "react";
import { NavLink, useLocation } from "react-router";
import { GsapFadeScrub } from "../utils/useGsap.js";
import ShootingStar from "./ShootingStar.js";
import EmailForm from "../utils/EmailForm.js";
import useWindowDimensions from "../utils/useWindowDimensions.js";
import DefaultButton from "../utils/DefaultButton.js";
import "../../css/navbar.css";
import "../../css/utils/hamburger.css";
import PropTypes from "prop-types";
import useWindowScroll from "../utils/useWindowScroll.js";

//main navbar for page navigation on the website
export const NavbarMain = (props) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const [visible, setVisibility] = useState(false);

  const isVisibleClass = visible ? "is-active" : ""; //class to append if visible

  //toggle email logic
  const { width } = useWindowDimensions();
  const isDesktop = width > 900;
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
      if (width > 900) {
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
    [width, mailButtonVisible, visible]
  );

  const isActiveAndDesktop = width > 900 && visible;

  // if homepage and the scroll is all the way at the time, don't show
  const scrollPosition = useWindowScroll();
  if (isHomePage && scrollPosition === 0) return null;

  //navbar open
  return (
    <div className={`navbarClass ${isVisibleClass}`}>
      <GsapFadeScrub scrub fadeIn className="fixedButtonsWrapper noselect">
        <NavLink to="/" className="navbarFloatLeft"></NavLink>
        <div className="navbarFloatRight">
          {!isHomePage ||
            (isDesktop && (
              <DefaultButton
                shadowless
                animated
                icon="forward"
                id="emailToggleButtonMobile"
                className={`${mailButtonVisibleClass} is-red`}
                navlink="/buy"
                text="Buy now!"
              />
            ))}
          <button
            id="navbarOpenClose"
            className={`hamburger hamburger--slider ${isVisibleClass}`}
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

      <div className={`navbarMain ${isVisibleClass}`}>
        <div className="navbarChildrenWrapper">
          <div
            className={`navbarChildren navbarLeftWrapper ${mobileShowLeftClass}`}
          >
            <div className="navbarButtonWrapper">
              <NavLink
                onClick={toggleNav}
                to="/"
                className="navbarButton noselect"
              >
                Home
              </NavLink>
              <NavLink
                onClick={toggleNav}
                to="/howtoplay"
                className="navbarButton noselect"
              >
                How to play
              </NavLink>
              <NavLink
                onClick={toggleNav}
                to="/characters"
                className="navbarButton noselect"
              >
                Characters
              </NavLink>
              <a
                aria-label="Play online"
                onClick={toggleNav}
                href="https://screentop.gg/@PegasusGames/lcm"
                className="navbarButton noselect"
                target="_blank"
                rel="noopener noreferrer"
              >
                Play online
              </a>
              <NavLink
                onClick={toggleNav}
                to="/contact"
                className="navbarButton noselect"
              >
                About / contact
              </NavLink>
              <a
                aria-label="Blog"
                href="https://pegasusgames.medium.com/"
                rel="noopener noreferrer"
                target="_blank"
                className="navbarButton noselect"
              >
                Blog
              </a>
            </div>
          </div>
          <div className="navbarChildren navbarCenterBorder"></div>
          <div
            className={`navbarChildren navbarRightWrapper ${mobileShowRightClass}`}
          >
            <ShootingStar
              className="leftStar"
              isActive={visible}
              orientation="right"
              mirror
            />
            <ShootingStar
              className="rightStar"
              isActive={visible}
              orientation="left"
              delay="2"
            />
            <ShootingStar
              className="leftStar"
              isActive={visible}
              orientation="up"
              delay="4"
            />
            <ShootingStar
              className="leftStar"
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
              className="artbookMockup"
              src="/images/bizz_fukidashi.webp"
              alt="Navbar illustration"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

NavbarMain.propTypes = {
  onMount: PropTypes.func,
};

export default NavbarMain;
