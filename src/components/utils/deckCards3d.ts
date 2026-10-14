// A small deck of real 3D cards for the home page's "How to play" steps (three.js). Scrolling the deck
// into view deals the cards in, one at a time: each one tumbles in from the side and settles, face
// up, where the layout puts it (deckPoses.ts works out where each card is, so that no two ever pass
// through each other). Once dealt they sway a little and the deck leans toward the pointer; the card
// under the pointer lifts (if nothing rests on it), and clicking it follows its link. Scrolling back
// up takes them back out again. It renders only while it's on screen; visitors who ask for less
// motion get the cards already dealt and holding still.
// One WebGL renderer serves the whole page (card3d.ts): this deck renders through it and copies the
// picture onto its own 2D canvas.
import type * as THREE from "three";
import { bleedCanvas, calm, cardShadow, loadTexture, loadThree, makeCard, paint, renderer, studio, warm } from "./card3d";
import type { Three } from "./card3d";
import type { CardEdge, CardFaces } from "./cardViewer3d";
import { clamp } from "./cardPose";
import { deckPoses, keepClear } from "./deckPoses";
import type { ClearBox, DeckCardMotion, DeckPose } from "./deckPoses";

export type { DeckPose };

export interface DeckCard {
  faces: () => Promise<CardFaces>;
  label: string;
  href?: string;
}

interface MountOptions {
  cards: DeckCard[];
  mm: [number, number];
  edge?: CardEdge;
  from: "left" | "right"; // the side they're dealt from
  layout: (w: number, h: number, stacked: boolean) => DeckPose[];
  onPick?: (card: DeckCard) => void;
  onFail: () => void;
}

export interface DeckApi {
  destroy: () => void;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

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
    const x = typeof f === "string" ? await loadTexture(T, f) : new T.CanvasTexture(f);
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
  const shadowMap = cardShadow(T);

  interface Live extends DeckCardMotion {
    card: DeckCard;
    obj: THREE.Group; // the card, scaled to px
    shadow: THREE.Mesh;
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
      rest: { x: 0, y: 0, w: 1, tilt: 0 },
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
  let W = 0, H = 0, CW = 0, CH = 0; // the stage's size; the canvas's (it reaches past the stage)
  const draw = () => {
    if (!W || !H || !ctx) return;
    paint(r, sc, cam, ctx, CW, CH);
  };
  // Where the cards rest: where the layout puts them (on phones and small tablets the deck spans the
  // whole step), moved as little as it takes to keep clear of the step's words and drawings, wherever
  // those are at this size
  const area = stage.parentElement ?? stage;
  const clearOf = (): ClearBox[] => {
    const s = stage.getBoundingClientRect(), cx = s.left + s.width / 2, cy = s.top + s.height / 2;
    const box = (b: DOMRect): ClearBox => ({ x0: b.left - cx, y0: b.top - cy, x1: b.right - cx, y1: b.bottom - cy });
    const boxes: ClearBox[] = [];
    const walk = document.createTreeWalker(area, NodeFilter.SHOW_TEXT), range = document.createRange();
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      if (!n.textContent?.trim() || stage.contains(n)) continue;
      range.selectNodeContents(n);
      const b = range.getBoundingClientRect();
      if (b.width && b.height) boxes.push(box(b));
    }
    for (const im of area.querySelectorAll("img")) {
      const b = im.getBoundingClientRect();
      if (!stage.contains(im) && b.width && b.height) boxes.push(box(b));
    }
    return boxes;
  };
  const place = () => {
    if (!W || !H) return;
    const poses = keepClear(layout(W, H, W > innerWidth * 0.9), aspect, clearOf(), W, H);
    live.forEach((l, i) => (l.rest = poses[i] ?? poses[poses.length - 1]));
  };
  // again once the drawings (which load lazily) and the fonts are in
  const replace = () => {
    place();
    step(0, true);
    draw();
  };
  const imgs = Array.from(area.querySelectorAll("img"));
  imgs.forEach((im) => im.addEventListener("load", replace));
  document.fonts?.ready.then(() => !dead && replace());

  // one unit is one px where the cards rest (z = 0)
  const size = () => {
    W = stage.clientWidth;
    H = stage.clientHeight;
    if (!W || !H) return;
    // room above and below for a card leaning or lifting past the step's edges (not the sides: the
    // cards come in from off the side)
    ({ w: CW, h: CH } = bleedCanvas(cv, W, H, 0, Math.round(Math.max(160, H * 0.3)), r.getPixelRatio()));
    cam.aspect = CW / CH;
    cam.position.set(0, 0, CH / 2 / Math.tan((cam.fov * Math.PI) / 360));
    cam.updateProjectionMatrix();
    place();
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
  const step = (dt: number, instant = false) => {
    t += dt;
    const still = calm();
    const k = (rate: number) => (instant ? 1 : 1 - Math.exp(-dt * rate));
    dealt += (target() - dealt) * k(6);
    lean.x += (lean.tx - lean.x) * k(4);
    lean.y += (lean.ty - lean.y) * k(4);
    deck.rotation.set(lean.y * 0.06, lean.x * 0.1, 0);
    live.forEach((l) => (l.lift += ((l === hovered ? 1 : 0) - l.lift) * k(9)));
    const fromX = side * (W / 2 + Math.max(...live.map((l) => l.rest.w)) * 0.9);
    const poses = deckPoses(dealt, t, live, { aspect, fromX, H }, live.map((l) => l.lift), still);
    live.forEach((l, i) => {
      const q = poses[i];
      l.obj.position.set(q.x, q.y, q.z);
      l.obj.rotation.set(q.rx, q.ry, q.rz);
      l.obj.scale.setScalar(l.rest.w * q.scale);
      l.obj.visible = q.shown;
      // its shadow on the page, behind every card: further off and fainter the higher the card is
      l.shadow.visible = q.shown;
      l.shadow.position.set(q.x + 10 + q.z * 0.06, q.y - 16 - q.z * 0.12, -40);
      l.shadow.rotation.z = q.rz;
      l.shadow.scale.setScalar(l.rest.w * (1 + q.z * 0.0006));
      (l.shadow.material as THREE.MeshBasicMaterial).opacity = 0.3 * clamp(1 - q.z / 600);
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
  let down: { x: number; y: number } | null = null;
  const onMove = (e: PointerEvent) => {
    // a finger moving is scrolling the page: only a tap (its pointerup) picks a card
    if (e.pointerType !== "mouse" && e.type !== "pointerup") {
      hovered = null;
      return;
    }
    const b = cv.getBoundingClientRect();
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
  await warm(r, sc, cam); // shaders and pictures ready before its first frame
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
      imgs.forEach((im) => im.removeEventListener("load", replace));
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
