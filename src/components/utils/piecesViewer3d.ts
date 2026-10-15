// "What's in the box" on the How to play page: one game piece at a time in 3D (three.js), built from
// its flat front and back art, lit like the studio mockups: soft light from above and its shadow on
// an invisible floor. Drag turns it any way (it coasts when let go, then turns straight back to rest),
// two fingers pinch to zoom and move together to pan, the wheel (or a trackpad pinch) zooms toward
// the pointer, + and - zoom, and Home, 0 or a double-click zoom back out (as does leaving it alone for
// 3 seconds). A new piece makes one slow turn to show it's 3D, unless it's already been grabbed.
// Visitors who ask for less motion get no turn, coast or easing.
// One WebGL renderer serves the whole page (card3d.ts): the viewer renders through it and copies the
// picture onto its own 2D canvas.
import type * as THREE from "three";
import { calm, ease, loadTexture, loadThree, makeCard, paint, renderer, studio } from "./card3d";
import type { Three } from "./card3d";

export interface Piece {
  key: string; // which piece (a load that finishes after another's been picked is dropped)
  kind: "card" | "box" | "token";
  mm: number[]; // card: width x height; box: long side, short side, height; token: across, thick
  front: string;
  back: string;
  sides?: { near: string; far: string; left: string; right: string }; // the box's walls
  gold?: boolean; // a gold foil edge (the character cards), not cream card stock
}

export interface PiecesViewerApi {
  show: (p: Piece) => void;
  zoom: (f: number) => void;
  reset: () => void;
  destroy: () => void;
}

interface MountOptions {
  onFail: (key: string) => void; // its art didn't load
}

// where a card rests: turned 24° and tipped back a little, so its edge shows; the box lies lid up,
// turned the same, its lid tipped toward you
const REST_CARD = { rx: -0.12, ry: -0.42, order: "YXZ" as const };
const REST_BOX = { rx: 0.62, ry: -0.42, order: "XYZ" as const };
const ZOOM_MAX = 4;
const IDLE_MS = 3000; // left alone this long, zoomed, it zooms back out

// a mesh from flat quads, each [material, outward normal, 4 corners as [x, y, z, u, v]] (wound to face outward)
type Quad = [number, [number, number, number], number[][]];
function quads(T: Three, qs: Quad[]) {
  const pos: number[] = [], nor: number[] = [], uv: number[] = [], geo = new T.BufferGeometry();
  let at = 0;
  for (const [mi, n, cs] of qs) {
    const [a, b, c] = cs.map((p) => new T.Vector3(p[0], p[1], p[2]));
    const out = new T.Vector3().crossVectors(b.clone().sub(a), c.clone().sub(a)).dot(new T.Vector3(...n)) > 0;
    for (const k of out ? [0, 1, 2, 0, 2, 3] : [0, 2, 1, 0, 3, 2]) {
      const p = cs[k];
      pos.push(p[0], p[1], p[2]);
      nor.push(...n);
      uv.push(p[3], p[4]);
    }
    geo.addGroup(at, 6, mi);
    at += 6;
  }
  geo.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new T.Float32BufferAttribute(nor, 3));
  geo.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
  return geo;
}

// the game box lying lid up, its near long side toward you, each side's art laid as on the box's flat art
function makeBox(T: Three, mm: number[], tx: Record<string, THREE.Texture>) {
  const L = 1, W = mm[1] / mm[0], H = mm[2] / mm[0];
  const x0 = -L / 2, x1 = L / 2, y0 = -H / 2, y1 = H / 2, z0 = -W / 2, z1 = W / 2;
  const u = (x: number) => (x - x0) / L, d = (z: number) => (z1 - z) / W, h = (y: number) => (y - y0) / H;
  const q: Quad[] = [
    [0, [0, 1, 0], [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]].map(([x, y, z]) => [x, y, z, u(x), d(z)])], // lid
    [1, [0, 0, 1], [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]].map(([x, y, z]) => [x, y, z, u(x), h(y)])], // near: lid edge up
    [2, [0, 0, -1], [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]].map(([x, y, z]) => [x, y, z, u(x), 1 - h(y)])], // far
    [3, [1, 0, 0], [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]].map(([x, y, z]) => [x, y, z, 1 - h(y), d(z)])], // right
    [4, [-1, 0, 0], [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]].map(([x, y, z]) => [x, y, z, h(y), d(z)])], // left
    // underside: How to Play, upright once the box is turned over like a book
    [5, [0, -1, 0], [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]].map(([x, y, z]) => [x, y, z, 1 - u(x), d(z)])],
  ];
  const mat = (t?: THREE.Texture) =>
    t ? new T.MeshStandardMaterial({ map: t, roughness: 0.45, metalness: 0 }) : new T.MeshStandardMaterial({ color: 0xefece5, roughness: 0.7 });
  const m = new T.Mesh(quads(T, q), [tx.front, tx.near, tx.far, tx.right, tx.left, tx.back].map(mat));
  m.castShadow = true;
  const grp = new T.Group();
  grp.add(m);
  return grp;
}

// a wood grain as a bump map: long wavy fibres, made once (the token is wood, not card stock)
let grainTex: THREE.Texture | null = null;
function grain(T: Three) {
  if (grainTex) return grainTex;
  const N = 256, cv = document.createElement("canvas");
  cv.width = cv.height = N;
  const x = cv.getContext("2d")!, im = x.createImageData(N, N);
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++) {
      const w = Math.sin(i * 0.021 + j * 0.013) * 2.5 + Math.sin(i * 0.07) * 0.8;
      const f = 0.5 + 0.5 * Math.sin((j + w) * 1.3) * (0.6 + 0.4 * Math.sin((j + w) * 0.17));
      const v = Math.round(255 * (0.62 + 0.3 * f + 0.03 * Math.sin(i * 2.3 + j * 5.1))), k = (j * N + i) * 4;
      im.data[k] = im.data[k + 1] = im.data[k + 2] = v;
      im.data[k + 3] = 255;
    }
  x.putImageData(im, 0, 0);
  grainTex = new T.CanvasTexture(cv);
  grainTex.wrapS = grainTex.wrapT = T.RepeatWrapping;
  return grainTex;
}

// a point token: a wooden disc with a black edge, the 1 point side toward you
function makeToken(T: Three, mm: number[], tx: Record<string, THREE.Texture>) {
  const r = 0.5, t = mm[1] / mm[0], geo = new T.CylinderGeometry(r, r, t, 96, 1);
  geo.rotateX(Math.PI / 2);
  const p = geo.attributes.position, uv = geo.attributes.uv, nz = geo.attributes.normal;
  for (let i = 0; i < p.count; i++) {
    const z = nz.getZ(i);
    if (Math.abs(z) < 0.5) continue;
    const x = p.getX(i) / (2 * r);
    uv.setXY(i, z > 0 ? x + 0.5 : 0.5 - x, p.getY(i) / (2 * r) + 0.5); // the back mirrored, so it reads right once it turns over
  }
  const bump = grain(T);
  const art = (map: THREE.Texture) => new T.MeshStandardMaterial({ map, color: 0xfff0d6, roughness: 0.85, metalness: 0, bumpMap: bump, bumpScale: 0.35 });
  const m = new T.Mesh(geo, [new T.MeshStandardMaterial({ color: 0x141212, roughness: 0.85, bumpMap: bump, bumpScale: 0.35 }), art(tx.front), art(tx.back)]);
  m.castShadow = true;
  const grp = new T.Group();
  grp.add(m);
  return grp;
}

export async function mountPiecesViewer(stage: HTMLElement, { onFail }: MountOptions): Promise<PiecesViewerApi | null> {
  const T = await loadThree();
  const r = renderer(T);
  if (!stage.isConnected) return null;

  const sc = new T.Scene();
  const cam = new T.PerspectiveCamera(28, 4 / 3, 0.05, 20);
  // what it looks at, and from where (all the way out): close enough that the piece and its shadow
  // fill the stage
  const AIM = new T.Vector3(0, -0.06, 0), CAM = new T.Vector3(0, 0.38, 3.1).multiplyScalar(0.8);
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
  const back = new T.DirectionalLight(0xffffff, 0.8); // the same from behind, so the back reads as bright as the front
  back.position.set(-0.7, 0.5, -3);
  sc.add(back);
  const floor = new T.Mesh(new T.PlaneGeometry(6, 6), new T.ShadowMaterial({ opacity: 0.085 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.6;
  floor.receiveShadow = true;
  sc.add(floor);
  const spin = new T.Group();
  sc.add(spin);

  // its own canvas, over the thumbnail and under the buttons; the shared renderer draws into it
  const cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  const ctx = cv.getContext("2d");
  stage.insertBefore(cv, stage.firstElementChild?.nextSibling ?? null);
  let W = 0, H = 0, dead = false;
  const render = () => {
    if (dead || !W || !H || !ctx) return;
    paint(r, sc, cam, ctx, W, H);
  };
  // the pointer and the wheel can move it many times a frame: drawn once, on the next frame
  let pending = 0, batching = false;
  const draw = () => {
    if (!batching) render();
  };
  const later = <A extends unknown[]>(f: (...a: A) => void) => (...a: A) => {
    batching = true;
    try {
      f(...a);
    } finally {
      batching = false;
    }
    if (!pending) pending = requestAnimationFrame(() => {
      pending = 0;
      render();
    });
  };

  let z = 1; // zoom, 1 to ZOOM_MAX
  const tgt = AIM.clone();
  const place = () => {
    cam.position.copy(CAM).divideScalar(z).add(tgt);
    cam.lookAt(tgt);
    cam.updateMatrixWorld(); // zooming toward the pointer aims from here before the next frame's drawn
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
    render();
  };
  const ro = new ResizeObserver(size);
  ro.observe(stage);
  place();
  size();

  let raf = 0;
  const q = new T.Quaternion(), rest = new T.Quaternion(), upAx = new T.Vector3(0, 1, 0);
  let v: [number, number] = [0, 0];
  const X = new T.Vector3(1, 0, 0), Y = new T.Vector3(0, 1, 0), tmp = new T.Quaternion();
  const apply = () => {
    spin.quaternion.copy(q);
    draw();
  };
  const turn = (ax: number, ay: number) => {
    q.premultiply(tmp.setFromAxisAngle(Y, ax)).premultiply(tmp.setFromAxisAngle(X, ay)).normalize();
    apply();
  };
  const about = (a: number) => {
    q.premultiply(tmp.setFromAxisAngle(upAx, a)).normalize();
    apply();
  };
  // a turn about its own upright axis (more than half a turn can't be a slerp)
  const spinBy = (rad: number, ms: number) => {
    cancelAnimationFrame(raf);
    if (calm()) return;
    let done = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / ms), a = rad * ease(t);
      about(a - done);
      done = a;
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };
  // left alone, it turns straight back to rest (the zoom stays)
  const settle = () => {
    cancelAnimationFrame(raf);
    const q0 = q.clone(), t0 = performance.now(), ms = calm() ? 0 : 600;
    const step = (now: number) => {
      const t = ms ? Math.min(1, (now - t0) / ms) : 1;
      q.slerpQuaternions(q0, rest, ease(t));
      apply();
      if (t < 1) raf = requestAnimationFrame(step);
    };
    if (ms) raf = requestAnimationFrame(step);
    else step(t0);
  };
  const coast = () => {
    cancelAnimationFrame(raf);
    if (calm()) return settle();
    const step = () => {
      v = [v[0] * 0.94, v[1] * 0.94];
      turn(v[0], v[1]);
      if (Math.hypot(...v) > 0.0008) raf = requestAnimationFrame(step);
      else settle();
    };
    raf = requestAnimationFrame(step);
  };
  // left alone a while zoomed (in or out), it zooms back (not while it's held)
  let idle = 0;
  const restSoon = () => {
    clearTimeout(idle);
    idle = window.setTimeout(() => {
      if (dead) return;
      if (pts.size) return restSoon();
      if (z > 1.01 || tgt.distanceTo(AIM) > 0.001) reset();
    }, IDLE_MS);
  };
  const used = () => {
    stage.classList.add("used");
    restSoon();
  };

  // zoom: the camera moves toward the piece, keeping the spot under the pointer (or between two
  // fingers) where it is
  const ray = new T.Raycaster(), ndc = new T.Vector2(), plane = new T.Plane(), dir = CAM.clone().normalize();
  const a3 = new T.Vector3(), b3 = new T.Vector3(), c3 = new T.Vector3();
  const hit = (cx: number, cy: number, out: THREE.Vector3) => {
    const b = stage.getBoundingClientRect();
    ndc.set(((cx - b.left) / b.width) * 2 - 1, -((cy - b.top) / b.height) * 2 + 1);
    ray.setFromCamera(ndc, cam);
    plane.setFromNormalAndCoplanarPoint(dir, tgt);
    return ray.ray.intersectPlane(plane, out) || out.copy(tgt);
  };
  // it can't be panned out of sight
  const fit = () => {
    const off = a3.subVectors(tgt, AIM), max = 0.7 * (1 - 1 / z);
    if (off.length() > max) tgt.copy(AIM).add(off.setLength(max));
    place();
  };
  const zoomAt = (f: number, cx?: number, cy?: number) => {
    const b = stage.getBoundingClientRect();
    const x = cx ?? b.left + b.width / 2, y = cy ?? b.top + b.height / 2;
    const p0 = hit(x, y, c3);
    z = Math.min(ZOOM_MAX, Math.max(1, z * f));
    place();
    tgt.add(p0.sub(hit(x, y, b3)));
    fit();
    draw();
    stage.classList.toggle("zoomed", z > 1.01);
  };
  const panBy = (x0: number, y0: number, x1: number, y1: number) => {
    const p0 = hit(x0, y0, c3);
    tgt.add(p0.sub(hit(x1, y1, b3)));
    fit();
    draw();
  };
  // straight, and all the way out
  const reset = () => {
    used();
    cancelAnimationFrame(raf);
    stage.classList.remove("zoomed");
    const q0 = q.clone(), z0 = z, t0v = tgt.clone(), t0 = performance.now(), ms = calm() ? 0 : 600;
    const step = (now: number) => {
      const t = ms ? Math.min(1, (now - t0) / ms) : 1, k = ease(t);
      q.slerpQuaternions(q0, rest, k);
      z = z0 + (1 - z0) * k;
      tgt.lerpVectors(t0v, AIM, k);
      place();
      apply();
      if (t < 1) raf = requestAnimationFrame(step);
    };
    if (ms) raf = requestAnimationFrame(step);
    else step(t0);
  };

  // the pointer: one turns it, two pinch and pan
  let drag: { x: number; y: number; t: number } | null = null, pinch: { x: number; y: number; d: number } | null = null;
  const pts = new Map<number, { x: number; y: number }>();
  const mid = () => {
    const [p, o] = [...pts.values()];
    return [(p.x + o.x) / 2, (p.y + o.y) / 2, Math.hypot(p.x - o.x, p.y - o.y)];
  };
  const onDown = (e: PointerEvent) => {
    if (e.button > 0 || (e.target as Element).closest("button")) return;
    cancelAnimationFrame(raf);
    used();
    try {
      stage.setPointerCapture(e.pointerId);
    } catch {
      // (a pointer the browser no longer tracks)
    }
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    v = [0, 0];
    if (pts.size === 2) {
      drag = null;
      const [x, y, d] = mid();
      pinch = { x, y, d };
      return;
    }
    drag = { x: e.clientX, y: e.clientY, t: e.timeStamp };
    stage.classList.add("drag");
  };
  const onMove = (e: PointerEvent) => {
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
    const per = (Math.PI * 2) / (stage.clientWidth * 1.1);
    const dx = (e.clientX - drag.x) * per, dy = (e.clientY - drag.y) * per, dt = Math.max(1, e.timeStamp - drag.t);
    turn(dx, dy);
    v = [(dx / dt) * 16, (dy / dt) * 16];
    drag = { x: e.clientX, y: e.clientY, t: e.timeStamp };
  };
  const onUp = (e: PointerEvent) => {
    pts.delete(e.pointerId);
    restSoon(); // (the wait starts again from when it's let go)
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
    const held = e.timeStamp - drag.t > 80;
    drag = null;
    stage.classList.remove("drag");
    if (!held && Math.hypot(...v) > 0.004) coast(); // let go while moving: it coasts, then settles
    else settle();
  };
  const onMoveLater = later(onMove);
  const onDbl = (e: MouseEvent) => {
    if (!(e.target as Element).closest("button")) reset();
  };
  // a trackpad pinch arrives as a wheel with ctrlKey
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    used();
    zoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), e.clientX, e.clientY);
  };
  const onWheelLater = later(onWheel);
  const onKey = (e: KeyboardEvent) => {
    if (e.target !== stage) return;
    if (e.key === "+" || e.key === "=") {
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
  stage.addEventListener("pointerdown", onDown);
  stage.addEventListener("pointermove", onMoveLater);
  stage.addEventListener("pointerup", onUp);
  stage.addEventListener("pointercancel", onUp);
  stage.addEventListener("dblclick", onDbl);
  stage.addEventListener("wheel", onWheelLater, { passive: false });
  stage.addEventListener("keydown", onKey);

  // the pieces' art
  const load = (u: string) =>
    loadTexture(T, u).then((x) => {
      x.colorSpace = T.SRGBColorSpace;
      x.anisotropy = Math.min(8, r.capabilities.getMaxAnisotropy());
      return x;
    });
  let piece: THREE.Group | null = null, textures: THREE.Texture[] = [], showing = "";
  const disposePiece = () => {
    if (!piece) return;
    spin.remove(piece);
    piece.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      ([] as THREE.Material[]).concat(m.material || []).forEach((x) => x.dispose());
    });
    piece = null;
  };

  const show = async (p: Piece) => {
    showing = p.key;
    cancelAnimationFrame(raf);
    // every piece opens all the way out; the last one stays until this one's art arrives, hidden, so
    // the thumbnail shows meanwhile
    v = [0, 0];
    z = 1;
    tgt.copy(AIM);
    place();
    stage.classList.remove("ready", "zoomed", "used");
    if (piece) piece.visible = false;
    draw();
    const urls = Object.entries({ front: p.front, back: p.back, ...(p.sides || {}) }).filter(([, u]) => u);
    let tx: Record<string, THREE.Texture>;
    try {
      tx = Object.fromEntries(await Promise.all(urls.map(([k, u]) => load(u).then((t) => [k, t] as const))));
    } catch {
      if (!dead && showing === p.key) onFail(p.key);
      return;
    }
    const gold = p.gold ? await studio(T, r).catch(() => null) : null; // (what gold foil reflects, made once)
    if (dead || showing !== p.key) {
      Object.values(tx).forEach((t) => t.dispose());
      return;
    }
    disposePiece();
    textures.forEach((x) => x.dispose());
    textures = Object.values(tx);
    piece =
      p.kind === "box"
        ? makeBox(T, p.mm, tx)
        : p.kind === "token"
          ? makeToken(T, p.mm, tx)
          : makeCard(T, [p.mm[0], p.mm[1]], tx.front, tx.back, gold);
    spin.add(piece);
    const pose = p.kind === "box" ? REST_BOX : REST_CARD;
    rest.setFromEuler(new T.Euler(pose.rx, pose.ry, 0, pose.order));
    q.copy(rest);
    // the show-off turn goes round its own up
    upAx.set(0, 1, 0).applyQuaternion(tmp.setFromEuler(new T.Euler(p.kind === "box" ? pose.rx : 0, 0, 0)));
    apply();
    stage.classList.add("ready");
    if (!stage.classList.contains("used")) spinBy(Math.PI * 2, 2400); // one slow turn, unless it's been grabbed
  };

  return {
    show: (p) => void show(p),
    zoom: (f) => {
      used();
      zoomAt(f);
    },
    reset,
    destroy: () => {
      dead = true;
      clearTimeout(idle);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(pending);
      ro.disconnect();
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMoveLater);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onUp);
      stage.removeEventListener("dblclick", onDbl);
      stage.removeEventListener("wheel", onWheelLater);
      stage.removeEventListener("keydown", onKey);
      disposePiece();
      textures.forEach((x) => x.dispose());
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      (key.shadow.map as THREE.WebGLRenderTarget | null)?.dispose();
      cv.remove();
    },
  };
}
