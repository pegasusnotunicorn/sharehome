import { useEffect, useRef, useState } from "react";
import { GsapFadeScrub } from "../utils/useGsap";
import { trackEvent } from "../utils/trackEvent";
import VideoPoster from "../utils/VideoPoster";
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

// how long a game plays for, from where it starts (the character introductions) to its end
const minutes = ({ start, length }: { start: number; length: number }) => `${Math.round((length - start) / 60)} min`;

// "Real players, real stories": one game on the big screen (it plays right there), and every game
// in a strip below to pick from.
export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const screenRef = useRef<HTMLDivElement>(null);
  const shown = PLAYTHROUGHS[current];

  // On narrow screens the games are a row that scrolls sideways: swipe it, drag it with the mouse,
  // or page through it with the arrows (greyed out at either end)
  const stripRef = useRef<HTMLUListElement>(null);
  const [ends, setEnds] = useState({ start: true, end: false });
  const measure = () => {
    const el = stripRef.current;
    if (!el) return;
    setEnds({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  };
  useEffect(() => {
    measure();
    addEventListener("resize", measure);
    return () => removeEventListener("resize", measure);
  }, []);
  const page = (dir: 1 | -1) => {
    const el = stripRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const onDown = (e: React.PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== "mouse" || !stripRef.current) return;
    drag.current = { x: e.clientX, left: stripRef.current.scrollLeft, moved: false };
  };
  const onDrag = (e: React.PointerEvent<HTMLUListElement>) => {
    const d = drag.current, el = stripRef.current;
    if (!d || !el) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 5) d.moved = true;
    if (d.moved) el.scrollLeft = d.left - dx;
  };
  const onUp = () => setTimeout(() => (drag.current = null)); // after the click it might end in

  const play = () => {
    setPlaying(true);
    trackEvent("playthrough_play", { game: shown.game });
  };
  // a game picked from the strip goes up on the big screen (playing, if one already was)
  const pick = (i: number) => {
    if (drag.current?.moved) return; // that was a drag, not a click
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
        <h2 className={styles.title}>Real players, real stories</h2>
        <p className={styles.lede}>Nine games at real tables. Pick one and watch it play out, from the character introductions.</p>
      </div>

      <div className={styles.screen} ref={screenRef}>
        <VideoPoster
          id={shown.id}
          start={shown.start}
          title={`Love, Career & Magic playthrough, game ${shown.game}`}
          label={`Play game ${shown.game}, from the character introductions`}
          poster={shown.thumb}
          posterWidth={1600}
          posterHeight={900}
          posterClassName={styles.crop}
          playing={playing}
          onPlay={play}
        >
          <span className={styles.caption} aria-hidden="true">
            <span className={styles.tableNo}>Game {shown.game}</span>
            <span>From the character introductions · {minutes(shown)}</span>
          </span>
        </VideoPoster>
      </div>

      <div className={styles.carousel}>
        <button
          type="button"
          className={`${styles.arrow} ${styles.prev} tap-area`}
          onClick={() => page(-1)}
          disabled={ends.start}
          aria-label="Earlier games"
        >
          <span aria-hidden="true">‹</span>
        </button>
        <ul
          ref={stripRef}
          className={styles.strip}
          aria-label="Pick a game"
          onScroll={measure}
          onPointerDown={onDown}
          onPointerMove={onDrag}
          onPointerUp={onUp}
          onPointerLeave={onUp}
        >
          {PLAYTHROUGHS.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                className={`${styles.thumb} ${i === current ? styles.active : ""}`}
                aria-pressed={i === current}
                aria-label={`Game ${p.game}`}
                onClick={() => pick(i)}
              >
                {/* (a small copy for the strip; the full one's only for the big screen) */}
                <img className={styles.crop} src={p.thumb.replace("/testimonials/", "/testimonials/thumbs/")} alt="" loading="lazy" width={400} height={225} />
                <span className={styles.thumbNo} aria-hidden="true">
                  {p.game}
                </span>
                <span className={styles.thumbTime} aria-hidden="true">
                  {minutes(p)}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className={`${styles.arrow} ${styles.next} tap-area`}
          onClick={() => page(1)}
          disabled={ends.end}
          aria-label="More games"
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>

      <a className={`${styles.more} tap-area`} href={`https://www.youtube.com/watch?v=${shown.id}&t=${shown.start}s`} target="_blank" rel="noreferrer">
        Open on YouTube <span aria-hidden="true">↗</span>
      </a>
    </GsapFadeScrub>
  );
}
