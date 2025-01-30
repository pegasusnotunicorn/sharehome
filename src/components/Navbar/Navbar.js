import { useState, useEffect, useCallback } from "react";
import { NavLink } from "react-router-dom";
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
    [width, mailButtonVisible, visible]
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

  //kickstarter

  // <p className="languageChangeWrapper noselect"><span className="languageChangeSpan noselect"
  //   onClick={()=>{ changeLanguage("en-US")}}>English</span> / <span className="languageChangeSpan noselect"
  //   onClick={()=>{ changeLanguage("ja")}}>日本語</span>
  // </p>

  //navbar open
  return (
    <div className={`navbarClass ${isVisibleClass}`}>
      <GsapFadeDelay delay={1500} className="fixedButtonsWrapper noselect">
        <GsapFadeScrub scrub startScreenTop fadeIn>
          <NavLink to="/" className="navbarFloatLeft noselect"></NavLink>
        </GsapFadeScrub>
        <div className="navbarFloatRight">
          <GsapFadeScrub scrub startScreenTop fadeIn>
            {/* <DefaultButton
              shadowless
              animated
              icon="forward"
              id="emailToggleButtonMobile"
              className={`${mailButtonVisibleClass} GTMtoggleEmailButton is-green`}
              onClick={toggleMail}
              text={t("email form.joinbutton")}
            /> */}
            <DefaultButton
              shadowless
              animated
              icon="forward"
              id="emailToggleButtonMobile"
              className={`${mailButtonVisibleClass} is-blue`}
              href="https://buy.stripe.com/bIYg0Q1e08Z86Fa8wy"
              text="Buy now!"
            />
          </GsapFadeScrub>
          <button
            id="navbarOpenClose"
            className={`hamburger hamburger--slider ${isVisibleClass}`}
            onClick={toggleNav}
            type="button"
          >
            <span className="hamburger-box">
              <span className="hamburger-inner"></span>
            </span>
          </button>
        </div>
      </GsapFadeDelay>

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
