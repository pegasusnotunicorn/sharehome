import { useRef, useState } from "react";
import { GsapFadeScrub } from "../utils/useGsap";
import { trackEvent } from "../utils/trackEvent";
import landingPageStyles from "../../css/landingPage.module.css";
import styles from "../../css/pages/home/playthroughs.module.css";

// Recorded games at real tables. The thumbnails are the videos' YouTube thumbnails; the banner baked
// into their top is cropped off here, so what shows is the players.
const PLAYTHROUGHS = [
  "Cpvz4dzRz2c",
  "ANDtl5Tgnmk",
  "Bh8wjBpwSYI",
  "p-oXROylaAc",
  "E6zQV_ni1pE",
  "AKcLhaALw8Q",
  "BKUpx-Z8mrs",
  "u_iFb02L0QY",
  "HOGt-U67PKc",
].map((id, i) => ({ id, table: i + 1, thumb: `/images/testimonials/playthrough${i + 1}.webp` }));

// "Real players, real stories": one table on the big screen (it plays right there), and every
// table in a strip below to pick from.
export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const screenRef = useRef<HTMLDivElement>(null);
  const shown = PLAYTHROUGHS[current];

  const play = () => {
    setPlaying(true);
    trackEvent("playthrough_play", { table: shown.table });
  };
  // a table picked from the strip goes up on the big screen (playing, if one already was)
  const pick = (i: number) => {
    if (i === current) return play();
    setCurrent(i);
    if (playing) trackEvent("playthrough_play", { table: PLAYTHROUGHS[i].table });
    if (screenRef.current && screenRef.current.getBoundingClientRect().top < 0)
      screenRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <GsapFadeScrub fadeIn className={`${landingPageStyles.mainpageContainer} ${styles.section}`}>
      <div className={styles.heading}>
        <p className={landingPageStyles.stepEyebrow}>Recorded at real tables</p>
        <h1 className={styles.title}>Real players, real stories</h1>
        <p className={styles.lede}>Nine tables of strangers, one game. Pick a table and watch how it played out.</p>
      </div>

      <div className={styles.screen} ref={screenRef}>
        {playing ? (
          <iframe
            key={shown.id}
            className={styles.video}
            src={`https://www.youtube-nocookie.com/embed/${shown.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title={`Love, Career & Magic playthrough, table ${shown.table}`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <button type="button" className={styles.poster} onClick={play} aria-label={`Play table ${shown.table}'s game`}>
            <img className={styles.crop} src={shown.thumb} alt="" />
            <span className={styles.shade} aria-hidden="true" />
            <span className={styles.play} aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
            </span>
            <span className={styles.caption} aria-hidden="true">
              <span className={styles.tableNo}>Table {shown.table}</span>
              <span>Watch the whole game</span>
            </span>
          </button>
        )}
      </div>

      <ul className={styles.strip} aria-label="Pick a table">
        {PLAYTHROUGHS.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              className={`${styles.thumb} ${i === current ? styles.active : ""}`}
              aria-pressed={i === current}
              aria-label={`Table ${p.table}`}
              onClick={() => pick(i)}
            >
              <img className={styles.crop} src={p.thumb} alt="" loading="lazy" />
              <span className={styles.thumbNo} aria-hidden="true">
                {p.table}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <a className={styles.more} href={`https://www.youtube.com/watch?v=${shown.id}`} target="_blank" rel="noreferrer">
        Open on YouTube <span aria-hidden="true">↗</span>
      </a>
    </GsapFadeScrub>
  );
}
