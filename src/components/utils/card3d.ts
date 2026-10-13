// The pieces every 3D card on the site shares (three.js): loading three.js the first time it's needed,
// the one WebGL renderer for the whole page (browsers allow only a few contexts), the studio that gold
// foil reflects, and the card itself.
import type * as THREE from "three";

export type Three = typeof THREE;

let threeP: Promise<Three> | null = null;
export const loadThree = () =>
  (threeP ||= import("three").catch((e) => {
    threeP = null;
    throw e;
  }));

let shared: THREE.WebGLRenderer | null = null;
export const renderer = (T: Three) => {
  if (shared) return shared;
  const r = new T.WebGLRenderer({ antialias: true, alpha: true });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  r.shadowMap.enabled = true;
  r.shadowMap.type = T.VSMShadowMap;
  r.outputColorSpace = T.SRGBColorSpace;
  return (shared = r);
};

// what gold foil reflects: a soft studio room, made once (metal with nothing to reflect looks black)
let goldEnv: Promise<THREE.Texture> | null = null;
export const studio = (T: Three, r: THREE.WebGLRenderer) =>
  (goldEnv ||= import("three/examples/jsm/environments/RoomEnvironment.js").then(({ RoomEnvironment }) => {
    const pm = new T.PMREMGenerator(r);
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();
    return env;
  }));

// a soft shadow to sit under a card on the page, made once
let shadowTex: THREE.Texture | null = null;
export const cardShadow = (T: Three) => {
  if (shadowTex) return shadowTex;
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.filter = "blur(22px)";
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.roundRect(48, 48, 160, 160, 12);
  ctx.fill();
  return (shadowTex = new T.CanvasTexture(c));
};

export const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
export const calm = () => !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// a rounded card with a cream paper or gold foil edge; its long side is 1
export function makeCard(T: Three, mm: [number, number], front: THREE.Texture, back: THREE.Texture, gold: THREE.Texture | null) {
  const k = 1 / Math.max(mm[0], mm[1]);
  const w = mm[0] * k, h = mm[1] * k, r = 3.5 * k, t = 0.72 * k;
  const s = new T.Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.absarc(w / 2 - r, -h / 2 + r, r, -Math.PI / 2, 0, false);
  s.lineTo(w / 2, h / 2 - r);
  s.absarc(w / 2 - r, h / 2 - r, r, 0, Math.PI / 2, false);
  s.lineTo(-w / 2 + r, h / 2);
  s.absarc(-w / 2 + r, h / 2 - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(-w / 2, -h / 2 + r);
  s.absarc(-w / 2 + r, -h / 2 + r, r, Math.PI, Math.PI * 1.5, false);
  const face = () => {
    const f = new T.ShapeGeometry(s, 10);
    const p = f.attributes.position, uv = f.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + w / 2) / w, (p.getY(i) + h / 2) / h);
    return f;
  };
  const mat = (map: THREE.Texture) => new T.MeshStandardMaterial({ map, roughness: 0.42, metalness: 0 });
  const grp = new T.Group();
  const fr = new T.Mesh(face(), mat(front));
  fr.position.z = t / 2;
  const bk = new T.Mesh(face(), mat(back));
  bk.rotation.y = Math.PI; // turned, so it reads right from behind
  bk.position.z = -t / 2;
  const edge = new T.Mesh(new T.ExtrudeGeometry(s, { depth: t, bevelEnabled: false, curveSegments: 10 }), [
    new T.MeshBasicMaterial({ visible: false }),
    gold
      ? new T.MeshStandardMaterial({ color: 0xe6bd5c, metalness: 1, roughness: 0.34, envMap: gold, envMapIntensity: 1.7 })
      : new T.MeshStandardMaterial({ color: 0xede8db, roughness: 0.8 }),
  ]);
  edge.position.z = -t / 2;
  for (const m of [fr, bk, edge]) {
    m.castShadow = true;
    grp.add(m);
  }
  return grp;
}
