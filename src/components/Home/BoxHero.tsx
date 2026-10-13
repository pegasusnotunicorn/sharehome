import { useState } from "react";
import BoxViewer from "../utils/BoxViewer";
import BuyButton from "../utils/BuyButton";
import DefaultButton from "../utils/DefaultButton";
import ShoutBubble from "../utils/ShoutBubble";
import useWindowDimensions from "../utils/useWindowDimensions";
import type { BoxArt } from "../utils/box3d";
import styles from "../../css/pages/home/boxHero.module.css";

// The top of the home page: the game box in 3D, Bizz peeking over it to shout the title. Click the
// box and it opens to play the trailer inside.
const panels = (part: "lid" | "base") => ({
  top: `/images/box/${part}.webp`,
  near: `/images/box/${part}-near.webp`,
  far: `/images/box/${part}-far.webp`,
  left: `/images/box/${part}-left.webp`,
  right: `/images/box/${part}-right.webp`,
});
const BOX: BoxArt = { lid: panels("lid"), base: panels("base") };
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
  // Bizz's words appear once he's popped up to say them
  const [spoken, setSpoken] = useState(false);
  const { isDesktop } = useWindowDimensions();

  return (
    <section className={`${styles.hero} ${open ? styles.open : ""} ${spoken ? styles.spoken : ""}`.trim()}>
      <div className={styles.bg} aria-hidden="true" />
      <div className={styles.copy}>
        <header className={styles.head}>
          {/* Bizz says it: on wide screens he's to the right of the words, on phones below them */}
          <ShoutBubble side={isDesktop ? "right" : "bottom"} aim={0.2} reach={isDesktop ? 4.5 : 3} className={styles.bubble}>
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
            <BuyButton animated icon="forward" variant="primary" color="red" size="large" text="Buy now" />
          </div>
        )}
      </div>

      <div className={styles.stageWrap}>
        <BoxViewer
          art={BOX}
          video={VIDEO}
          label="The Love, Career & Magic game box"
          still="/images/box/still.webp"
          onOpen={(o) => {
            setOpen(o);
            onOpen?.(o);
          }}
          onStill={hideStaticHero}
          onPeek={(shown) => {
            if (shown) setSpoken(true);
          }}
          behind={<img className={styles.bizz} src="/images/box/bizz.webp" alt="" draggable={false} />}
          fallback={
            <a className={styles.fallback} href={`https://www.youtube.com/watch?v=${VIDEO.landscape}`} target="_blank" rel="noreferrer">
              <img src="/images/box/still.webp" alt="The Love, Career & Magic game box. Watch the trailer." onLoad={hideStaticHero} />
            </a>
          }
        />
        <img className={styles.hint} src="/images/box/click-hint.webp" alt="" aria-hidden="true" draggable={false} />
      </div>

      {/* phones: along the bottom, where the site's own buttons sit on other pages (the navbar
          leaves them off at the top of the home page) */}
      {!isDesktop && (
        <div className={`${styles.ctas} ${styles.ctasBottom}`}>
          <BuyButton animated compact icon="forward" variant="primary" color="red" text="Buy now!" />
          <DefaultButton
            compact
            icon="star"
            variant="primary"
            color="yellow"
            href="https://www.kickstarter.com/projects/pegasusgamesnyc/love-career-and-magic-the-second-season"
            text="Expansion!"
          />
        </div>
      )}
    </section>
  );
}
