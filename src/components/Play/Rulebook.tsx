import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import Icon from "../utils/Icons";
import useDialogFocus from "../utils/useDialogFocus";
import { play } from "./sounds";
import styles from "../../css/pages/rulebook.module.css";

// The rulebook, always to hand in a room: a little book where the site's navbar would be. A tap brings
// up the printed rulebook's pages, one at a time, a pile of rounded cards: swipe (or drag) the top one
// away to turn it, or tap a page's edge, the arrows, the arrow keys. Anything else on the page can open
// it too (the phone's Rules button), with openRulebook().

const OPEN_EVENT = "lcm:open-rulebook";
// open it (at a section of it, or where it opens by default)
export const openRulebook = (section?: Section) => window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: section }));
// where it opens: the cover, or (while a game's on, set by the table) the game's rules
// (and while a game's on, the little book in the corner's gone: the phone has Rules)
let opensAt: Section | null = null;
const MODE_EVENT = "lcm:rulebook-mode";
export const rulebookOpensAt = (section: Section | null) => {
  opensAt = section;
  window.dispatchEvent(new Event(MODE_EVENT));
};

// the printed rulebook's pages (public/rulebook.pdf), a picture each: its cover first, then the rest
// in order (the picture and the quote inside the cover after it)
const ORDER = [3, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
const PAGES = ORDER.length;
const pageSrc = (n: number) => `/images/rulebook/${String(ORDER[n]).padStart(2, "0")}.webp`;

// the sections to go straight to: their first page (in the order above)
const SECTIONS = [
  { id: "setup", label: "Setup", page: 6 },
  { id: "rules", label: "Game rules", page: 7 },
  { id: "scoring", label: "Scoring", page: 8 },
  { id: "example", label: "Example round", page: 9 },
  { id: "remote", label: "R.E.M.O.T.E.", page: 11 },
  { id: "advanced", label: "Advanced", page: 12 },
] as const;
type Section = (typeof SECTIONS)[number]["id"];
const pageOf = (s: Section | null | undefined) => SECTIONS.find((x) => x.id === s)?.page ?? 0;
// the section a page is in
const sectionAt = (n: number) => [...SECTIONS].reverse().find((x) => x.page <= n)?.id ?? null;

// (the last page asks for a review: the game on BoardGameGeek, and our socials)
const BGG_URL = "https://boardgamegeek.com/boardgame/355824/love-career-and-magic";
const SOCIALS_URL = "https://linktr.ee/pegasusgames";

const TURN_MS = 420;
const OPEN_MS = 400;
// (how far a drag has to go to turn the page, in px)
const SWIPE = 60;

const Rulebook = () => {
  // closed → in (it comes up) → open → out (it goes)
  const [stage, setStage] = useState<"closed" | "in" | "open" | "out">("closed");
  const [view, setView] = useState(0);
  // a page on its way: the top one off to the left (forward), or the one before back on (back)
  const [flying, setFlying] = useState<1 | -1 | null>(null);
  // a drag under way: how far, in px
  const [drag, setDrag] = useState<number | null>(null);
  // zoomed in on the page: how far, and where to (dragged about, in px)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const unzoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  // (kept inside the page: it never shows past its edges)
  const clampPan = (p: { x: number; y: number }, z = zoom) => {
    const b = bookRef.current;
    const mx = b ? (b.clientWidth * (z - 1)) / 2 : 0, my = b ? (b.clientHeight * (z - 1)) / 2 : 0;
    return { x: Math.max(-mx, Math.min(mx, p.x)), y: Math.max(-my, Math.min(my, p.y)) };
  };
  const zoomBy = (to: number) => {
    const z = Math.max(1, Math.min(3, to));
    setZoom(z);
    setPan((p) => (z === 1 ? { x: 0, y: 0 } : clampPan(p, z)));
  };
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [inGame, setInGame] = useState(opensAt !== null);
  useEffect(() => {
    const on = () => setInGame(opensAt !== null);
    window.addEventListener(MODE_EVENT, on);
    return () => window.removeEventListener(MODE_EVENT, on);
  }, []);
  const bookRef = useRef<HTMLDivElement>(null);

  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const stageRef = useRef(stage);
  stageRef.current = stage;
  const open = useCallback((section?: Section | null) => {
    if (stageRef.current !== "closed") return;
    setView(pageOf(section ?? opensAt));
    stageRef.current = "in";
    setStage("in");
    play("whoosh");
    later(() => setStage("open"), OPEN_MS);
  }, []);
  const close = useCallback(() => {
    if (stageRef.current !== "open") return;
    stageRef.current = "out";
    setStage("out");
    play("whoosh");
    later(() => {
      setStage("closed");
      setView(0);
      unzoom();
    }, OPEN_MS);
  }, []);

  // (the first pages are fetched early, so they're there as it opens)
  useEffect(() => {
    const t = setTimeout(() => [0, 1].forEach((n) => (new Image().src = pageSrc(n))), 2500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const on = (e: Event) => open((e as CustomEvent<Section | undefined>).detail);
    window.addEventListener(OPEN_EVENT, on);
    return () => window.removeEventListener(OPEN_EVENT, on);
  }, [open]);

  // straight to a section: the page fades, and the section's first page is there
  const [jumping, setJumping] = useState(false);
  const jump = (n: number) => {
    if (flying || jumping || n === view) return;
    play("page");
    unzoom();
    setJumping(true);
    later(() => {
      setView(n);
      setJumping(false);
    }, 160);
  };

  const go = useCallback(
    (dir: 1 | -1) => {
      if (flying || stageRef.current !== "open") return setDrag(null);
      const next = view + dir;
      if (next < 0 || next >= PAGES) return setDrag(null);
      play("page");
      setDrag(null);
      unzoom();
      setFlying(dir);
      later(() => {
        setView(next);
        setFlying(null);
      }, TURN_MS);
    },
    [flying, view]
  );

  // a dialog while it's up: focus in it, Tab kept in it, Escape shuts it, and focus back where it was
  // once it's gone
  useDialogFocus(bookRef, close, { open: stage !== "closed" });
  // the arrows turn the pages; and the page behind doesn't scroll
  useEffect(() => {
    if (stage === "closed") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
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

  // a drag (a finger, or the mouse) moves the page with it; let go far enough and it turns
  // (zoomed in, a drag moves about the page instead)
  const start = useRef<{ x: number; y: number; id: number; pan: { x: number; y: number } } | null>(null);
  const dragged = useRef(false);
  const onPointerDown = (e: React.PointerEvent) => {
    if (flying || e.button !== 0) return;
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId, pan };
    dragged.current = false;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const s = start.current;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y;
    if (zoom > 1) {
      if (!dragged.current && Math.hypot(dx, dy) < 6) return;
      if (!dragged.current) (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      dragged.current = true;
      setPan(clampPan({ x: s.pan.x + dx, y: s.pan.y + dy }));
      return;
    }
    if (!dragged.current) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
      dragged.current = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    // (past the last page, or before the first, it gives a little and no more)
    const end = (dx < 0 && view >= PAGES - 1) || (dx > 0 && view === 0);
    setDrag(end ? dx * 0.2 : dx);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const s = start.current;
    start.current = null;
    if (!s || !dragged.current || zoom > 1) return;
    const dx = e.clientX - s.x;
    if (dx < -SWIPE) go(1);
    else if (dx > SWIPE) go(-1);
    else setDrag(null);
  };
  // the scroll wheel (or a trackpad's pinch, which comes as a wheel with ctrl) zooms in and out, about the
  // pointer: the point under it stays put
  const onWheel = (e: React.WheelEvent) => {
    if (flying) return;
    const b = bookRef.current?.getBoundingClientRect();
    if (!b) return;
    const z = Math.max(1, Math.min(3, zoom * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0025))));
    if (z === zoom) return;
    // (where the pointer is, from the book's middle)
    const px = e.clientX - (b.left + b.width / 2), py = e.clientY - (b.top + b.height / 2);
    const k = z / zoom;
    setZoom(z);
    setPan((p) => (z === 1 ? { x: 0, y: 0 } : clampPan({ x: px - (px - p.x) * k, y: py - (py - p.y) * k }, z)));
  };

  // (a drag isn't a tap on the page's edge too)
  const tap = (dir: 1 | -1) => () => {
    if (dragged.current) return (dragged.current = false);
    if (zoom > 1) return;
    go(dir);
  };

  // the pile: the page before (off to the left, for turning back), this one, and the next two under it
  const AWAY = "translateX(calc(-50vw - 100%)) rotate(-10deg)";
  const place = (n: number): { style: CSSProperties; cls: string } | null => {
    const d = n - view;
    const live = drag !== null; // (following the finger: no easing)
    const ease = live ? "none" : `transform ${TURN_MS}ms cubic-bezier(0.3, 0.7, 0.3, 1)`;
    if (d === -1) {
      // (comes back on as it's dragged right, or turned back)
      const t = flying === -1 ? "none" : drag !== null && drag > 0 && view > 0 ? `translateX(calc(-50vw - 100% + ${drag * 1.6}px)) rotate(${-10 + drag / 40}deg)` : AWAY;
      return { style: { transform: t, transition: ease, zIndex: 4 }, cls: "" };
    }
    if (d === 0) {
      const t =
        flying === 1
          ? AWAY
          : drag !== null && (drag < 0 || view === 0)
            ? `translateX(${drag}px) rotate(${drag / 60}deg)`
            : flying === -1
              ? "translate(6px, 6px) rotate(0.6deg)"
              : "none";
      return { style: { transform: t, transition: ease, zIndex: 3 }, cls: "" };
    }
    if (d === 1) return { style: { transition: ease, zIndex: 2, ...(flying === 1 ? { transform: "none", filter: "none" } : {}) }, cls: styles.under };
    if (d === 2) return { style: { transition: ease, zIndex: 1 }, cls: styles.under2 };
    return null;
  };

  const shown = stage !== "closed";

  return (
    <>
      {!inGame && (
      <button
        type="button"
        className={`${styles.launcher}${shown ? ` ${styles.launcherAway}` : ""}`}
        onClick={() => open()}
        aria-label="Open the rulebook"
        title="Rulebook"
      >
        <span className={styles.launcherBook} aria-hidden>
          <Icon name="rulebook" strokeWidth={2.2} />
        </span>
        <span className={styles.launcherText}>Rules</span>
      </button>
      )}

      {shown &&
        createPortal(
          <div className={`${styles.overlay} ${styles[stage]}`} onClick={close}>
            <div
              ref={bookRef}
              className={`${styles.book}${jumping ? ` ${styles.jumping}` : ""}`}
              role="dialog"
              aria-modal="true"
              aria-label="Rulebook"
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onWheel={onWheel}
            >
              {[view + 2, view + 1, view, view - 1].map((n) => {
                if (n < 0 || n >= PAGES) return null;
                const p = place(n);
                if (!p) return null;
                return (
                  <div key={n} className={`${styles.page}${p.cls ? ` ${p.cls}` : ""}`} style={p.style} aria-hidden={n !== view}>
                    <img
                      src={pageSrc(n)}
                      alt={n === view ? `Rulebook, page ${n + 1}` : ""}
                      width="1614"
                      height="906"
                      draggable={false}
                      decoding="async"
                      className={n === view && zoom > 1 ? styles.zoomed : undefined}
                      style={n === view ? { transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` } : undefined}
                      onDoubleClick={n === view ? () => (zoom > 1 ? unzoom() : zoomBy(2)) : undefined}
                    />
                    {/* the last page: a review, please (on the page, so it comes and goes with it) */}
                    {n === PAGES - 1 && (
                      <div className={styles.review} onPointerDown={(e) => e.stopPropagation()}>
                        <a className={styles.reviewButton} href={BGG_URL} target="_blank" rel="noreferrer" tabIndex={n === view ? 0 : -1}>
                          <Icon name="star" strokeWidth={2.2} />
                          <span className={styles.long}>Review us on BoardGameGeek</span>
                          <span className={styles.short}>Review on BGG</span>
                        </a>
                        <a className={`${styles.reviewButton} ${styles.reviewPlain}`} href={SOCIALS_URL} target="_blank" rel="noreferrer" tabIndex={n === view ? 0 : -1}>
                          <Icon name="share" strokeWidth={2.2} />
                          Follow us
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
              <button type="button" className={`${styles.edge} ${styles.edgePrev}`} onClick={tap(-1)} disabled={view === 0} aria-hidden tabIndex={-1} />
              <button type="button" className={`${styles.edge} ${styles.edgeNext}`} onClick={tap(1)} disabled={view >= PAGES - 1} aria-hidden tabIndex={-1} />

              {/* straight to a section */}
              <nav className={styles.sections} aria-label="Sections" onPointerDown={(e) => e.stopPropagation()}>
                {SECTIONS.map((x) => (
                  <button
                    key={x.id}
                    type="button"
                    className={`${styles.section}${sectionAt(view) === x.id ? ` ${styles.sectionOn}` : ""}`}
                    onClick={() => jump(x.page)}
                    aria-current={sectionAt(view) === x.id}
                  >
                    {x.label}
                  </button>
                ))}
              </nav>

              <div className={styles.bar}>
                <button type="button" className={styles.turn} onClick={() => go(-1)} disabled={view === 0} aria-label="Previous page">
                  <Icon name="prev" strokeWidth={2.6} />
                </button>
                <span className={styles.pageCount} aria-live="polite">
                  {view + 1} / {PAGES}
                </span>
                <button type="button" className={styles.turn} onClick={() => go(1)} disabled={view >= PAGES - 1} aria-label="Next page">
                  <Icon name="next" strokeWidth={2.6} />
                </button>
                <span className={styles.barGap} aria-hidden />
                <a className={styles.turn} href="/rulebook.pdf" target="_blank" rel="noreferrer" aria-label="The rulebook as a PDF (opens in a new tab)" title="Rulebook PDF">
                  <Icon name="download" strokeWidth={2.4} />
                </a>
                <button type="button" className={styles.turn} onClick={() => zoomBy(zoom - 0.5)} disabled={zoom <= 1} aria-label="Zoom out">
                  <Icon name="minus" strokeWidth={2.6} />
                </button>
                <button type="button" className={styles.turn} onClick={() => zoomBy(zoom + 0.5)} disabled={zoom >= 3} aria-label="Zoom in">
                  <Icon name="plus" strokeWidth={2.6} />
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
