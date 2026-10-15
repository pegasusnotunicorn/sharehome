import { clamp, ease, flipLift, turn } from "./cardPose";
import type { CardPose } from "./cardPose";

// Where every card of the home page's card wall is, at a point in the scroll (parallaxWall3d.ts
// draws them; scripts/card-clipping.mjs checks no two ever pass through each other). Pure math, no
// three.js: positions in px with y up, rotations as three.js applies them (x, then y, then z).
//
// How the wall moves without its cards ever cutting through one another:
//   - Every card is turned only about the upright (y) axis, and rows are a gap apart, so one row
//     can never reach into another.
//   - Standing, a row's cards are on an arc, each one facing out from it, a gap apart along it. Faces
//     on an arc only meet beyond their edges, so neighbours never touch. Sliding the row moves every
//     card along the arc together.
//   - Parting, each half of a row moves as one panel, swinging back about its outer card and sliding
//     out, while the row's arc flattens (every moment of it still an arc). The two panels only move
//     apart.
//   - A hovered card lifts straight out of the wall along its own facing, so it clears its
//     neighbours as soon as it starts to move.

export interface WallSize {
  W: number; // the stage's width, px
  H: number; // and height (the camera stands back so that z = 0 is drawn at 1px per px)
  cw: number; // a card's width, px
  cols: number;
  rows: number;
  gap: number; // how far from the middle, px on screen, the parted halves stop (clear of the words)
}

export interface WallCardMotion {
  row: number;
  col: number;
}

export const WALL_GAP = 16;
export const CARD_ASPECT = 120 / 69.44; // CHARACTER_CARD_MM
const OPEN = 0.55; // how far each half swings back, radians
const SWAY_Y = 2.5, SWAY_TILT = 0.02;


// p: how far through the wall's section (0 to 1); t: seconds, for the idle sway (pass still to stop it)
export function wallPoses(p: number, t: number, size: WallSize, cards: WallCardMotion[], still = false): CardPose[] {
  const { W, H, cw, cols, rows, gap } = size;
  const D = H / 2 / Math.tan((15 * Math.PI) / 180); // the camera's distance (a 30° view)
  const ch = cw / CARD_ASPECT, pitch = cw + WALL_GAP, mid = Math.floor(cols / 2);
  const R = Math.max(W * 1.4, (cols - 1) * pitch * 1.2); // the arc's radius
  const slide = clamp(p / 0.5);

  // each row parts a beat after the one above
  const opening = (row: number) => ease(clamp(((p - 0.5) / 0.35 - row * 0.08) / 0.84)); // parted by 85% of the way

  // standing: on the arc (facing out from it, toward you), slid along it. As a row parts, its arc
  // flattens out (each moment still an arc, a gap apart along it), so each half opens out flat
  const standing = (row: number, col: number) => {
    const dir = row % 2 !== 0 ? 1 : -1;
    const along = (col - (cols - 1) / 2) * pitch + dir * 0.25 * cw * slide;
    const k = (1 - opening(row)) / R; // the arc's curvature
    if (k < 1e-7) return { x: along, z: 0, ry: 0 };
    const a = along * k;
    return { x: Math.sin(a) / k, z: (1 - Math.cos(a)) / k, ry: -a };
  };

  // parting: each half of each row as one panel (left of the middle, and the rest; the middle card
  // goes with alternate sides row by row)
  const panel = (row: number, col: number) => {
    const dir = row % 2 !== 0 ? 1 : -1;
    const left = dir > 0 ? col < mid : col <= mid;
    const outer = left ? 0 : cols - 1; // its hinge
    const inner = left ? (dir > 0 ? mid - 1 : mid) : dir > 0 ? mid : mid + 1; // the card nearest the gap
    const open = opening(row);
    const swing = (left ? 1 : -1) * OPEN; // inner end back, away from you
    const hinge = standing(row, outer);
    // how far it slides out so that, fully open, the inner card's inner edge is drawn `gap` from the
    // middle (it has swung back, away from the camera, which draws it nearer the middle)
    const ic = standing(row, inner);
    const edge = left ? cw / 2 : -cw / 2;
    const [ex, ez] = turn(edge, 0, ic.ry);
    const [ox, oz] = turn(ic.x + ex - hinge.x, ic.z + ez - hinge.z, swing);
    const slideOut = ((left ? -gap : gap) * (D - (hinge.z + oz))) / D - (hinge.x + ox);
    return { hinge, angle: swing * open, shift: slideOut * open };
  };

  return cards.map((c) => {
    const s = standing(c.row, c.col);
    const pn = panel(c.row, c.col);
    const [dx, dz] = turn(s.x - pn.hinge.x, s.z - pn.hinge.z, pn.angle);
    let x = pn.hinge.x + dx + pn.shift, z = pn.hinge.z + dz, ry = s.ry + pn.angle;
    let y = -(c.row - (rows - 1) / 2) * (ch + WALL_GAP);
    let rx = 0;
    const rz = 0, scale = 1;

    // the wall sways as one, so the gaps between its cards stay the same
    if (!still) {
      const sway = Math.sin(t * 1.05);
      y += sway * SWAY_Y;
      rx += sway * SWAY_TILT;
    }
    return { x, y, z, rx, ry, rz, scale };
  });
}

// a hovered card (lift 0 to 1): straight out along its own facing, and a little bigger. Turning
// over (flip, radians: clicked) it stays in its own column (it turns sideways about its upright
// middle, so it only gets narrower) and comes out as far again as its side swings back, so that side
// can't reach behind it
export function hoverPose(q: CardPose, lift: number, cw: number, flip = 0): CardPose {
  const out = lift * (40 + cw * 0.04) + flipLift(cw * (1 + 0.04 * lift), flip);
  const [nx, nz] = turn(0, 1, q.ry);
  return { ...q, x: q.x + nx * out, z: q.z + nz * out, scale: q.scale * (1 + 0.04 * lift), flip };
}
