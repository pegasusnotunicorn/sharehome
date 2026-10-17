import { useState, useCallback, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router";
import EmailForm from "../utils/EmailForm";
import useWindowDimensions from "../utils/useWindowDimensions";
import ExpansionButton from "../utils/ExpansionButton";
import BuyButton from "../utils/BuyButton";
import { hidesBuyButtons } from "../utils/BuyButton";
import styles from "../../css/navbar.module.css";
import "../../css/utils/hamburger.css";
import useWindowScroll from "../utils/useWindowScroll";
import useDialogFocus from "../utils/useDialogFocus";
import CharacterPinPopup from "../CharacterPinPopup";
import { usePinPopup } from "../utils/usePinPopup";
import { SocialChips } from "../utils/SocialIcons";
import { BLOG_URL } from "../../utils/links";

interface NavbarMainProps {
  trailerPlaying?: boolean; // the home page's trailer is playing: the pin popup waits
}

const NavbarMain = ({ trailerPlaying }: NavbarMainProps) => {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  const hideBuyButtons = hidesBuyButtons(location.pathname);

  const [visible, setVisibility] = useState(false);
  const isVisibleClass = visible ? "is-active" : "";
  const { isDesktop } = useWindowDimensions();

  const toggleNav = useCallback(() => setVisibility((v) => !v), []);
  const closeNav = useCallback(() => setVisibility(false), []);

  const menuRef = useRef<HTMLElement>(null);
  // while it's open: the page behind doesn't scroll
  useEffect(() => {
    if (!visible) return;
    // (the scrollbar's room is kept, so nothing on the page shifts sideways as it goes)
    const root = document.documentElement, was = root.style.overflow, gutter = root.style.scrollbarGutter;
    if (innerWidth > root.clientWidth) root.style.scrollbarGutter = "stable"; // (only if there's a scrollbar)
    root.style.overflow = "hidden";
    // (keyboard focus goes into the menu as it opens, past its close button)
    requestAnimationFrame(() => menuRef.current?.querySelector<HTMLElement>("a, button, input")?.focus({ preventScroll: true }));
    return () => {
      root.style.overflow = was;
      root.style.scrollbarGutter = gutter;
    };
  }, [visible]);
  // open, it's a dialog like the rest: Tab goes round the menu and its close button, Escape closes it,
  // and focus goes back to the menu button
  const navbarRef = useRef<HTMLDivElement>(null);
  useDialogFocus(navbarRef, closeNav, { open: visible });
  // closed, nothing in it can be reached (by Tab, or a screen reader). (React 18 doesn't pass `inert` on.)
  useEffect(() => {
    menuRef.current?.toggleAttribute("inert", !visible);
  }, [visible]);
  // (a new page closes it)
  useEffect(() => setVisibility(false), [location.pathname]);

  const scrollPosition = useWindowScroll();
  const isAtTop = scrollPosition === 0;
  const isLandingPageAtTop = isLandingPage && isAtTop;

  const { showPopup, shown, closePopup, followed } = usePinPopup({ hold: trailerPlaying });
  const getNavLinkClassName = ({ isActive }: { isActive: boolean }) =>
    `${styles.navLink} noselect ${isActive ? styles.navLinkActive : ""}`;
  const linkBody = (label: string, note: string, external?: boolean) => (
    <>
      <span className={styles.navLinkLabel}>
        {label}
        {external && (
          <span className={styles.navLinkExternal} aria-hidden="true">
            ↗
          </span>
        )}
      </span>
      <span className={styles.navLinkNote}>{note}</span>
    </>
  );

  return (
    <>
      {!trailerPlaying && showPopup && (
        <CharacterPinPopup shown={shown} closePopup={closePopup} followed={followed} />
      )}

      <div ref={navbarRef} className={`${styles.navbar} ${isVisibleClass}`}>
        {/* Top bar: logo + action buttons + hamburger */}
        <header className={`${styles.topBar} noselect`}>
          <NavLink to="/" className={styles.logo} aria-label="Love, Career & Magic home" />
          <div className={styles.topBarActions}>
            {!hideBuyButtons && (!isLandingPage || isDesktop) && !isLandingPageAtTop && (
              <BuyButton
                from={isDesktop ? "navbar" : "mobile_bar"}
                animated
                compact
                icon="forward"
                variant="primary"
                color="red"
                className={styles.buyButton}
                text="Buy now!"
              />
            )}
            {!hideBuyButtons && ((!isLandingPage || isDesktop) && (!isLandingPage || !isAtTop)) && (
              <ExpansionButton className={styles.expansionButton} />
            )}
            <button
              className={`hamburger noselect tap-area ${styles.navToggle} ${isVisibleClass}`}
              onClick={toggleNav}
              type="button"
              aria-label={visible ? "Close menu" : "Open menu"}
              aria-expanded={visible}
              aria-controls="site-menu"
            >
              <span className="hamburger-box">
                <span className="hamburger-inner" />
              </span>
            </button>
          </div>
        </header>

        {/* The menu: a drawer from the right, over the dimmed page */}
        <div className={`${styles.backdrop} ${isVisibleClass}`} onClick={closeNav} aria-hidden="true" />
        <nav
          id="site-menu"
          className={`${styles.menu} ${isVisibleClass}`}
          aria-label="Site menu"
          ref={menuRef}
        >
          <div className={styles.menuContent}>
            <div className={styles.navLinkList}>
              <NavLink onClick={closeNav} to="/" end className={getNavLinkClassName}>
                {linkBody("Home", "The game in a nutshell")}
              </NavLink>
              <NavLink onClick={closeNav} to="/howtoplay" className={getNavLinkClassName}>
                {linkBody("How to play", "The rules, and what's in the box")}
              </NavLink>
              <NavLink onClick={closeNav} to="/characters" className={getNavLinkClassName}>
                {linkBody("Characters", "Meet the 25 contestants")}
              </NavLink>
              <NavLink onClick={closeNav} to="/play" className={getNavLinkClassName}>
                {linkBody("Play online", "Play with friends in your browser")}
              </NavLink>
              <NavLink onClick={closeNav} to="/contact" className={getNavLinkClassName}>
                {linkBody("Contact us", "Get in touch")}
              </NavLink>
              <a
                onClick={closeNav}
                href={BLOG_URL}
                rel="noopener noreferrer"
                target="_blank"
                className={`${styles.navLink} noselect`}
              >
                {linkBody("Blog", "Notes from the studio", true)}
              </a>
            </div>

            <div className={styles.menuNews}>
              <img loading="lazy" className={styles.menuNewsArt} src="/images/bizz_fukidashi.webp" alt="" />
              <div className={styles.menuNewsBody}>
                <p className={styles.menuNewsTitle}>Don’t miss the latest news.</p>
                <EmailForm
                  hideTitle
                  inputId="menu-email"
                  className={styles.menuEmail}
                  formClassName={styles.menuEmailForm}
                  inputClassName={styles.menuEmailInput}
                  submitButtonClassName={styles.menuEmailButton}
                  compactButton
                />
              </div>
            </div>

            <SocialChips className={styles.menuSocials} />
          </div>
        </nav>
      </div>
    </>
  );
};

export default NavbarMain;
