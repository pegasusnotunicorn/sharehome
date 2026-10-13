import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import styles from "../../css/utils/shoutBubble.module.css";

// A comic shout bubble, drawn in pencil: a box with a row of spikes along one side, the longest
// pointing at whoever's shouting (`aim`, 0..1 along that side), or (side "none") just the box. It's
// drawn to fit its content.
interface ShoutBubbleProps {
  side: "bottom" | "right" | "none";
  aim?: number;
  className?: string;
  children: ReactNode;
}

// spike depths along the side, like the hand-drawn ones (the longest is placed at `aim`)
const PATTERN = [0.62, 0.8, 0.55, 0.9, 0.68, 0.75, 0.58, 0.85, 0.66];

function outline(side: "bottom" | "right" | "none", w: number, h: number, aim: number, depth: number) {
  if (side === "none") return pencil([[0, 0], [w, 0], [w, h], [0, h]]);
  const along = side === "bottom" ? w : h;
  const n = Math.max(4, Math.round(along / 62));
  const a0 = along * 0.06, a1 = along * 0.94, step = (a1 - a0) / n;
  const longest = Math.min(n - 1, Math.max(0, Math.floor((aim * along - a0) / step)));
  const pts: [number, number][] = [];
  // valleys sit on the edge, peaks stand out from it
  for (let i = 0; i <= n; i++) {
    const v = a1 - i * step; // run back along the side
    pts.push(side === "bottom" ? [v, h] : [w, v]);
    if (i < n) {
      const k = n - 1 - i, d = depth * (k === longest ? 1.5 : PATTERN[k % PATTERN.length]);
      // the tips lean a little; the longest leans toward the start of the side (up, on the right)
      const m = v - step / 2 + (k === longest ? (side === "right" ? -0.9 : 0) : (k % 2 ? 0.12 : -0.12)) * step;
      pts.push(side === "bottom" ? [m, h + d] : [w + d, m]);
    }
  }
  const corner = 0.035 * along; // the side steps in a touch at each end, like the drawn bubble
  const body =
    side === "bottom"
      ? [[0, 0], [w, 0], [w, h - corner], [a1, h], ...pts.slice(1, -1), [a0, h], [0, h - corner]]
      : [[0, 0], [w - corner, 0], [w, a0], ...pts.slice(1, -1).reverse(), [w, a1], [w - corner, h], [0, h]];
  return pencil(body as [number, number][]);
}

// a closed outline drawn by hand: each long edge wobbles a touch (the same wobble every time)
function pencil(pts: [number, number][]) {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
  const out: string[] = [];
  pts.forEach(([x0, y0], i) => {
    const [x1, y1] = pts[(i + 1) % pts.length], len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(1, Math.round(len / 26)), nx = -(y1 - y0) / len, ny = (x1 - x0) / len;
    out.push(`${x0.toFixed(1)},${y0.toFixed(1)}`);
    for (let k = 1; k < n; k++) {
      const t = k / n, j = rnd() * 1.1;
      out.push(`${(x0 + (x1 - x0) * t + nx * j).toFixed(1)},${(y0 + (y1 - y0) * t + ny * j).toFixed(1)}`);
    }
  });
  return "M" + out.join("L") + "Z";
}

const ShoutBubble = ({ side, aim = 0.5, className, children }: ShoutBubbleProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<[number, number] | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize([el.offsetWidth, el.offsetHeight]));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const depth = 30, pad = 6; // pad: room for the pencil line
  const d = size ? outline(side, size[0], size[1], aim, depth) : "";
  return (
    <div ref={ref} className={`${styles.bubble} ${className ?? ""}`.trim()}>
      {size && (
        <svg
          className={styles.shape}
          aria-hidden="true"
          style={{
            left: -pad,
            top: -pad,
            width: size[0] + 2 * pad + (side === "right" ? depth * 1.6 : 0),
            height: size[1] + 2 * pad + (side === "bottom" ? depth * 1.6 : 0),
          }}
        >
          <g transform={`translate(${pad} ${pad})`}>
            <path d={d} />
            {/* a second, lighter pass of the pencil, just off the first */}
            <path className={styles.second} d={d} transform="translate(0.8 0.6)" />
          </g>
        </svg>
      )}
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default ShoutBubble;
