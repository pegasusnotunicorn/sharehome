import { useState } from "react";
import { Helmet } from "react-helmet";
import BoxViewer from "./utils/BoxViewer";
import BuyButton from "./utils/BuyButton";
import ShoutBubble from "./utils/ShoutBubble";
import useWindowDimensions from "./utils/useWindowDimensions";
import type { BoxArt } from "./utils/box3d";
import styles from "../css/pages/boxHero.module.css";

// A test page for a new top of the home page: the game box in 3D, which opens to play the trailer.
// Not linked from anywhere.
const panels = (part: "lid" | "base") => ({
  top: `/images/box/${part}.webp`,
  near: `/images/box/${part}-near.webp`,
  far: `/images/box/${part}-far.webp`,
  left: `/images/box/${part}-left.webp`,
  right: `/images/box/${part}-right.webp`,
});
const BOX: BoxArt = { lid: panels("lid"), base: panels("base") };
// the trailers the home page plays: wide on big screens, upright on phones
const VIDEO = { landscape: "EoQ2VTipXPA", portrait: "fNq9hS6DsTU" };

const BoxPreviewPage = () => {
  const [open, setOpen] = useState(false);
  // Bizz's words appear once he's popped up to say them
  const [spoken, setSpoken] = useState(false);
  const { isDesktop } = useWindowDimensions();

  return (
    <div className="content">
      <Helmet>
        <meta name="robots" content="noindex" />
      </Helmet>
      <section className={`${styles.hero} ${open ? styles.open : ""} ${spoken ? styles.spoken : ""}`.trim()}>
        <div className={styles.bg} aria-hidden="true" />
        <div className={styles.copy}>
          <header className={styles.head}>
            {/* Bizz says it: on wide screens he's to the right of the words, on phones below them */}
            <ShoutBubble
              side={isDesktop ? "right" : "bottom"}
              aim={isDesktop ? 0.2 : 0.2}
              reach={isDesktop ? 4.5 : 3}
              className={styles.bubble}
            >
              <h1 className={styles.title}>
                A party game where{" "}
                <span className="fantasyEmphasis">fantasy</span> meets reality
                TV!
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
          <div className={styles.ctas}>
            <BuyButton
              animated
              icon="forward"
              variant="primary"
              color="red"
              size="large"
              text="Buy now"
            />
          </div>
        </div>

        <div className={styles.stageWrap}>
          <BoxViewer
            art={BOX}
            video={VIDEO}
            label="The Love, Career & Magic game box"
            still="/images/box/still.webp"
            onOpen={setOpen}
            onPeek={(shown) => {
              if (shown) setSpoken(true);
            }}
            behind={
              <img
                className={styles.bizz}
                src="/images/box/bizz.webp"
                alt=""
                draggable={false}
              />
            }
            fallback={
              <a
                className={styles.fallback}
                href={`https://www.youtube.com/watch?v=${VIDEO.landscape}`}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src="/images/box_transparent.webp"
                  alt="The Love, Career & Magic game box. Watch the trailer."
                />
              </a>
            }
          />
          <img
            className={styles.hint}
            src="/images/box/click-hint.webp"
            alt=""
            aria-hidden="true"
            draggable={false}
          />
        </div>
      </section>
    </div>
  );
};

export default BoxPreviewPage;
