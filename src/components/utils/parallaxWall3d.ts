// The home page's wall of character cards, just below the hero, in 3D (three.js). It's driven by the
// page's scroll (ParallaxSection.tsx passes how far through the section you are, 0 to 1):
//   - first half: the wall rises from lying back to standing up, curved round toward you, its rows
//     sliding opposite ways
//   - second half: each row parts down the middle, each half swinging back like a door and fading a
//     little, to show the words behind it
// Where each card is at each moment is worked out in wallPoses.ts, so that no two ever pass through
// each other. The pointer leans the wall toward it, and the card under it lifts out; clicking it
// opens that character's page. It renders only while it's on screen; visitors who ask for less
// motion get it following the scroll without the idle sway.
// One WebGL renderer serves the whole page (card3d.ts): the wall renders through it and copies the
// picture onto its own 2D canvas.
import type * as THREE from "three";
import { bleedCanvas, calm, ease, loadTexture, loadThree, makeCard, paint, pointerReaches, renderer, studio, warm } from "./card3d";
import type { Three } from "./card3d";
import { ATLAS } from "./footerCards3d";
import { CHARACTER_CARD_MM } from "../Characters/characterCardFaces";
import { hoverPose, wallPoses } from "./wallPoses";
import type { WallCardMotion } from "./wallPoses";

export interface WallCard {
  front: () => Promise<HTMLCanvasElement>;
  atlasIndex: number; // where its back is in the sprite sheet of card backs
  urlName: string;
}

interface MountOptions {
  cards: WallCard[]; // row by row
  cols: number;
  cardWidth: (w: number) => number; // a card's width in px on a stage this wide
  wordsHalfWidth: () => number; // half the width of the words the wall parts to show
  onPick: (card: WallCard) => void;
  onFail: () => void;
}

export interface WallApi {
  progress: (p: number) => void;
  destroy: () => void;
}

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export async function mountWall(stage: HTMLElement, opts: MountOptions): Promise<WallApi | null> {
  const { cards, cols, cardWidth, wordsHalfWidth, onPick, onFail } = opts;
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
      loadTexture(T, ATLAS.backs).then(tex),
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
  const rows = Math.ceil(cards.length / cols);
  interface Live extends WallCardMotion {
    card: WallCard;
    obj: THREE.Group;
    back: THREE.Texture;
    lift: number; // 0: in the wall, 1: lifted out (hovered)
  }
  const live: Live[] = cards.map((card, i) => {
    const row = Math.floor(i / cols), col = i % cols;
    const back = backCell(card.atlasIndex);
    const obj = new T.Group();
    obj.add(makeCard(T, CHARACTER_CARD_MM, fronts[i], back, gold));
    wall.add(obj);
    return {
      card,
      row,
      col,
      obj,
      back,
      lift: 0,
    };
  });

  // its own canvas; the shared renderer draws into it
  const cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  const ctx = cv.getContext("2d");
  stage.prepend(cv);
  let W = 0, H = 0, CW = 0, CH = 0, cw = 1, gap = 0; // CW x CH: the canvas, which reaches past the stage
  const draw = () => {
    if (!W || !H || !ctx) return;
    paint(r, sc, cam, ctx, CW, CH);
  };
  // one unit is one px where the wall stands (z = 0)
  const size = () => {
    W = stage.clientWidth;
    H = stage.clientHeight;
    if (!W || !H) return;
    // room above and below for the wall's ends, which curve toward you
    ({ w: CW, h: CH } = bleedCanvas(cv, W, H, 0, Math.round(H * 0.15), r.getPixelRatio()));
    cam.aspect = CW / CH;
    cam.position.set(0, 0, CH / 2 / Math.tan((cam.fov * Math.PI) / 360));
    cam.updateProjectionMatrix();
    cw = cardWidth(W);
    // the halves stop a little way clear of the words; where the words fill the width, off the sides
    const words = wordsHalfWidth();
    gap = words > W * 0.35 ? W / 2 + cw * 0.2 : words + 45;
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

  let t = 0, shownFade = "";
  const step = (dt: number, instant = false) => {
    t += dt;
    const still = calm();
    const k = (rate: number) => (instant || still ? 1 : 1 - Math.exp(-dt * rate));
    p += (target - p) * k(4);
    lean.x += (lean.tx - lean.x) * k(4);
    lean.y += (lean.ty - lean.y) * k(4);

    const rise = ease(clamp(p / 0.45)); // lying back, to standing
    wall.rotation.set(lerp(0.6, 0.06, rise) + lean.y * 0.05, lean.x * 0.08, 0);
    wall.position.set(0, lerp(-H * 0.12, 0, rise), lerp(-260, 0, rise));
    // (written only when it changes: each write restyles the page)
    const fade = (1 - 0.35 * ease(clamp((p - 0.5) / 0.5))).toFixed(3);
    if (fade !== shownFade) cv.style.opacity = shownFade = fade;

    const poses = wallPoses(p, t, { W, H, cw, cols, rows, gap }, live, still);
    live.forEach((l, i) => {
      const want = l === hovered ? 1 : 0;
      l.lift += (want - l.lift) * k(9);
      const q = hoverPose(poses[i], l.lift, cw);
      l.obj.position.set(q.x, q.y, q.z);
      l.obj.rotation.set(q.rx, q.ry, q.rz);
      l.obj.scale.setScalar(cw * q.scale);
      l.obj.visible = q.scale > 0.01;
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

  // The pointer, followed over the whole page: the hero and the words below are over parts of the
  // wall, so it counts wherever all that's in the way is see-through
  let down: { x: number; y: number } | null = null, cursor = false;
  const setCursor = (on: boolean) => {
    if (on === cursor) return;
    cursor = on;
    document.body.style.cursor = on ? "pointer" : "";
  };
  const onMove = (e: PointerEvent) => {
    // a finger moving is scrolling the page: only a tap (its pointerup) picks a card
    if (e.pointerType !== "mouse" && e.type !== "pointerup") {
      hovered = null;
      return;
    }
    if (!onScreen) {
      hovered = null;
      return setCursor(false);
    }
    const reaches = pointerReaches(stage, e.clientX, e.clientY);
    const b = cv.getBoundingClientRect();
    if (reaches) ndc.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
    else ndc.set(-9, -9);
    if (e.pointerType === "mouse") {
      lean.tx = reaches ? ndc.x : 0;
      lean.ty = reaches ? -ndc.y : 0;
    }
    hovered = reaches && (e.pointerType === "mouse" || e.type === "pointerup") ? pick() : null;
    setCursor(!!hovered);
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
  addEventListener("pointermove", onMove, { passive: true });
  addEventListener("pointerdown", onDown, { passive: true });
  addEventListener("pointerup", onUp);

  const ro = new ResizeObserver(size);
  await warm(r, sc, cam); // shaders and pictures ready before its first frame
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
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      removeEventListener("pointerup", onUp);
      setCursor(false);
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
