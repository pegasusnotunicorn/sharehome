import { useEffect, useRef, useState } from "react";
import styles from "../../css/utils/cardTurn.module.css";

// One card turning around (front, edge, back), from a mockup sprite: 24 views, 8 across and 3 down,
// view 0 a three-quarter view of the front. Made in Blender (LCM repo: marketing/video/tools/blender).
// It turns slowly by itself until someone drags it; it stays still for visitors who asked for less motion.
const FRAMES = 24;
const COLS = 8;
const ROWS = FRAMES / COLS;
const PX_PER_FRAME = 12;
const SPIN_MS = 120;

interface CardTurnProps {
  src: string;
  alt: string;
}

const CardTurn = ({ src, alt }: CardTurnProps) => {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);
  const [frame, setFrame] = useState(0);
  const [touched, setTouched] = useState(false);
  const drag = useRef<{ x: number; f: number } | null>(null);

  // load the sprite only when the card is about to scroll into view
  useEffect(() => {
    const el = boxRef.current;
    if (!el || near) return;
    if (!("IntersectionObserver" in window)) {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  useEffect(() => {
    if (!near) return;
    setReady(false);
    const im = new Image();
    im.onload = () => setReady(true);
    im.src = src;
  }, [near, src]);

  // a slow turn until someone takes over
  useEffect(() => {
    if (!ready || touched) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setFrame((f) => (f + 1) % FRAMES), SPIN_MS);
    return () => clearInterval(t);
  }, [ready, touched]);

  const wrap = (f: number) => ((Math.round(f) % FRAMES) + FRAMES) % FRAMES;

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!ready) return;
    setTouched(true);
    drag.current = { x: e.clientX, f: frame };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    setFrame(wrap(drag.current.f - (e.clientX - drag.current.x) / PX_PER_FRAME));
  };
  const onPointerUp = () => {
    drag.current = null;
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    setTouched(true);
    setFrame((f) => wrap(f + (e.key === "ArrowRight" ? -1 : 1)));
  };

  const col = frame % COLS;
  const row = Math.floor(frame / COLS);
  return (
    <div
      ref={boxRef}
      className={`${styles.stage} ${ready ? styles.ready : ""} ${touched ? styles.touched : ""}`}
      role="img"
      aria-label={`${alt}. Drag, or use the arrow keys, to turn it.`}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      style={
        ready
          ? {
              backgroundImage: `url("${src}")`,
              backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
              backgroundPosition: `${(col / (COLS - 1)) * 100}% ${(row / (ROWS - 1)) * 100}%`,
            }
          : undefined
      }
    >
      {!ready && <span className={styles.loading} aria-hidden="true" />}
      <span className={`${styles.hint} noselect`} aria-hidden="true">
        <img src="/images/icons/drag.svg" alt="" />
        Drag to turn
      </span>
    </div>
  );
};

export default CardTurn;
