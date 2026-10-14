// Checks that the home page's 3D cards never pass through each other: the card wall below the hero
// (wallPoses.ts) and the "How to play" decks (deckPoses.ts). It steps through the whole scroll at
// every screen width the site lays out differently, with the idle sway at several moments and every
// card hovered, treating each card as a slab (both faces, 5px apart) and looking for any edge of one
// card passing through another.
//
//   npm run check-cards
import { wallPoses, hoverPose, canLift, CARD_ASPECT } from "../src/components/utils/wallPoses.ts";
import { deckPoses } from "../src/components/utils/deckPoses.ts";
import { characterLayout, directionEpisodeLayout } from "../src/components/Home/utils/deckLayouts.ts";

// --- a card as a rectangle in 3D (three.js's rotation order: R = Rx * Ry * Rz) ---
const mul = (A, B) => A.map((r) => [0, 1, 2].map((j) => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j]));
const Rx = (a) => [[1, 0, 0], [0, Math.cos(a), -Math.sin(a)], [0, Math.sin(a), Math.cos(a)]];
const Ry = (a) => [[Math.cos(a), 0, Math.sin(a)], [0, 1, 0], [-Math.sin(a), 0, Math.cos(a)]];
const Rz = (a) => [[Math.cos(a), -Math.sin(a), 0], [Math.sin(a), Math.cos(a), 0], [0, 0, 1]];
const apply = (M, v) => M.map((r) => r[0] * v[0] + r[1] * v[1] + r[2] * v[2]);
const sub = (a, b) => a.map((x, k) => x - b[k]);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const SLAB = 2.5; // half the thickness we allow a card (the cards are about 2.3px thick)

function face(q, w, h, off) {
  const M = mul(mul(Rx(q.rx), Ry(q.ry)), Rz(q.rz));
  const u = apply(M, [1, 0, 0]), v = apply(M, [0, 1, 0]), n = apply(M, [0, 0, 1]);
  const c = [q.x + n[0] * off, q.y + n[1] * off, q.z + n[2] * off];
  const hw = (w * q.scale) / 2, hh = (h * q.scale) / 2;
  const at = (a, b) => [0, 1, 2].map((k) => c[k] + u[k] * a + v[k] * b);
  return { c, u, v, n, hw, hh, corners: [at(-hw, -hh), at(hw, -hh), at(hw, hh), at(-hw, hh)] };
}
const slab = (q, w, h) => [face(q, w, h, -SLAB), face(q, w, h, SLAB)];
function pierces(p, q, R) {
  const dp = dot(sub(p, R.c), R.n), dq = dot(sub(q, R.c), R.n);
  if (dp * dq > 0 || dp === dq) return false;
  const t = dp / (dp - dq), x = p.map((v, k) => v + (q[k] - v) * t), d = sub(x, R.c);
  return Math.abs(dot(d, R.u)) < R.hw - 0.5 && Math.abs(dot(d, R.v)) < R.hh - 0.5;
}
const facesClip = (A, B) =>
  [[A, B], [B, A]].some(([X, Y]) => X.corners.some((p, i) => pierces(p, X.corners[(i + 1) % 4], Y)));
const clip = (A, B) => A.some((a) => B.some((b) => facesClip(a, b)));

let seed = 11;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const WIDTHS = [1920, 1600, 1440, 1280, 1024, 900, 820, 700, 600, 390, 360];
const SWAY = [0, 1.3, 2.9, 4.6];
let failures = 0;
const report = (name, bad) => {
  failures += bad.size;
  console.log(`${name}:`, bad.size ? `${bad.size} clips, e.g. ${[...bad].slice(0, 4).join("; ")}` : "ok");
};

// --- the card wall ---
const cardWidth = (W) => Math.floor(W / (W >= 1600 ? 4.2 : W >= 1200 ? 3.7 : W >= 900 ? 2.7 : W >= 700 ? 2.2 : 1.7)); // getHomePageCardProps
for (const W of WIDTHS) {
  const H = W <= 900 ? 844 : 900, cw = cardWidth(W);
  const size = { W, H, cw, cols: W >= 900 ? 5 : 3, rows: 3, gap: W <= 600 ? W / 2 + cw * 0.2 : W < 1000 ? 215 : 300 };
  const h = size.cw / CARD_ASPECT, bad = new Set();
  for (let trial = 0; trial < 4; trial++) {
    const cards = Array.from({ length: size.cols * size.rows }, (_, i) => ({
      row: Math.floor(i / size.cols),
      col: i % size.cols,
      missing: i === Math.floor(size.cols / 2),
      spin: [rnd() * 7 - 3.5, rnd() * 7 - 3.5, Math.PI / 2],
    }));
    for (let k = 0; k <= 1000; k++) {
      const p = k / 1000;
      for (const t of SWAY) {
        const ps = wallPoses(p, t, size, cards);
        const ss = ps.map((q) => slab(q, size.cw, h));
        for (let i = 0; i < ps.length; i++)
          for (let j = i + 1; j < ps.length; j++)
            if (ps[i].scale > 0.02 && ps[j].scale > 0.02 && clip(ss[i], ss[j])) bad.add(`p ${p.toFixed(3)}: cards ${i} and ${j}`);
        if (trial || t || k % 10) continue;
        for (let i = 0; i < ps.length; i++)
          for (const lift of [0.3, 0.6, 1]) {
            if (!canLift(p, cards[i], size.cols)) continue;
            const hs = slab(hoverPose(ps[i], lift, size.cw), size.cw, h);
            for (let j = 0; j < ps.length; j++) if (j !== i && ps[j].scale > 0.02 && clip(hs, ss[j])) bad.add(`p ${p.toFixed(2)}: hovered ${i} into ${j}`);
          }
      }
    }
  }
  report(`wall, ${W}px (${size.cols} columns of ${size.cw}px cards)`, bad);
}

// --- the "How to play" decks (deck areas as the page lays them out: beside the words, or the whole step) ---
const DECKS = [
  { name: "characters", layout: characterLayout, aspect: 120 / 69.44, area: [0.6, 0.88], side: -1 },
  { name: "directions", layout: directionEpisodeLayout(1), aspect: 88.9 / 57.6, area: [0.5, 0.88], side: 1 },
  { name: "episodes", layout: directionEpisodeLayout(-1), aspect: 88.9 / 63.5, area: [0.5, 0.88], side: -1 },
];
for (const d of DECKS)
  for (const W of WIDTHS) {
    const stacked = W <= 900, vh = W <= 900 ? 844 : 900;
    const w = stacked ? W : W * d.area[0], H = vh * (stacked ? 0.82 : d.area[1]);
    const rest = d.layout(w, H, stacked), bad = new Set();
    for (let trial = 0; trial < 6; trial++) {
      const cards = rest.map((r) => ({
        rest: r,
        start: { dy: rnd() * 0.5 - 0.25, z: 150 + rnd() * 170, rx: rnd() * 2.2 - 1.1, ry: d.side * (Math.PI * (rnd() < 0.5 ? 1 : 3) + rnd() * 0.8 - 0.4), rz: rnd() * 2.8 - 1.4 },
        phase: rnd() * 6.28,
      }));
      const fromX = d.side * (w / 2 + Math.max(...rest.map((r) => r.w)) * 0.9);
      for (let k = 0; k <= 1000; k++)
        for (const t of SWAY)
          for (const hovered of [-1, 0, 1, 2]) {
            if (hovered >= 0 && (trial || t || k % 10)) continue;
            for (const amount of hovered < 0 ? [0] : [0.3, 0.6, 1]) {
              const lift = rest.map((_, i) => (i === hovered ? amount : 0));
              const ps = deckPoses(k / 1000, t, cards, { aspect: d.aspect, fromX, H }, lift);
              const ss = ps.map((q, i) => slab(q, rest[i].w, rest[i].w / d.aspect));
              for (let i = 0; i < ps.length; i++)
                for (let j = i + 1; j < ps.length; j++)
                  if (ps[i].shown && ps[j].shown && clip(ss[i], ss[j])) bad.add(`dealt ${(k / 1000).toFixed(3)}${hovered >= 0 ? `, ${hovered} hovered` : ""}: cards ${i} and ${j}`);
            }
          }
    }
    report(`${d.name} deck, ${W}px${stacked ? " (stacked)" : ""}`, bad);
  }

console.log(failures ? `FAIL: ${failures} clips` : "PASS: no card ever passes through another");
process.exit(failures ? 1 : 0);
