import type { CSSProperties } from "react";
import styles from "../../css/pages/gameTable.module.css";

// The picnic on the tablecloth: little drawings of wine, fruit and snacks, in the room the seats
// leave free. Each spread sits in its own space beside the seats (it never covers them): with more
// players that space shrinks, and the drawings go away once they no longer fit.

const INK = "#3a3030";
const line = { stroke: INK, strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const Wine = () => (
  <svg viewBox="0 0 120 130" aria-hidden>
    <ellipse cx="62" cy="122" rx="44" ry="5" fill="rgba(30,40,70,.12)" />
    {/* the bottle */}
    <path d="M30 120V62c0-10 8-16 8-26V12h12v24c0 10 8 16 8 26v58z" fill="#7a2335" {...line} />
    <path d="M38 12h12" {...line} />
    <rect x="35" y="68" width="18" height="26" rx="3" fill="#fbf3dc" {...line} />
    <path d="M40 78h8M40 84h6" {...line} strokeWidth={1.6} />
    <path d="M36 50c2-6 4-9 4-14" stroke="rgba(255,255,255,.55)" strokeWidth="3" strokeLinecap="round" fill="none" />
    {/* the glass */}
    <path d="M70 58h30c0 16-6 26-15 26s-15-10-15-26z" fill="#fff" fillOpacity=".6" {...line} />
    <path d="M72 66h26c-1 10-6 16-13 16s-12-6-13-16z" fill="#b8344a" />
    <path d="M85 84v26M74 112h22" {...line} />
  </svg>
);

const Grapes = () => (
  <svg viewBox="0 0 110 120" aria-hidden>
    <ellipse cx="55" cy="112" rx="34" ry="5" fill="rgba(30,40,70,.12)" />
    <path d="M55 18c0-8 4-12 10-14" {...line} fill="none" />
    <path d="M58 16c10-10 26-8 30 0-10 6-22 6-30 0z" fill="#7cb36a" {...line} />
    {[
      [42, 30], [58, 30], [74, 32], [34, 46], [50, 46], [66, 46], [82, 48], [42, 62], [58, 62], [74, 62], [50, 77], [66, 77], [58, 92],
    ].map(([x, y], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r="9" fill={i % 3 ? "#8a5fb5" : "#7a4fa5"} {...line} />
        <circle cx={x - 3} cy={y - 3} r="2.2" fill="rgba(255,255,255,.6)" />
      </g>
    ))}
  </svg>
);

const Watermelon = () => (
  <svg viewBox="0 0 130 90" aria-hidden>
    <ellipse cx="65" cy="80" rx="52" ry="5" fill="rgba(30,40,70,.12)" />
    <path d="M12 22h106c0 32-24 52-53 52S12 54 12 22z" fill="#5f9f5a" {...line} />
    <path d="M20 22h90c-1 26-20 44-45 44S21 48 20 22z" fill="#f4f0d8" />
    <path d="M25 22h80c-2 22-19 38-40 38S27 44 25 22z" fill="#ef5b5b" />
    <path d="M12 22h106" {...line} />
    {[
      [48, 34], [64, 40], [80, 34], [56, 48], [74, 49],
    ].map(([x, y], i) => (
      <ellipse key={i} cx={x} cy={y} rx="2.2" ry="3.4" fill={INK} transform={`rotate(${i * 12 - 20} ${x} ${y})`} />
    ))}
  </svg>
);

const Cheese = () => (
  <svg viewBox="0 0 120 90" aria-hidden>
    <ellipse cx="60" cy="82" rx="46" ry="5" fill="rgba(30,40,70,.12)" />
    <path d="M14 70V44l88-26v52z" fill="#f6c94a" {...line} />
    <path d="M14 44l38-30 50 4z" fill="#fbe08a" {...line} />
    <circle cx="36" cy="56" r="6" fill="#e2ad2c" />
    <circle cx="66" cy="48" r="4" fill="#e2ad2c" />
    <circle cx="82" cy="60" r="7" fill="#e2ad2c" />
    <circle cx="52" cy="66" r="3" fill="#e2ad2c" />
  </svg>
);

const Strawberries = () => (
  <svg viewBox="0 0 120 90" aria-hidden>
    <ellipse cx="60" cy="82" rx="46" ry="5" fill="rgba(30,40,70,.12)" />
    {[
      [38, 46, -14],
      [76, 50, 12],
    ].map(([x, y, r], i) => (
      <g key={i} transform={`rotate(${r} ${x} ${y})`}>
        <path d={`M${x - 20} ${y - 10}c0-8 40-8 40 0 0 18-10 34-20 34s-20-16-20-34z`} fill="#e9474f" {...line} />
        <path d={`M${x - 16} ${y - 12}l6 6 4-8 6 8 4-8 6 8 6-6`} fill="#6faa58" {...line} />
        {[
          [-8, 2], [4, 0], [-2, 12], [8, 12], [-6, 20], [3, 24],
        ].map(([dx, dy], j) => (
          <ellipse key={j} cx={x + dx} cy={y + dy} rx="1.3" ry="2" fill="#ffe6a3" />
        ))}
      </g>
    ))}
  </svg>
);

const Sandwich = () => (
  <svg viewBox="0 0 120 90" aria-hidden>
    <ellipse cx="60" cy="82" rx="46" ry="5" fill="rgba(30,40,70,.12)" />
    <path d="M18 68l42-50 42 50z" fill="#f3dca8" {...line} />
    <path d="M24 62l36-42 36 42" fill="none" stroke="#9fc96b" strokeWidth="6" strokeLinejoin="round" />
    <path d="M30 60l30-34 30 34" fill="none" stroke="#e8645a" strokeWidth="5" strokeLinejoin="round" />
    <path d="M18 76l42-50 42 50z" fill="#f7e6bd" {...line} />
    <path d="M18 76l42-50 42 50" fill="none" stroke="#d9a75e" strokeWidth="4" strokeLinejoin="round" />
  </svg>
);

const Cookies = () => (
  <svg viewBox="0 0 120 90" aria-hidden>
    <ellipse cx="60" cy="82" rx="46" ry="5" fill="rgba(30,40,70,.12)" />
    {[
      [42, 52],
      [76, 44],
    ].map(([x, y], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r="22" fill="#d9a15e" {...line} />
        {[
          [-8, -6], [6, -10], [10, 6], [-4, 9], [-12, 6],
        ].map(([dx, dy], j) => (
          <circle key={j} cx={x + dx} cy={y + dy} r="3" fill="#5b3a26" />
        ))}
      </g>
    ))}
  </svg>
);

const SPREADS = {
  left: [Wine, Cheese],
  right: [Grapes, Watermelon],
  nearLeft: [Strawberries, Sandwich],
  nearRight: [Cookies, Grapes],
} as const;

const Picnic = ({ spread }: { spread: keyof typeof SPREADS }) => (
  <div className={styles.picnic} aria-hidden>
    <div className={styles.picnicItems}>
      {SPREADS[spread].map((Item, i) => (
        <span key={i} className={styles.picnicItem} style={{ "--r": `${i % 2 ? 6 : -5}deg` } as CSSProperties}>
          <Item />
        </span>
      ))}
    </div>
  </div>
);

export default Picnic;
