// A game card in 3D (three.js): drag to turn it any way, zoom toward the pointer, turn it over.
// Lit like the studio mockups: one soft light from above, its shadow pooled on an invisible floor.
// three.js is loaded the first time a viewer appears. One WebGL renderer serves every viewer on the
// page (browsers allow only a few contexts): each viewer renders through it and copies the picture
// onto its own 2D canvas. Nothing renders unless something changed.
import type * as THREE from "three";

type Three = typeof THREE;
export type CardFace = string | HTMLCanvasElement;
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

let threeP: Promise<Three> | null = null;
const loadThree = () =>
  (threeP ||= import("three").catch((e) => {
    threeP = null;
    throw e;
  }));

let shared: THREE.WebGLRenderer | null = null;
const renderer = (T: Three) => {
  if (shared) return shared;
  const r = new T.WebGLRenderer({ antialias: true, alpha: true });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  r.shadowMap.enabled = true;
  r.shadowMap.type = T.VSMShadowMap;
  r.outputColorSpace = T.SRGBColorSpace;
  return (shared = r);
};

// what gold foil reflects: a soft studio room, made once (metal with nothing to reflect looks black)
let goldEnv: Promise<THREE.Texture> | null = null;
const studio = (T: Three, r: THREE.WebGLRenderer) =>
  (goldEnv ||= import("three/examples/jsm/environments/RoomEnvironment.js").then(({ RoomEnvironment }) => {
    const pm = new T.PMREMGenerator(r);
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();
    return env;
  }));

const REST: [number, number] = [-0.42, -0.12]; // turned 24° and tipped back 7°, so its edge shows
const REST_Z = 1.4; // and zoomed in one step (the zoom-in button's step)
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const calm = () => !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// a rounded card with a cream paper or gold foil edge; its long side is 1
function makeCard(T: Three, mm: [number, number], front: THREE.Texture, back: THREE.Texture, gold: THREE.Texture | null) {
  const k = 1 / Math.max(mm[0], mm[1]);
  const w = mm[0] * k, h = mm[1] * k, r = 3.5 * k, t = 0.72 * k;
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

interface MountOptions {
  mm: [number, number];
  faces: () => Promise<CardFaces>;
  edge?: CardEdge;
  onFail: () => void;
}

// Turns `stage` (a 4:3 box) into a card viewer. Resolves once the card is showing.
export async function mountCardViewer(stage: HTMLElement, { mm, faces, edge = "paper", onFail }: MountOptions): Promise<CardViewerApi | null> {
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
  const floorMat = new T.ShadowMaterial({ opacity: 0.17 });
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
  stage.onpointerdown = (e) => {
    if (e.button > 0 || (e.target as Element).closest("button")) return;
    cancelAnimationFrame(raf);
    used();
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
  stage.ondblclick = (e) => {
    if (!(e.target as Element).closest("button")) reset();
  };
  // The wheel zooms once the card is in use (or zoomed), so scrolling past it still scrolls the page.
  // A trackpad pinch arrives as a wheel with ctrlKey, and always zooms.
  function onWheel(e: WheelEvent) {
    const inUse = stage.classList.contains("used") || z > 1.01 || document.activeElement === stage;
    if (!e.ctrlKey && !inUse) return;
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
    reset,
    destroy: cleanup,
  };
}
