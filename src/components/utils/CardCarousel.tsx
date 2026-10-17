import { useEffect, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { Link } from "react-router";
import CardViewer from "./CardViewer";
import type { CardRingApi } from "./cardRing3d";
import styles from "../../css/utils/cardCarousel.module.css";

// A deck of cards to go through one at a time, in 3D: the card on show in the middle (CardViewer: drag
// to turn it, zoom it), and either side of it the cards round the deck from it, angled back like a
// rotary card file on its side (cardRing3d.ts). Prev / Next (or a click on a card at the side) swings
// them all round, the next card in to face you. Round the deck: the last one's next is the first.
// It shows card `index`; a turn tells `onTurn` which card it came round to, and the page shows that
// one next (its own index, or another page). The character pages and the game's character picker use it.

// (how long the picture a 3D card shows while it loads takes to fade: cardViewer.module.css .still)
const STILL_FADE_MS = 450;
// (how wide the card on show is, by default: for its render's smaller copies)
const CARD_SIZES = "(max-width: 592px) 100vw, 560px";

interface CardCarouselProps {
  index: number;
  count: number;
  mm: [number, number]; // the cards' real size: width x height
  front: (i: number) => string;
  back: (i: number) => string;
  // a render of the card at rest (CardViewer `render`), shown until the 3D card is in: for the card the
  // page opens on (a card turned to is brought in by the ring, so needs none)
  render?: (i: number) => string;
  name: (i: number) => string; // for Prev / Next
  label: (i: number) => string; // the card on show, for screen readers
  href?: (i: number) => string; // Prev / Next as links (a page per card)
  fallback?: (i: number) => ReactNode; // shown where 3D can't be
  onTurnStart?: (to: number) => void;
  onTurn: (to: number) => void;
  // the arrow keys turn it too (where it's the only thing on screen)
  keys?: boolean;
  // the card on show stays as it's left when let go (doesn't turn or zoom back to rest)
  hold?: boolean;
  // how wide the card on show is (default: up to 560px)
  cardWidth?: string;
  className?: string;
}

const CardCarousel = ({ index, count, mm, front, back, render, name, label, href, fallback, onTurnStart, onTurn, keys, hold, cardWidth, className }: CardCarouselProps) => {
  const around = (k: number) => (index + k + count * 4) % count;

  const ring = useRef<CardRingApi | null>(null);
  const ringEl = useRef<HTMLDivElement>(null);
  const viewerEl = useRef<HTMLDivElement>(null);
  // a turn under way, or just made: the viewer waits, hidden, until its card's in; the ring shows it
  const [swung, setSwung] = useState(false);
  // Prev / Next fade out while the cards swing round, and back in for the next card
  const [hush, setHush] = useState(false);
  const turning = useRef(false);
  const opened = useRef(index);
  const handover = useRef(0);
  useEffect(() => () => clearTimeout(handover.current), []);

  const fronts = useRef<string[]>([]);
  fronts.current = [-4, -3, -2, -1, 0, 1, 2, 3, 4].map((k) => front(around(k)));

  useEffect(() => {
    const el = ringEl.current;
    if (!el) return;
    let gone = false;
    import("./cardRing3d")
      .then(({ mountCardRing }) =>
        mountCardRing(el, {
          mm,
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
    // (one ring; the cards on it change with the card on show)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    ring.current?.set(fronts.current);
    turning.current = false; // (the cards are round this one now: the next turn can start)
  }, [index]);

  // swing round `k` cards, then it's that card's turn to be on show
  const go = async (k: number) => {
    if (turning.current || !k) return;
    const to = around(k);
    const r = ring.current;
    onTurnStart?.(to);
    if (!r) return onTurn(to);
    turning.current = true;
    clearTimeout(handover.current); // (a card that came in just now is already on its way out)
    setHush(true);
    const turned = r.turn(k); // (the ring draws the middle card from here, this frame...)
    if (viewerEl.current) viewerEl.current.style.opacity = "0"; // (...as the viewer goes)
    setSwung(true);
    await turned;
    if (!ring.current) return; // (gone meanwhile)
    // (still "turning" until the cards are round the next one: a click before then would start a
    // turn they'd cut short)
    onTurn(to);
    requestAnimationFrame(() => setHush(false));
  };
  const goRef = useRef(go);
  goRef.current = go;

  useEffect(() => {
    if (!keys) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goRef.current(-1);
      else if (e.key === "ArrowRight") goRef.current(1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [keys]);

  // the new card's in: once the picture shown while it loaded has faded from under it, the viewer shows
  // it and the ring stops drawing it, in the same frame (the same card, in the same place, lit the same:
  // no change you can see)
  const ready = () => {
    if (!swung) return;
    clearTimeout(handover.current);
    handover.current = window.setTimeout(() => {
      // (not mid-swing: another click turned the cards on before this one came in)
      if (turning.current) return;
      if (viewerEl.current) viewerEl.current.style.opacity = "";
      ring.current?.showMiddle(false);
      setSwung(false);
    }, STILL_FADE_MS);
  };

  const step = (dir: -1 | 1) => {
    const to = around(dir);
    const body = (
      <>
        <span className={styles.stepArrow} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d={dir < 0 ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
          </svg>
        </span>
        <span className={styles.stepName}>{name(to)}</span>
      </>
    );
    const cls = `${styles.step}${dir > 0 ? ` ${styles.next}` : ""} tap-area`;
    const aria = `${dir < 0 ? "Previous" : "Next"}: ${name(to)}`;
    return href ? (
      <Link
        to={href(to)}
        onClick={(e: MouseEvent) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
          e.preventDefault();
          go(dir);
        }}
        className={cls}
        aria-label={aria}
      >
        {body}
      </Link>
    ) : (
      <button type="button" onClick={() => go(dir)} className={cls} aria-label={aria}>
        {body}
      </button>
    );
  };

  return (
    <div className={`${styles.stage}${className ? ` ${className}` : ""}`}>
      <div ref={ringEl} className={styles.ring} />
      <div
        ref={viewerEl}
        className={`${styles.card} ${swung ? styles.cardAway : ""} ${hush || swung ? styles.toolsAway : ""}`}
        style={cardWidth ? { width: cardWidth } : undefined}
      >
        <CardViewer
          key={index}
          mm={mm}
          edge="gold"
          faces={async () => ({ front: front(index), back: back(index) })}
          label={label(index)}
          still={front(index)}
          render={index === opened.current ? render?.(index) : undefined}
          renderSizes={cardWidth ? undefined : CARD_SIZES}
          intro={!swung}
          onReady={ready}
          hold={hold}
          fallback={fallback?.(index)}
        />
      </div>
      <div className={`${styles.steps} ${hush ? styles.hushed : ""}`}>
        {step(-1)}
        {step(1)}
      </div>
    </div>
  );
};

export default CardCarousel;
