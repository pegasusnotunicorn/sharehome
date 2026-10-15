import { useEffect, useRef, useState } from "react";
import styles from "../css/pages/contactPage.module.css";
import galleryStyles from "../css/utils/polaroidGallery.module.css";
import { NavLink } from "react-router";
import { BUY_DESTINATION, recordBuyClick } from "./utils/BuyButton";
import PolaroidGallery, { formatDate } from "./utils/PolaroidGallery";
import { CONTACT_POLAROIDS } from "./utils/contactPolaroids";
import { SOCIAL_LINKS, SocialIcon, SocialIconDefs } from "./utils/SocialIcons";
import type { PolaroidRingApi } from "./utils/polaroidRing3d";

const ContactPage = () => {
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  useEffect(() => {
    document.title = "Contact us";
  }, []);

  return (
    <div className={`content ${styles.contactPage}`}>
      <SocialIconDefs className={styles.socialIconDefs} />
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Say hi</p>
        <h1 className={styles.title}>Contact us</h1>
        <p className={styles.lede}>Follow along on my game dev journey 🎮</p>
        <div className={styles.socials}>
          {SOCIAL_LINKS.map(({ href, label, iconId, external = true, brandColor, hoverBackground, hoverIconColor = "#fff" }) => (
            <a
              key={label}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noreferrer" : undefined}
              aria-label={label}
              style={{
                ["--social-brand-color" as string]: brandColor,
                ["--social-brand-background" as string]: hoverBackground ?? brandColor,
                ["--social-brand-icon-color" as string]: hoverIconColor,
              }}
            >
              <SocialIcon className={styles.socialIcon} iconId={iconId} />
            </a>
          ))}
        </div>
      </header>

      <section className={styles.about}>
        <img src="/images/wonmin.webp" alt="Wonmin, the game designer" className={styles.portrait} />
        <div className={styles.aboutWords}>
          <p className={styles.label}>The game designer</p>
          <h2 className={styles.aboutTitle}>Hello, I&apos;m Wonmin 👋</h2>
          <div className={`${styles.bio}${isBioExpanded ? ` ${styles.bioOpen}` : ""}`}>
            <p>
              I quit my cushy corporate job in 2016 to pursue my dreams of becoming a game developer. And in March of
              2021, that dream became a reality when my first game,{" "}
              <a href="http://sysifuscorp.com/" target="_blank" rel="noreferrer">
                Welcome to Sysifus Corp
              </a>
              , was successfully funded on Kickstarter.
            </p>
            <p>
              I had no idea what I was doing when I quit my job. Even now, I am still terrified for my future. But it
              is thanks to the support of fans like you that I am able to do what I love. And for that, I am truly
              thankful.
            </p>
            <p>
              I make games through{" "}
              <a href="https://unicornwithwings.com" target="_blank" rel="noreferrer">
                Pegasus Games
              </a>
              , including Love, Career & Magic, which is very much inspired by reality TV but not affiliated with any
              existing show.
            </p>
            <p>
              Thanks for visiting my humble page and please consider{" "}
              <NavLink to={BUY_DESTINATION} onClick={recordBuyClick}>
                buying the game!
              </NavLink>
            </p>
          </div>
          <button type="button" className={styles.readMore} onClick={() => setIsBioExpanded((v) => !v)}>
            {isBioExpanded ? "Show less" : "Read more"}
          </button>
        </div>
      </section>

      <Journey />
    </div>
  );
};

// #region--------------------------------------THE JOURNEY: the polaroids, going round in 3D

const AUTO_MS = 3600;
const PHOTOS = CONTACT_POLAROIDS.map((p) => ({ src: p.src, date: formatDate(p.date) }));

const Journey = () => {
  const stage = useRef<HTMLDivElement>(null);
  const api = useRef<PolaroidRingApi | null>(null);
  const [at, setAt] = useState(0);
  const [live, setLive] = useState(false);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [paused, setPaused] = useState(false); // the visitor's pause button
  const [held, setHeld] = useState(false); // a pointer or focus on it: it waits
  const [shown, setShown] = useState(false); // on screen

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let gone = false;
    import("./utils/polaroidRing3d")
      .then(({ mountPolaroidRing }) =>
        mountPolaroidRing(el, {
          photos: PHOTOS,
          onTurn: (i) => !gone && setAt(i),
          onOpen: (i) => !gone && setOpen(i),
          onFail: () => !gone && setFailed(true),
        })
      )
      .then((a) => {
        if (gone) return a?.destroy();
        api.current = a;
        if (a) setLive(true);
      })
      .catch(() => !gone && setFailed(true));
    return () => {
      gone = true;
      api.current?.destroy();
      api.current = null;
    };
  }, []);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShown(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [live]);

  // round it goes, while it's on screen and nobody's looking closely (and not for visitors who ask for
  // less motion)
  useEffect(() => {
    if (!live || paused || held || !shown || open !== null) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => !document.hidden && api.current?.turn(1), AUTO_MS);
    return () => clearInterval(t);
  }, [live, paused, held, shown, open, at]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const item = CONTACT_POLAROIDS[at];
  const shownItem = open !== null ? CONTACT_POLAROIDS[open] : null;

  return (
    <section className={styles.journey} aria-roledescription="carousel" aria-label="The journey so far">
      <header className={styles.journeyHead}>
        <p className={styles.label}>2018 – today</p>
        <h2 className={styles.journeyTitle}>The journey so far</h2>
      </header>

      {failed ? (
        <PolaroidGallery items={CONTACT_POLAROIDS} className={styles.flatPolaroids} showConnector={false} />
      ) : (
        <div onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)}>
          <div ref={stage} className={`${styles.ring}${live ? ` ${styles.ringLive}` : ""}`}>
            {!live && <img className={styles.ringStill} src={CONTACT_POLAROIDS[0].src} alt="" />}
          </div>
          <div className={styles.journeyBar} onFocus={() => setHeld(true)} onBlur={() => setHeld(false)}>
            <button type="button" className={styles.chip} onClick={() => api.current?.turn(-1)} aria-label="Previous photo">
              <Chevron flip />
            </button>
            <div className={styles.caption} aria-live={paused ? "polite" : "off"}>
              <p key={at} className={styles.captionText}>
                {item.caption}
                <span className={styles.captionMeta}>
                  {formatDate(item.date)} · {at + 1} of {CONTACT_POLAROIDS.length}
                </span>
              </p>
            </div>
            <button type="button" className={styles.chip} onClick={() => api.current?.turn(1)} aria-label="Next photo">
              <Chevron />
            </button>
          </div>
          <div className={styles.journeyTools}>
            <button type="button" className={styles.textButton} onClick={() => setPaused((p) => !p)}>
              {paused ? "Play" : "Pause"}
            </button>
            <span aria-hidden="true">·</span>
            <button type="button" className={styles.textButton} onClick={() => setOpen(at)}>
              View photo
            </button>
          </div>
        </div>
      )}

      {shownItem && (
        <div className={galleryStyles.lightbox} onClick={() => setOpen(null)} role="presentation">
          <div
            className={galleryStyles.lightboxCard}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={shownItem.alt}
          >
            <button type="button" className={styles.lightboxClose} onClick={() => setOpen(null)} aria-label="Close">
              <img src="/images/icons/cross.svg" alt="" />
            </button>
            <img src={shownItem.src} alt={shownItem.alt} className={galleryStyles.lightboxPhoto} />
            <div className={galleryStyles.lightboxCaptionWrapper}>
              <p className={galleryStyles.lightboxCaption}>{shownItem.caption}</p>
              <p className={galleryStyles.lightboxDate}>{formatDate(shownItem.date)}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const Chevron = ({ flip }: { flip?: boolean }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={flip ? { transform: "scaleX(-1)" } : undefined}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

// #endregion

export default ContactPage;
