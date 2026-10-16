import type { CSSProperties, ReactNode } from "react";
import styles from "../../css/pages/gameTable.module.css";

// The picnic on the tablecloth: little watercolour paintings of wine, fruit and snacks, in the room
// the seats leave free. Each spread sits in its own space beside the seats (it never covers them):
// with more players that space shrinks, and the paintings go away once they no longer fit.
//
// The look is made with SVG filters (PicnicPaint, once on the page): each wash is a soft shape whose
// edge wobbles and darkens where the pigment pools, on a little paper grain, with a loose pencil line.

// the paint: washes (soft, wobbly, pooled at the edge), and a pencil line (thin and a little shaky)
export const PicnicPaint = () => (
  <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
    <defs>
      <filter id="lcm-wash" x="-15%" y="-15%" width="130%" height="130%">
        <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="4" result="wobble" />
        <feDisplacementMap in="SourceGraphic" in2="wobble" scale="7" xChannelSelector="R" yChannelSelector="G" result="shape" />
        <feGaussianBlur in="shape" stdDeviation="0.6" result="soft" />
        {/* pigment pooled at the rim of the wash */}
        <feMorphology in="soft" operator="erode" radius="2.2" result="inner" />
        <feComposite in="soft" in2="inner" operator="out" result="rim" />
        <feColorMatrix in="rim" type="matrix" values="0.72 0 0 0 0  0 0.72 0 0 0  0 0 0.78 0 0  0 0 0 0.75 0" result="rimDark" />
        {/* blooms: the colour uneven across the wash */}
        <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="9" result="bloom" />
        <feColorMatrix in="bloom" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -1 0.55" result="light" />
        <feComposite in="light" in2="soft" operator="in" result="lightIn" />
        <feMerge result="paint">
          <feMergeNode in="soft" />
          <feMergeNode in="lightIn" />
          <feMergeNode in="rimDark" />
        </feMerge>
        {/* the paper's grain showing through */}
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="1" seed="2" result="grain" />
        <feColorMatrix in="grain" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -0.45 0.16" result="grainW" />
        <feComposite in="grainW" in2="paint" operator="in" result="grainIn" />
        <feMerge>
          <feMergeNode in="paint" />
          <feMergeNode in="grainIn" />
        </feMerge>
      </filter>
      <filter id="lcm-pencil" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" seed="7" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id="lcm-shadow" x="-20%" y="-50%" width="140%" height="200%">
        <feGaussianBlur stdDeviation="3" />
      </filter>
    </defs>
  </svg>
);

const Wash = ({ children, opacity = 0.9 }: { children: ReactNode; opacity?: number }) => (
  <g filter="url(#lcm-wash)" opacity={opacity}>
    {children}
  </g>
);

const Pencil = ({ d }: { d: string }) => (
  <path
    d={d}
    fill="none"
    stroke="#5a4a44"
    strokeOpacity="0.55"
    strokeWidth="1.1"
    strokeLinecap="round"
    strokeLinejoin="round"
    filter="url(#lcm-pencil)"
  />
);

const Shadow = ({ cx, cy, rx }: { cx: number; cy: number; rx: number }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.14} fill="#3b4a78" opacity="0.18" filter="url(#lcm-shadow)" />
);

const Wine = () => (
  <svg viewBox="0 0 140 150" aria-hidden>
    <Shadow cx={74} cy={140} rx={52} />
    {/* bottle */}
    <Wash>
      <path d="M34 138c-2-26-2-52 0-72 2-12 10-18 11-30l1-26h12l1 26c1 12 9 18 11 30 2 20 2 46 0 72z" fill="#7d2a3c" />
    </Wash>
    <Wash opacity={0.8}>
      <path d="M42 20c0-6 0-9 1-12h12c1 3 1 6 1 12z" fill="#c9a24a" />
    </Wash>
    <Wash opacity={0.95}>
      <path d="M38 78c6-2 22-2 28 0l-1 30c-6 2-20 2-26 0z" fill="#f5e7c4" />
    </Wash>
    <Wash opacity={0.55}>
      <path d="M41 88c6-1 16-1 21 0M42 96c5-1 13-1 18 0" stroke="#b5485a" strokeWidth="3" fill="none" />
    </Wash>
    <path d="M40 46c-2 10-3 20-2 28" stroke="#fff" strokeOpacity=".5" strokeWidth="4" strokeLinecap="round" fill="none" />
    <Pencil d="M34 138c-2-26-2-52 0-72 2-12 10-18 11-30l1-26h12l1 26c1 12 9 18 11 30 2 20 2 46 0 72z" />
    {/* glass */}
    <Wash opacity={0.35}>
      <path d="M86 62h34c0 20-7 32-17 32s-17-12-17-32z" fill="#cfe3f0" />
    </Wash>
    <Wash>
      <path d="M88 74h30c-2 13-8 19-15 19s-13-6-15-19z" fill="#a8304a" />
    </Wash>
    <Pencil d="M86 62h34c0 20-7 32-17 32s-17-12-17-32zM103 94v32M90 128c8-3 18-3 26 0" />
    <path d="M91 68c0 6 1 10 3 14" stroke="#fff" strokeOpacity=".7" strokeWidth="2.5" strokeLinecap="round" fill="none" />
  </svg>
);

const Cheese = () => (
  <svg viewBox="0 0 140 100" aria-hidden>
    <Shadow cx={70} cy={88} rx={54} />
    <Wash>
      <path d="M16 78l2-30 106-28-2 58z" fill="#f2c14e" />
    </Wash>
    <Wash opacity={0.85}>
      <path d="M18 48l48-34 58 6z" fill="#f8dc8c" />
    </Wash>
    <Wash opacity={0.7}>
      <circle cx="42" cy="60" r="7" fill="#d9a22c" />
      <circle cx="76" cy="52" r="5" fill="#d9a22c" />
      <circle cx="98" cy="64" r="8" fill="#d9a22c" />
      <circle cx="60" cy="71" r="3.5" fill="#d9a22c" />
    </Wash>
    <Pencil d="M16 78l2-30 106-28-2 58zM18 48l48-34 58 6" />
  </svg>
);

const Grapes = () => {
  const grapes = [
    [48, 38], [64, 36], [80, 40], [40, 54], [56, 54], [72, 54], [88, 58], [48, 70], [64, 70], [80, 72], [56, 86], [72, 86], [64, 101],
  ];
  return (
    <svg viewBox="0 0 130 130" aria-hidden>
      <Shadow cx={66} cy={122} rx={40} />
      <Wash opacity={0.85}>
        <path d="M66 26c8-14 30-16 38-4-12 10-28 10-38 4z" fill="#7fb069" />
      </Wash>
      <Pencil d="M64 30c0-10 3-16 8-20M66 26c8-14 30-16 38-4-12 10-28 10-38 4z" />
      {grapes.map(([x, y], i) => (
        <Wash key={i} opacity={0.82}>
          <circle cx={x} cy={y} r="10" fill={["#7b5ca8", "#8d6cbb", "#6d4f98"][i % 3]} />
        </Wash>
      ))}
      {grapes.map(([x, y], i) => (
        <circle key={i} cx={x - 3.5} cy={y - 3.5} r="2.6" fill="#fff" opacity=".55" />
      ))}
    </svg>
  );
};

const Watermelon = () => (
  <svg viewBox="0 0 150 100" aria-hidden>
    <Shadow cx={75} cy={90} rx={58} />
    <Wash>
      <path d="M14 30h122c0 34-28 54-61 54S14 64 14 30z" fill="#4f9a5a" />
    </Wash>
    <Wash opacity={0.95}>
      <path d="M22 30h106c-1 28-24 46-53 46S23 58 22 30z" fill="#eef0d4" />
    </Wash>
    <Wash>
      <path d="M27 30h96c-2 24-21 40-48 40S29 54 27 30z" fill="#ec5e62" />
    </Wash>
    {[
      [56, 42], [74, 48], [92, 42], [64, 57], [84, 58],
    ].map(([x, y], i) => (
      <ellipse key={i} cx={x} cy={y} rx="2" ry="3.2" fill="#3a2a2a" opacity=".85" transform={`rotate(${i * 14 - 24} ${x} ${y})`} />
    ))}
    <Pencil d="M14 30h122c0 34-28 54-61 54S14 64 14 30z" />
  </svg>
);

const Strawberries = () => (
  <svg viewBox="0 0 140 100" aria-hidden>
    <Shadow cx={70} cy={90} rx={50} />
    {[
      [46, 52, -16],
      [88, 56, 12],
    ].map(([x, y, r], i) => (
      <g key={i} transform={`rotate(${r} ${x} ${y})`}>
        <Wash>
          <path d={`M${x - 20} ${y - 12}c2-8 38-8 40 0 0 20-10 36-20 36s-22-16-20-36z`} fill="#e04a52" />
        </Wash>
        <Wash opacity={0.9}>
          <path d={`M${x - 16} ${y - 14}l8 6 5-9 5 9 6-9 4 9 8-6c-4 8-32 8-36 0z`} fill="#6ea85a" />
        </Wash>
        {[
          [-8, 0], [4, -2], [-2, 10], [9, 10], [-6, 19], [4, 22],
        ].map(([dx, dy], j) => (
          <ellipse key={j} cx={x + dx} cy={y + dy} rx="1.2" ry="1.9" fill="#ffe7a8" opacity=".9" />
        ))}
        <path d={`M${x - 12} ${y - 6}c-2 6-1 12 1 16`} stroke="#fff" strokeOpacity=".5" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    ))}
  </svg>
);

const Sandwich = () => (
  <svg viewBox="0 0 140 100" aria-hidden>
    <Shadow cx={70} cy={90} rx={54} />
    {/* the bottom slice, the fillings spilling past the top one, then the top slice */}
    <Wash>
      <path d="M18 86l52-58 52 58z" fill="#e9cf98" />
    </Wash>
    <Wash opacity={0.9}>
      <path d="M22 80c8 4 14-3 22 1s14-4 22 0 14-4 22 0 14-3 22 1l-4-6H26z" fill="#86bf66" />
    </Wash>
    <Wash opacity={0.9}>
      <path d="M28 74h84l-3-4H31z" fill="#e8705e" />
    </Wash>
    <Wash>
      <path d="M26 72l44-50 44 50z" fill="#f6e4b8" />
    </Wash>
    <Wash opacity={0.8}>
      <path d="M26 72l44-50 44 50" fill="none" stroke="#c9945a" strokeWidth="5" strokeLinejoin="round" />
    </Wash>
    <Pencil d="M26 72l44-50 44 50zM18 86l52-58" />
  </svg>
);

const Cookies = () => (
  <svg viewBox="0 0 140 100" aria-hidden>
    <Shadow cx={70} cy={90} rx={52} />
    {[
      [48, 58],
      [90, 50],
    ].map(([x, y], i) => (
      <g key={i}>
        <Wash>
          <circle cx={x} cy={y} r="25" fill="#d6a062" />
        </Wash>
        <Wash opacity={0.85}>
          {[
            [-9, -7], [7, -11], [12, 6], [-4, 10], [-14, 6], [2, -1],
          ].map(([dx, dy], j) => (
            <circle key={j} cx={x + dx} cy={y + dy} r="3.4" fill="#5b3a28" />
          ))}
        </Wash>
        <Pencil d={`M${x - 25} ${y}a25 25 0 1 0 50 0a25 25 0 1 0 -50 0`} />
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
