// A game card, or the game box, in 3D (three.js): drag to turn it any way, zoom toward the pointer, turn it over.
// Lit like the studio mockups: one soft light from above, its shadow pooled on an invisible floor.
// three.js is loaded the first time a viewer appears. One WebGL renderer serves every viewer on the
// page (browsers allow only a few contexts): each viewer renders through it and copies the picture
// onto its own 2D canvas. Nothing renders unless something changed.
import type * as THREE from "three";
import { calm, ease, loadThree, makeCard, renderer, studio } from "./card3d";
import type { Three } from "./card3d";
import { BOX_RADIUS, makeBox } from "./box3d";
import type { BoxArt, BoxPanels } from "./box3d";

export type CardFace = string | HTMLCanvasElement;
export type CardEdge = "paper" | "gold"; // cream card stock, or gold foil (the character cards)
export interface CardFaces {
  front: CardFace;
  back: CardFace;
}
export interface CardViewerApi {
  zoom: (f: number) => void;
  open: (open: boolean) => void; // the box: take the lid off, or put it back
  reset: () => void;
  destroy: () => void;
}

const REST: [number, number] = [-0.42, -0.12]; // turned 24° and tipped back 7°, so its edge shows
const REST_Z = 1.4; // and zoomed in one step (the zoom-in button's step)
// the box lies lid up, turned 24° and tipped 35° toward you, like the product shots. It doesn't zoom,
// and the camera stands far enough back that it never leaves the frame however it's turned (lid
// lifted included), its floor just below it and that floor's shadow in frame too. With the lid off
// it needs more room, and everything (camera, aim, floor) moves back by the same factor.
const BOX_REST: [number, number] = [-0.42, 0.61];
const BOX_CAM_DIST = 3.085;
const BOX_AIM_Y = -0.105;
const BOX_FLOOR = -0.61;

interface MountOptions {
  mm?: [number, number];
  faces?: () => Promise<CardFaces>;
  edge?: CardEdge;
  box?: BoxArt; // the game box instead of a card
  onMoved?: (moved: boolean) => void; // when it's been turned away from its rest pose, and back
  onFail: () => void;
}

// Turns `stage` (a 4:3 box) into a card viewer. Resolves once the card is showing.
export async function mountCardViewer(stage: HTMLElement, { mm, faces, edge = "paper", box, onMoved, onFail }: MountOptions): Promise<CardViewerApi | null> {
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
  const AIM = new T.Vector3(0, box ? BOX_AIM_Y : -0.06, 0), CAM = new T.Vector3(0, 0.38, 3.1);
  if (box) CAM.setLength(BOX_CAM_DIST);
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
  const floorMat = new T.ShadowMaterial({ opacity: 0.17 });
  const floor = new T.Mesh(new T.PlaneGeometry(6, 6), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = box ? BOX_FLOOR : -0.6;
  floor.receiveShadow = true;
  sc.add(floor);
  const spin = new T.Group();
  sc.add(spin);

  const restZ = box ? 1 : REST_Z;
  let z = restZ, raf = 0, pending = 0, lraf = 0, dead = false;
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
  let W = 0, H = 0;
  const draw = () => {
    if (dead || !W || !H || !ctx) return;
    r.setSize(W, H, false);
    cam.aspect = W / H;
    cam.updateProjectionMatrix();
    r.render(sc, cam);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.drawImage(r.domElement, 0, 0, cv.width, cv.height);
  };
  const schedule = () => {
    if (!pending) pending = requestAnimationFrame(() => { pending = 0; draw(); });
  };
  const size = () => {
    W = stage.clientWidth;
    H = stage.clientHeight;
    const pr = r.getPixelRatio();
    cv.width = Math.max(1, Math.round(W * pr));
    cv.height = Math.max(1, Math.round(H * pr));
    draw();
  };
  const ro = new ResizeObserver(size);
  ro.observe(stage);
  size();

  // the card's art
  const textures: THREE.Texture[] = [];
  const tex = async (f: CardFace) => {
    const x = typeof f === "string" ? await new T.TextureLoader().loadAsync(f) : new T.CanvasTexture(f);
    x.colorSpace = T.SRGBColorSpace;
    x.anisotropy = Math.min(8, r.capabilities.getMaxAnisotropy());
    textures.push(x);
    return x;
  };
  const cleanup = () => {
    dead = true;
    cancelAnimationFrame(raf);
    cancelAnimationFrame(pending);
    cancelAnimationFrame(lraf);
    cancelAnimationFrame(oraf);
    clearTimeout(settle);
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
    stage.onpointerdown = stage.onpointermove = stage.onpointerup = stage.onpointercancel = stage.onpointerleave = null;
    stage.ondblclick = stage.onkeydown = null;
    stage.removeEventListener("wheel", onWheel);
  };
  let io: IntersectionObserver | null = null;
  let settle = 0;
  let object: THREE.Object3D, pose: ((hover: number, open: number) => number) | null = null;
  try {
    if (box) {
      const panels = async (p: BoxPanels) => {
        const [top, near, far, left, right] = await Promise.all([p.top, p.near, p.far, p.left, p.right].map(tex));
        return { top, near, far, left, right };
      };
      const [lid, base] = await Promise.all([panels(box.lid), panels(box.base)]);
      ({ box: object, pose } = makeBox(T, lid, base));
    } else {
      if (!mm || !faces) throw new Error("A card needs its size and faces");
      const f = await faces();
      const [front, back, gold] = await Promise.all([tex(f.front), tex(f.back), edge === "gold" ? studio(T, r) : null]);
      object = makeCard(T, mm, front, back, gold);
    }
  } catch {
    cleanup();
    onFail();
    return null;
  }
  if (!stage.isConnected) {
    cleanup();
    return null;
  }
  spin.add(object);
  // the box turns about its own up axis first, then tips (XYZ), so its yaw is a spin on the table
  const rest = new T.Quaternion().setFromEuler(
    box ? new T.Euler(BOX_REST[1], BOX_REST[0], 0, "XYZ") : new T.Euler(REST[1], REST[0], 0, "YXZ")
  );
  q.copy(rest);
  spin.quaternion.copy(rest);
  draw();
  stage.classList.add("ready");

  const X = new T.Vector3(1, 0, 0), Y = new T.Vector3(0, 1, 0), tmp = new T.Quaternion();
  let moved = false, intro = false;
  const report = () => {
    const m = q.angleTo(rest) > 0.02;
    if (m !== moved) onMoved?.((moved = m));
  };
  const turn = (ax: number, ay: number) => {
    tmp.setFromAxisAngle(Y, ax);
    q.premultiply(tmp);
    tmp.setFromAxisAngle(X, ay);
    q.premultiply(tmp);
    q.normalize();
    spin.quaternion.copy(q);
    if (!intro) report();
  };
  // a turn about the upright axis (more than half a turn can't be a slerp); a tipped box turns about
  // its own up axis instead, or it would wobble
  const spinStep = (a: number) => {
    if (!box) return turn(a, 0);
    q.multiply(tmp.setFromAxisAngle(Y, a)).normalize();
    spin.quaternion.copy(q);
  };
  const spinBy = (rad: number, ms: number) => {
    cancelAnimationFrame(raf);
    if (calm()) {
      spinStep(rad);
      return draw();
    }
    let done = 0;
    const t0 = performance.now();
    intro = true;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / ms), a = rad * ease(t);
      spinStep(a - done);
      done = a;
      draw();
      if (t < 1) raf = requestAnimationFrame(step);
      else intro = false;
    };
    raf = requestAnimationFrame(step);
  };
  const coast = () => {
    cancelAnimationFrame(raf);
    if (calm()) return;
    const step = () => {
      v[0] *= 0.94;
      v[1] *= 0.94;
      turn(v[0], v[1]);
      draw();
      if (Math.hypot(...v) > 0.0008) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };
  const used = () => stage.classList.add("used");

  // zoom: the camera moves toward the card, keeping the spot under the pointer (or between two fingers) where it is
  const ray = new T.Raycaster(), ndc = new T.Vector2(), plane = new T.Plane(), dir = CAM.clone().normalize();
  const a3 = new T.Vector3(), b3 = new T.Vector3();
  const hit = (cx: number, cy: number, out: THREE.Vector3) => {
    const b = stage.getBoundingClientRect();
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
    if (box) return; // the box keeps its distance, so it can't leave the frame
    const b = stage.getBoundingClientRect();
    cx ??= b.left + b.width / 2;
    cy ??= b.top + b.height / 2;
    const p0 = hit(cx, cy, new T.Vector3());
    z = Math.min(4, Math.max(1, z * f));
    place();
    tgt.add(p0.sub(hit(cx, cy, b3)));
    fit();
    stage.classList.toggle("zoomed", z > 1.01);
    schedule();
  };
  const panBy = (x0: number, y0: number, x1: number, y1: number) => {
    if (box) return;
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
    if (moved) onMoved?.((moved = false)); // it's on its way back
    const q0 = q.clone(), z0 = z, t0v = tgt.clone(), t0 = performance.now(), ms = calm() ? 0 : 600;
    const step = (now: number) => {
      const t = ms ? Math.min(1, (now - t0) / ms) : 1, k = ease(t);
      q.slerpQuaternions(q0, rest, k);
      spin.quaternion.copy(q);
      z = z0 + (restZ - z0) * k;
      tgt.lerpVectors(t0v, AIM, k);
      place();
      draw();
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };

  // the box's lid lifts while the pointer is over it, or for a moment after a tap, then settles back;
  // "Open box" takes it off. The camera stands back as far as the lid's place needs.
  let lifted = 0, liftTo = 0, opened = 0, openTo = 0, oraf = 0;
  const camLen = CAM.length(), aim0 = AIM.clone();
  const setPose = () => {
    if (!pose) return;
    const s = pose(lifted, opened) / BOX_RADIUS;
    CAM.setLength(camLen * s);
    AIM.copy(aim0).multiplyScalar(s);
    tgt.copy(AIM);
    floor.position.y = BOX_FLOOR * s;
    place();
  };
  const liftLid = (to: number) => {
    if (!pose || to === liftTo || openTo) return;
    liftTo = to;
    cancelAnimationFrame(lraf);
    if (calm()) {
      lifted = to;
      setPose();
      return draw();
    }
    const from = lifted, t0 = performance.now(), ms = 450;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / ms);
      lifted = from + (to - from) * ease(t);
      setPose();
      draw();
      if (t < 1) lraf = requestAnimationFrame(step);
    };
    lraf = requestAnimationFrame(step);
  };
  const openLid = (open: boolean) => {
    const to = open ? 1 : 0;
    if (!pose || to === openTo) return;
    openTo = to;
    liftTo = 0; // the hover lift folds into the opening
    cancelAnimationFrame(lraf);
    cancelAnimationFrame(oraf);
    const from = opened, l0 = lifted, t0 = performance.now(), ms = calm() ? 0 : 1100 * Math.abs(to - from);
    const step = (now: number) => {
      const t = ms ? Math.min(1, (now - t0) / ms) : 1;
      opened = from + (to - from) * t; // the lid's path is eased in makeBox
      lifted = l0 * (1 - t);
      setPose();
      draw();
      if (t < 1) oraf = requestAnimationFrame(step);
    };
    oraf = requestAnimationFrame(step);
  };
  const over = (cx: number, cy: number) => {
    const b = stage.getBoundingClientRect();
    ndc.set(((cx - b.left) / b.width) * 2 - 1, -((cy - b.top) / b.height) * 2 + 1);
    ray.setFromCamera(ndc, cam);
    return ray.intersectObject(object, true).length > 0;
  };
  let tap: { x: number; y: number; t: number } | null = null;

  let drag: { x: number; y: number; t: number } | null = null;
  let pinch: { x: number; y: number; d: number } | null = null;
  const pts = new Map<number, { x: number; y: number }>();
  const mid = (): [number, number, number] => {
    const [p, o] = [...pts.values()];
    return [(p.x + o.x) / 2, (p.y + o.y) / 2, Math.hypot(p.x - o.x, p.y - o.y)];
  };
  stage.onpointerdown = (e) => {
    if (e.button > 0 || (e.target as Element).closest("button")) return;
    cancelAnimationFrame(raf);
    intro = false;
    used();
    tap = pts.size ? null : { x: e.clientX, y: e.clientY, t: e.timeStamp };
    stage.setPointerCapture(e.pointerId);
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
    if (pose && e.pointerType === "mouse" && !drag && !pinch) liftLid(over(e.clientX, e.clientY) ? 1 : 0);
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
    // a tap on the box (a touch that didn't move) lifts the lid for a moment
    if (pose && !openTo && tap && e.pointerType !== "mouse" && e.type === "pointerup" && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) < 8 && e.timeStamp - tap.t < 400 && over(e.clientX, e.clientY)) {
      liftLid(1);
      clearTimeout(settle);
      settle = window.setTimeout(() => liftLid(0), 1200);
    }
    tap = null;
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
    if (!still && Math.hypot(...v) > 0.004) coast(); // let go while moving: it coasts
  };
  stage.onpointerup = up;
  stage.onpointercancel = up;
  stage.onpointerleave = (e) => {
    if (e.pointerType === "mouse" && !drag) liftLid(0);
  };
  stage.ondblclick = (e) => {
    if (!(e.target as Element).closest("button")) reset();
  };
  // The wheel zooms once the card is in use (or zoomed), so scrolling past it still scrolls the page.
  // A trackpad pinch arrives as a wheel with ctrlKey, and always zooms.
  function onWheel(e: WheelEvent) {
    const inUse = stage.classList.contains("used") || z > 1.01 || document.activeElement === stage;
    if (box || (!e.ctrlKey && !inUse)) return;
    e.preventDefault();
    used();
    zoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), e.clientX, e.clientY);
  }
  stage.addEventListener("wheel", onWheel, { passive: false });
  stage.onkeydown = (e) => {
    const a = Math.PI / 12;
    const m = ({ ArrowRight: [a, 0], ArrowLeft: [-a, 0], ArrowUp: [0, -a], ArrowDown: [0, a] } as Record<string, [number, number]>)[e.key];
    if (m) {
      e.preventDefault();
      used();
      cancelAnimationFrame(raf);
      turn(...m);
      schedule();
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
  if (!calm()) {
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
    open: openLid,
    reset,
    destroy: cleanup,
  };
}
