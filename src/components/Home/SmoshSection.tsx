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
              940K+ views
            </span>
            {/* YouTube's own play button, so it reads as a YouTube video */}
            <span className={smosh.ytPlay} aria-hidden="true">
              <svg viewBox="0 0 68 48">
                <path className={smosh.ytPlayBg} d="M66.5 7.7c-.8-2.9-2.5-5.4-5.4-6.2C55.8.1 34 0 34 0S12.2.1 6.9 1.6C4 2.3 2.3 4.8 1.5 7.7.1 13 0 24 0 24s.1 11 1.5 16.3c.8 2.9 2.5 5.4 5.4 6.2C12.2 47.9 34 48 34 48s21.8-.1 27.1-1.6c2.9-.8 4.6-3.3 5.4-6.2C67.9 35 68 24 68 24s-.1-11-1.5-16.3z" />
                <path d="M45 24 27 14v20z" fill="#fff" />
              </svg>
            </span>
            <span className={styles.caption} aria-hidden="true">
              <span className={styles.tableNo}>Board AF</span>
              <span>Smosh Games · Our Magical Reality Show</span>
            </span>
          </button>
        )}
      </div>
    </GsapFadeScrub>
  );
}
