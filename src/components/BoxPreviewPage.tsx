import { useState } from "react";
import { Helmet } from "react-helmet";
import BoxViewer from "./utils/BoxViewer";
import BuyButton from "./utils/BuyButton";
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

  return (
    <div className="content">
      <Helmet>
        <meta name="robots" content="noindex" />
      </Helmet>
      <section className={`${styles.hero} ${open ? styles.open : ""}`.trim()}>
        <div className={styles.bg} aria-hidden="true" />
        <div className={styles.copy}>
          <header className={styles.head}>
            <h1 className={styles.title}>
              A party game where{" "}
              <span className="fantasyEmphasis">fantasy</span> meets reality TV!
            </h1>
            <p className={styles.facts}>
              <span>12 minutes</span>
              <span aria-hidden="true">·</span>
              <span>2–6 players</span>
              <span aria-hidden="true">·</span>
              <span>Ages 12+</span>
            </p>
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
          <img
            className={styles.scroll}
            src="/images/just_keep_scrolling.webp"
            alt="or just keep scrolling"
            draggable={false}
          />
        </div>

        <div className={styles.stageWrap}>
          <BoxViewer
            art={BOX}
            video={VIDEO}
            label="The Love, Career & Magic game box"
            still="/images/box/still.webp"
            onOpen={setOpen}
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
        </div>
      </section>
    </div>
  );
};

export default BoxPreviewPage;
