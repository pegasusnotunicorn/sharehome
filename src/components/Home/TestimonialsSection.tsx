import { useRef, useState } from "react";
import { GsapFadeScrub } from "../utils/useGsap";
import { trackEvent } from "../utils/trackEvent";
import landingPageStyles from "../../css/landingPage.module.css";
import styles from "../../css/pages/home/playthroughs.module.css";

// Recorded games at real tables, each played from its "Character introductions" chapter (where the
// game gets going; the times are from the chapters in each video's description). The thumbnails are
// the videos' YouTube thumbnails; the banner baked into their top is cropped off here, so what shows
// is the players.
const PLAYTHROUGHS = [
  { id: "Cpvz4dzRz2c", start: 121, length: 1162 },
  { id: "ANDtl5Tgnmk", start: 171, length: 1435 },
  { id: "Bh8wjBpwSYI", start: 147, length: 1157 },
  { id: "p-oXROylaAc", start: 163, length: 1140 },
  { id: "E6zQV_ni1pE", start: 150, length: 1065 },
  { id: "AKcLhaALw8Q", start: 132, length: 1041 },
  { id: "BKUpx-Z8mrs", start: 151, length: 881 },
  { id: "u_iFb02L0QY", start: 140, length: 937 },
  { id: "HOGt-U67PKc", start: 120, length: 745 },
].map((v, i) => ({ ...v, game: i + 1, thumb: `/images/testimonials/playthrough${i + 1}.webp` }));

const minutes = (s: number) => `${Math.round(s / 60)} min`;

// "Real players, real stories": one game on the big screen (it plays right there), and every game
// in a strip below to pick from.
export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const screenRef = useRef<HTMLDivElement>(null);
  const shown = PLAYTHROUGHS[current];

  const play = () => {
    setPlaying(true);
    trackEvent("playthrough_play", { game: shown.game });
  };
  // a game picked from the strip goes up on the big screen (playing, if one already was)
  const pick = (i: number) => {
    if (i === current) return play();
    setCurrent(i);
    if (playing) trackEvent("playthrough_play", { game: PLAYTHROUGHS[i].game });
    if (screenRef.current && screenRef.current.getBoundingClientRect().top < 0)
      screenRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <GsapFadeScrub fadeIn className={`${landingPageStyles.mainpageContainer} ${styles.section}`}>
      <div className={styles.heading}>
        <p className={landingPageStyles.stepEyebrow}>Recorded at real tables</p>
        <h1 className={styles.title}>Real players, real stories</h1>
        <p className={styles.lede}>Nine games at real tables. Pick one and watch it play out, from the character introductions.</p>
      </div>

      <div className={styles.screen} ref={screenRef}>
        {playing ? (
          <iframe
            key={shown.id}
            className={styles.video}
            src={`https://www.youtube-nocookie.com/embed/${shown.id}?start=${shown.start}&autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title={`Love, Career & Magic playthrough, game ${shown.game}`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <button type="button" className={styles.poster} onClick={play} aria-label={`Play game ${shown.game}, from the character introductions`}>
            <img className={styles.crop} src={shown.thumb} alt="" />
            <span className={styles.shade} aria-hidden="true" />
            <span className={styles.play} aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
            </span>
            <span className={styles.caption} aria-hidden="true">
              <span className={styles.tableNo}>Game {shown.game}</span>
              <span>From the character introductions · {minutes(shown.length - shown.start)}</span>
            </span>
          </button>
        )}
      </div>

      <ul className={styles.strip} aria-label="Pick a game">
        {PLAYTHROUGHS.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              className={`${styles.thumb} ${i === current ? styles.active : ""}`}
              aria-pressed={i === current}
              aria-label={`Game ${p.game}`}
              onClick={() => pick(i)}
            >
              <img className={styles.crop} src={p.thumb} alt="" loading="lazy" />
              <span className={styles.thumbNo} aria-hidden="true">
                {p.game}
              </span>
              <span className={styles.thumbTime} aria-hidden="true">
                {minutes(p.length)}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <a className={styles.more} href={`https://www.youtube.com/watch?v=${shown.id}&t=${shown.start}s`} target="_blank" rel="noreferrer">
        Open on YouTube <span aria-hidden="true">↗</span>
      </a>
    </GsapFadeScrub>
  );
}
