import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { Link, useNavigate } from "react-router";
import CardTurn from "../utils/CardTurn";
import CardViewer from "../utils/CardViewer";
import type { CardRingApi } from "../utils/cardRing3d";
import { CHARACTER_CARD_MM, characterCardFaces } from "./characterCardFaces";
import { getAllCharacters } from "./Characters";
import type { CharacterWithNav } from "../../types/character";
import styles from "../../css/pages/characterProfile.module.css";

// a character's printed card front, by their place in the cast
const cardFront = (i: number) => `/images/pieces/characters/${String(i + 1).padStart(2, "0")}.webp`;

// The top of a character's page: who they are, over their card in 3D. Either side of it stand the cards
// of the characters round the cast from them, angled back like a rotary card file on its side
// (cardRing3d.ts): Prev / Next (or a click on one of them) swings them all round, the next card in to
// face you, and then it's that character's page. Below: their story and their hobbies side by side. On a
// phone the rest of their story waits behind a button.
const CharacterProfile = ({ character: c }: { character: CharacterWithNav }) => {
  const navigate = useNavigate();
  const [story, setStory] = useState(false);
  const work = (job: string, employer: string | false | undefined) => (employer ? `${job} at ${employer}` : job);
  const jobs = [work(c.job, c.employer), c.job2 && work(c.job2, c.employer2)].filter(Boolean).join(" · ");
  // (round the cast: the last one's next is the first)
  const all = getAllCharacters(), at = c.index - 1, n = all.length;
  const around = (k: number) => (at + k + n * 4) % n;
  const prev = all[around(-1)], next = all[around(1)];

  // the cards round the cast either side
  const ring = useRef<CardRingApi | null>(null);
  const ringEl = useRef<HTMLDivElement>(null);
  const viewerEl = useRef<HTMLDivElement>(null);
  // a turn under way, or just made: the viewer waits, hidden, until its card's in; the ring shows it
  const [swung, setSwung] = useState(false);
  const turning = useRef(false);
  useEffect(() => {
    const el = ringEl.current;
    if (!el) return;
    let gone = false;
    import("../utils/cardRing3d")
      .then(({ mountCardRing }) =>
        mountCardRing(el, {
          mm: CHARACTER_CARD_MM,
          viewer: () => viewerEl.current?.querySelector<HTMLElement>('[aria-roledescription="3D card"]') ?? null,
          onPick: (k) => goRef.current(k),
          onFail: () => {},
        })
      )
      .then((a) => {
        if (gone) return a?.destroy();
        ring.current = a;
        a?.set(fronts.current);
      })
      .catch(() => {});
    return () => {
      gone = true;
      ring.current?.destroy();
      ring.current = null;
    };
    // (one ring for the page; the cards on it change with the character)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const fronts = useRef<string[]>([]);
  fronts.current = [-3, -2, -1, 0, 1, 2, 3].map((k) => cardFront(around(k)));
  useEffect(() => {
    ring.current?.set(fronts.current);
    // (the cards change with the character)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.urlName]);

  // swing round `k` cards, then go to that character's page
  const go = async (k: number) => {
    if (turning.current) return;
    const to = all[around(k)];
    const r = ring.current;
    if (!r) return navigate(`/characters/${to.urlName}`);
    turning.current = true;
    setSwung(true);
    await r.turn(k);
    turning.current = false;
    navigate(`/characters/${to.urlName}`);
  };
  const goRef = useRef(go);
  goRef.current = go;
  const step = (to: typeof prev, dir: "prev" | "next") => (
    <Link
      to={`/characters/${to.urlName}`}
      onClick={(e: MouseEvent) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
        e.preventDefault();
        go(dir === "prev" ? -1 : 1);
      }}
      className={`${styles.step} ${styles[dir]}`}
      aria-label={`${dir === "prev" ? "Previous" : "Next"}: ${to.name}`}
    >
      <span className={styles.stepArrow} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d={dir === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
        </svg>
      </span>
      <span className={styles.stepName}>{to.name}</span>
    </Link>
  );
  // the new card's in: the viewer shows it, then the ring stops drawing it
  const ready = () => {
    if (!swung) return;
    setSwung(false);
    setTimeout(() => ring.current?.showMiddle(false), 260);
  };

  return (
    <article className={styles.profile} aria-labelledby="character-name">
      <div className={styles.topRow}>
        <Link to="/characters" className={styles.back}>
          <span aria-hidden="true">←</span> All characters
        </Link>
        <span className={styles.count}>
          {c.index} of {c.total}
        </span>
      </div>

      <header className={styles.head}>
        <p className={styles.eyebrow}>{c.title || `The ${c.race}`}</p>
        <h1 id="character-name" className={styles.name}>
          {c.name}
        </h1>
        <p className={styles.meta}>
          {c.age} years old · {jobs}
          {!c.employer && " (self employed)"}
        </p>
      </header>

      <div className={styles.stage}>
        <div ref={ringEl} className={styles.ring} />
        <div ref={viewerEl} className={`${styles.card} ${swung ? styles.cardAway : ""}`}>
          <CardViewer
            key={c.urlName}
            mm={CHARACTER_CARD_MM}
            edge="gold"
            faces={characterCardFaces(c)}
            label={`${c.name}'s card from Love, Career & Magic`}
            still={c.image.url}
            intro={!swung}
            onReady={ready}
            fallback={
              <CardTurn
                src={`/images/mockups/${c.urlName}.webp?v=2`}
                alt={`${c.name}'s card from Love, Career & Magic, front and back`}
              />
            }
          />
        </div>
        <div className={styles.steps}>
          {step(prev, "prev")}
          {step(next, "next")}
        </div>
      </div>

      <div className={styles.details}>
        <section className={styles.box} aria-labelledby="story-title">
          <h2 id="story-title" className={styles.label}>
            Their story
          </h2>
          <div className={`${styles.story} ${story ? styles.storyOpen : ""}`} id="character-story">
            {c.description.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
          {c.description.length > 1 && (
            <button
              type="button"
              className={styles.storyToggle}
              aria-expanded={story}
              aria-controls="character-story"
              onClick={() => setStory((s) => !s)}
            >
              {story ? "Show less" : "Read more"}
            </button>
          )}
        </section>

        <section className={styles.box} aria-labelledby="hobbies-title">
          <h2 id="hobbies-title" className={styles.label}>
            Hobbies
          </h2>
          <ul className={styles.hobbies}>
            {c.hobbies.map((h) => (
              <li key={h}>{h.trim()}</li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  );
};

export default CharacterProfile;
