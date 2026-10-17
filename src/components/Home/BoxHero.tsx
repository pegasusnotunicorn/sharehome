import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import BoxViewer from "../utils/BoxViewer";
import BuyButton from "../utils/BuyButton";
import DefaultButton from "../utils/DefaultButton";
import ShoutBubble from "../utils/ShoutBubble";
import useWindowDimensions from "../utils/useWindowDimensions";
import { trackEvent } from "../utils/trackEvent";
import type { BoxArt } from "../utils/box3d";
import styles from "../../css/pages/home/boxHero.module.css";

// The top of the home page: the game box in 3D, Bizz peeking over it to shout the title. Click the
// box and it opens to play the trailer inside.
// phones get the art at two thirds the size: less than half the download, and still sharp at that size
const panels = (dir: string, part: "lid" | "base") => ({
  top: `${dir}/${part}.webp`,
  near: `${dir}/${part}-near.webp`,
  far: `${dir}/${part}-far.webp`,
  left: `${dir}/${part}-left.webp`,
  right: `${dir}/${part}-right.webp`,
});
const boxArt = (dir: string): BoxArt => ({ lid: panels(dir, "lid"), base: panels(dir, "base") });
const BOX = boxArt("/images/box");
const BOX_PHONE = boxArt("/images/box/phone");
const isPhone = () => !!window.matchMedia?.("(max-width: 900px)").matches;
// the words come in this soon after the page is up, whether or not the 3D box is in yet (Bizz pops up
// behind the box when it is)
const WORDS_MS = 300;
// the trailers: wide on big screens, upright on phones
const VIDEO = { landscape: "EoQ2VTipXPA", portrait: "fNq9hS6DsTU" };

// index.html shows the box before the app is up; once ours is on screen, that one goes
const hideStaticHero = () => {
  const el = document.getElementById("hero-static");
  if (el) el.style.display = "none";
};

interface BoxHeroProps {
  onOpen?: (open: boolean) => void;
}

export default function BoxHero({ onOpen }: BoxHeroProps) {
  const [open, setOpen] = useState(false);
  // Bizz's words
  const [spoken, setSpoken] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSpoken(true), WORDS_MS);
    return () => clearTimeout(t);
  }, []);
  const { isDesktop } = useWindowDimensions();
  const [art] = useState(() => (isPhone() ? BOX_PHONE : BOX));
  const openedAt = useRef(0);
  // touch screens tap
  const [verb] = useState(() => (window.matchMedia?.("(hover: none)").matches ? "Tap" : "Click"));

  return (
    <section className={`${styles.hero} ${open ? styles.open : ""} ${spoken ? styles.spoken : ""}`.trim()}>
      <div className={styles.bg} aria-hidden="true" />
      <div className={styles.copy}>
        <header className={styles.head}>
          {/* Bizz says it: on wide screens he's to the right of the words, on phones below them */}
          <ShoutBubble side={isDesktop ? "right" : "bottom"} aim={0.2} reach={isDesktop ? 4.5 : 5.5} depth={isDesktop ? 30 : 18} lean={isDesktop ? undefined : 0.3} className={styles.bubble}>
            <h1 className={styles.title}>
              A party game where <span className="fantasyEmphasis">fantasy</span> meets reality TV!
            </h1>
          </ShoutBubble>
          <ShoutBubble side="none" className={styles.factsBubble}>
            <p className={styles.facts}>
              <span>12 minutes</span>
              <span aria-hidden="true">·</span>
              <span>2–6 players</span>
              <span aria-hidden="true">·</span>
              <span>Ages 12+</span>
            </p>
          </ShoutBubble>
        </header>
        {isDesktop && (
          <div className={styles.ctas}>
            <BuyButton from="home_hero" animated icon="forward" variant="primary" color="red" size="large" text="Buy now" />
          </div>
        )}
      </div>

      <div className={styles.stageWrap}>
        <BoxViewer
          art={art}
          video={VIDEO}
          label="The Love, Career & Magic game box"
          still="/images/box/still.webp"
          onOpen={(o) => {
            setOpen(o);
            onOpen?.(o);
            if (o) {
              openedAt.current = Date.now();
              trackEvent("hero_trailer_open");
            } else if (openedAt.current) {
              trackEvent("hero_trailer_close", { seconds_open: Math.round((Date.now() - openedAt.current) / 1000) });
              openedAt.current = 0;
            }
          }}
          onStill={hideStaticHero}
          behind={<img className={styles.bizz} src="/images/box/bizz.webp" alt="" width={450} height={392} draggable={false} />}
          fallback={
            <a className={styles.fallback} href={`https://www.youtube.com/watch?v=${VIDEO.landscape}`} target="_blank" rel="noreferrer">
              <img src="/images/box/still.webp" alt="The Love, Career & Magic game box. Watch the trailer." onLoad={hideStaticHero} />
            </a>
          }
        />
        <span className={styles.hint} aria-hidden="true">
          {/* drawn up and to the left, at the box */}
          <svg className={styles.hintArrow} viewBox="0 0 640 235">
            <path d="M425 228C430 140 330 62 216 15M262 3L216 14L246 50" />
          </svg>
          {verb} the box to learn more
        </span>
      </div>

      {/* phones: fixed along the bottom of the screen all the way down the home page (the navbar
          leaves its own off on the home page). Outside the hero, so the sections below it can't
          cover them; the wrapper carries the hero's state, so they appear once Bizz has spoken and
          make way while the trailer plays. */}
      {!isDesktop &&
        createPortal(
          <div className={`${spoken ? styles.spoken : ""} ${open ? styles.open : ""}`.trim() || undefined}>
            <div className={`${styles.ctas} ${styles.ctasBottom}`}>
              <BuyButton from="home_hero" animated compact icon="forward" variant="primary" color="red" text="Buy now!" />
              <DefaultButton
                compact
                icon="star"
                variant="primary"
                color="yellow"
                href="https://www.kickstarter.com/projects/pegasusgamesnyc/love-career-and-magic-the-second-season"
                text="Expansion!"
              />
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
