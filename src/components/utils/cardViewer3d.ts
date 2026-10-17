// A game card in 3D (three.js): drag to turn it any way (let go, it turns straight back to rest), zoom
// toward the pointer (left alone 3 seconds, it zooms back). Its canvas reaches below the stage, so the
// shadow under the card isn't cut off.
// Lit like the studio mockups: one soft light from above, its shadow pooled on an invisible floor.
// three.js is loaded the first time a viewer appears. One WebGL renderer serves every viewer on the
// page (browsers allow only a few contexts): each viewer renders through it and copies the picture
// onto its own 2D canvas. Nothing renders unless something changed.
import type * as THREE from "three";
import { calm, ease, loadTexture, loadThree, makeCard, paint, renderer, studio } from "./card3d";
import type { Three } from "./card3d";

type CardFace = string | HTMLCanvasElement;
export type CardEdge = "paper" | "gold"; // cream card stock, or gold foil (the character cards)
export interface CardFaces {
  front: CardFace;
  back: CardFace;
}
export interface CardViewerApi {
  zoom: (f: number) => void;
  reset: () => void;
  destroy: () => void;
}

const REST: [number, number] = [-0.42, -0.12]; // turned 24° and tipped back 7°, so its edge shows
const REST_Z = 1.4; // and zoomed in one step (the zoom-in button's step)
const BELOW = 0.3; // how far the canvas reaches below the stage, for the shadow (of the stage's height)

interface MountOptions {
  mm: [number, number];
  faces: () => Promise<CardFaces>;
  edge?: CardEdge;
  intro?: boolean; // the slow turn the first time it's on screen (not when it's just been swung in)
  onReady?: () => void; // the card's showing
  onFail: () => void;
  hold?: boolean; // left alone, it stays as it's left: no turning back to rest, no zooming back
}

const IDLE_MS = 3000; // left alone this long, zoomed in (or out), it zooms back

// Turns `stage` (a 4:3 box) into a card viewer. Resolves once the card is showing.
export async function mountCardViewer(stage: HTMLElement, { mm, faces, edge = "paper", intro = true, onReady, onFail, hold = false }: MountOptions): Promise<CardViewerApi | null> {
  let T: Three, r: THREE.WebGLRenderer;
  try {
    T = await loadThree();
    r = renderer(T);
  } catch {
    onFail();
    return null;
  }
  if (!stage.isConnected) return null;

  const sc = new T.Scene();
  const cam = new T.PerspectiveCamera(28, 4 / 3, 0.05, 20);
  const AIM = new T.Vector3(0, -0.06, 0), CAM = new T.Vector3(0, 0.38, 3.1);
  sc.add(new T.HemisphereLight(0xffffff, 0xd9d2cc, 1.25));
  const key = new T.DirectionalLight(0xffffff, 1.7);
  key.position.set(0.15, 4, 0.9);
  key.castShadow = true;
  Object.assign(key.shadow.camera, { left: -1, right: 1, top: 1, bottom: -1, near: 1, far: 7 });
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.radius = 30;
  key.shadow.blurSamples = 24;
  key.shadow.bias = -0.0005;
  sc.add(key);
  const fill = new T.DirectionalLight(0xffffff, 0.8);
  fill.position.set(0.7, 0.5, 3);
  sc.add(fill);
  const fillBack = new T.DirectionalLight(0xffffff, 0.8); // the same from behind, so the back reads as bright as the front
  fillBack.position.set(-0.7, 0.5, -3);
  sc.add(fillBack);
  const floorMat = new T.ShadowMaterial({ opacity: 0.085 });
  const floor = new T.Mesh(new T.PlaneGeometry(6, 6), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.6;
  floor.receiveShadow = true;
  sc.add(floor);
  const spin = new T.Group();
  sc.add(spin);

  let z = REST_Z, raf = 0, pending = 0, dead = false;
  const tgt = AIM.clone(), q = new T.Quaternion(), v: [number, number] = [0, 0];
  const place = () => {
    cam.position.copy(CAM).divideScalar(z).add(tgt);
    cam.lookAt(tgt);
  };
  place();

  // this viewer's own canvas; the shared renderer draws into it
  const cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  cv.dataset.cardCanvas = "";
  const ctx = cv.getContext("2d");
  stage.prepend(cv);
  let W = 0, H = 0, B = 0; // the stage; B: how far the canvas reaches below it
  const draw = () => {
    if (dead || !W || !H || !ctx) return;
    // the stage's view, carried on down past its bottom edge
    cam.aspect = W / H;
    cam.setViewOffset(W, H, 0, 0, W, H + B);
    cam.updateProjectionMatrix();
    paint(r, sc, cam, ctx, W, H + B);
  };
  const schedule = () => {
    if (!pending) pending = requestAnimationFrame(() => { pending = 0; draw(); });
  };
  const size = () => {
    W = stage.clientWidth;
    H = stage.clientHeight;
    B = Math.round(H * BELOW);
    const pr = r.getPixelRatio();
    Object.assign(cv.style, { height: `${H + B}px`, bottom: "auto", pointerEvents: "none" });
    cv.width = Math.max(1, Math.round(W * pr));
    cv.height = Math.max(1, Math.round((H + B) * pr));
    draw();
  };
  const ro = new ResizeObserver(size);
  ro.observe(stage);
  size();

  // the card's art
  const textures: THREE.Texture[] = [];
  const tex = async (f: CardFace) => {
    const x = typeof f === "string" ? await loadTexture(T, f) : new T.CanvasTexture(f);
    x.colorSpace = T.SRGBColorSpace;
    x.anisotropy = Math.min(8, r.capabilities.getMaxAnisotropy());
    textures.push(x);
    return x;
  };
  let idle = 0; // (the wait before it zooms back, below)
  const cleanup = () => {
    dead = true;
    clearTimeout(idle);
    cancelAnimationFrame(raf);
    cancelAnimationFrame(pending);
    ro.disconnect();
    io?.disconnect();
    sc.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      ([] as THREE.Material[]).concat(m.material || []).forEach((x) => x.dispose());
    });
    textures.forEach((x) => x.dispose());
    (key.shadow.map as THREE.WebGLRenderTarget | null)?.dispose();
    cv.remove();
    stage.onpointerdown = stage.onpointermove = stage.onpointerup = stage.onpointercancel = null;
    stage.ondblclick = stage.onkeydown = null;
    stage.removeEventListener("wheel", onWheel);
    stage.removeEventListener("pointermove", onHover);
    stage.style.cursor = "";
  };
  let io: IntersectionObserver | null = null;
  let front: THREE.Texture, back: THREE.Texture, gold: THREE.Texture | null = null;
  try {
    const f = await faces();
    [front, back, gold] = await Promise.all([tex(f.front), tex(f.back), edge === "gold" ? studio(T, r) : null]);
  } catch {
    cleanup();
    onFail();
    return null;
  }
  if (!stage.isConnected) {
    cleanup();
    return null;
  }
  spin.add(makeCard(T, mm, front, back, gold));
  const rest = new T.Quaternion().setFromEuler(new T.Euler(REST[1], REST[0], 0, "YXZ"));
  q.copy(rest);
  spin.quaternion.copy(rest);
  draw();
  stage.classList.add("ready");
  onReady?.();

  const X = new T.Vector3(1, 0, 0), Y = new T.Vector3(0, 1, 0), tmp = new T.Quaternion();
  const turn = (ax: number, ay: number) => {
    tmp.setFromAxisAngle(Y, ax);
    q.premultiply(tmp);
    tmp.setFromAxisAngle(X, ay);
    q.premultiply(tmp);
    q.normalize();
    spin.quaternion.copy(q);
  };
  // a turn about the upright axis (more than half a turn can't be a slerp)
  const spinBy = (rad: number, ms: number) => {
    cancelAnimationFrame(raf);
    if (calm()) {
      turn(rad, 0);
      return draw();
    }
    let done = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / ms), a = rad * ease(t);
      turn(a - done, 0);
      done = a;
      draw();
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };
  // left alone, it turns straight back to rest (the zoom stays)
  const settle = () => {
    cancelAnimationFrame(raf);
    if (hold) return;
    const q0 = q.clone(), t0 = performance.now(), ms = calm() ? 0 : 600;
    const step = (now: number) => {
      const t = ms ? Math.min(1, (now - t0) / ms) : 1;
      q.slerpQuaternions(q0, rest, ease(t));
      spin.quaternion.copy(q);
      draw();
      if (t < 1) raf = requestAnimationFrame(step);
    };
    if (ms) raf = requestAnimationFrame(step);
    else step(t0);
  };
  const coast = () => {
    cancelAnimationFrame(raf);
    if (calm()) return settle();
    const step = () => {
      v[0] *= 0.94;
      v[1] *= 0.94;
      turn(v[0], v[1]);
      draw();
      if (Math.hypot(...v) > 0.0008) raf = requestAnimationFrame(step);
      else settle();
    };
    raf = requestAnimationFrame(step);
  };
  // left alone a while, zoomed, it zooms back (not while it's held)
  const zoomed = () => Math.abs(z - REST_Z) > 0.01 || tgt.distanceTo(AIM) > 0.001;
  const rest_ = () => {
    clearTimeout(idle);
    if (hold) return;
    idle = window.setTimeout(() => {
      if (dead) return;
      if (pts.size) return rest_();
      if (zoomed()) reset();
    }, IDLE_MS);
  };
  const used = () => {
    stage.classList.add("used");
    rest_();
  };

  // zoom: the camera moves toward the card, keeping the spot under the pointer (or between two fingers) where it is
  const ray = new T.Raycaster(), ndc = new T.Vector2(), plane = new T.Plane(), dir = CAM.clone().normalize();
  const a3 = new T.Vector3(), b3 = new T.Vector3();
  const hit = (cx: number, cy: number, out: THREE.Vector3) => {
    const b = cv.getBoundingClientRect(); // (the camera's view is the whole canvas, past the stage)
    ndc.set(((cx - b.left) / b.width) * 2 - 1, -((cy - b.top) / b.height) * 2 + 1);
    ray.setFromCamera(ndc, cam);
    plane.setFromNormalAndCoplanarPoint(dir, tgt);
    return ray.ray.intersectPlane(plane, out) || out.copy(tgt);
  };
  const fit = () => {
    // you can't pan the card out of sight
    const off = a3.subVectors(tgt, AIM), max = 0.7 * (1 - 1 / z);
    if (off.length() > max) tgt.copy(AIM).add(off.setLength(max));
    place();
  };
  const zoomAt = (f: number, cx?: number, cy?: number) => {
    const b = stage.getBoundingClientRect();
    cx ??= b.left + b.width / 2;
    cy ??= b.top + b.height / 2;
    const p0 = hit(cx, cy, new T.Vector3());
    z = Math.min(4, Math.max(1, z * f));
    place();
    tgt.add(p0.sub(hit(cx, cy, b3)));
    fit();
    stage.classList.toggle("zoomed", Math.abs(z - REST_Z) > 0.01);
    schedule();
  };
  const panBy = (x0: number, y0: number, x1: number, y1: number) => {
    const p0 = hit(x0, y0, new T.Vector3());
    tgt.add(p0.sub(hit(x1, y1, b3)));
    fit();
    schedule();
  };
  const reset = () => {
    // straight, and back to the resting zoom
    used();
    cancelAnimationFrame(raf);
    stage.classList.remove("zoomed");
    const q0 = q.clone(), z0 = z, t0v = tgt.clone(), t0 = performance.now(), ms = calm() ? 0 : 600;
    const step = (now: number) => {
      const t = ms ? Math.min(1, (now - t0) / ms) : 1, k = ease(t);
      q.slerpQuaternions(q0, rest, k);
      spin.quaternion.copy(q);
      z = z0 + (REST_Z - z0) * k;
      tgt.lerpVectors(t0v, AIM, k);
      place();
      draw();
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };

  let drag: { x: number; y: number; t: number } | null = null;
  let pinch: { x: number; y: number; d: number } | null = null;
  const pts = new Map<number, { x: number; y: number }>();
  const mid = (): [number, number, number] => {
    const [p, o] = [...pts.values()];
    return [(p.x + o.x) / 2, (p.y + o.y) / 2, Math.hypot(p.x - o.x, p.y - o.y)];
  };
  // Only the card itself (and a little round it) is held to turn it, not the room round it on the stage,
  // so a swipe or a tap beside it still scrolls the page or reaches the buttons. Zoomed in, the whole
  // window is the card.
  const box = new T.Box3(), corner = new T.Vector3();
  const onCard = (cx: number, cy: number) => {
    if (zoomed()) return true;
    const b = cv.getBoundingClientRect();
    box.setFromObject(spin);
    if (box.isEmpty()) return false;
    let l = Infinity, rt = -Infinity, t = Infinity, bt = -Infinity;
    for (let i = 0; i < 8; i++) {
      corner.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).project(cam);
      const x = b.left + ((corner.x + 1) / 2) * b.width, y = b.top + ((1 - corner.y) / 2) * b.height;
      l = Math.min(l, x);
      rt = Math.max(rt, x);
      t = Math.min(t, y);
      bt = Math.max(bt, y);
    }
    const pad = 10;
    return cx >= l - pad && cx <= rt + pad && cy >= t - pad && cy <= bt + pad;
  };
  function onHover(e: PointerEvent) {
    if (e.pointerType === "mouse" && !pts.size) stage.style.cursor = onCard(e.clientX, e.clientY) ? "" : "default";
  }
  stage.addEventListener("pointermove", onHover);
  stage.onpointerdown = (e) => {
    if (e.button > 0 || (e.target as Element).closest("button")) return;
    if (!pts.size && !onCard(e.clientX, e.clientY)) return;
    cancelAnimationFrame(raf);
    used();
    try {
      stage.setPointerCapture(e.pointerId);
    } catch {
      // (a pointer the browser no longer tracks)
    }
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2) {
      // two fingers: pinch to zoom, move them together to pan
      drag = null;
      v[0] = v[1] = 0;
      const [x, y, d] = mid();
      pinch = { x, y, d };
      return;
    }
    drag = { x: e.clientX, y: e.clientY, t: e.timeStamp };
    v[0] = v[1] = 0;
    stage.classList.add("drag");
  };
  stage.onpointermove = (e) => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pts.size >= 2) {
      const [x, y, d] = mid();
      zoomAt(d / Math.max(1, pinch.d), x, y);
      panBy(pinch.x, pinch.y, x, y);
      pinch = { x, y, d };
      return;
    }
    if (!drag) return;
    const per = (Math.PI * 2) / (stage.clientWidth * 1.1); // a drag across the stage is about one turn
    const dx = (e.clientX - drag.x) * per, dy = (e.clientY - drag.y) * per, dt = Math.max(1, e.timeStamp - drag.t);
    turn(dx, dy);
    schedule();
    v[0] = (dx / dt) * 16;
    v[1] = (dy / dt) * 16;
    drag = { x: e.clientX, y: e.clientY, t: e.timeStamp };
  };
  const up = (e: PointerEvent) => {
    pts.delete(e.pointerId);
    rest_(); // (the wait starts again from when it's let go)
    if (pinch) {
      // one finger left: it turns again, no coast
      if (pts.size < 2) {
        pinch = null;
        const [p] = [...pts.values()];
        drag = p ? { x: p.x, y: p.y, t: e.timeStamp } : null;
        if (!p) stage.classList.remove("drag");
      }
      return;
    }
    if (!drag) return;
    const still = e.timeStamp - drag.t > 80;
    drag = null;
    stage.classList.remove("drag");
    if (!still && Math.hypot(...v) > 0.004) coast(); // let go while moving: it coasts, then settles
    else settle();
  };
  stage.onpointerup = up;
  stage.onpointercancel = up;
  stage.ondblclick = (e) => {
    if (!(e.target as Element).closest("button")) reset();
  };
  // The wheel zooms once the card is in use (or zoomed), so scrolling past it still scrolls the page.
  // A trackpad pinch arrives as a wheel with ctrlKey, and always zooms.
  function onWheel(e: WheelEvent) {
    const inUse = stage.classList.contains("used") || Math.abs(z - REST_Z) > 0.01 || document.activeElement === stage;
    if (!e.ctrlKey && !inUse) return;
    e.preventDefault();
    used();
    zoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), e.clientX, e.clientY);
  }
  stage.addEventListener("wheel", onWheel, { passive: false });
  stage.onkeydown = (e) => {
    // the arrow keys turn it (and stay on it: not on to another card), F flips it over
    const a = Math.PI / 12;
    const by = ({ ArrowRight: [a, 0], ArrowLeft: [-a, 0], ArrowUp: [0, -a], ArrowDown: [0, a] } as Record<string, [number, number]>)[e.key];
    if (by) {
      e.preventDefault();
      e.stopPropagation();
      used();
      cancelAnimationFrame(raf);
      turn(...by);
      schedule();
    } else if (e.key === "f" || e.key === "F") {
      e.preventDefault();
      used();
      spinBy(Math.PI, 600);
    } else if (e.key === "+" || e.key === "=") {
      e.preventDefault();
      used();
      zoomAt(1.25);
    } else if (e.key === "-" || e.key === "_") {
      e.preventDefault();
      used();
      zoomAt(0.8);
    } else if (e.key === "Home" || e.key === "0") {
      e.preventDefault();
      reset();
    }
  };

  // one slow turn to show it's 3D, the first time it's on screen, unless it's already been grabbed
  if (intro && !calm()) {
    io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((x) => x.isIntersecting)) return;
        io?.disconnect();
        if (!stage.classList.contains("used")) spinBy(Math.PI * 2, 2400);
      },
      { threshold: 0.5 }
    );
    io.observe(stage);
  }

  return {
    zoom: (f) => {
      used();
      zoomAt(f);
    },
    reset,
    destroy: cleanup,
  };
}
