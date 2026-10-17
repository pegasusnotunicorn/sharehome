import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { CardEdge, CardFaces, CardViewerApi } from "./cardViewer3d";
import { FETCH_FIRST, srcSet } from "./imageCopies";
import styles from "../../css/utils/cardViewer.module.css";

// A game card in 3D: drag to turn it any way (it turns back to rest when let go), scroll or pinch to
// zoom (cardViewer3d.ts).
// The 3D code loads only when the card is about to scroll into view. If the browser can't show it
// (no WebGL), `fallback` is shown instead.
interface CardViewerProps {
  mm: [number, number]; // the card's real size: width x height
  faces: () => Promise<CardFaces>;
  edge?: CardEdge;
  label: string;
  still?: string; // an image of the front, shown on the card's shape until the 3D card is in
  // or, better: a render of the 3D card at rest, as its canvas draws it (scripts/card-stills.mjs). Shown
  // until the 3D card is in, then swapped for it in one frame: no fade, nothing moves
  render?: string;
  renderSizes?: string; // how wide the card is shown, for `render`'s smaller copies
  fallback?: ReactNode;
  intro?: boolean; // its slow turn the first time it's on screen (default: yes)
  onReady?: () => void; // the 3D card's showing
  hold?: boolean; // left alone, it stays as it's left (doesn't turn or zoom back)
}

const CardViewer = ({ mm, faces, edge, label, still, render, renderSizes, fallback, intro, onReady, hold }: CardViewerProps) => {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const api = useRef<CardViewerApi | null>(null);
  const [failed, setFailed] = useState(false);
  const ready = useRef(onReady);
  ready.current = onReady;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let gone = false;
    const start = () => {
      import("./cardViewer3d")
        .then(({ mountCardViewer }) =>
          mountCardViewer(stage, { mm, faces, edge, intro, hold, onReady: () => !gone && ready.current?.(), onFail: () => !gone && setFailed(true) })
        )
        .then((a) => {
          if (gone) a?.destroy();
          else api.current = a;
        })
        .catch(() => !gone && setFailed(true));
    };
    let io: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          io?.disconnect();
          start();
        },
        { rootMargin: "300px" }
      );
      io.observe(stage);
    } else start();
    return () => {
      gone = true;
      io?.disconnect();
      api.current?.destroy();
      api.current = null;
    };
    // faces and mm describe one card; the parent remounts the viewer (key) for another card
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed && fallback) return <>{fallback}</>;

  return (
    <div className={styles.viewer}>
      <div
        ref={stageRef}
        className={styles.stage}
        tabIndex={0}
        role="group"
        aria-roledescription="3D card"
        aria-label={`${label}. Drag it, or use the arrow keys, to turn it any way; F turns it over. Plus and minus zoom.`}
      >
        {render ? (
          // (the canvas's size: the stage and the shadow's room below it, cardViewer3d.ts BELOW)
          <img className={styles.render} src={render} srcSet={srcSet(render)} sizes={renderSizes} alt="" aria-hidden="true" width={1120} height={1092} {...FETCH_FIRST} />
        ) : (
          <span className={styles.still} aria-hidden="true">
            <span className={styles.stillShadow} />
            <span
              className={styles.stillCard}
              style={{ aspectRatio: `${mm[0]} / ${mm[1]}`, backgroundImage: still ? `url("${still}")` : undefined }}
            />
          </span>
        )}
        <span className={styles.tools}>
          <button className={`${styles.tool} tap-area`} type="button" title="Zoom in (+, scroll or pinch)" aria-label="Zoom in" onClick={() => api.current?.zoom(1.4)}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M8 3.5v9M3.5 8h9" />
            </svg>
          </button>
          <button className={`${styles.tool} tap-area`} type="button" title="Zoom out (-)" aria-label="Zoom out" onClick={() => api.current?.zoom(0.714)}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M3.5 8h9" />
            </svg>
          </button>
          <button
            className={`${styles.tool} ${styles.straighten} tap-area`}
            type="button"
            title="Zoom back out (or double-click the card)"
            aria-label="Zoom back out"
            onClick={() => api.current?.reset()}
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2.5 8a5.5 5.5 0 1 0 1.6-3.9" />
              <path d="M2.5 2.5v3h3" />
            </svg>
          </button>
        </span>
      </div>
    </div>
  );
};

export default CardViewer;
