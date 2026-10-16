import { useState, useCallback, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router";
import EmailForm from "../utils/EmailForm";
import useWindowDimensions from "../utils/useWindowDimensions";
import DefaultButton from "../utils/DefaultButton";
import BuyButton from "../utils/BuyButton";
import { BUY_DESTINATION } from "../utils/BuyButton";
import styles from "../../css/navbar.module.css";
import "../../css/utils/hamburger.css";
import useWindowScroll from "../utils/useWindowScroll";
import CharacterPinPopup from "../CharacterPinPopup";
import { usePinPopup } from "../utils/usePinPopup";
import { SOCIAL_LINKS, SocialIcon } from "../utils/SocialIcons";

interface NavbarMainProps {
  trailerPlaying?: boolean; // the home page's trailer is playing: the pin popup waits
}

export const NavbarMain = ({ trailerPlaying }: NavbarMainProps) => {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  // (and in an online game room, where they'd sit over the game)
  const hideBuyButtons =
    ["/buy", BUY_DESTINATION, "/thankyou", "/raffle"].includes(location.pathname) || location.pathname.startsWith("/play/");

  const [visible, setVisibility] = useState(false);
  const isVisibleClass = visible ? "is-active" : "";
  const { isDesktop } = useWindowDimensions();

  const toggleNav = useCallback(() => setVisibility((v) => !v), []);
  const closeNav = useCallback(() => setVisibility(false), []);

  // while it's open: the page behind doesn't scroll, and Escape closes it
  useEffect(() => {
    if (!visible) return;
    // (the scrollbar's room is kept, so nothing on the page shifts sideways as it goes)
    const root = document.documentElement, was = root.style.overflow, gutter = root.style.scrollbarGutter;
    if (innerWidth > root.clientWidth) root.style.scrollbarGutter = "stable"; // (only if there's a scrollbar)
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setVisibility(false);
    addEventListener("keydown", onKey);
    // (keyboard focus goes into the menu as it opens, and back to the menu button as it closes)
    const opener = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => menuRef.current?.querySelector<HTMLElement>("a, button, input")?.focus({ preventScroll: true }));
    return () => {
      root.style.overflow = was;
      root.style.scrollbarGutter = gutter;
      removeEventListener("keydown", onKey);
      if (menuRef.current?.contains(document.activeElement)) opener?.focus({ preventScroll: true });
    };
  }, [visible]);
  // closed, nothing in it can be reached (by Tab, or a screen reader). (React 18 doesn't pass `inert` on.)
  const menuRef = useRef<HTMLElement>(null);
  useEffect(() => {
    menuRef.current?.toggleAttribute("inert", !visible);
  }, [visible]);
  // (a new page closes it)
  useEffect(() => setVisibility(false), [location.pathname]);

  const scrollPosition = useWindowScroll();
  const isAtTop = scrollPosition === 0;
  const isLandingPageAtTop = isLandingPage && isAtTop;

  const { showPopup, closePopup, followed } = usePinPopup({ hold: trailerPlaying });
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
        <CharacterPinPopup closePopup={closePopup} followed={followed} />
      )}

      <div className={`${styles.navbar} ${isVisibleClass}`}>
        {/* Top bar: logo + action buttons + hamburger */}
        <div className={`${styles.topBar} noselect`}>
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
        </div>

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
              <a
                onClick={closeNav}
                href="https://screentop.gg/@PegasusGames/lcm"
                className={`${styles.navLink} noselect`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {linkBody("Play online", "Try it in your browser", true)}
              </a>
              <NavLink onClick={closeNav} to="/contact" className={getNavLinkClassName}>
                {linkBody("Contact us", "Get in touch")}
              </NavLink>
              <a
                onClick={closeNav}
                href="https://pegasusgames.medium.com/"
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
                />
              </div>
            </div>

            <div className={styles.menuSocials}>
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
          </div>
        </nav>
      </div>
    </>
  );
};

export default NavbarMain;
