import { useState } from "react";
import { GsapFadeScrub } from "../utils/useGsap";
import { trackEvent } from "../utils/trackEvent";
import landingPageStyles from "../../css/landingPage.module.css";
import styles from "../../css/pages/home/playthroughs.module.css";
import smosh from "../../css/pages/home/smosh.module.css";

// Smosh Games played Love, Career & Magic on Board AF: the episode on the big screen (it plays right
// there), above "Real players, real stories". Its thumbnail is YouTube's (the full-size one, or the
// smaller one where a video has no full-size thumbnail).
const VIDEO = { id: "OrUfce-2eUU", title: "Our Magical Reality Show | Board AF: Love, Career, and Magic" };
const thumb = (size: "maxresdefault" | "hqdefault") => `https://i.ytimg.com/vi/${VIDEO.id}/${size}.jpg`;

export default function SmoshSection() {
  const [playing, setPlaying] = useState(false);
  const play = () => {
    setPlaying(true);
    trackEvent("smosh_play");
  };

  return (
    <GsapFadeScrub fadeIn className={`${landingPageStyles.mainpageContainer} ${styles.section} ${smosh.section}`}>
      <div className={styles.heading}>
        <p className={landingPageStyles.stepEyebrow}>As seen on Smosh Games</p>
        <h2 className={styles.title}>Smosh played it!</h2>
        <p className={styles.lede}>The Board AF crew turned Love, Career &amp; Magic into their own magical reality show.</p>
      </div>

      <div className={styles.screen}>
        {playing ? (
          <iframe
            className={styles.video}
            src={`https://www.youtube-nocookie.com/embed/${VIDEO.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title={VIDEO.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <button type="button" className={styles.poster} onClick={play} aria-label={`Play “${VIDEO.title}” from Smosh Games`}>
            <img
              className={smosh.thumb}
              src={thumb("maxresdefault")}
              alt="Smosh Games playing Love, Career & Magic"
              loading="lazy"
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.src.includes("hqdefault")) img.src = thumb("hqdefault");
              }}
            />
            <span className={styles.shade} aria-hidden="true" />
            <span className={smosh.views} aria-hidden="true">
              900K+ views
            </span>
            <span className={styles.play} aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
            </span>
            <span className={styles.caption} aria-hidden="true">
              <span className={styles.tableNo}>Board AF</span>
              <span>Smosh Games · Our Magical Reality Show</span>
            </span>
          </button>
        )}
      </div>
      <a className={`${styles.more} tap-area`} href={`https://www.youtube.com/watch?v=${VIDEO.id}`} target="_blank" rel="noreferrer">
        Open on YouTube <span aria-hidden="true">↗</span>
      </a>
    </GsapFadeScrub>
  );
}
