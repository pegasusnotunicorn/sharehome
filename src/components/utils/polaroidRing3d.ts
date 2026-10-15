// The contact page's polaroids in 3D (three.js), turned like a character page's cards (cardRing3d.ts): a
// rotary card file on its side, the photo in front facing you, the ones a step away angled back to the
// left and right in a mist the colour of the page, and further ones further back. It goes round by
// itself, one photo at a time, and goes on round: after the last comes the first again.
// One WebGL renderer serves the whole page (card3d.ts): the ring renders through it onto its own canvas,
// and only when something moves.
import type * as THREE from "three";
import { calm, decoded, loadThree, makeCard, paint, renderer } from "./card3d";
import type { Three } from "./card3d";

export interface PolaroidRingApi {
  // swing round `n` photos (+1: the next one comes in)
  turn: (n: number) => void;
  destroy: () => void;
}

interface Photo {
  src: string;
  date?: string; // written along the bottom
}

interface MountOptions {
  photos: Photo[];
  onTurn: (i: number) => void; // the photo now in front
  onOpen: (i: number) => void; // the one in front was clicked
  onTouch?: () => void; // someone swiped or clicked it
  onFail: () => void;
}

// a polaroid, in mm: its long side's 1 in the scene
const MM: [number, number] = [88, 107];
const SIDE = 4;
const seen = (a: number) => Math.min(1, Math.max(0, 3.55 - a));
const mist = (a: number) => Math.min(0.85, 0.42 * Math.min(1, a) + 0.22 * Math.max(0, a - 1));
const TURN_MS = 900;
const AIM: [number, number, number] = [0, -0.04, 0];
const CAM: [number, number, number] = [0, 0.32, 3.3];

// where the photo `k` steps from the one in front stands (k needn't be whole: part way)
const place = (k: number) => {
  const a = Math.abs(k), s = Math.sign(k);
  const x = s * (a <= 1 ? 0.84 * a : 0.84 + 0.46 * (a - 1));
  const z = -(a <= 1 ? 0.5 * a : 0.5 + 0.6 * (a - 1));
  const ry = a <= 1 ? -s * 0.95 * a : -s * (0.95 + 0.12 * (a - 1));
  return { x, z, ry, rx: -0.06 };
};

// a photo as a polaroid: the white frame, the photo, the date written in the wide strip below it
const W = 704, H = Math.round((W * MM[1]) / MM[0]);
const polaroid = async (T: Three, p: Photo) => {
  const img = await decoded(await new T.ImageLoader().loadAsync(p.src));
  await document.fonts?.load(`40px GochiHand`).catch(() => {});
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  g.fillStyle = "#fbfaf6";
  g.fillRect(0, 0, W, H);
  const m = Math.round(W * 0.06), side = W - 2 * m;
  // (the middle of the photo, square)
  const s = Math.min(img.width, img.height);
  g.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, m, m, side, side);
  g.strokeStyle = "rgba(0, 0, 0, 0.08)";
  g.lineWidth = 2;
  g.strokeRect(m, m, side, side);
  if (p.date) {
    g.fillStyle = "rgba(50, 50, 50, 0.72)";
    g.font = `${Math.round(W * 0.105)}px GochiHand, "Comic Sans MS", cursive`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(p.date, W / 2, m + side + (H - m - side) / 2);
  }
  const x = new T.CanvasTexture(c);
  x.colorSpace = T.SRGBColorSpace;
  return x;
};

const mod = (i: number, n: number) => ((i % n) + n) % n;

export async function mountPolaroidRing(el: HTMLElement, { photos, onTurn, onOpen, onTouch, onFail }: MountOptions): Promise<PolaroidRingApi | null> {
  let T: Three, r: THREE.WebGLRenderer;
  try {
    T = await loadThree();
    r = renderer(T);
  } catch {
    onFail();
    return null;
  }
  if (!el.isConnected || !photos.length) return null;

  const sc = new T.Scene();
  const cam = new T.PerspectiveCamera(28, 2, 0.05, 30);
  sc.add(new T.HemisphereLight(0xffffff, 0xe4ded6, 1.9));
  const key = new T.DirectionalLight(0xffffff, 1.5);
  key.position.set(0.15, 4, 1.2);
  key.castShadow = true;
  Object.assign(key.shadow.camera, { left: -3.5, right: 3.5, top: 3, bottom: -3, near: 1, far: 9 });
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.radius = 30;
  key.shadow.blurSamples = 24;
  key.shadow.bias = -0.0005;
  sc.add(key);
  const fill = new T.DirectionalLight(0xffffff, 1.35);
  fill.position.set(0.7, 0.5, 3);
  sc.add(fill);
  const floor = new T.Mesh(new T.PlaneGeometry(14, 14), new T.ShadowMaterial({ opacity: 0.085 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.56;
  floor.receiveShadow = true;
  sc.add(floor);

  // the back of every polaroid: plain card
  const paper = document.createElement("canvas");
  paper.width = paper.height = 4;
  const pg = paper.getContext("2d")!;
  pg.fillStyle = "#f1eee6";
  pg.fillRect(0, 0, 4, 4);
  const back = new T.CanvasTexture(paper);
  back.colorSpace = T.SRGBColorSpace;
  const blank = new T.Texture();

  const cards = Array.from({ length: SIDE * 2 + 1 }, () => {
    const obj = makeCard(T, MM, blank, back, null, 1.2);
    obj.traverse((o) => {
      for (const m of ([] as THREE.Material[]).concat((o as THREE.Mesh).material || [])) m.transparent = true;
    });
    sc.add(obj);
    return obj;
  });
  const faceOf = (obj: THREE.Group) => (obj.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
  const backOf = (obj: THREE.Group) => (obj.children[1] as THREE.Mesh).material as THREE.MeshStandardMaterial;
  const edgeOf = (obj: THREE.Group) => ((obj.children[2] as THREE.Mesh).material as THREE.MeshStandardMaterial[])[1];
  const EDGE = edgeOf(cards[0]).color.clone();
  const MIST = new T.Color(0xf4f2ec);

  // the polaroids, made as they're needed (the ones near the front first) and kept
  const made = new Map<number, THREE.Texture>();
  const making = new Map<number, Promise<void>>();
  const make = (i: number) => {
    if (made.has(i) || making.has(i)) return;
    making.set(
      i,
      polaroid(T, photos[i])
        .then((x) => {
          if (dead) return x.dispose();
          r.initTexture(x);
          made.set(i, x);
          wear();
          draw();
        })
        .catch(() => {})
    );
  };

  let at = 0, shift = 0, dead = false;
  const itemOf = (slot: number) => mod(at + slot - SIDE, photos.length);
  const wear = () =>
    cards.forEach((obj, slot) => {
      const x = made.get(itemOf(slot)) || blank;
      if (faceOf(obj).map === x) return;
      faceOf(obj).map = x;
      faceOf(obj).needsUpdate = true;
    });
  const dress = () => {
    for (let d = 0; d <= SIDE + 1; d++) {
      make(mod(at + d, photos.length));
      make(mod(at - d, photos.length));
    }
    wear();
  };

  const pose = () =>
    cards.forEach((obj, slot) => {
      const k = slot - SIDE - shift;
      const a = Math.abs(k), m = mist(a), o = seen(a);
      for (const mat of [faceOf(obj), backOf(obj)]) {
        mat.color.setScalar(1 - m);
        mat.emissive.copy(MIST).multiplyScalar(m);
      }
      const edge = edgeOf(obj);
      edge.color.copy(EDGE).multiplyScalar(1 - m);
      edge.emissive.copy(MIST).multiplyScalar(m);
      const p = place(k);
      obj.position.set(p.x, 0, p.z);
      obj.rotation.set(p.rx, p.ry, 0, "YXZ");
      obj.traverse((c) => {
        const mesh = c as THREE.Mesh;
        if (!mesh.isMesh) return;
        for (const mat of ([] as THREE.Material[]).concat(mesh.material)) mat.opacity = o;
        mesh.castShadow = o > 0.5;
      });
      // (a photo not in yet stays away, rather than show as a blank card)
      obj.visible = o > 0.001 && made.has(itemOf(slot));
    });

  const cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  Object.assign(cv.style, { position: "absolute", inset: "0", width: "100%", height: "100%" });
  const ctx = cv.getContext("2d");
  el.prepend(cv);
  let Wr = 0, Hr = 0;
  const frame = () => {
    cam.aspect = Wr / Hr;
    // the polaroid in front about three quarters of the height, however wide (a narrow screen: smaller,
    // so a little of the ones either side still shows)
    const fit = Math.max(1, 0.8 / cam.aspect);
    cam.fov = 26 * fit;
    cam.position.set(...CAM).add(new T.Vector3(...AIM));
    cam.lookAt(...AIM);
    cam.updateProjectionMatrix();
  };
  const draw = () => {
    if (dead || !Wr || !Hr || !ctx) return;
    frame();
    pose();
    paint(r, sc, cam, ctx, Wr, Hr);
  };
  const size = () => {
    Wr = el.clientWidth;
    Hr = el.clientHeight;
    const pr = r.getPixelRatio();
    cv.width = Math.max(1, Math.round(Wr * pr));
    cv.height = Math.max(1, Math.round(Hr * pr));
    draw();
  };
  const ro = new ResizeObserver(size);
  ro.observe(el);

  // a turn: the photos swing round together, then the one in front is the new one
  let raf = 0, from = 0, to = 0, t0 = 0, ms = 0;
  const ease = (t: number) => 1 - Math.pow(1 - t, 3);
  const step = (now: number) => {
    const t = ms ? Math.min(1, (now - t0) / ms) : 1;
    shift = from + (to - from) * ease(t);
    if (t < 1) {
      draw();
      raf = requestAnimationFrame(step);
      return;
    }
    raf = 0;
    at = mod(at + to, photos.length);
    shift = 0;
    dress();
    draw();
  };
  // a turn under way, stopped where it's got to (the nearest photo in front, the rest of the way
  // still to go), and how much of it was left
  const halt = () => {
    if (!raf) return 0;
    cancelAnimationFrame(raf);
    raf = 0;
    const whole = Math.round(shift);
    at = mod(at + whole, photos.length);
    shift -= whole;
    to -= whole;
    wear();
    return to;
  };
  const turn = (n: number) => {
    // (another turn on top of one under way: on from where it's got to)
    n += halt();
    if (!n && !shift) return;
    n = Math.max(-SIDE + 1, Math.min(SIDE - 1, n));
    from = shift;
    to = n;
    t0 = performance.now();
    ms = calm() ? 0 : TURN_MS * Math.min(1.5, 0.75 + 0.25 * Math.abs(n - from));
    // the ones coming in
    for (let d = 0; d <= SIDE + 1; d++) make(mod(at + to + Math.sign(n) * d, photos.length));
    onTurn(mod(at + n, photos.length));
    raf = requestAnimationFrame(step);
  };

  // a click: on the one in front, opens it; on one to the side, turns to it
  const ray = new T.Raycaster(), ndc = new T.Vector2();
  const hitAt = (e: MouseEvent) => {
    const b = cv.getBoundingClientRect();
    ndc.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
    frame();
    ray.setFromCamera(ndc, cam);
    const hit = ray.intersectObjects(cards.filter((c) => c.visible), true)[0];
    return hit ? cards.findIndex((c) => c === hit.object.parent) : -1;
  };
  // a swipe (or a drag) across: the photos follow it, and let go, it settles on the nearest one, or the
  // next one along if it was flicked
  let swipe: { id: number; x0: number; y0: number; base: number; on: boolean; x: number; t: number; v: number } | null = null;
  let swiped = false;
  const perPhoto = () => Math.max(120, Math.min(360, Wr * (Wr < 700 ? 0.5 : 0.28)));
  const onDown = (e: PointerEvent) => {
    if (e.button > 0) return;
    swiped = false;
    swipe = { id: e.pointerId, x0: e.clientX, y0: e.clientY, base: 0, on: false, x: e.clientX, t: e.timeStamp, v: 0 };
  };
  const onDrag = (e: PointerEvent) => {
    if (!swipe || e.pointerId !== swipe.id) return;
    const dx = e.clientX - swipe.x0, dy = e.clientY - swipe.y0;
    if (!swipe.on) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
      swipe.on = swiped = true;
      onTouch?.();
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        // (a pointer the browser no longer tracks)
      }
      halt();
      swipe.base = shift;
      swipe.x0 = e.clientX;
    }
    const dt = Math.max(1, e.timeStamp - swipe.t);
    swipe.v = (e.clientX - swipe.x) / dt;
    swipe.x = e.clientX;
    swipe.t = e.timeStamp;
    shift = Math.max(-SIDE + 1.2, Math.min(SIDE - 1.2, swipe.base - (e.clientX - swipe.x0) / perPhoto()));
    for (let d = 0; d <= SIDE + 1; d++) {
      make(mod(at + Math.round(shift) + d, photos.length));
      make(mod(at + Math.round(shift) - d, photos.length));
    }
    draw();
  };
  const onUp = (e: PointerEvent) => {
    if (!swipe || e.pointerId !== swipe.id) return;
    const s0 = swipe;
    swipe = null;
    if (!s0.on) return;
    // (a flick carries on to the next one)
    const fling = Math.abs(s0.v) > 0.35 && e.timeStamp - s0.t < 100 ? -Math.sign(s0.v) * 0.5 : 0;
    turn(Math.max(-SIDE + 1, Math.min(SIDE - 1, Math.round(shift + fling))));
  };
  el.addEventListener("pointerdown", onDown);
  el.addEventListener("pointermove", onDrag);
  el.addEventListener("pointerup", onUp);
  el.addEventListener("pointercancel", onUp);
  const onClick = (e: MouseEvent) => {
    if (swiped) return;
    const slot = hitAt(e);
    if (slot < 0) return;
    onTouch?.();
    if (slot === SIDE && !raf) onOpen(at);
    else if (slot !== SIDE) turn(slot - SIDE - Math.round(shift));
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || swipe?.on) return;
    el.style.cursor = hitAt(e) >= 0 ? "pointer" : "";
  };
  el.addEventListener("click", onClick);
  el.addEventListener("pointermove", onMove);

  dress();
  size();
  onTurn(at);

  return {
    turn,
    destroy: () => {
      dead = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("click", onClick);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onDrag);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointermove", onMove);
      el.style.cursor = "";
      sc.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        ([] as THREE.Material[]).concat(m.material || []).forEach((x) => x.dispose());
      });
      made.forEach((x) => x.dispose());
      back.dispose();
      blank.dispose();
      (key.shadow.map as THREE.WebGLRenderTarget | null)?.dispose();
      cv.remove();
    },
  };
}
