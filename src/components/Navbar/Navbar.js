import { useState, useEffect, useCallback } from "react";
import { NavLink, useLocation } from "react-router";
import { GsapFadeDelay, GsapFadeScrub } from "../utils/useGsap.js";
import ShootingStar from "./ShootingStar.js";
import EmailForm from "../utils/EmailForm.js";
import useWindowDimensions from "../utils/useWindowDimensions.js";
import DefaultButton from "../utils/DefaultButton.js";
import "../../css/navbar.css";
import "../../css/utils/hamburger.css";
import PropTypes from "prop-types";

//main navbar for page navigation on the website
export const NavbarMain = (props) => {
  const { setVideoModalVisible } = props;

  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const [visible, setVisibility] = useState(false);

  const isVisibleClass = visible ? "is-active" : ""; //class to append if visible

  //toggle email logic
  const { width } = useWindowDimensions();
  const [mailButtonVisible, setMailButtonVisible] = useState(true);
  const mailButtonVisibleClass = mailButtonVisible ? "is-active" : ""; //class to append if visible

  const [mobileShowMail, setMobileShowMail] = useState(false);
  const mobileShowLeftClass = mobileShowMail ? "" : "is-active"; //class to append if visible
  const mobileShowRightClass = !mobileShowMail ? "" : "is-active"; //class to append if visible

  //toggle nav / mail buttons
  const toggleNav = useCallback(
    (mailButton) => {
      setVisibility(!visible);
      setVideoModalVisible(false);

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
          setMailButtonVisible(false);
        } else {
          setMailButtonVisible(true);
          setMobileShowMail(false);
        }
      }
    },
    [width, mailButtonVisible, visible, setVideoModalVisible]
  );

  const toggleMail = useCallback(() => {
    toggleNav(width <= 900 && !mobileShowMail);
  }, [width, toggleNav, mobileShowMail]);
  const isActiveAndDesktop = width > 900 && visible;

  //set the parent setter
  const onMount = props.onMount;
  useEffect(() => {
    onMount(toggleMail);
  }, [onMount, visible, toggleMail]);

  //navbar open
  return (
    <GsapFadeDelay delay={1500} className={`navbarClass ${isVisibleClass}`}>
      <GsapFadeScrub
        scrub
        startScreenTop
        fadeIn
        className="fixedButtonsWrapper"
      >
        <NavLink to="/" className="navbarFloatLeft noselect"></NavLink>
        <div className="navbarFloatRight">
          {!isHomePage && (
            <DefaultButton
              shadowless
              animated
              icon="forward"
              id="emailToggleButtonMobile"
              className={`${mailButtonVisibleClass} is-red`}
              navlink="/buy"
              text="Buy now!"
            />
          )}
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
                exact={true}
                to="/"
                activeClassName="is-active"
                className="navbarButton noselect"
              >
                Home
              </NavLink>
              <NavLink
                onClick={toggleNav}
                to="/howtoplay"
                activeClassName="is-active"
                className="navbarButton noselect"
              >
                How to play
              </NavLink>
              <NavLink
                onClick={toggleNav}
                to="/characters"
                activeClassName="is-active"
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
                activeClassName="is-active"
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
    </GsapFadeDelay>
  );
};

NavbarMain.propTypes = {
  onMount: PropTypes.func,
};

export default NavbarMain;
