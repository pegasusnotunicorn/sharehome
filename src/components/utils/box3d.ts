// The Love, Career & Magic game box in 3D (three.js), built from the box's print art cut at its folds.
// It's two open shells, as in real life: the lid (top and four walls), and the base tray, which is the
// same shell turned upside down, 2.5 mm inside the lid and a little shorter. Each shell is one geometry
// of quads with explicit UVs (BoxGeometry's UVs don't fit this art), printed outside, plain board inside.
import type * as THREE from "three";
import type { Three } from "./card3d";

// the art, cut from the print file at the fold lines; each wall is laid out as on the flat dieline,
// with the edge that touches the lid (or the base's bottom) at the top of the picture
export interface BoxPanels {
  top: string;
  near: string;
  far: string;
  left: string;
  right: string;
}
export interface BoxArt {
  lid: BoxPanels;
  base: BoxPanels;
}

const MM = { L: 216, W: 127, H: 38, inset: 2.5, baseH: 37 }; // the lid, 216 x 127 x 38 mm
export const BOX_MM: [number, number] = [MM.L, MM.W];

const BOARD = 0xefece5; // the plain grey board inside
const LIFT = 0.15; // how far the lid lifts on hover or tap, of the box's height

type V = [number, number, number];
type Tex = Record<keyof BoxPanels, THREE.Texture>;

// one shell, lid up, centred on the origin: x0..x1 = ±L/2, y0..y1 = ±H/2, z0..z1 = ±W/2
function shell(T: Three, L: number, W: number, H: number, tex: Tex) {
  const x0 = -L / 2, x1 = L / 2, y0 = -H / 2, y1 = H / 2, z0 = -W / 2, z1 = W / 2;
  const pos: number[] = [], uv: number[] = [], nor: number[] = [];
  const geo = new T.BufferGeometry();
  let n = 0;
  // a quad from four corners, wound so it faces `out`; `map` gives each corner's UV
  const quad = (c: V[], out: V, map: (p: V) => [number, number], group: number) => {
    const e1 = c[1].map((v, i) => v - c[0][i]), e2 = c[3].map((v, i) => v - c[0][i]);
    const cross = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    const k = cross[0] * out[0] + cross[1] * out[1] + cross[2] * out[2] > 0 ? [0, 1, 2, 0, 2, 3] : [0, 2, 1, 0, 3, 2];
    for (const i of k) {
      pos.push(...c[i]);
      uv.push(...map(c[i]));
      nor.push(...out);
    }
    geo.addGroup(n, 6, group);
    n += 6;
  };
  const top: V[] = [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]];
  const near: V[] = [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
  const far: V[] = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]];
  const right: V[] = [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]];
  const left: V[] = [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]];
  const u = (x: number) => (x - x0) / L, v = (y: number) => (y - y0) / H, w = (z: number) => (z1 - z) / W;
  // printed outside: the lid's art top at the far side; the far wall, printed upside down on the
  // dieline, turned to read upright
  quad(top, [0, 1, 0], ([x, , z]) => [u(x), w(z)], 0);
  quad(near, [0, 0, 1], ([x, y]) => [u(x), v(y)], 1);
  quad(far, [0, 0, -1], ([x, y]) => [u(x), 1 - v(y)], 2);
  quad(right, [1, 0, 0], ([, y, z]) => [1 - v(y), w(z)], 3);
  quad(left, [-1, 0, 0], ([, y, z]) => [v(y), w(z)], 4);
  // plain board inside
  const plain = () => [0, 0] as [number, number];
  quad(top, [0, -1, 0], plain, 5);
  quad(near, [0, 0, -1], plain, 5);
  quad(far, [0, 0, 1], plain, 5);
  quad(right, [-1, 0, 0], plain, 5);
  quad(left, [1, 0, 0], plain, 5);
  geo.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new T.Float32BufferAttribute(nor, 3));
  geo.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
  const mat = (map?: THREE.Texture) =>
    new T.MeshStandardMaterial(map ? { map, roughness: 0.45, metalness: 0 } : { color: BOARD, roughness: 0.45, metalness: 0 });
  const m = new T.Mesh(geo, [mat(tex.top), mat(tex.near), mat(tex.far), mat(tex.right), mat(tex.left), mat()]);
  m.castShadow = true;
  return m;
}

// the closed box, lid up, its long side 1 and its near long side toward the camera. `lift(t)` raises
// the lid by t (0 shut, 1 lifted).
export function makeBox(T: Three, lid: Tex, base: Tex) {
  const k = 1 / MM.L;
  const H = MM.H * k;
  const grp = new T.Group();
  const lidShell = shell(T, 1, MM.W * k, H, lid);
  const tray = shell(T, (MM.L - 2 * MM.inset) * k, (MM.W - 2 * MM.inset) * k, MM.baseH * k, base);
  tray.rotation.z = Math.PI; // upside down: its top is the box's bottom
  tray.position.y = -H / 2 + (MM.baseH * k) / 2;
  grp.add(lidShell, tray);
  return { box: grp, lift: (t: number) => (lidShell.position.y = t * LIFT * H) };
}
