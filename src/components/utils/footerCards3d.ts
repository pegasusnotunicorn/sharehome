// The footer's cloud of character cards (three.js): real cards with gold foil edges, drifting and
// tumbling slowly. The cloud leans toward the pointer; a card under the pointer turns to face you, and
// clicking it opens that character's page. It animates only while it's on screen, and holds still for
// visitors who ask for less motion. The art comes from two sprite sheets (scripts/card-atlas.mjs).
import type * as THREE from "three";
import { calm, loadTexture, loadThree, makeCard, paint, renderer, studio, warm } from "./card3d";
import { CHARACTER_CARD_MM } from "../Characters/characterCardFaces";

export const ATLAS = {
  fronts: "/images/cards/character-fronts.webp",
  backs: "/images/cards/character-backs.webp",
  cols: 5,
  rows: 5,
  cellW: 400,
  cellH: 232,
  pad: 4,
};

export interface FooterCard {
  index: number; // where the character sits in the sprite sheets
  name: string;
  urlName: string;
}

interface MountOptions {
  cards: FooterCard[];
  onHover: (card: FooterCard | null, x: number, y: number) => void;
  onPick: (card: FooterCard) => void;
  onFail: () => void;
}

export interface FooterCardsApi {
  destroy: () => void;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export async function mountFooterCards(stage: HTMLElement, { cards, onHover, onPick, onFail }: MountOptions): Promise<FooterCardsApi | null> {
  let T: typeof THREE, r: THREE.WebGLRenderer;
  try {
    T = await loadThree();
    r = renderer(T);
  } catch {
    onFail();
    return null;
  }
  if (!stage.isConnected) return null;

  let fronts: THREE.Texture, backs: THREE.Texture, gold: THREE.Texture;
  try {
    [fronts, backs, gold] = await Promise.all([loadTexture(T, ATLAS.fronts), loadTexture(T, ATLAS.backs), studio(T, r)]);
  } catch {
    onFail();
    return null;
  }
  if (!stage.isConnected) {
    fronts.dispose();
    backs.dispose();
    return null;
  }
  for (const x of [fronts, backs]) {
    x.colorSpace = T.SRGBColorSpace;
    x.anisotropy = Math.min(8, r.capabilities.getMaxAnisotropy());
  }

  // a stage lit like a TV set at night: soft light from above, a cool rim from behind
  const sc = new T.Scene();
  const cam = new T.PerspectiveCamera(30, 3, 0.1, 30);
  cam.position.set(0, 0, 6);
  cam.lookAt(0, 0, 0);
  sc.add(new T.HemisphereLight(0xffffff, 0x4a4366, 1.6));
  const key = new T.DirectionalLight(0xffffff, 2.1);
  key.position.set(0.4, 3, 2.5);
  sc.add(key);
  const rim = new T.DirectionalLight(0x9c96ff, 1.5);
  rim.position.set(-2.5, 1.5, -3);
  sc.add(rim);
  const fill = new T.DirectionalLight(0xffe8d0, 0.8);
  fill.position.set(2, -1, 3);
  sc.add(fill);

  const cloud = new T.Group();
  sc.add(cloud);

  // one cell of a sprite sheet (the sheets' images are shared, only the window moves)
  const { cols, cellW, cellH, pad } = ATLAS;
  const sheetW = cols * cellW, sheetH = ATLAS.rows * cellH;
  const cell = (sheet: THREE.Texture, i: number) => {
    const t = sheet.clone();
    const c = i % cols, row = Math.floor(i / cols);
    t.repeat.set((cellW - 2 * pad) / sheetW, (cellH - 2 * pad) / sheetH);
    t.offset.set((c * cellW + pad) / sheetW, 1 - ((row + 1) * cellH - pad) / sheetH);
    return t;
  };

  interface Live {
    card: FooterCard;
    obj: THREE.Group;
    home: THREE.Vector3;
    spin: THREE.Quaternion; // where its own tumbling has got to
    axis: THREE.Vector3;
    speed: number;
    bob: number;
    phase: number;
    focus: number; // 0: tumbling, 1: facing you
  }
  const textures: THREE.Texture[] = [];
  const live: Live[] = cards.map((card) => {
    const f = cell(fronts, card.index), b = cell(backs, card.index);
    textures.push(f, b);
    const obj = new T.Group();
    const mesh = makeCard(T, CHARACTER_CARD_MM, f, b, gold);
    mesh.traverse((o) => ((o as THREE.Mesh).castShadow = false));
    obj.add(mesh);
    cloud.add(obj);
    return {
      card,
      obj,
      home: new T.Vector3(),
      // mostly turning about the upright, so both faces show more than the edge
      spin: new T.Quaternion().setFromEuler(new T.Euler(rand(-0.25, 0.25), rand(-Math.PI, Math.PI), rand(-0.3, 0.3))),
      axis: new T.Vector3(rand(-0.18, 0.18), 1, rand(-0.18, 0.18)).normalize(),
      speed: rand(0.18, 0.4) * (Math.random() < 0.5 ? -1 : 1),
      bob: rand(0.5, 0.9),
      phase: rand(0, Math.PI * 2),
      focus: 0,
    };
  });

  // Spread the cards out, near and far: across the right of a wide band (the words are on the left), across the
  // whole of a narrow one. They never pass through each other: a card turning about its (nearly) upright axis
  // stays inside an upright cylinder, so each one goes only where its cylinder can't touch another's, either far
  // enough apart side to side or clear above or below. A card with no room left is left out.
  let W = 0, H = 0, scale = 1;
  const HOVER_GROW = 1.1;
  const layout = () => {
    const vh = 2 * cam.position.z * Math.tan((cam.fov * Math.PI) / 360), vw = vh * cam.aspect;
    const wide = cam.aspect > 1.8;
    const [x0, x1] = wide ? [-0.08, 0.47] : [-0.44, 0.44];
    scale = 1.15;
    // a card is 1 x 0.58 and tips up to about 0.5 rad off upright: its corners reach 0.58 out and 0.52 up
    const radius = 0.58 * scale * HOVER_GROW + 0.02;
    const half = 0.52 * scale * HOVER_GROW + 0.07; // plus its bob
    const placed: THREE.Vector3[] = [];
    for (const l of live) {
      let spot: THREE.Vector3 | null = null;
      for (let tries = 0; tries < 300 && !spot; tries++) {
        const z = rand(-1.6, 0.5);
        const depth = (cam.position.z - z) / cam.position.z; // farther away, more room shows
        const p = new T.Vector3(rand(x0, x1) * vw * depth, rand(-0.26, 0.26) * vh * depth, z);
        const clear = placed.every((o) => Math.hypot(p.x - o.x, p.z - o.z) >= 2 * radius || Math.abs(p.y - o.y) >= 2 * half);
        if (clear) spot = p;
      }
      l.obj.visible = !!spot;
      if (spot) {
        placed.push(spot);
        l.home.copy(spot);
      }
    }
  };

  // its own canvas; the shared renderer draws into it
  const cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  const ctx = cv.getContext("2d");
  stage.prepend(cv);
  const draw = () => {
    if (!W || !H || !ctx) return;
    paint(r, sc, cam, ctx, W, H);
  };
  const size = () => {
    W = stage.clientWidth;
    H = stage.clientHeight;
    if (!W || !H) return;
    const pr = r.getPixelRatio();
    cv.width = Math.round(W * pr);
    cv.height = Math.round(H * pr);
    cam.aspect = W / H;
    cam.updateProjectionMatrix();
    layout();
    step(0, true);
    draw();
  };

  // the pointer: the cloud leans toward it, and the card under it turns to face you
  const ray = new T.Raycaster(), ndc = new T.Vector2(-9, -9);
  const lean = { x: 0, y: 0, tx: 0, ty: 0 };
  let hovered: Live | null = null;
  let hoverAt = { x: 0, y: 0 };
  const pick = () => {
    if (ndc.x < -2) return null;
    ray.setFromCamera(ndc, cam);
    const hit = ray.intersectObjects(live.filter((l) => l.obj.visible).map((l) => l.obj), true)[0];
    return hit ? live.find((l) => l.obj === hit.object.parent?.parent) ?? null : null;
  };
  const facing = new T.Quaternion().setFromEuler(new T.Euler(-0.08, -0.18, 0));
  const tmp = new T.Quaternion(), dq = new T.Quaternion();

  let t = 0;
  const step = (dt: number, instant = false) => {
    t += dt;
    const k = instant ? 1 : 1 - Math.exp(-dt * 4);
    lean.x += (lean.tx - lean.x) * k;
    lean.y += (lean.ty - lean.y) * k;
    cloud.rotation.set(lean.y * 0.12, lean.x * 0.22, 0);
    for (const l of live) {
      if (l.focus < 0.98) {
        dq.setFromAxisAngle(l.axis, l.speed * dt);
        l.spin.premultiply(dq);
      }
      const want = l === hovered ? 1 : 0;
      l.focus += (want - l.focus) * (instant ? 1 : 1 - Math.exp(-dt * 7));
      tmp.copy(l.spin).slerp(facing, l.focus);
      l.obj.quaternion.copy(tmp);
      l.obj.position.set(l.home.x, l.home.y + Math.sin(t * l.bob + l.phase) * 0.06, l.home.z);
      l.obj.scale.setScalar(scale * (1 + l.focus * (HOVER_GROW - 1)));
    }
  };

  // run while it's on screen (and the tab is showing); still for visitors who ask for less motion
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
    if (dead || !onScreen || document.hidden || calm()) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const io = new IntersectionObserver((e) => {
    onScreen = e.some((x) => x.isIntersecting);
    run();
  });
  io.observe(stage);
  document.addEventListener("visibilitychange", run);

  let down: { x: number; y: number } | null = null;
  const onMove = (e: PointerEvent) => {
    const b = stage.getBoundingClientRect();
    ndc.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
    lean.tx = ndc.x;
    lean.ty = -ndc.y;
    // a card turning to face you can slide out from under the pointer: keep it until the pointer moves on
    let h = pick();
    if (!h && hovered && Math.hypot(e.clientX - hoverAt.x, e.clientY - hoverAt.y) < 70) h = hovered;
    if (h !== hovered) {
      hovered = h;
      hoverAt = { x: e.clientX, y: e.clientY };
      stage.style.cursor = h ? "pointer" : "";
    }
    onHover(hovered?.card ?? null, e.clientX - b.left, e.clientY - b.top);
    if (calm()) {
      step(1, true);
      draw();
    }
  };
  const onLeave = () => {
    ndc.set(-9, -9);
    lean.tx = lean.ty = 0;
    hovered = null;
    stage.style.cursor = "";
    onHover(null, 0, 0);
    if (calm()) {
      step(1, true);
      draw();
    }
  };
  const onDown = (e: PointerEvent) => {
    down = { x: e.clientX, y: e.clientY };
    onMove(e);
  };
  const onUp = (e: PointerEvent) => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) return;
    down = null;
    onMove(e);
    if (hovered) onPick(hovered.card);
  };
  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerleave", onLeave);
  stage.addEventListener("pointerdown", onDown);
  stage.addEventListener("pointerup", onUp);

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
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointerup", onUp);
      sc.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        ([] as THREE.Material[]).concat(m.material || []).forEach((x) => x.dispose());
      });
      textures.forEach((x) => x.dispose());
      fronts.dispose();
      backs.dispose();
      cv.remove();
    },
  };
}
