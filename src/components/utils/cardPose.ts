// The small bits of pose math the 3D card scenes share (wallPoses.ts, deckPoses.ts): positions in px
// with y up, rotations as three.js applies them (x, then y, then z).

export interface CardPose {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  scale: number;
  flip?: number; // turned over about its own long middle (radians, after rx, ry, rz): clicked
}

export const clamp = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
export const outCubic = (t: number) => 1 - (1 - t) ** 3;

// turn (x, z) about the y axis by a, as three.js does
export const turn = (x: number, z: number, a: number): [number, number] => [
  x * Math.cos(a) + z * Math.sin(a),
  -x * Math.sin(a) + z * Math.cos(a),
];

// how far the corners of a card (half sizes hw x hh) reach in front of or behind its centre, once
// it's turned like this
export const depthReach = (hw: number, hh: number, rx: number, ry: number, rz: number) => {
  // the z row of Rx(rx)·Ry(ry)·Rz(rz)
  const sx = Math.sin(rx), cx = Math.cos(rx), sy = Math.sin(ry), sz = Math.sin(rz), cz = Math.cos(rz);
  const zx = -cx * sy * cz + sx * sz, zy = cx * sy * sz + sx * cz;
  return Math.abs(zx) * hw + Math.abs(zy) * hh;
};

// how far a card h high comes out toward you while it turns over (flip, radians): its edge swings
// back by half its height times the turn's sine, and a little more so it clears what's behind it
export const flipLift = (h: number, flip: number) => (h / 2) * Math.abs(Math.sin(flip)) + 6 * Math.min(1, Math.abs(Math.sin(flip)) * 8);
