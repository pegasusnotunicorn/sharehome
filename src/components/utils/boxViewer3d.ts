// The game box in 3D (three.js), for the top of the home page. Lit and shadowed like the 3D cards
// (cardViewer3d.ts), sharing their renderer. Closed, it can be turned any way (drag, with coasting, or
// the arrow keys), and its lid lifts a little under the mouse. Open (a click or tap on it, or open()),
// it turns to face you, the lid comes off and goes under it, and the trailer plays in the tray. Open,
// it stays put.
//
// It never leaves the frame: the camera stands back far enough for the box at any angle (and for
// whatever the lid is doing), checked against the box's corners every frame.
import type * as THREE from "three";
import { calm, ease, loadThree, renderer } from "./card3d";
import type { Three } from "./card3d";
import { BOX_RADIUS, makeBox } from "./box3d";
import type { BoxArt, BoxPanels } from "./box3d";

export interface BoxVideo {
  landscape: string; // YouTube video ids: one for a wide stage, one for a tall one
  portrait: string;
}
export interface BoxViewerApi {
  open: (open: boolean) => void;
  reset: () => void;
  destroy: () => void;
}
interface MountOptions {
  art: BoxArt;
  video: BoxVideo;
  onMoved?: (moved: boolean) => void; // turned away from its rest pose, and back
  onOpen?: (open: boolean) => void;
  onFail: () => void;
}

// at rest it lies lid up, turned 24° and tipped 35° toward you, like the product shots
const REST: [number, number] = [-0.42, 0.61];
// how far back the camera stands for the box at any angle on a 4:3 stage, and where it looks, so the
// floor's shadow is in frame too (the floor just below the box's reach)
const DIST = 3.085, AIM_Y = -0.105, FLOOR = -0.61;
const OPEN_MS = 950;

export async function mountBoxViewer(stage: HTMLElement, { art, video, onMoved, onOpen, onFail }: MountOptions): Promise<BoxViewerApi | null> {
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
  const cam = new T.PerspectiveCamera(28, 4 / 3, 0.05, 30);
  const DIR = new T.Vector3(0, 0.38, 3.1).normalize();
  sc.add(new T.HemisphereLight(0xffffff, 0xd9d2cc, 1.25));
  const key = new T.DirectionalLight(0xffffff, 1.7);
  key.position.set(0.15, 4, 0.9);
  key.castShadow = true;
  Object.assign(key.shadow.camera, { left: -1.2, right: 1.2, top: 1.2, bottom: -1.2, near: 1, far: 8 });
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.radius = 30;
  key.shadow.blurSamples = 24;
  key.shadow.bias = -0.0005;
  sc.add(key);
  const fill = new T.DirectionalLight(0xffffff, 0.8);
  fill.position.set(0.7, 0.5, 3);
  sc.add(fill);
  const fillBack = new T.DirectionalLight(0xffffff, 0.8);
  fillBack.position.set(-0.7, 0.5, -3);
  sc.add(fillBack);
  const floorMat = new T.ShadowMaterial({ opacity: 0.17 });
  const floor = new T.Mesh(new T.PlaneGeometry(8, 8), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = FLOOR;
  floor.receiveShadow = true;
  sc.add(floor);
  const spin = new T.Group();
  sc.add(spin);

  let raf = 0, pending = 0, lraf = 0, oraf = 0, dead = false;
  const q = new T.Quaternion(), v: [number, number] = [0, 0];

  const cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  cv.dataset.boxCanvas = "";
  const ctx = cv.getContext("2d");
  stage.prepend(cv);
  let W = 0, H = 0;

  // the art
  const textures: THREE.Texture[] = [];
  const tex = async (url: string) => {
    const x = await new T.TextureLoader().loadAsync(url);
    x.colorSpace = T.SRGBColorSpace;
    x.anisotropy = Math.min(8, r.capabilities.getMaxAnisotropy());
    textures.push(x);
    return x;
  };
  let io: IntersectionObserver | null = null, ro: ResizeObserver | null = null, settle = 0;
  let player: HTMLIFrameElement | null = null, unlisten = () => {};
  const cleanup = () => {
    dead = true;
    [raf, pending, lraf, oraf].forEach(cancelAnimationFrame);
    clearTimeout(settle);
    ro?.disconnect();
    io?.disconnect();
    sc.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      ([] as THREE.Material[]).concat(m.material || []).forEach((x) => x.dispose());
    });
    textures.forEach((x) => x.dispose());
    (key.shadow.map as THREE.WebGLRenderTarget | null)?.dispose();
    cv.remove();
    player?.remove();
    stage.onpointerdown = stage.onpointermove = stage.onpointerup = stage.onpointercancel = stage.onpointerleave = null;
    stage.onkeydown = null;
    unlisten();
  };
  let made: ReturnType<typeof makeBox>;
  try {
    const panels = async (p: BoxPanels) => {
      const [top, near, far, left, right] = await Promise.all([p.top, p.near, p.far, p.left, p.right].map(tex));
      return { top, near, far, left, right };
    };
    const [lid, base] = await Promise.all([panels(art.lid), panels(art.base)]);
    made = makeBox(T, lid, base);
  } catch {
    cleanup();
    onFail();
    return null;
  }
  if (!stage.isConnected) {
    cleanup();
    return null;
  }
  const { box, parts, tray, pose } = made;
  spin.add(box);
  const rest = new T.Quaternion().setFromEuler(new T.Euler(REST[1], REST[0], 0, "XYZ")); // its own yaw, then the tip
  q.copy(rest);
  spin.quaternion.copy(q);

  // The box's corners, to keep it in frame. Each part is a box, so its eight corners bound it.
  const corners: THREE.Vector3[] = [];
  for (const m of parts) {
    m.geometry.computeBoundingBox();
    const { min, max } = m.geometry.boundingBox!;
    for (let c = 0; c < 8; c++) corners.push(new T.Vector3(c & 1 ? max.x : min.x, c & 2 ? max.y : min.y, c & 4 ? max.z : min.z));
  }
  const world = corners.map(() => new T.Vector3()), p3 = new T.Vector3();
  const aim = new T.Vector3();
  // The box's own part of the stage: closed, it can be kept to the right of `--frame-left` (a
  // fraction of the stage's width, set by the page so words can sit on the left); open, it has the
  // whole stage. The lens shifts to centre it there (frame: its centre and half-width, in NDC).
  let frameLeft = 0;
  const frame = { c: 0, half: 1 };
  // the nearest the camera can stand, looking at `aim`, with every corner inside `m` of the frame
  const fitDist = (m: number) => {
    spin.updateMatrixWorld(true);
    let k = 0;
    for (const part of parts) for (let c = 0; c < 8; c++, k++) world[k].copy(corners[k]).applyMatrix4(part.matrixWorld);
    let lo = 0.6, hi = 12;
    for (let it = 0; it < 22; it++) {
      const d = (lo + hi) / 2;
      cam.position.copy(DIR).multiplyScalar(d).add(aim);
      cam.lookAt(aim);
      cam.updateMatrixWorld();
      const ok = world.every((w) => {
        p3.copy(w).project(cam);
        return p3.z < 1 && Math.abs(p3.x - frame.c) <= m * frame.half && Math.abs(p3.y) <= m;
      });
      if (ok) hi = d;
      else lo = d;
    }
    return hi;
  };

  // where the lid is, how open the box is (0..1), and the turn it's making to face you
  let lifted = 0, liftTo = 0, opened = 0, openTo = 0, portrait = false;
  const qFrom = new T.Quaternion(), qFace = new T.Quaternion();
  const camAt = () => {
    if (!W || !H) return;
    const s = pose(lifted, opened) / BOX_RADIUS, o = ease(opened);
    const fl = frameLeft * (1 - o);
    frame.half = 1 - fl;
    frame.c = fl;
    cam.aspect = W / H;
    cam.updateProjectionMatrix();
    cam.projectionMatrix.elements[8] = -frame.c; // the lens shift
    cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
    // closed: far enough back for any angle. DIST covers the height; a narrow frame can need more
    // for the width (the box's reach, and its shadow's, which is a little wider)
    const dWide = (BOX_RADIUS + 0.08) / 0.94 / (cam.aspect * frame.half * Math.tan((cam.fov * Math.PI) / 360));
    const dAny = Math.max(DIST, dWide) * s;
    aim.set(0, AIM_Y * s * (1 - o), 0);
    // open: as close as fits, so the video is big
    const dOpen = o > 0 ? fitDist(portrait ? 0.94 : 0.9) : dAny;
    const d = Math.max(dAny * (1 - o) + dOpen * o, fitDist(0.97));
    cam.position.copy(DIR).multiplyScalar(d).add(aim);
    cam.lookAt(aim);
    floor.position.y = FLOOR * s;
    floorMat.opacity = 0.17 * (1 - o);
  };

  // the trailer, on the tray's floor
  const floorPts = made.floor.map(() => new T.Vector3());
  const placePlayer = () => {
    if (!player) return;
    tray.updateMatrixWorld(true);
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    made.floor.forEach((f, i) => {
      floorPts[i].copy(f).applyMatrix4(tray.matrixWorld).project(cam);
      const x = ((floorPts[i].x + 1) / 2) * W, y = ((1 - floorPts[i].y) / 2) * H;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    });
    // the video's shape, as big as fits inside a board margin
    const pad = 0.04 * Math.min(x1 - x0, y1 - y0), w0 = x1 - x0 - 2 * pad, h0 = y1 - y0 - 2 * pad;
    const ratio = portrait ? 9 / 16 : 16 / 9;
    const w = Math.min(w0, h0 * ratio), h = w / ratio;
    Object.assign(player.style, { left: `${(x0 + x1 - w) / 2}px`, top: `${(y0 + y1 - h) / 2}px`, width: `${w}px`, height: `${h}px` });
  };

  const draw = () => {
    if (dead || !W || !H || !ctx) return;
    camAt();
    r.setSize(W, H, false);
    r.render(sc, cam);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.drawImage(r.domElement, 0, 0, cv.width, cv.height);
    placePlayer();
  };
  const schedule = () => {
    if (!pending) pending = requestAnimationFrame(() => { pending = 0; draw(); });
  };
  const size = () => {
    W = stage.clientWidth;
    H = stage.clientHeight;
    frameLeft = Math.min(0.7, Math.max(0, parseFloat(getComputedStyle(stage).getPropertyValue("--frame-left")) || 0));
    const pr = r.getPixelRatio();
    cv.width = Math.max(1, Math.round(W * pr));
    cv.height = Math.max(1, Math.round(H * pr));
    draw();
  };
  ro = new ResizeObserver(size);
  ro.observe(stage);
  size();
  stage.classList.add("ready");

  // turning it
  const X = new T.Vector3(1, 0, 0), Y = new T.Vector3(0, 1, 0), tmp = new T.Quaternion();
  let moved = false, intro = false;
  const report = () => {
    const m = q.angleTo(rest) > 0.02;
    if (m !== moved) onMoved?.((moved = m));
  };
  const turn = (ax: number, ay: number) => {
    q.premultiply(tmp.setFromAxisAngle(Y, ax)).premultiply(tmp.setFromAxisAngle(X, ay)).normalize();
    spin.quaternion.copy(q);
    if (!intro) report();
  };
  // a turn about its own up axis, so the tipped box doesn't wobble (more than half a turn can't be a slerp)
  const spinBy = (rad: number, ms: number) => {
    cancelAnimationFrame(raf);
    let done = 0;
    const t0 = performance.now();
    intro = true;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / ms), a = rad * ease(t);
      q.multiply(tmp.setFromAxisAngle(Y, a - done)).normalize();
      spin.quaternion.copy(q);
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
  const reset = () => {
    if (openTo) return;
    cancelAnimationFrame(raf);
    if (moved) onMoved?.((moved = false)); // it's on its way back
    const q0 = q.clone(), t0 = performance.now(), ms = calm() ? 0 : 600;
    const step = (now: number) => {
      const t = ms ? Math.min(1, (now - t0) / ms) : 1;
      q.slerpQuaternions(q0, rest, ease(t));
      spin.quaternion.copy(q);
      draw();
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };

  // the lid lifts a little while the mouse is over the box, and settles back
  const liftLid = (to: number) => {
    if (to === liftTo || openTo || opened) return;
    liftTo = to;
    cancelAnimationFrame(lraf);
    const from = lifted, t0 = performance.now(), ms = calm() ? 0 : 450;
    const step = (now: number) => {
      const t = ms ? Math.min(1, (now - t0) / ms) : 1;
      lifted = from + (to - from) * ease(t);
      draw();
      if (t < 1) lraf = requestAnimationFrame(step);
    };
    lraf = requestAnimationFrame(step);
  };

  // open: it turns to face you (on a tall stage, on its side), the lid comes off and goes under, and
  // the trailer plays in the tray; closed, it goes back the same way to its rest pose
  const openBox = (open: boolean) => {
    const to = open ? 1 : 0;
    if (to === openTo) return;
    openTo = to;
    onOpen?.(open);
    cancelAnimationFrame(raf);
    cancelAnimationFrame(lraf);
    cancelAnimationFrame(oraf);
    v[0] = v[1] = 0;
    liftTo = 0;
    if (open) {
      // the upright video, with the box on its side, on a clearly tall stage (phones)
      portrait = W / H < 0.8; // (the whole stage is the box's, open)
      // its top toward the camera; on its side when the stage is tall, for the upright video
      qFace.setFromUnitVectors(Y, DIR);
      if (portrait) qFace.multiply(tmp.setFromAxisAngle(Y, Math.PI / 2));
      qFrom.copy(q);
    } else {
      qFrom.copy(rest);
      stopPlayer();
      if (moved) onMoved?.((moved = false));
    }
    const from = opened, l0 = lifted, t0 = performance.now(), ms = calm() ? 0 : OPEN_MS * Math.abs(to - from);
    const step = (now: number) => {
      const t = ms ? Math.min(1, (now - t0) / ms) : 1;
      opened = from + (to - from) * t; // the lid's path is eased in makeBox
      lifted = l0 * (1 - t);
      q.slerpQuaternions(qFrom, qFace, ease(Math.min(1, opened / 0.6)));
      spin.quaternion.copy(q);
      draw();
      if (t < 1) oraf = requestAnimationFrame(step);
      else if (open) startPlayer(); // only once it's open, so the trailer starts as it appears
      else q.copy(rest);
    };
    oraf = requestAnimationFrame(step);
  };
  const startPlayer = () => {
    player?.remove();
    const id = portrait ? video.portrait : video.landscape;
    player = document.createElement("iframe");
    player.src = `https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;
    player.title = "Love, Career & Magic: how to play";
    player.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    player.allowFullscreen = true;
    player.dataset.boxVideo = "";
    stage.append(player);
    placePlayer();
    const shown = player;
    requestAnimationFrame(() => shown.classList.add("shown"));
  };
  const stopPlayer = () => {
    player?.remove();
    player = null;
  };

  // open, a click or tap anywhere off the box (its buttons aside) closes it
  const outside = (e: PointerEvent) => {
    if (!openTo) return;
    const el = e.target as Element;
    if (el.closest?.("button") && stage.contains(el)) return;
    if (stage.contains(el) && over(e.clientX, e.clientY)) return;
    openBox(false);
  };
  document.addEventListener("pointerdown", outside, true);
  unlisten = () => document.removeEventListener("pointerdown", outside, true);

  // pointer: drag to turn it, click or tap it to open it
  const ray = new T.Raycaster(), ndc = new T.Vector2();
  const over = (cx: number, cy: number) => {
    const b = stage.getBoundingClientRect();
    ndc.set(((cx - b.left) / b.width) * 2 - 1, -((cy - b.top) / b.height) * 2 + 1);
    ray.setFromCamera(ndc, cam);
    return ray.intersectObject(box, true).length > 0;
  };
  let drag: { x: number; y: number; t: number } | null = null, tap: { x: number; y: number; t: number } | null = null;
  const still = () => openTo || opened > 0;
  stage.onpointerdown = (e) => {
    if (e.button > 0 || (e.target as Element).closest("button, iframe") || still() || drag) return;
    cancelAnimationFrame(raf);
    intro = false;
    stage.classList.add("used");
    stage.setPointerCapture(e.pointerId);
    drag = tap = { x: e.clientX, y: e.clientY, t: e.timeStamp };
    v[0] = v[1] = 0;
  };
  stage.onpointermove = (e) => {
    if (!drag) {
      if (e.pointerType === "mouse" && !still()) {
        const on = over(e.clientX, e.clientY);
        liftLid(on ? 1 : 0);
        stage.classList.toggle("over", on);
      }
      return;
    }
    stage.classList.add("drag");
    const per = (Math.PI * 2) / (stage.clientWidth * 1.1); // a drag across the stage is about one turn
    const dx = (e.clientX - drag.x) * per, dy = (e.clientY - drag.y) * per, dt = Math.max(1, e.timeStamp - drag.t);
    turn(dx, dy);
    schedule();
    v[0] = (dx / dt) * 16;
    v[1] = (dy / dt) * 16;
    drag = { x: e.clientX, y: e.clientY, t: e.timeStamp };
  };
  const up = (e: PointerEvent) => {
    if (!drag) return;
    const wasTap = tap && e.type === "pointerup" && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) < 8 && e.timeStamp - tap.t < 500;
    const stillAtEnd = e.timeStamp - drag.t > 80;
    drag = tap = null;
    stage.classList.remove("drag");
    if (wasTap && over(e.clientX, e.clientY)) return openBox(true);
    if (!stillAtEnd && Math.hypot(...v) > 0.004) coast(); // let go while moving: it coasts
  };
  stage.onpointerup = up;
  stage.onpointercancel = up;
  stage.onpointerleave = (e) => {
    if (e.pointerType === "mouse" && !drag) {
      liftLid(0);
      stage.classList.remove("over");
    }
  };
  stage.onkeydown = (e) => {
    if ((e.target as Element) !== stage) return;
    const a = Math.PI / 12;
    const m = ({ ArrowRight: [a, 0], ArrowLeft: [-a, 0], ArrowUp: [0, -a], ArrowDown: [0, a] } as Record<string, [number, number]>)[e.key];
    if (m && !still()) {
      e.preventDefault();
      cancelAnimationFrame(raf);
      intro = false;
      turn(...m);
      schedule();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openBox(!openTo);
    } else if (e.key === "Escape" && openTo) {
      openBox(false);
    } else if ((e.key === "Home" || e.key === "0") && !still()) {
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
        if (!stage.classList.contains("used") && !openTo) spinBy(Math.PI * 2, 2400);
      },
      { threshold: 0.5 }
    );
    io.observe(stage);
  }

  return { open: openBox, reset, destroy: cleanup };
}
