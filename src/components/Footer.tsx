import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import BuyButton, { hidesBuyButtons } from "./utils/BuyButton";
import { SOCIAL_LINKS, SocialIcon } from "./utils/SocialIcons";
import useWindowDimensions from "./utils/useWindowDimensions";
import type { FooterCard, FooterCardsApi } from "./utils/footerCards3d";
import styles from "../css/footer.module.css";

const SHEET = { fronts: "/images/cards/character-fronts.webp", cols: 5, rows: 5 }; // footerCards3d.ts ATLAS

const EXPLORE: { label: string; to?: string; href?: string }[] = [
  { label: "Home", to: "/" },
  { label: "How to play", to: "/howtoplay" },
  { label: "Characters", to: "/characters" },
  { label: "Play online", to: "/play" },
  { label: "Blog", href: "https://pegasusgames.medium.com/" },
  { label: "Contact us", to: "/contact" },
];

// a handful of the cast, a different handful each visit. (The cast's data is loaded with the cards, as
// the footer comes near, rather than with every page.)
type CastData = typeof import("./Characters/Characters");
const pickCast = ({ getAllCharacters }: CastData, count: number): FooterCard[] =>
  getAllCharacters()
    .map((c, index) => ({ index, name: c.name, urlName: c.urlName, done: !c.ignoreInRandom }))
    .filter((c) => c.done)
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
    .map(({ index, name, urlName }) => ({ index, name, urlName }));

const Footer = () => {
  const { width } = useWindowDimensions();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // a link to the page you're already on goes back to its top (the router does nothing otherwise)
  const toTopIfHere = (to: string) => (e: React.MouseEvent) => {
    if (to !== pathname) return;
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [hover, setHover] = useState<{ name: string; x: number; y: number } | null>(null);
  const [flat, setFlat] = useState(false); // the 3D cards can't be shown: a fan of flat cards instead
  const isMobile = width <= 900;
  const count = isMobile ? 5 : 9;
  const [cast, setCast] = useState<FooterCard[]>([]);

  // the 3D cards load when the footer is about to scroll into view
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let api: FooterCardsApi | null = null, gone = false;
    const castData = () => import("./Characters/Characters");
    // (the flat fan needs the cast too)
    const fail = () =>
      castData()
        .then((m) => !gone && setCast((c) => (c.length ? c : pickCast(m, count))))
        .catch(() => {})
        .finally(() => !gone && setFlat(true));
    stage.classList.remove("ready");
    const start = () =>
      Promise.all([import("./utils/footerCards3d"), castData()])
        .then(([{ mountFooterCards }, m]) => {
          const cards = pickCast(m, count);
          if (!gone) setCast(cards);
          return mountFooterCards(stage, {
            cards,
            onHover: (c, x, y) => setHover(c ? { name: c.name, x, y } : null),
            onPick: (c) => {
              const to = `/characters/${c.urlName}`;
              if (to === window.location.pathname) window.scrollTo({ top: 0, behavior: "smooth" });
              else navigate(to);
            },
            onFail: fail,
          });
        })
        .then((a) => (gone ? a?.destroy() : (api = a)))
        .catch(fail);
    const io = new IntersectionObserver(
      (e) => {
        if (!e.some((x) => x.isIntersecting)) return;
        io.disconnect();
        start();
      },
      { rootMargin: "400px" }
    );
    io.observe(stage);
    return () => {
      gone = true;
      io.disconnect();
      api?.destroy();
      setHover(null);
    };
  }, [count, navigate]);

  return (
    <footer className={styles.footer}>
      <div className={styles.band}>
        <div ref={stageRef} className={styles.stage}>
          {/* if the 3D cards can't be shown: a fan of flat cards */}
          {flat && (
            <div className={styles.fan} aria-hidden="true">
              {cast.slice(0, 5).map((c, i) => (
                <span
                  key={c.urlName}
                  className={styles.fanCard}
                  style={{
                    ["--i" as string]: i - 2,
                    backgroundImage: `url("${SHEET.fronts}")`,
                    backgroundPosition: `${((c.index % SHEET.cols) / (SHEET.cols - 1)) * 100}% ${(Math.floor(c.index / SHEET.cols) / (SHEET.rows - 1)) * 100}%`,
                  }}
                />
              ))}
            </div>
          )}
          {hover && (
            <span className={styles.pill} style={{ left: hover.x, top: hover.y }} aria-hidden="true">
              Meet {hover.name} <span>→</span>
            </span>
          )}
        </div>
        <div className={styles.headline}>
          <p className={styles.kicker}>The cast is waiting</p>
          <h2 className={styles.title}>Love, Career &amp; Magic</h2>
          <img className={styles.tagline} src="/images/title.webp" alt="A game where fantasy meets reality TV" loading="lazy" />
          <div className={styles.ctas}>
            {!hidesBuyButtons(pathname) && <BuyButton from="footer" animated icon="forward" variant="primary" color="red" text="Buy now!" />}
            <NavLink to="/characters" className={styles.castLink} onClick={toTopIfHere("/characters")}>
              Meet the cast <span aria-hidden="true">→</span>
            </NavLink>
          </div>
        </div>
      </div>

      <div className={styles.inner}>
        <nav className={styles.col} aria-label="Explore">
          <h3 className={styles.colTitle}>Explore</h3>
          {EXPLORE.map((l) =>
            l.to ? (
              <NavLink key={l.label} to={l.to} className={styles.link} onClick={toTopIfHere(l.to)}>
                {l.label}
              </NavLink>
            ) : (
              <a key={l.label} href={l.href} className={styles.link} target="_blank" rel="noopener noreferrer">
                {l.label}
              </a>
            )
          )}
        </nav>
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Follow along</h3>
          <div className={styles.socials}>
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.external === false ? undefined : "_blank"}
                rel={s.external === false ? undefined : "noreferrer"}
                aria-label={s.label}
                title={s.label}
                className={styles.social}
                style={{
                  ["--brand" as string]: s.brandColor,
                  // (hovered, as in the menu: the brand's own background and icon colour)
                  ["--social-brand-background" as string]: s.hoverBackground ?? s.brandColor,
                  ["--social-brand-icon-color" as string]: s.hoverIconColor ?? "#fff",
                }}
              >
                <SocialIcon iconId={s.iconId} className={styles.socialSvg} />
              </a>
            ))}
          </div>
        </div>
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Made by</h3>
          <p className={styles.blurb}>
            <a href="https://unicornwithwings.com/" className={styles.inline} target="_blank" rel="noreferrer">
              Pegasus Games
            </a>
            , a tiny studio in New York.
          </p>
          <p className={styles.blurb}>
            Illustrations by{" "}
            <a href="https://www.instagram.com/carofranklyn/?hl=en" className={styles.inline} target="_blank" rel="noreferrer">
              Carolyn Frank
            </a>
            .
          </p>
        </div>
      </div>

      <div className={styles.bottom}>
        <span>© {new Date().getFullYear()} Pegasus Games</span>
        <span className={styles.legal}>
          <NavLink to="/terms" className={styles.link} onClick={toTopIfHere("/terms")}>
            Terms
          </NavLink>
          <NavLink to="/privacy" className={styles.link} onClick={toTopIfHere("/privacy")}>
            Privacy
          </NavLink>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
