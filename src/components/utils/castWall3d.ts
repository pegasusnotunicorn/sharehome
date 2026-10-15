// The characters page's wall of cards in 3D (three.js): each card on the page is a link with its printed
// front showing; once its picture's loaded, a 3D card (gold foil edge, soft shadow) is drawn over it,
// turned a little so its edges catch the light. With a mouse they all turn a little toward the pointer,
// and the one under it (or focused) lifts off the wall, turns to face you and tilts under the pointer.
// Nothing is drawn while nothing moves, and only the cards on screen are drawn: on a phone, scrolling
// draws nothing at all. Visitors who ask for less motion get the cards lifting without the turning.
// One WebGL renderer serves the whole page (card3d.ts). One card in one scene is drawn for every card on
// the page in turn, with its own picture, and copied onto that card's 2D canvas.
import type * as THREE from "three";
import { calm, cardShadow, loadTexture, loadThree, makeCard, paint, renderer, stretchCanvas, studio, warm } from "./card3d";
import type { Three } from "./card3d";
import { CHARACTER_CARD_MM } from "../Characters/characterCardFaces";

export interface CastTile {
  link: HTMLElement; // hovering or focusing it lifts the card
  stage: HTMLElement; // the card's place on the page (the canvas reaches a little past it)
  src: string; // its printed front
  onReady: () => void; // drawn: the flat picture under it can go
}

export interface CastWallApi {
  destroy: () => void;
}

const clamp = (x: number, a = -1, b = 1) => Math.min(b, Math.max(a, x));
const ASPECT = CHARACTER_CARD_MM[1] / CHARACTER_CARD_MM[0];
const REST = { rx: -0.12, ry: -0.32 };

export async function mountCastWall(tiles: CastTile[], onFail: () => void): Promise<CastWallApi | null> {
  let T: Three, r: THREE.WebGLRenderer, gold: THREE.Texture;
  try {
    T = await loadThree();
    r = renderer(T);
    gold = await studio(T, r);
  } catch {
    onFail();
    return null;
  }
  if (!tiles.some((t) => t.stage.isConnected)) return null;

  // lit like the other cards on the site: soft light from above, enough from the front for the art
  const sc = new T.Scene();
  const cam = new T.PerspectiveCamera(30, 1, 10, 6000);
  sc.add(new T.HemisphereLight(0xffffff, 0xd9d2cc, 1.35));
  const key = new T.DirectionalLight(0xffffff, 1.5);
  key.position.set(0.25, 1.2, 1);
  sc.add(key);
  const fill = new T.DirectionalLight(0xffffff, 0.75);
  fill.position.set(-0.6, -0.2, 1);
  sc.add(fill);

  const blank = new T.Texture();
  const card = makeCard(T, CHARACTER_CARD_MM, blank, blank, gold, 2.4);
  const frontMat = (card.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
  const backMat = (card.children[1] as THREE.Mesh).material as THREE.MeshStandardMaterial;
  frontMat.roughness = 0.7; // (a satin card: the art keeps its colours under the lights)
  const holder = new T.Group();
  holder.add(card);
  sc.add(holder);
  // its shadow on the wall behind it
  const shadowMat = new T.MeshBasicMaterial({ map: cardShadow(T), color: 0x231c28, transparent: true, depthWrite: false });
  const shadow = new T.Mesh(new T.PlaneGeometry(1, 1), shadowMat);
  sc.add(shadow);

  interface Live extends CastTile {
    cv: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D | null;
    view: ((c: THREE.PerspectiveCamera) => void) | null;
    W: number;
    H: number;
    CW: number;
    CH: number;
    tex: THREE.Texture | null;
    loading: boolean;
    onScreen: boolean;
    hover: boolean;
    local: { x: number; y: number }; // where the pointer is on it (-1 to 1)
    // the pose now, and where it's heading
    rx: number; ry: number; lift: number;
    trx: number; try: number; tlift: number;
    drawn: string; // the pose it was last drawn in
    gen: number; // how many times it's been drawn
    still: HTMLImageElement; // the card at rest, as a picture (see bake)
    baked: boolean;
    baking: boolean;
  }
  const live: Live[] = tiles.map((t) => {
    const cv = document.createElement("canvas");
    cv.setAttribute("aria-hidden", "true");
    t.stage.appendChild(cv);
    const still = document.createElement("img");
    still.alt = "";
    still.setAttribute("aria-hidden", "true");
    still.decoding = "async";
    still.style.display = "none";
    t.stage.appendChild(still);
    return {
      ...t, cv, ctx: cv.getContext("2d"), view: null, W: 0, H: 0, CW: 0, CH: 0, tex: null, loading: false,
      onScreen: false, hover: false, local: { x: 0, y: 0 },
      rx: REST.rx, ry: REST.ry, lift: 0, trx: REST.rx, try: REST.ry, tlift: 0, drawn: "",
      gen: 0, still, baked: false, baking: false,
    };
  });

  const size = (l: Live) => {
    l.W = l.stage.clientWidth;
    l.H = l.stage.clientHeight || Math.round(l.W * ASPECT);
    if (!l.W) return;
    // room round it for the lift and the tilt, and below it for the shadow
    const by = { left: Math.round(l.W * 0.1), right: Math.round(l.W * 0.1), top: Math.round(l.H * 0.16), bottom: Math.round(l.H * 0.34) };
    const s = stretchCanvas(l.cv, l.W, l.H, by, r.getPixelRatio());
    l.CW = s.w;
    l.CH = s.h;
    l.view = s.view;
    l.drawn = "";
  };

  const draw = (l: Live) => {
    if (!l.tex || !l.ctx || !l.view || !l.W) return;
    l.gen++;
    if (l.baked) {
      l.baked = false;
      l.cv.style.display = "";
      l.still.style.display = "none";
    }
    l.view(cam);
    const w = l.W;
    frontMat.map = backMat.map = l.tex;
    holder.position.set(0, w * 0.012 * l.lift, w * 0.13 * l.lift);
    holder.rotation.set(l.rx, l.ry, 0);
    card.scale.setScalar(w * (1 + 0.02 * l.lift));
    // the shadow drops and softens as it lifts
    const spread = 1 + 0.12 * l.lift;
    // (well behind it, so the card never dips into it as it tilts)
    shadow.position.set(w * 0.01 * l.ry, -w * (0.035 + 0.05 * l.lift), -w * 0.3);
    shadow.scale.set(w * 1.32 * spread, w * ASPECT * 1.45 * spread, 1);
    shadowMat.opacity = 0.42 - 0.12 * l.lift;
    paint(r, sc, cam, l.ctx, l.CW, l.CH);
  };

  // where each card wants to be
  let mouse: { x: number; y: number } | null = null;
  const aim = () => {
    const still = calm(), reach = Math.max(innerWidth, innerHeight);
    for (const l of live) {
      if (!l.onScreen) continue;
      if (still) {
        l.trx = REST.rx;
        l.try = REST.ry;
        l.tlift = l.hover ? 1 : 0;
        continue;
      }
      let rx = REST.rx, ry = REST.ry;
      if (mouse) {
        const b = l.stage.getBoundingClientRect();
        ry += clamp((mouse.x - b.left - b.width / 2) / reach) * 0.22;
        rx += clamp((mouse.y - b.top - b.height / 2) / reach) * 0.16;
      }
      if (l.hover) {
        // turned to face you, and pressed where the pointer is
        ry = l.local.x * 0.24;
        rx = l.local.y * 0.2;
      }
      l.trx = rx;
      l.try = ry;
      l.tlift = l.hover ? 1 : 0;
    }
  };

  // A card that's come to rest is swapped for a picture of itself: a page of canvases is costly to put
  // on screen (each one's its own layer, every frame), a page of pictures isn't. It's back to its
  // canvas the moment it moves.
  const resting = (l: Live) => !mouse && !l.hover && l.rx === l.trx && l.ry === l.try && l.lift === l.tlift;
  const bake = (l: Live) => {
    if (l.baked || l.baking || !l.tex || !l.W || !resting(l)) return;
    l.baking = true;
    const gen = l.gen;
    l.cv.toBlob(
      (blob) => {
        if (dead || !blob || gen !== l.gen) return void (l.baking = false);
        const old = l.still.src, url = URL.createObjectURL(blob);
        l.still.onload = l.still.onerror = () => {
          l.baking = false;
          if (old) URL.revokeObjectURL(old);
          if (dead || gen !== l.gen || !l.still.naturalWidth) return;
          l.still.style.cssText = l.cv.style.cssText;
          l.still.style.display = "";
          l.cv.style.display = "none";
          l.baked = true;
        };
        l.still.src = url;
      },
      "image/webp",
      0.95
    );
  };

  let raf = 0, last = 0, dead = false;
  const frame = (now: number) => {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    aim();
    const k = calm() ? 1 : 1 - Math.exp(-dt * 9);
    let moving = false;
    for (const l of live) {
      if (!l.onScreen || !l.tex) continue;
      l.rx += (l.trx - l.rx) * k;
      l.ry += (l.try - l.ry) * k;
      l.lift += (l.tlift - l.lift) * k;
      if (Math.abs(l.trx - l.rx) + Math.abs(l.try - l.ry) + Math.abs(l.tlift - l.lift) > 0.0015) moving = true;
      else (l.rx = l.trx), (l.ry = l.try), (l.lift = l.tlift);
      const pose = `${l.rx.toFixed(4)} ${l.ry.toFixed(4)} ${l.lift.toFixed(4)}`;
      if (pose !== l.drawn) {
        l.drawn = pose;
        draw(l);
      }
    }
    for (const l of live) bake(l);
    if (moving) wake();
  };
  const wake = () => {
    if (dead || raf || document.hidden) return;
    if (!last || performance.now() - last > 100) last = performance.now();
    raf = requestAnimationFrame(frame);
  };

  // each card's picture, as it nears the screen
  const load = async (l: Live) => {
    if (l.loading) return;
    l.loading = true;
    try {
      const x = await loadTexture(T, l.src);
      x.colorSpace = T.SRGBColorSpace;
      x.anisotropy = Math.min(8, r.capabilities.getMaxAnisotropy());
      if (dead) return x.dispose();
      r.initTexture(x);
      l.tex = x;
      size(l);
      aim();
      l.rx = l.trx;
      l.ry = l.try;
      draw(l);
      l.drawn = "";
      l.onReady();
      bake(l);
      wake();
    } catch {
      l.loading = false; // (its flat picture stays)
    }
  };
  const near = new IntersectionObserver(
    (es) => es.forEach((e) => e.isIntersecting && load(live.find((l) => l.stage === e.target)!)),
    { rootMargin: "400px 0px" }
  );
  const seen = new IntersectionObserver((es) => {
    for (const e of es) {
      const l = live.find((x) => x.stage === e.target);
      if (l) l.onScreen = e.isIntersecting;
    }
    wake();
  });
  const ro = new ResizeObserver((es) => {
    for (const e of es) {
      const l = live.find((x) => x.stage === e.target);
      if (l) {
        size(l);
        draw(l);
        bake(l);
      }
    }
  });

  // the pointer and the page
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    mouse = { x: e.clientX, y: e.clientY };
    wake();
  };
  const onLeavePage = () => {
    mouse = null;
    wake();
  };
  const offs: (() => void)[] = [];
  const on = <K extends keyof HTMLElementEventMap>(el: HTMLElement, type: K, f: (e: HTMLElementEventMap[K]) => void) => {
    el.addEventListener(type, f as EventListener);
    offs.push(() => el.removeEventListener(type, f as EventListener));
  };
  for (const l of live) {
    on(l.link, "pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const b = l.stage.getBoundingClientRect();
      l.local = { x: clamp(((e.clientX - b.left) / b.width) * 2 - 1), y: clamp(((e.clientY - b.top) / b.height) * 2 - 1) };
      l.hover = true;
      wake();
    });
    on(l.link, "pointerleave", () => {
      l.hover = false;
      wake();
    });
    on(l.link, "focus", () => {
      l.hover = l.link.matches(":focus-visible");
      l.local = { x: 0, y: 0 };
      wake();
    });
    on(l.link, "blur", () => {
      l.hover = false;
      wake();
    });
  }
  addEventListener("pointermove", onMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeavePage);
  // (the cards move under a still mouse as the page scrolls)
  const onScroll = () => mouse && wake();
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", wake);
  document.addEventListener("visibilitychange", wake);

  await warm(r, sc, cam);
  for (const l of live) {
    near.observe(l.stage);
    seen.observe(l.stage);
    ro.observe(l.stage);
  }

  return {
    destroy: () => {
      dead = true;
      cancelAnimationFrame(raf);
      near.disconnect();
      seen.disconnect();
      ro.disconnect();
      offs.forEach((f) => f());
      removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeavePage);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", wake);
      document.removeEventListener("visibilitychange", wake);
      sc.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        ([] as THREE.Material[]).concat(m.material || []).forEach((x) => x.dispose());
      });
      for (const l of live) {
        l.tex?.dispose();
        l.cv.remove();
        if (l.still.src) URL.revokeObjectURL(l.still.src);
        l.still.remove();
      }
    },
  };
}
