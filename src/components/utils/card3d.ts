// The pieces every 3D card on the site shares (three.js): loading three.js the first time it's needed,
// the one WebGL renderer for the whole page (browsers allow only a few contexts), the studio that gold
// foil reflects, and the card itself.
import type * as THREE from "three";
import { afterPaint, whenIdle } from "./later";

export type Three = typeof import("./three");

// whether the browser can draw 3D at all (asked once, of a canvas that's then let go)
let gl: boolean | null = null;
export const canDraw3d = () => {
  if (gl === null)
    try {
      const c = document.createElement("canvas");
      const ctx = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
      gl = !!ctx;
      ctx?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      gl = false;
    }
  return gl;
};

// three.js, downloaded at once, but handed over only once the page has painted and is idle, so
// setting up a scene never holds up the first screen. Without 3D it isn't downloaded at all (the
// scenes show their flat pictures instead).
let threeP: Promise<Three> | null = null;
export const loadThree = () =>
  (threeP ||= (canDraw3d() ? Promise.all([import("./three"), afterPaint()]) : Promise.reject(new Error("no WebGL")))
    .then(([T]) => T)
    .catch((e) => {
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
  // asking the driver about each shader as it's made waits for it to compile, which stalls a frame
  // the first time a scene is drawn
  r.debug.checkShaderErrors = !import.meta.env.PROD;
  return (shared = r);
};

// Draws a scene onto a page canvas `w` x `h` (CSS px) through the one renderer. Every scene on the
// page shares that renderer, so it isn't resized to each one (resizing its canvas is costly, and
// several scenes draw every frame): it only ever grows, each scene draws into its bottom-left corner,
// and that corner is copied onto the page canvas.
let room = { w: 0, h: 0 };
export function paint(r: THREE.WebGLRenderer, sc: THREE.Scene, cam: THREE.Camera, ctx: CanvasRenderingContext2D, w: number, h: number) {
  if (w > room.w || h > room.h) {
    // just big enough for the biggest scene so far: no bigger, as every copy out of it smooths
    // (antialiases) all of it, not just the scene's corner
    room = { w: Math.max(room.w, Math.ceil(w / 32) * 32), h: Math.max(room.h, Math.ceil(h / 32) * 32) };
    r.setSize(room.w, room.h, false);
  }
  r.setViewport(0, 0, w, h);
  r.setScissor(0, 0, w, h);
  r.setScissorTest(true);
  r.render(sc, cam);
  r.setScissorTest(false);
  const src = r.domElement, pr = r.getPixelRatio(), pw = Math.floor(w * pr), ph = Math.floor(h * pr);
  const out = ctx.canvas;
  ctx.clearRect(0, 0, out.width, out.height);
  ctx.drawImage(src, 0, src.height - ph, pw, ph, 0, 0, out.width, out.height);
}

// Gets a scene ready to draw without stalling a frame: its shaders compiled in the background, and
// its pictures sent to the GPU one at a time when the page is idle. (Left to its first frame, both
// happen at once there and then.) Scenes call it as they load, before they're on screen.
export async function warm(r: THREE.WebGLRenderer, sc: THREE.Scene, cam: THREE.Camera) {
  // (only where the browser compiles in the background; elsewhere it compiles on its first frame,
  // which is drawn as the scene loads, before it's on screen, anyway)
  if (r.extensions.has("KHR_parallel_shader_compile"))
    try {
      await r.compileAsync(sc, cam);
    } catch {
      // (it compiles on its first frame instead)
    }
  const maps = new Set<THREE.Texture>();
  sc.traverse((o) => {
    for (const m of ([] as THREE.Material[]).concat((o as THREE.Mesh).material || []))
      for (const v of Object.values(m)) if ((v as THREE.Texture)?.isTexture && !(v as THREE.CubeTexture).isCubeTexture) maps.add(v as THREE.Texture);
  });
  for (const t of maps) await new Promise<void>((done) => whenIdle(() => (r.initTexture(t), done()), 500));
}

// A picture as a texture, decoded before it's drawn: left to the GPU upload, the browser decodes it
// there and then, on the main thread, and the page stutters. As a bitmap, it's decoded off the main
// thread, upside down as WebGL wants it, where the browser can do that (checked once: some only
// say they can); otherwise as a decoded picture.
export const decoded = (img: HTMLImageElement) => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(() => img);
let flipsP: Promise<boolean> | null = null;
const bitmapsFlip = () =>
  (flipsP ||= (async () => {
    if (typeof createImageBitmap !== "function") return false;
    const c = document.createElement("canvas");
    c.width = 1;
    c.height = 2;
    const g = c.getContext("2d")!;
    g.fillStyle = "#f00";
    g.fillRect(0, 0, 1, 1);
    g.fillStyle = "#00f";
    g.fillRect(0, 1, 1, 1);
    const b = await createImageBitmap(c, { imageOrientation: "flipY" });
    g.clearRect(0, 0, 1, 2);
    g.drawImage(b, 0, 0);
    b.close();
    return g.getImageData(0, 0, 1, 1).data[2] > 128; // blue on top: it flipped
  })().catch(() => false));
export const loadTexture = async (T: Three, url: string) => {
  if (await bitmapsFlip()) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(String(res.status));
      const bmp = await createImageBitmap(await res.blob(), { imageOrientation: "flipY", premultiplyAlpha: "none", colorSpaceConversion: "none" });
      const x = new T.Texture(bmp as unknown as HTMLImageElement);
      x.flipY = false; // (it already is)
      x.needsUpdate = true;
      x.addEventListener("dispose", () => bmp.close());
      return x;
    } catch {
      // (the picture as a picture, below)
    }
  }
  const img = await decoded(await new T.ImageLoader().loadAsync(url));
  const x = new T.Texture(img);
  x.needsUpdate = true;
  return x;
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
  // (a square's blurred shadow, the square itself drawn off the canvas: a canvas filter blur and
  // roundRect aren't in older Safari)
  ctx.shadowColor = "#000";
  ctx.shadowBlur = 44;
  ctx.shadowOffsetX = 1000;
  ctx.fillStyle = "#000";
  ctx.fillRect(48 - 1000, 48, 160, 160);
  return (shadowTex = new T.CanvasTexture(c));
};

export const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
// visitors who ask for less motion (read once, and kept up to date: scenes ask every frame)
const reduce = typeof window !== "undefined" ? window.matchMedia?.("(prefers-reduced-motion: reduce)") : undefined;
let calmNow = !!reduce?.matches;
reduce?.addEventListener?.("change", (e) => (calmNow = e.matches));
export const calm = () => calmNow;

// a rounded card with a cream paper or gold foil edge; its long side is 1. (`thick`: how thick it is,
// in mm; small cards are drawn a little thicker, so their edges still show)
export function makeCard(T: Three, mm: [number, number], front: THREE.Texture, back: THREE.Texture, gold: THREE.Texture | null, thick = 0.72) {
  const k = 1 / Math.max(mm[0], mm[1]);
  const w = mm[0] * k, h = mm[1] * k, r = 3.5 * k, t = thick * k;
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

// Whether the pointer at (x, y) is on `scene` with nothing in the way: everything above it at that
// point is see-through (no background, picture, text or control), like the empty part of a block of
// words that overlaps a 3D scene.
const SOLID = new Set(["IMG", "SVG", "VIDEO", "IFRAME", "CANVAS", "A", "BUTTON", "INPUT", "SELECT", "TEXTAREA", "LABEL"]);
const seeThrough = (el: Element) => {
  if (SOLID.has(el.tagName.toUpperCase())) return false;
  for (const n of el.childNodes) if (n.nodeType === Node.TEXT_NODE && n.textContent?.trim()) return false;
  const s = getComputedStyle(el);
  if (s.backgroundImage !== "none" || s.pointerEvents === "none") return s.pointerEvents === "none";
  const bg = s.backgroundColor;
  return bg === "transparent" || /rgba\(.*,\s*0\)$/.test(bg);
};
export const pointerReaches = (scene: Element, x: number, y: number) => {
  for (const el of document.elementsFromPoint(x, y)) {
    if (scene.contains(el)) return true;
    if (!seeThrough(el)) return false;
  }
  return false;
};

// A scene's canvas reaches past its stage by (bx, by) px on each side, so cards that tumble, lift or
// lean past the stage's edges aren't cut off (it draws over the neighbouring sections, and lets the
// pointer through to them). Its middle stays on the stage's middle. Returns the canvas's size in px.
// The same, reaching further on some sides than others ({ left, right, top, bottom } px). The view
// stays centred on the stage: `view` sets a camera (px units, z = 0 at 1px per px) to draw the stage's
// own view carried on out to the canvas's edges.
export function stretchCanvas(cv: HTMLCanvasElement, W: number, H: number, by: { left: number; right: number; top: number; bottom: number }, pixelRatio: number) {
  const w = W + by.left + by.right, h = H + by.top + by.bottom;
  Object.assign(cv.style, { position: "absolute", left: `${-by.left}px`, top: `${-by.top}px`, width: `${w}px`, height: `${h}px`, pointerEvents: "none" });
  cv.width = Math.round(w * pixelRatio);
  cv.height = Math.round(h * pixelRatio);
  // a frame as wide and as high either side of the stage's middle as the canvas reaches on its far side
  const fx = Math.max(by.left, by.right), fy = Math.max(by.top, by.bottom), fw = W + 2 * fx, fh = H + 2 * fy;
  const view = (cam: THREE.PerspectiveCamera) => {
    cam.aspect = fw / fh;
    cam.position.set(0, 0, fh / 2 / Math.tan((cam.fov * Math.PI) / 360));
    cam.setViewOffset(fw, fh, fx - by.left, fy - by.top, w, h);
    cam.updateProjectionMatrix();
  };
  return { w, h, view };
}

export function bleedCanvas(cv: HTMLCanvasElement, W: number, H: number, bx: number, by: number, pixelRatio: number) {
  const w = W + 2 * bx, h = H + 2 * by;
  Object.assign(cv.style, { position: "absolute", left: `${-bx}px`, top: `${-by}px`, width: `${w}px`, height: `${h}px`, pointerEvents: "none" });
  cv.width = Math.round(w * pixelRatio);
  cv.height = Math.round(h * pixelRatio);
  return { w, h };
}
