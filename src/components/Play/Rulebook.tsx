import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ARC_POINTS, EPISODES, EPISODE_SECONDS, RATINGS } from "../../../game-server/src/protocol";
import Icon from "../utils/Icons";
import { play } from "./sounds";
import styles from "../../css/pages/rulebook.module.css";

// The rulebook, always to hand in a room: a little book where the site's navbar would be. A tap slides
// the book in and swings its cover open; its pages turn (a tap on a page's edge, the arrows, a swipe).
// Anything else on the page can open it too (the phone's Rules button), with openRulebook().

const OPEN_EVENT = "lcm:open-rulebook";
export const openRulebook = () => window.dispatchEvent(new Event(OPEN_EVENT));

// #region--------------------------------------THE PAGES

interface Page {
  eyebrow: string;
  title: string;
  art?: ReactNode;
  body: ReactNode;
}

const Art = ({ src, w = 62, r = 0, x = 50, y = 50, kind }: { src: string; w?: number; r?: number; x?: number; y?: number; kind?: "token" | "line" }) => (
  <img
    src={src}
    alt=""
    draggable={false}
    loading="lazy"
    className={`${styles.art}${kind ? ` ${styles[kind]}` : ""}`}
    style={{ "--w": `${w}%`, "--r": `${r}deg`, "--x": `${x}%`, "--y": `${y}%` } as CSSProperties}
  />
);

const REMOTE = [
  ["Pause", "Let’s stop and talk.", "#e05a5a"],
  ["Play", "All good, carry on.", "#4f7fd1"],
  ["Rewind", "Take that last bit back.", "#e0962f"],
  ["Fast-forward", "Skip past this.", "#4f9a5a"],
  ["Instant replay", "More of that, please!", "#9a5fc0"],
  ["Frame by frame", "Slow down, go gently.", "#e06a3a"],
];

const PAGES: Page[] = [
  {
    eyebrow: "Welcome to the show",
    title: "You’re the cast",
    art: (
      <>
        <Art src="/images/pieces/characters/09.webp" w={58} r={-5} x={36} y={46} />
        <Art src="/images/pieces/characters/14.webp" w={58} r={4} x={64} y={56} />
      </>
    ),
    body: (
      <ul>
        <li>Improvise a reality TV show together, out loud.</li>
        <li>Pick a character, introduce yourself, and play them.</li>
        <li>Score points as a team for the season’s ratings.</li>
      </ul>
    ),
  },
  {
    eyebrow: "Each episode",
    title: `${EPISODES} episodes, ${EPISODE_SECONDS / 60} minutes each`,
    art: (
      <>
        <Art src="/images/pieces/episodes/back.webp" w={56} r={-7} x={40} y={46} />
        <Art src="/images/pieces/episodes/12.webp" w={62} r={4} x={58} y={54} />
      </>
    ),
    body: (
      <ul>
        <li>The episode card is where it all takes place.</li>
        <li>No turns: talk over each other, in real time.</li>
        <li>Between episodes, chat about what happened.</li>
      </ul>
    ),
  },
  {
    eyebrow: "Direction cards",
    title: "Do what the cards say",
    art: (
      <>
        <Art src="/images/pieces/director/07.webp" w={44} r={-8} x={30} y={50} />
        <Art src="/images/pieces/producer/15.webp" w={44} r={2} x={50} y={44} />
        <Art src="/images/pieces/showrunner/22.webp" w={44} r={9} x={70} y={52} />
      </>
    ),
    body: (
      <ul>
        <li>Narrate what your character does, then tap the card.</li>
        <li>
          <b>Director 1</b> · <b>Producer 2</b> · <b>Showrunner 3</b> points.
        </li>
        <li>Producer cards need someone else to answer “What happens?”</li>
      </ul>
    ),
  },
  {
    eyebrow: "Bonus points",
    title: "Tokens",
    art: (
      <>
        <Art src="/images/pieces/box/token-front.webp" kind="token" w={26} r={12} x={34} y={44} />
        <Art src="/images/pieces/box/token-back.webp" kind="token" w={26} r={-30} x={62} y={56} />
        <Art src="/images/pieces/box/token-front.webp" kind="token" w={20} r={70} x={52} y={28} />
      </>
    ),
    body: (
      <ul>
        <li>
          <b>Beaten to it?</b> Add a token to the played card (+1), and say it anyway.
        </li>
        <li>
          <b>Callbacks</b> (from episode 2): mention an earlier episode, tap it (+1).
        </li>
      </ul>
    ),
  },
  {
    eyebrow: "Character Arc",
    title: "Play your traits",
    art: (
      <>
        <Art src="/images/pieces/good-traits/04.webp" w={62} r={-4} x={46} y={30} />
        <Art src="/images/pieces/bad-traits/11.webp" w={62} r={3} x={54} y={50} />
        <Art src="/images/pieces/chaotic-traits/07.webp" w={62} r={-2} x={48} y={70} />
      </>
    ),
    body: (
      <ul>
        <li>Show off one of your traits each episode.</li>
        <li>When the table agrees, tap it at the episode’s end.</li>
        <li>
          All three is a Character Arc: <b>+{ARC_POINTS}</b>.
        </li>
      </ul>
    ),
  },
  {
    eyebrow: "Always",
    title: "Two golden rules",
    art: (
      <>
        <Art src="/images/illustrations/rules/commentatorpoint2.svg" kind="line" w={42} x={28} y={50} />
        <Art src="/images/illustrations/rules/reveal2.svg" kind="line" w={42} x={72} y={50} />
      </>
    ),
    body: (
      <ol className={styles.golden}>
        <li>
          <b>Everything must make sense,</b> however far-fetched.
        </li>
        <li>
          <b>“Yes, and…”</b> Whatever’s said is true, unless it contradicts something already said.
        </li>
      </ol>
    ),
  },
  {
    eyebrow: "Look after each other",
    title: "The R.E.M.O.T.E.",
    body: (
      <>
        <p className={styles.note}>Anyone can press a button on the phone’s Remote tab. No one’s told who, and everyone goes along with it.</p>
        <ul className={styles.remote}>
          {REMOTE.map(([label, text, color]) => (
            <li key={label} style={{ "--c": color } as CSSProperties}>
              <b>{label}</b>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    eyebrow: "The finale",
    title: "Your ratings",
    body: (
      <>
        <p className={styles.note}>All the points, divided by the number of players:</p>
        <ul className={styles.ratings}>
          {RATINGS.map(([min, name], i) => (
            <li key={min}>
              <span>{i === 0 ? `${min}+` : `${min}–${RATINGS[i - 1][0] - 1}`}</span>
              <b>{name}</b>
            </li>
          ))}
        </ul>
      </>
    ),
  },
];

const PageFace = ({ n }: { n: number }) => {
  const page = PAGES[n];
  if (!page) return <div className={`${styles.page} ${styles.blank}`} />;
  return (
    <div className={`${styles.page}${n % 2 ? ` ${styles.rightPage}` : ` ${styles.leftPage}`}`}>
      <p className={styles.eyebrow}>{page.eyebrow}</p>
      <h3 className={styles.title}>{page.title}</h3>
      {page.art && <div className={styles.artBox}>{page.art}</div>}
      <div className={styles.body}>{page.body}</div>
      <span className={styles.folio}>{n + 1}</span>
    </div>
  );
};

// #endregion

type Turn = { dir: 1 | -1; from: number };
const TURN_MS = 620;
const OPEN_MS = 900;

const useSpread = () => {
  const query = "(min-width: 820px)";
  const [two, setTwo] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setTwo(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return two;
};

const Rulebook = () => {
  // closed → opening (slides in, the cover swings open) → open → closing (the cover shuts, it slides out)
  const [stage, setStage] = useState<"closed" | "in" | "open" | "out">("closed");
  const [view, setView] = useState(0);
  const [turn, setTurn] = useState<Turn | null>(null);
  const two = useSpread();
  const per = two ? 2 : 1;
  const views = Math.ceil(PAGES.length / per);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const bookRef = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const stageRef = useRef(stage);
  stageRef.current = stage;
  const open = useCallback(() => {
    if (stageRef.current !== "closed") return;
    opener.current = document.activeElement as HTMLElement | null;
    stageRef.current = "in";
    setStage("in");
    play("whoosh");
    later(() => play("page"), 380);
    later(() => setStage("open"), OPEN_MS);
  }, []);
  const close = useCallback(() => {
    if (stageRef.current !== "open") return;
    stageRef.current = "out";
    setStage("out");
    play("page");
    later(() => {
      setStage("closed");
      setView(0);
      opener.current?.focus({ preventScroll: true });
    }, OPEN_MS);
  }, []);

  // (the cover's art is fetched early, so it's there as the book slides in)
  useEffect(() => {
    const t = setTimeout(() => (new Image().src = "/images/box/lid.webp"), 2500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, [open]);

  // a page spread at a time on a wide screen, a page at a time on a phone (the place kept as it switches)
  useEffect(() => setView((v) => Math.min(v, views - 1)), [views]);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (turn || stage !== "open") return;
      const next = view + dir;
      if (next < 0 || next >= views) return;
      play("page");
      setTurn({ dir, from: view });
      if (dir === 1) {
        // (forward: the page lifts and turns over to the left, the next one underneath)
        later(() => {
          setView(next);
          setTurn(null);
        }, TURN_MS);
      } else {
        setView(next);
        later(() => setTurn(null), TURN_MS);
      }
    },
    [turn, stage, view, views]
  );

  // the keys: Escape shuts it, the arrows turn the pages; and the page behind doesn't scroll
  useEffect(() => {
    if (stage === "closed") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    addEventListener("keydown", onKey);
    const root = document.documentElement, was = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      removeEventListener("keydown", onKey);
      root.style.overflow = was;
    };
  }, [stage, close, go]);
  useEffect(() => {
    if (stage === "open") bookRef.current?.focus({ preventScroll: true });
  }, [stage]);

  // a swipe turns a page
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY });
  const onTouchEnd = (e: React.TouchEvent) => {
    const t = touch.current;
    touch.current = null;
    if (!t) return;
    const dx = e.changedTouches[0].clientX - t.x, dy = e.changedTouches[0].clientY - t.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
  };

  // what lies on the book, and on the turning leaf (its front, and its back)
  let left: number | null, right: number;
  let leaf: { front: number | null; back: number | null } | null = null;
  if (two) {
    left = view * 2;
    right = view * 2 + 1;
    if (turn?.dir === 1) {
      right = turn.from * 2 + 3;
      leaf = { front: turn.from * 2 + 1, back: turn.from * 2 + 2 };
    } else if (turn?.dir === -1) {
      right = turn.from * 2 + 1;
      leaf = { front: view * 2 + 1, back: view * 2 + 2 };
    }
  } else {
    left = null;
    right = view;
    if (turn?.dir === 1) {
      right = turn.from + 1;
      leaf = { front: turn.from, back: null };
    } else if (turn?.dir === -1) {
      right = turn.from;
      leaf = { front: view, back: null };
    }
  }

  const shown = stage !== "closed";
  const page = two ? `${view * 2 + 1}–${Math.min(view * 2 + 2, PAGES.length)}` : `${view + 1}`;

  return (
    <>
      <button
        type="button"
        className={`${styles.launcher}${shown ? ` ${styles.launcherAway}` : ""}`}
        onClick={open}
        aria-label="Open the rulebook"
        title="Rulebook"
      >
        <span className={styles.launcherBook} aria-hidden>
          <Icon name="rulebook" strokeWidth={2.2} />
        </span>
        <span className={styles.launcherText}>Rules</span>
      </button>

      {shown &&
        createPortal(
          <div className={`${styles.overlay} ${styles[stage]}`} onClick={close}>
            <div
              ref={bookRef}
              className={`${styles.book}${two ? ` ${styles.two}` : ""}`}
              role="dialog"
              aria-modal="true"
              aria-label="Rulebook"
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <div className={styles.spine} aria-hidden />
              {two && (
                <div className={`${styles.half} ${styles.halfLeft}`} onClick={() => go(-1)}>
                  <PageFace n={left!} />
                </div>
              )}
              <div className={`${styles.half} ${styles.halfRight}`} onClick={() => go(1)}>
                <PageFace n={right} />
              </div>

              {leaf && (
                <div className={`${styles.leaf} ${turn!.dir === 1 ? styles.leafForward : styles.leafBack}`} aria-hidden>
                  <div className={styles.leafFront}>
                    <PageFace n={leaf.front ?? -1} />
                  </div>
                  <div className={styles.leafBackFace}>{two ? <PageFace n={leaf.back ?? -1} /> : <div className={`${styles.page} ${styles.blank}`} />}</div>
                </div>
              )}

              {/* the cover: shut while the book slides in, then it swings open */}
              <div className={styles.cover} aria-hidden>
                <div className={styles.coverFront}>
                  <img src="/images/box/lid.webp" alt="" className={styles.coverArt} draggable={false} />
                  <span className={styles.coverBand} />
                  <span className={styles.coverPlate}>
                    <span className={styles.coverWord}>Rulebook</span>
                    <span className={styles.coverEdition}>Online edition</span>
                  </span>
                </div>
                <div className={styles.coverInside} />
              </div>

              <div className={styles.bar}>
                <button type="button" className={styles.turn} onClick={() => go(-1)} disabled={view === 0} aria-label="Previous page">
                  <Icon name="prev" strokeWidth={2.6} />
                </button>
                <span className={styles.pageCount} aria-live="polite">
                  Page {page} of {PAGES.length}
                </span>
                <button type="button" className={styles.turn} onClick={() => go(1)} disabled={view >= views - 1} aria-label="Next page">
                  <Icon name="next" strokeWidth={2.6} />
                </button>
              </div>
              <button type="button" className={styles.close} onClick={close} aria-label="Close the rulebook">
                <Icon name="close" strokeWidth={2.6} />
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default Rulebook;
