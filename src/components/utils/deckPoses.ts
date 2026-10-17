import { clamp, depthReach, ease, flipLift, lerp, outCubic } from "./cardPose";
import type { CardPose } from "./cardPose";

// Where each card of a "How to play" deck is (deckCards3d.ts draws them; scripts/card-clipping.mjs
// checks no two ever pass through each other). Pure math, no three.js: px with y up, rotations as
// three.js applies them.
//
// How the cards are dealt without ever cutting through one another:
//   - Each card rests on its own layer, a little above the one dealt before it, further apart than
//     their sway can tip them.
//   - They're dealt one at a time: a card is down before the next one sets off (and, scrolling back,
//     the last one dealt leaves first).
//   - A card in flight stays above the pile until it has stopped tumbling, then settles flat onto
//     its layer.
//   - Hovered, a card lifts straight up if nothing rests on it; one with a card on it first slides
//     out from under, in its own layer, then lifts.

// where a card lands: its centre in px from the stage's centre (y down, like the page), its width in
// px and its tilt in degrees
export interface DeckPose {
  x: number;
  y: number;
  w: number;
  tilt: number;
}

export interface DeckCardMotion {
  rest: DeckPose;
  start: { dy: number; z: number; rx: number; ry: number; rz: number }; // how it sets off
  phase: number; // where its idle sway starts
}

const FLIGHT = 0.3; // of the deal, each card's flight
const SWAY_Y = 3, SWAY_RX = 0.012, SWAY_RY = 0.015;
const DEG = Math.PI / 180;

const swayReach = (w: number, h: number) => depthReach(w / 2, h / 2, SWAY_RX, SWAY_RY, 0);
// how far apart the layers are: more than two cards' sway, plus the cards' thickness and room to spare
const deckLayer = (cards: DeckCardMotion[], aspect: number) =>
  Math.ceil(2 * Math.max(...cards.map((c) => swayReach(c.rest.w, c.rest.w / aspect))) + 10);

// the share of the deal at which card i sets off (they go one after another)
const setsOff = (i: number, n: number) => (n > 1 ? (i * (1 - FLIGHT)) / (n - 1) : 0);

// the four corners of a resting card on the page, for telling which cards rest on which
const footprint = (r: DeckPose, aspect: number, grow: number) => {
  const hw = (r.w / 2) * grow, hh = (r.w / aspect / 2) * grow, a = r.tilt * DEG;
  const c = Math.cos(a), s = Math.sin(a);
  return [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([x, y]) => [r.x + x * c - y * s, r.y + x * s + y * c]);
};
// do two convex outlines overlap (separating axis test)
const overlap = (A: number[][], B: number[][]) => {
  for (const P of [A, B])
    for (let i = 0; i < P.length; i++) {
      const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % P.length];
      const nx = y2 - y1, ny = x1 - x2;
      const pa = A.map(([x, y]) => x * nx + y * ny), pb = B.map(([x, y]) => x * nx + y * ny);
      if (Math.max(...pa) < Math.min(...pb) || Math.max(...pb) < Math.min(...pa)) return false;
    }
  return true;
};
// whether card i has another resting on it (so it can't lift straight up without passing through it)
const covered = (cards: DeckCardMotion[], i: number, aspect: number) =>
  cards.some((c, j) => j > i && overlap(footprint(cards[i].rest, aspect, 1.08), footprint(c.rest, aspect, 1.08)));

// how far a covered card slides out, in its own layer (so it passes under the cards above it and over
// those below), to come clear of everything resting on it: px, y down
const slideOut = (cards: DeckCardMotion[], i: number, aspect: number): [number, number] => {
  let r = { ...cards[i].rest };
  const above = cards.filter((_, j) => j > i).map((c) => footprint(c.rest, aspect, 1.08));
  for (let k = 0; k < 24; k++) {
    let moved = false;
    for (const B of above) {
      const d = pushOut(footprint(r, aspect, 1.08), B);
      if (d) {
        r = { ...r, x: r.x + d[0] * 1.02, y: r.y + d[1] * 1.02 };
        moved = true;
      }
    }
    if (!moved) break;
  }
  return [r.x - cards[i].rest.x, r.y - cards[i].rest.y];
};

// dealt: how far through the deal (0 to 1); fromX: where the cards come in from (px, off the side);
// H: the stage's height; lift: how far each card is lifted (hovered); t: seconds, for the sway
export function deckPoses(
  dealt: number,
  t: number,
  cards: DeckCardMotion[],
  { aspect, fromX, H }: { aspect: number; fromX: number; H: number },
  lift: number[],
  still = false,
  flip: number[] = [] // turned over sideways (radians: clicked), once it's lifted
): (CardPose & { shown: boolean; down: boolean })[] {
  const layer = deckLayer(cards, aspect);
  // hovered (once it's down): a card with nothing on it lifts straight up; a covered one slides out
  // from under first, then lifts
  // (the deal eases toward its end without ever quite getting there, so "down" is all but down)
  const landed = cards.map((_, i) => (dealt - setsOff(i, cards.length)) / FLIGHT >= 0.97);
  const under = cards.map((_, i) => covered(cards, i, aspect));
  const slides = cards.map((_, i) => (under[i] && lift[i] ? slideOut(cards, i, aspect) : ([0, 0] as [number, number])));
  const out = cards.map((_, i) => (landed[i] && under[i] ? ease(clamp(lift[i] / 0.5)) : 0));
  const ups = cards.map((_, i) => (!landed[i] ? 0 : under[i] ? clamp((lift[i] - 0.5) / 0.5) : lift[i]));
  const turnReach = (j: number) => (landed[j] ? flipLift(cards[j].rest.w * (1 + ups[j] * 0.04), flip[j] || 0) : 0);
  return cards.map((c, i) => {
    const r = c.rest, h = r.w / aspect;
    const a = clamp((dealt - setsOff(i, cards.length)) / FLIGHT);
    const e = outCubic(a);
    const sway = still ? 0 : Math.sin(t * 1.1 + c.phase), sway2 = still ? 0 : Math.cos(t * 0.9 + c.phase);
    const restZ = i * layer;

    // tumbling for the first 70% of its flight, then flat
    const tumble = 1 - outCubic(clamp(a / 0.7));
    const rx = c.start.rx * tumble, ry = c.start.ry * tumble, rz = c.start.rz * tumble;
    // above everything already down (and any of it lifted) until it's flat, then down onto its layer
    // (one turning over reaches out as far as it's lifted, and again as far as its side swings up)
    const pile = Math.max(0, ...cards.slice(0, i).map((_, j) => j * layer + ups[j] * 70 + 2 * turnReach(j))) + swayReach(r.w, h);
    const clearOfPile = tumble > 0 ? pile + depthReach(r.w / 2, h / 2, rx, ry, rz + r.tilt * DEG) + 8 : 0;
    const flying = lerp(c.start.z, restZ, outCubic(clamp((a - 0.6) / 0.4)));
    const up = ups[i];

    return {
      x: lerp(fromX, r.x, e) + slides[i][0] * out[i],
      y: -(lerp(r.y + c.start.dy * H, r.y, e) + slides[i][1] * out[i] + sway * SWAY_Y),
      // turning over, it comes out as far again as its side swings back toward the pile
      z: Math.max(flying, clearOfPile) + up * 70 + turnReach(i),
      rx: rx + sway * SWAY_RX,
      ry: ry + sway2 * SWAY_RY,
      rz: rz + r.tilt * DEG,
      scale: 1 + up * 0.04,
      flip: landed[i] ? flip[i] || 0 : 0,
      shown: a > 0,
      down: landed[i],
    };
  });
}

// A box on the page that cards must keep clear of (the step's words and drawings), in px from the
// stage's centre, y down
export interface ClearBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

// how far to move outline P (by the shortest way) so it no longer overlaps Q, or null if they don't
const pushOut = (P: number[][], Q: number[][]): [number, number] | null => {
  let best: [number, number] | null = null, bestLen = Infinity;
  for (const S of [P, Q])
    for (let i = 0; i < S.length; i++) {
      const [x1, y1] = S[i], [x2, y2] = S[(i + 1) % S.length];
      const len = Math.hypot(y2 - y1, x2 - x1);
      const nx = (y2 - y1) / len, ny = (x1 - x2) / len;
      const pp = P.map(([x, y]) => x * nx + y * ny), qq = Q.map(([x, y]) => x * nx + y * ny);
      const a = Math.max(...qq) - Math.min(...pp); // push P along +n by this much
      const b = Math.max(...pp) - Math.min(...qq); // or along -n by this much
      if (a <= 0 || b <= 0) return null; // a gap on this axis: they don't overlap
      const [d, s] = a < b ? [a, 1] : [b, -1];
      if (d < bestLen) [bestLen, best] = [d, [nx * d * s, ny * d * s]];
    }
  return best;
};

// the card moved the least it takes to be wholly within w x h (less `pad`), as far as it fits
const inside = (r: DeckPose, aspect: number, w: number, h: number, pad: number): DeckPose => {
  const f = footprint(r, aspect, 1), xs = f.map(([x]) => x), ys = f.map(([, y]) => y);
  const dx = Math.max(0, -w / 2 + pad - Math.min(...xs)) - Math.max(0, Math.max(...xs) - (w / 2 - pad));
  const dy = Math.max(0, -h / 2 + pad - Math.min(...ys)) - Math.max(0, Math.max(...ys) - (h / 2 - pad));
  return { ...r, x: r.x + dx, y: r.y + dy };
};
const fits = (r: DeckPose, aspect: number, w: number, h: number, pad: number) =>
  footprint(r, aspect, 1).every(([x, y]) => Math.abs(x) <= w / 2 - pad + 0.5 && Math.abs(y) <= h / 2 - pad + 0.5);

// Moves (and if it must, shrinks) each card the least it takes to keep `margin` px clear of every
// box and wholly on the stage (w x h).
export function keepClear(rest: DeckPose[], aspect: number, boxes: ClearBox[], w: number, h: number, margin = 14): DeckPose[] {
  const grown = boxes.map((b) => [
    [b.x0 - margin, b.y0 - margin],
    [b.x1 + margin, b.y0 - margin],
    [b.x1 + margin, b.y1 + margin],
    [b.x0 - margin, b.y1 + margin],
  ]);
  return rest.map((r0) => {
    let r = { ...r0 };
    // full size if there's room, or down to about three quarters of it, no smaller
    for (const size of [1, 0.9, 0.81, 0.73]) {
      r = { ...r0, w: r0.w * size };
      for (let i = 0; i < 24; i++) {
        let moved = false;
        for (const B of grown) {
          const d = pushOut(footprint(r, aspect, 1), B);
          if (!d) continue;
          r = { ...r, x: r.x + d[0], y: r.y + d[1] };
          moved = true;
        }
        // wholly inside its own step: resting cards don't hang over the next one (only a card that's
        // moving, lifted or leaning, reaches past)
        r = inside(r, aspect, w, h, 8);
        if (!moved) break;
      }
      if (grown.every((B) => !pushOut(footprint(r, aspect, 1), B)) && fits(r, aspect, w, h, 8)) break;
    }
    return r;
  });
}
