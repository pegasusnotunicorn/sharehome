// A small deck of real 3D cards for the home page's "How to play" steps (three.js). Scrolling the deck
// into view deals the cards in: each one tumbles in from the side and lands, turning face up, where
// the layout puts it. Once dealt they breathe a little and the deck leans toward the pointer; the card
// under the pointer lifts and squares up to you, and clicking it follows its link. Scrolling back
// up takes them back out again. It renders only while it's on screen; visitors who ask for less
// motion get the cards already dealt and holding still.
// One WebGL renderer serves the whole page (card3d.ts): this deck renders through it and copies the
// picture onto its own 2D canvas.
import type * as THREE from "three";
import { calm, loadThree, makeCard, renderer, studio } from "./card3d";
import type { Three } from "./card3d";
import type { CardEdge, CardFaces } from "./cardViewer3d";

export interface DeckCard {
  faces: () => Promise<CardFaces>;
  label: string;
  href?: string;
}

// where a card lands: its centre in px from the stage's centre (y down, like the page), its width in
// px and its tilt in degrees
export interface DeckPose {
  x: number;
  y: number;
  w: number;
  tilt: number;
}

interface MountOptions {
  cards: DeckCard[];
  mm: [number, number];
  edge?: CardEdge;
  from: "left" | "right"; // the side they're dealt from
  layout: (w: number, h: number) => DeckPose[];
  onPick?: (card: DeckCard) => void;
  onFail: () => void;
}

export interface DeckApi {
  destroy: () => void;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const outCubic = (t: number) => 1 - (1 - t) ** 3;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// a soft shadow to sit under a card on the page, made once
let shadowTex: THREE.Texture | null = null;
const shadowTexture = (T: Three) => {
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

export async function mountDeck(stage: HTMLElement, opts: MountOptions): Promise<DeckApi | null> {
  const { cards, mm, edge = "paper", from, layout, onPick, onFail } = opts;
  let T: Three, r: THREE.WebGLRenderer;
  try {
    T = await loadThree();
    r = renderer(T);
  } catch {
    onFail();
    return null;
  }
  if (!stage.isConnected) return null;

  // every card's faces, and gold foil to reflect if the edges are gold
  const tex = async (f: string | HTMLCanvasElement) => {
    const x = typeof f === "string" ? await new T.TextureLoader().loadAsync(f) : new T.CanvasTexture(f);
    x.colorSpace = T.SRGBColorSpace;
    x.anisotropy = Math.min(8, r.capabilities.getMaxAnisotropy());
    return x;
  };
  let faces: [THREE.Texture, THREE.Texture][], gold: THREE.Texture | null;
  try {
    [faces, gold] = await Promise.all([
      Promise.all(cards.map((c) => c.faces().then((f) => Promise.all([tex(f.front), tex(f.back)])))),
      edge === "gold" ? studio(T, r) : Promise.resolve(null),
    ]);
  } catch {
    onFail();
    return null;
  }
  if (!stage.isConnected) {
    faces.flat().forEach((x) => x.dispose());
    return null;
  }

  // lit like the card mockups: soft light from above, enough from the front that the art keeps its colours
  const sc = new T.Scene();
  const cam = new T.PerspectiveCamera(30, 1, 10, 8000);
  sc.add(new T.HemisphereLight(0xffffff, 0xd9d2cc, 1.35));
  const key = new T.DirectionalLight(0xffffff, 1.5);
  key.position.set(0.25, 1.2, 1);
  sc.add(key);
  const fill = new T.DirectionalLight(0xffffff, 0.75);
  fill.position.set(-0.6, -0.2, 1);
  sc.add(fill);

  const deck = new T.Group();
  sc.add(deck);
  const aspect = mm[0] / mm[1];
  const side = from === "left" ? -1 : 1;
  const shadowMap = shadowTexture(T);

  interface Live {
    card: DeckCard;
    obj: THREE.Group; // the card, scaled to px
    shadow: THREE.Mesh;
    pose: DeckPose;
    // how it arrives: where it starts and how far it tumbles on the way
    start: { dy: number; z: number; rx: number; ry: number; rz: number };
    phase: number;
    lift: number; // 0: resting, 1: lifted toward you (hovered)
  }
  const live: Live[] = cards.map((card, i) => {
    const obj = new T.Group();
    obj.add(makeCard(T, mm, faces[i][0], faces[i][1], gold));
    deck.add(obj);
    const shadow = new T.Mesh(
      new T.PlaneGeometry(1.6, 1.6 / aspect),
      new T.MeshBasicMaterial({ map: shadowMap, transparent: true, opacity: 0.3, depthWrite: false })
    );
    shadow.renderOrder = -1;
    deck.add(shadow);
    return {
      card,
      obj,
      shadow,
      pose: { x: 0, y: 0, w: 1, tilt: 0 },
      start: {
        dy: rand(-0.25, 0.25),
        z: rand(150, 320),
        rx: rand(-1.1, 1.1),
        // face down when it sets off, a turn and a half or so from landing face up
        ry: side * (Math.PI * (Math.random() < 0.5 ? 1 : 3) + rand(-0.4, 0.4)),
        rz: rand(-1.4, 1.4),
      },
      phase: rand(0, Math.PI * 2),
      lift: 0,
    };
  });

  // its own canvas; the shared renderer draws into it
  const cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  const ctx = cv.getContext("2d");
  stage.prepend(cv);
  let W = 0, H = 0;
  const draw = () => {
    if (!W || !H || !ctx) return;
    r.setSize(W, H, false);
    r.render(sc, cam);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.drawImage(r.domElement, 0, 0, cv.width, cv.height);
  };
  // one unit is one px where the cards rest (z = 0)
  const size = () => {
    W = stage.clientWidth;
    H = stage.clientHeight;
    if (!W || !H) return;
    const pr = r.getPixelRatio();
    cv.width = Math.round(W * pr);
    cv.height = Math.round(H * pr);
    cam.aspect = W / H;
    cam.position.set(0, 0, H / 2 / Math.tan((cam.fov * Math.PI) / 360));
    cam.updateProjectionMatrix();
    const poses = layout(W, H);
    live.forEach((l, i) => (l.pose = poses[i] ?? poses[poses.length - 1]));
    step(0, true);
    draw();
  };

  // how far the deck has been dealt: from its top entering the screen to its bottom reaching the
  // screen's bottom, eased so a fast scroll still lets the cards fly
  let dealt = 0;
  const target = () => {
    if (calm()) return 1;
    const b = stage.getBoundingClientRect();
    return clamp((innerHeight - b.top) / Math.max(1, b.height * 0.9));
  };

  // the pointer: the deck leans toward it, and the card under it lifts
  const ray = new T.Raycaster(), ndc = new T.Vector2(-9, -9);
  const lean = { x: 0, y: 0, tx: 0, ty: 0 };
  let hovered: Live | null = null;
  const pick = () => {
    if (ndc.x < -2) return null;
    ray.setFromCamera(ndc, cam);
    const hit = ray.intersectObjects(live.map((l) => l.obj), true)[0];
    return hit ? live.find((l) => hit.object.parent?.parent === l.obj) ?? null : null;
  };

  let t = 0;
  const DEG = Math.PI / 180;
  const step = (dt: number, instant = false) => {
    t += dt;
    const still = calm();
    const k = (rate: number) => (instant ? 1 : 1 - Math.exp(-dt * rate));
    dealt += (target() - dealt) * k(6);
    lean.x += (lean.tx - lean.x) * k(4);
    lean.y += (lean.ty - lean.y) * k(4);
    deck.rotation.set(lean.y * 0.06, lean.x * 0.1, 0);
    live.forEach((l, i) => {
      const { pose: p, start: s } = l;
      // each card a beat after the one before
      const a = clamp((dealt - i * 0.1) / 0.62);
      const e = outCubic(a);
      l.lift += ((l === hovered ? 1 : 0) - l.lift) * k(9);
      const breathe = still ? 0 : Math.sin(t * 1.1 + l.phase);
      const fromX = side * (W / 2 + p.w * 0.9);
      const x = lerp(fromX, p.x, e);
      const y = lerp(p.y + s.dy * H, p.y, e) + breathe * 3;
      const z = lerp(s.z, 0, e) + l.lift * 70;
      const tilt = p.tilt * DEG * (1 - l.lift * 0.7);
      l.obj.position.set(x, -y, z);
      l.obj.rotation.set(
        lerp(s.rx, 0, e) + breathe * 0.025 * (1 - l.lift),
        lerp(s.ry, 0, e) + Math.cos(t * 0.9 + l.phase) * (still ? 0 : 0.03) * (1 - l.lift),
        lerp(s.rz, 0, e) + tilt,
      );
      l.obj.scale.setScalar(p.w * (1 + l.lift * 0.05));
      l.obj.visible = a > 0;
      // its shadow on the page: further off and fainter the higher the card is
      l.shadow.visible = a > 0;
      l.shadow.position.set(x + 10 + z * 0.06, -y - 16 - z * 0.12, -40);
      l.shadow.rotation.z = lerp(s.rz, 0, e) + tilt;
      l.shadow.scale.setScalar(p.w * (1 + z * 0.0006));
      (l.shadow.material as THREE.MeshBasicMaterial).opacity = 0.3 * e * (1 - z / 900);
    });
  };

  // run while it's on screen (and the tab is showing)
  let raf = 0, last = 0, onScreen = false, dead = false;
  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    step(dt);
    draw();
    raf = requestAnimationFrame(frame);
  };
  const run = () => {
    cancelAnimationFrame(raf);
    if (dead || !onScreen || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const io = new IntersectionObserver((e) => {
    onScreen = e.some((x) => x.isIntersecting);
    run();
  });
  io.observe(stage);
  document.addEventListener("visibilitychange", run);

  // the cards are drawn over the step's words and doodles but let the pointer through to them (the
  // words' links still work), so the pointer is followed over the whole step
  const area = stage.parentElement ?? stage;
  let down: { x: number; y: number } | null = null;
  const onMove = (e: PointerEvent) => {
    const b = stage.getBoundingClientRect();
    ndc.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
    if (e.pointerType === "mouse") {
      lean.tx = ndc.x;
      lean.ty = -ndc.y;
    }
    hovered = e.pointerType === "mouse" || e.type === "pointerup" ? pick() : null;
    area.style.cursor = hovered?.card.href ? "pointer" : "";
  };
  const onLeave = () => {
    ndc.set(-9, -9);
    lean.tx = lean.ty = 0;
    hovered = null;
    area.style.cursor = "";
  };
  const onDown = (e: PointerEvent) => {
    down = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e: PointerEvent) => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) return;
    if ((e.target as Element).closest?.("a, button")) return;
    down = null;
    onMove(e);
    if (hovered && onPick) onPick(hovered.card);
  };
  area.addEventListener("pointermove", onMove);
  area.addEventListener("pointerleave", onLeave);
  area.addEventListener("pointerdown", onDown);
  area.addEventListener("pointerup", onUp);

  const ro = new ResizeObserver(size);
  ro.observe(stage);
  size();
  stage.classList.add("ready");

  return {
    destroy: () => {
      dead = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", run);
      area.removeEventListener("pointermove", onMove);
      area.removeEventListener("pointerleave", onLeave);
      area.removeEventListener("pointerdown", onDown);
      area.removeEventListener("pointerup", onUp);
      area.style.cursor = "";
      sc.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        ([] as THREE.Material[]).concat(m.material || []).forEach((x) => x.dispose());
      });
      faces.flat().forEach((x) => x.dispose());
      cv.remove();
    },
  };
}
