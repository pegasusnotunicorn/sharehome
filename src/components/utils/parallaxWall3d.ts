// The home page's wall of character cards, just below the hero, in 3D (three.js). It's driven by the
// page's scroll (ParallaxSection.tsx passes how far through the section you are, 0 to 1):
//   - first half: the wall rises from lying back to standing up, a slight curve toward you, its rows
//     sliding opposite ways; the one gap in the top row is filled by a card that tumbles down into it
//   - second half: the wall splits down the middle, each side swinging back like a pair of doors and
//     fading a little, to show the words behind it
// The pointer leans the wall toward it, and the card under it lifts and squares up; clicking it
// opens that character's page. It renders only while it's on screen; visitors who ask for less
// motion get it following the scroll without the small idle movements.
// One WebGL renderer serves the whole page (card3d.ts): the wall renders through it and copies the
// picture onto its own 2D canvas.
import type * as THREE from "three";
import { calm, cardShadow, ease, loadThree, makeCard, renderer, studio } from "./card3d";
import type { Three } from "./card3d";
import { ATLAS } from "./footerCards3d";
import { CHARACTER_CARD_MM } from "../Characters/characterCardFaces";

export interface WallCard {
  front: () => Promise<HTMLCanvasElement>;
  atlasIndex: number; // where its back is in the sprite sheet of card backs
  urlName: string;
}

interface MountOptions {
  cards: WallCard[]; // row by row
  cols: number;
  cardWidth: (w: number) => number; // a card's width in px on a stage this wide
  onPick: (card: WallCard) => void;
  onFail: () => void;
}

export interface WallApi {
  progress: (p: number) => void;
  destroy: () => void;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const GAP = 16;

export async function mountWall(stage: HTMLElement, opts: MountOptions): Promise<WallApi | null> {
  const { cards, cols, cardWidth, onPick, onFail } = opts;
  let T: Three, r: THREE.WebGLRenderer;
  try {
    T = await loadThree();
    r = renderer(T);
  } catch {
    onFail();
    return null;
  }
  if (!stage.isConnected) return null;

  const tex = (x: THREE.Texture) => {
    x.colorSpace = T.SRGBColorSpace;
    x.anisotropy = Math.min(8, r.capabilities.getMaxAnisotropy());
    return x;
  };
  let fronts: THREE.Texture[], backs: THREE.Texture, gold: THREE.Texture;
  try {
    [fronts, backs, gold] = await Promise.all([
      Promise.all(cards.map((c) => c.front().then((cv) => tex(new T.CanvasTexture(cv))))),
      new T.TextureLoader().loadAsync(ATLAS.backs).then(tex),
      studio(T, r),
    ]);
  } catch {
    onFail();
    return null;
  }
  if (!stage.isConnected) {
    fronts.forEach((x) => x.dispose());
    backs.dispose();
    return null;
  }

  // one cell of the backs' sprite sheet (the sheet's image is shared, only the window moves)
  const { cellW, cellH, pad } = ATLAS;
  const sheetW = ATLAS.cols * cellW, sheetH = ATLAS.rows * cellH;
  const backCell = (i: number) => {
    const t = backs.clone();
    const c = i % ATLAS.cols, row = Math.floor(i / ATLAS.cols);
    t.repeat.set((cellW - 2 * pad) / sheetW, (cellH - 2 * pad) / sheetH);
    t.offset.set((c * cellW + pad) / sheetW, 1 - ((row + 1) * cellH - pad) / sheetH);
    return t;
  };

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
  const wall = new T.Group();
  sc.add(wall);
  const shadowMap = cardShadow(T);
  const aspect = CHARACTER_CARD_MM[0] / CHARACTER_CARD_MM[1];

  const rows = Math.ceil(cards.length / cols);
  const mid = Math.floor(cols / 2);
  interface Live {
    card: WallCard;
    row: number;
    col: number;
    obj: THREE.Group;
    shadow: THREE.Mesh;
    back: THREE.Texture;
    missing: boolean; // the one that tumbles into the gap
    spin: [number, number, number];
    phase: number;
    lift: number;
  }
  const live: Live[] = cards.map((card, i) => {
    const row = Math.floor(i / cols), col = i % cols;
    const back = backCell(card.atlasIndex);
    const obj = new T.Group();
    obj.add(makeCard(T, CHARACTER_CARD_MM, fronts[i], back, gold));
    wall.add(obj);
    const shadow = new T.Mesh(
      new T.PlaneGeometry(1.6, 1.6 / aspect),
      new T.MeshBasicMaterial({ map: shadowMap, transparent: true, opacity: 0.16, depthWrite: false })
    );
    shadow.renderOrder = -1;
    wall.add(shadow);
    return {
      card,
      row,
      col,
      obj,
      shadow,
      back,
      missing: row === 0 && col === mid,
      spin: [rand(-3.5, 3.5), rand(-3.5, 3.5), Math.PI / 2],
      phase: rand(0, Math.PI * 2),
      lift: 0,
    };
  });

  // its own canvas; the shared renderer draws into it
  const cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  const ctx = cv.getContext("2d");
  stage.prepend(cv);
  let W = 0, H = 0, cw = 1;
  const draw = () => {
    if (!W || !H || !ctx) return;
    r.setSize(W, H, false);
    r.render(sc, cam);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.drawImage(r.domElement, 0, 0, cv.width, cv.height);
  };
  // one unit is one px where the wall stands (z = 0)
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
    cw = cardWidth(W);
    step(0, true);
    draw();
  };

  let target = 0, p = 0;
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
  const step = (dt: number, instant = false) => {
    t += dt;
    const still = calm();
    const k = (rate: number) => (instant || still ? 1 : 1 - Math.exp(-dt * rate));
    p += (target - p) * k(4);
    lean.x += (lean.tx - lean.x) * k(4);
    lean.y += (lean.ty - lean.y) * k(4);

    const ch = cw / aspect;
    const rise = ease(clamp(p / 0.45)); // lying back, to standing
    const slide = clamp(p / 0.5); // the rows' drift
    wall.rotation.set(lerp(0.6, 0.06, rise) + lean.y * 0.05, lean.x * 0.08, 0);
    wall.position.set(0, lerp(-H * 0.12, 0, rise), lerp(-260, 0, rise));
    cv.style.opacity = String(1 - 0.35 * ease(clamp((p - 0.5) / 0.5)));

    for (const l of live) {
      const dir = l.row % 2 !== 0 ? 1 : -1;
      let x = (l.col - (cols - 1) / 2) * (cw + GAP) + dir * 0.25 * cw * slide;
      let y = (l.row - (rows - 1) / 2) * (ch + GAP);
      let z = 0, rx = 0, ry = 0, rz = 0, scale = 1;

      // the missing card tumbles down into its place
      if (l.missing) {
        const a = ease(clamp(p / 0.5));
        y = lerp(y - 3 * ch, y, a);
        z = lerp(300, 0, a);
        rx = lerp(l.spin[0], 0, a);
        ry = lerp(l.spin[1], 0, a);
        rz = lerp(l.spin[2], 0, a);
        scale = a;
      }

      // the split: left of the middle swings left, the rest right (the middle card alternating by row),
      // the ones nearest the middle first. Each side closes up just clear of the words in the middle
      // (on phones, where the words fill the width, they go off the sides).
      const toLeft = dir > 0 ? l.col < mid : l.col <= mid;
      const inner = toLeft ? (dir > 0 ? mid - 1 : mid) : dir > 0 ? mid : mid + 1; // the column nearest the gap
      const gapHalf = W <= 600 ? W / 2 + cw * 0.15 : Math.min(Math.max(W * 0.2, 260), 360);
      const packed = gapHalf + cw / 2 + Math.abs(l.col - inner) * (cw + GAP) * 0.85;
      const from = Math.abs(l.col - (cols - 1) / 2) / cols;
      const s = ease(clamp(((p - 0.5) / 0.5 - from * 0.35) / 0.65));
      x = lerp(x, toLeft ? -packed : packed, s);
      z += 50 * s;
      ry += (toLeft ? -1 : 1) * 0.5 * s;

      // the curve: the wall's ends turn toward you
      ry += (-x / W) * 0.45;
      z -= (x / W) ** 2 * 380;

      const breathe = still ? 0 : Math.sin(t * 1.05 + l.phase);
      l.lift += ((l === hovered ? 1 : 0) - l.lift) * k(9);
      const settle = 1 - l.lift;
      l.obj.position.set(x, -y + breathe * 2.5, z + l.lift * 60);
      l.obj.rotation.set(rx * settle + breathe * 0.02, ry * settle, rz * settle);
      l.obj.scale.setScalar(cw * scale * (1 + l.lift * 0.05));
      l.obj.visible = scale > 0.01;
      l.shadow.visible = l.obj.visible;
      // just behind its own card, however the card's turned (so it never lands on a card)
      const depth = z - 40 - (cw / 2) * Math.abs(Math.sin(ry * settle));
      l.shadow.position.set(x + 8 + z * 0.05, -y - 12 - z * 0.1, depth);
      l.shadow.rotation.set(0, 0, rz * settle);
      l.shadow.scale.setScalar(cw * scale);
      (l.shadow.material as THREE.MeshBasicMaterial).opacity = 0.16 * scale * clamp(1 - z / 500);
    }
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

  // the pointer, where it reaches the wall's section (the hero and the words are over parts of it)
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
    area.style.cursor = hovered ? "pointer" : "";
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
    down = null;
    onMove(e);
    if (hovered) onPick(hovered.card);
  };
  area.addEventListener("pointermove", onMove);
  area.addEventListener("pointerleave", onLeave);
  area.addEventListener("pointerdown", onDown);
  area.addEventListener("pointerup", onUp);

  const ro = new ResizeObserver(size);
  ro.observe(stage);
  size();

  return {
    progress: (x) => {
      target = clamp(x);
      if (!onScreen) {
        step(0, true);
        draw();
      }
    },
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
      fronts.forEach((x) => x.dispose());
      live.forEach((l) => l.back.dispose());
      backs.dispose();
      cv.remove();
    },
  };
}
