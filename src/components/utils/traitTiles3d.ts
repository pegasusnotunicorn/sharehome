// The "character arcs" step's trait tags as 3D tiles (three.js): each new set of traits flips the
// tiles over, one after another, as they glide to the next character. They sway a little and lean
// toward the pointer. Each tile sits where its flat tag is laid out (the tags stay, hidden, so the
// page keeps its layout). One WebGL renderer serves the whole page (card3d.ts).
import type * as THREE from "three";
import { calm, ease, loadThree, renderer } from "./card3d";
import type { Three } from "./card3d";

export interface Trait {
  text: string;
  type: "good" | "bad" | "chaotic";
}

export interface TraitTilesApi {
  // show these traits on the tiles, which move to where these tags are laid out
  show: (traits: Trait[], tags: HTMLElement[]) => void;
  destroy: () => void;
}

const BORDER: Record<Trait["type"], string> = { good: "#94de8f", bad: "#a769d4", chaotic: "#9b9b9b" };
const FLIP_S = 0.75;
const STAGGER_S = 0.12;

// where `el` sits inside `stage`, ignoring transforms (the stage is tilted on wide screens)
const offsetIn = (el: HTMLElement, stage: HTMLElement) => {
  let x = 0, y = 0, e: HTMLElement | null = el;
  while (e && e !== stage) {
    x += e.offsetLeft;
    y += e.offsetTop;
    e = e.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
};

export async function mountTraitTiles(stage: HTMLElement, onFail: () => void): Promise<TraitTilesApi | null> {
  let T: Three, r: THREE.WebGLRenderer;
  try {
    T = await loadThree();
    r = renderer(T);
    await document.fonts.load('40px "Rowdies-Regular"').catch(() => []);
  } catch {
    onFail();
    return null;
  }
  if (!stage.isConnected) return null;

  const sc = new T.Scene();
  const cam = new T.PerspectiveCamera(30, 1, 10, 8000);
  sc.add(new T.HemisphereLight(0xffffff, 0xd9d2cc, 2.1));
  const key = new T.DirectionalLight(0xffffff, 0.9);
  key.position.set(0.3, 1, 1);
  sc.add(key);
  const group = new T.Group();
  sc.add(group);

  // a face: the tag's coloured border, white inside, the trait in capitals
  const TW = 512;
  const paint = (cv: HTMLCanvasElement, t: Trait, w: number, h: number, upsideDown: boolean) => {
    const g = cv.getContext("2d")!, H = cv.height, k = TW / w;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, TW, H);
    if (upsideDown) {
      g.translate(TW, H);
      g.rotate(Math.PI);
    }
    g.fillStyle = BORDER[t.type];
    g.beginPath();
    g.roundRect(0, 0, TW, H, 4 * k);
    g.fill();
    g.fillStyle = "#fff";
    g.beginPath();
    g.roundRect(5.6 * k, 5.6 * k, TW - 11.2 * k, H - 11.2 * k, 4 * k);
    g.fill();
    g.fillStyle = "#222";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = `${Math.round(24 * k)}px "Rowdies-Regular"`;
    if ("letterSpacing" in g) (g as unknown as { letterSpacing: string }).letterSpacing = `${k}px`;
    const max = TW - 24 * k;
    const tw = g.measureText(t.text).width;
    if (tw > max) g.font = `${Math.floor((24 * k * max) / tw)}px "Rowdies-Regular"`;
    g.fillText(t.text, TW / 2, H / 2 + 1.5 * k);
  };

  interface Tile {
    obj: THREE.Mesh;
    faces: [HTMLCanvasElement, HTMLCanvasElement];
    maps: [THREE.CanvasTexture, THREE.CanvasTexture];
    turns: number; // half turns done (odd: the back's showing)
    flip: { from: number; at: number } | null; // a flip under way: from which angle, starting when
    pos: { x: number; y: number; w: number; h: number };
    from: { x: number; y: number };
    phase: number;
  }
  const sideMat = new T.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.7 });
  const tiles: Tile[] = [];
  const tile = () => {
    const faces: [HTMLCanvasElement, HTMLCanvasElement] = [document.createElement("canvas"), document.createElement("canvas")];
    const maps = faces.map((c) => {
      const m = new T.CanvasTexture(c);
      m.colorSpace = T.SRGBColorSpace;
      m.anisotropy = Math.min(8, r.capabilities.getMaxAnisotropy());
      return m;
    }) as [THREE.CanvasTexture, THREE.CanvasTexture];
    const face = (map: THREE.Texture) => new T.MeshStandardMaterial({ map, roughness: 0.55 });
    // a box's faces: +x, -x, +y, -y, front, back
    const obj = new T.Mesh(new T.BoxGeometry(1, 1, 1), [sideMat, sideMat, sideMat, sideMat, face(maps[0]), face(maps[1])]);
    group.add(obj);
    const t: Tile = { obj, faces, maps, turns: 0, flip: null, pos: { x: 0, y: 0, w: 1, h: 1 }, from: { x: 0, y: 0 }, phase: Math.random() * 6 };
    tiles.push(t);
    return t;
  };

  // its own canvas; the shared renderer draws into it
  const cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  const ctx = cv.getContext("2d");
  stage.append(cv);
  let W = 0, H = 0;
  const draw = () => {
    if (!W || !H || !ctx) return;
    r.setSize(W, H, false);
    r.render(sc, cam);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.drawImage(r.domElement, 0, 0, cv.width, cv.height);
  };
  let tags: HTMLElement[] = [];
  const place = () => {
    tags.forEach((el, i) => {
      const t = tiles[i];
      if (!t) return;
      const o = offsetIn(el, stage);
      t.pos = { x: o.x + o.w / 2 - W / 2, y: o.y + o.h / 2 - H / 2, w: o.w, h: o.h };
    });
  };
  const size = () => {
    W = stage.offsetWidth;
    H = stage.offsetHeight;
    if (!W || !H) return;
    const pr = r.getPixelRatio();
    cv.width = Math.round(W * pr);
    cv.height = Math.round(H * pr);
    cam.aspect = W / H;
    cam.position.set(0, 0, H / 2 / Math.tan((cam.fov * Math.PI) / 360));
    cam.updateProjectionMatrix();
    place();
  };
  const resize = () => {
    size();
    for (const t of tiles) t.from = { x: t.pos.x, y: t.pos.y };
    step(true);
    draw();
  };

  const lean = { x: 0, y: 0, tx: 0, ty: 0 };
  let now = 0;
  const step = (instant = false) => {
    const still = calm() || instant;
    lean.x += (lean.tx - lean.x) * (still ? 1 : 0.08);
    lean.y += (lean.ty - lean.y) * (still ? 1 : 0.08);
    group.rotation.set(lean.y * 0.12, lean.x * 0.2, 0);
    for (const t of tiles) {
      let a = 1;
      if (t.flip) {
        a = still ? 1 : Math.min(1, Math.max(0, (now - t.flip.at) / FLIP_S));
        if (a >= 1) t.flip = null;
      }
      const e = ease(a);
      const angle = t.flip ? t.flip.from + (t.turns * Math.PI - t.flip.from) * e : t.turns * Math.PI;
      const sway = still ? 0 : Math.sin(now * 1.3 + t.phase);
      const x = t.from.x + (t.pos.x - t.from.x) * e, y = t.from.y + (t.pos.y - t.from.y) * e;
      if (a >= 1) t.from = { x: t.pos.x, y: t.pos.y };
      // it lifts off the picture as it turns over
      t.obj.position.set(x, -y, Math.sin(e * Math.PI) * 40);
      t.obj.rotation.set(angle + sway * 0.04, sway * 0.06, 0);
      t.obj.scale.set(t.pos.w, t.pos.h, 12);
    }
  };

  // run while it's on screen (and the tab is showing)
  let raf = 0, onScreen = false, dead = false;
  const frame = (ms: number) => {
    now = ms / 1000;
    step();
    draw();
    raf = requestAnimationFrame(frame);
  };
  const run = () => {
    cancelAnimationFrame(raf);
    if (dead || !onScreen || document.hidden) return;
    raf = requestAnimationFrame(frame);
  };
  const io = new IntersectionObserver((e) => {
    onScreen = e.some((x) => x.isIntersecting);
    run();
  });
  io.observe(stage);
  document.addEventListener("visibilitychange", run);

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const b = stage.getBoundingClientRect();
    lean.tx = ((e.clientX - b.left) / b.width) * 2 - 1;
    lean.ty = ((e.clientY - b.top) / b.height) * 2 - 1;
  };
  const onLeave = () => (lean.tx = lean.ty = 0);
  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerleave", onLeave);

  const ro = new ResizeObserver(resize);
  ro.observe(stage);

  return {
    show: (traits, els) => {
      tags = els;
      const first = !tiles.length;
      while (tiles.length < traits.length) tile();
      // each tile glides from where it is now
      for (const t of tiles) t.from = { x: t.obj.position.x, y: -t.obj.position.y };
      size();
      traits.forEach((trait, i) => {
        const t = tiles[i];
        // paint the face that's turned away, then turn it to you
        const next = first ? 0 : (t.turns + 1) % 2;
        if (first) {
          // both faces are the tag's shape from the start (a texture can't change size once it's in use)
          for (const c of t.faces) {
            c.width = TW;
            c.height = Math.round((TW * t.pos.h) / t.pos.w);
          }
          paint(t.faces[1], trait, t.pos.w, t.pos.h, true);
        }
        paint(t.faces[next], trait, t.pos.w, t.pos.h, next === 1);
        t.maps[next].needsUpdate = true;
        if (first) {
          t.maps[1].needsUpdate = true;
          t.from = { x: t.pos.x, y: t.pos.y };
          return;
        }
        const angle = t.obj.rotation.x;
        t.turns += 1;
        t.flip = { from: angle, at: now + i * STAGGER_S };
      });
      if (first) stage.classList.add("ready");
      step(!onScreen);
      draw();
    },
    destroy: () => {
      dead = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", run);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      for (const t of tiles) {
        t.obj.geometry.dispose();
        (t.obj.material as THREE.Material[]).slice(4).forEach((m) => m.dispose());
        t.maps.forEach((m) => m.dispose());
      }
      sideMat.dispose();
      cv.remove();
    },
  };
}
