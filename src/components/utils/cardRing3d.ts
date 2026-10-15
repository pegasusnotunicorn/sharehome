// The character page's cards either side of the one on show, in 3D (three.js): like a rotary card file
// turned on its side, the cards a step away stand angled back to the left and right of it, and the next
// ones further back. Turning (Prev / Next, or clicking a card) swings them all round together: the next
// card turns in to face you as this one swings off to the side.
// The card on show is the card viewer's (cardViewer3d.ts, which you can turn and zoom), drawn over this
// one: this camera is that viewer's, carried on out past its stage, so the card in the middle here sits
// exactly where the viewer's does. While a turn is under way the viewer steps aside and this one draws
// the middle card too, until the next viewer is ready.
// One WebGL renderer serves the whole page (card3d.ts): the ring renders through it onto its own canvas,
// and only when something moves.
import type * as THREE from "three";
import { calm, loadTexture, loadThree, makeCard, paint, renderer, studio } from "./card3d";
import type { Three } from "./card3d";

export interface CardRingApi {
  // the cards, in order round the cast, the one on show in the middle (4 either side)
  set: (fronts: string[]) => void;
  // swing round `n` cards (+1: the next one comes in); resolves once it's there
  turn: (n: number) => Promise<void>;
  // draw the middle card here (the viewer's not showing it)
  showMiddle: (on: boolean) => void;
  destroy: () => void;
}

interface MountOptions {
  mm: [number, number];
  viewer: () => HTMLElement | null; // the card viewer's stage: this camera continues its view
  onPick: (n: number) => void; // a card `n` steps away was clicked
  onFail: () => void;
}

// cards either side: three showing, and a fourth past them, unseen, that fades in as the ring turns it
// round (and the third fades out as it turns away)
const SIDE = 4;
const seen = (a: number) => Math.min(1, Math.max(0, 3.55 - a)); // how solid a card `a` steps out is
// (the viewer's camera and its card at rest: see cardViewer3d.ts)
const AIM: [number, number, number] = [0, -0.06, 0];
const CAM: [number, number, number] = [0, 0.38, 3.1];
const REST_Z = 1.4;
const REST: [number, number] = [-0.42, -0.12];
const TURN_MS = 700;

// where the card `k` steps from the middle stands (k needn't be whole: between two places, part way)
const place = (k: number) => {
  const a = Math.abs(k), s = Math.sign(k);
  // out to the side and back, further each step, turned more toward the middle
  const x = s * (a <= 1 ? 0.98 * a : 0.98 + 0.58 * (a - 1));
  const z = -(a <= 1 ? 0.5 * a : 0.5 + 0.62 * (a - 1));
  const turn = a <= 1 ? REST[0] * (1 - a) + -s * 0.95 * a : -s * (0.95 + 0.12 * (a - 1));
  return { x, z, ry: turn, rx: REST[1] };
};

export async function mountCardRing(el: HTMLElement, { mm, viewer, onPick, onFail }: MountOptions): Promise<CardRingApi | null> {
  let T: Three, r: THREE.WebGLRenderer, gold: THREE.Texture;
  try {
    T = await loadThree();
    r = renderer(T);
    gold = await studio(T, r);
  } catch {
    onFail();
    return null;
  }
  if (!el.isConnected) return null;

  // lit like the viewer, its shadows on the same invisible floor
  const sc = new T.Scene();
  const cam = new T.PerspectiveCamera(28, 4 / 3, 0.05, 30);
  sc.add(new T.HemisphereLight(0xffffff, 0xd9d2cc, 1.25));
  const key = new T.DirectionalLight(0xffffff, 1.7);
  key.position.set(0.15, 4, 0.9);
  key.castShadow = true;
  Object.assign(key.shadow.camera, { left: -3.5, right: 3.5, top: 3, bottom: -3, near: 1, far: 9 });
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.radius = 30;
  key.shadow.blurSamples = 24;
  key.shadow.bias = -0.0005;
  sc.add(key);
  const fill = new T.DirectionalLight(0xffffff, 0.8);
  fill.position.set(0.7, 0.5, 3);
  sc.add(fill);
  const floor = new T.Mesh(new T.PlaneGeometry(14, 14), new T.ShadowMaterial({ opacity: 0.085 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.6;
  floor.receiveShadow = true;
  sc.add(floor);

  // the cards, one per place (-SIDE … SIDE), their pictures swapped in as the ring turns
  const blank = new T.Texture();
  const cards = Array.from({ length: SIDE * 2 + 1 }, () => {
    const obj = makeCard(T, mm, blank, blank, gold);
    obj.traverse((o) => {
      for (const m of ([] as THREE.Material[]).concat((o as THREE.Mesh).material || [])) m.transparent = true;
    });
    sc.add(obj);
    return obj;
  });
  const fade = (obj: THREE.Group, a: number) =>
    obj.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      for (const m of ([] as THREE.Material[]).concat(mesh.material)) m.opacity = a;
      mesh.castShadow = a > 0.5; // (a shadow can't fade: it goes when the card's mostly gone)
    });
  const faceOf = (obj: THREE.Group) => (obj.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
  const backOf = (obj: THREE.Group) => (obj.children[1] as THREE.Mesh).material as THREE.MeshStandardMaterial;
  const edgeOf = (obj: THREE.Group) => ((obj.children[2] as THREE.Mesh).material as THREE.MeshStandardMaterial[])[1];
  const GOLD = edgeOf(cards[0]).color.clone(), GOLD_SHINE = edgeOf(cards[0]).envMapIntensity;

  const textures = new Map<string, Promise<THREE.Texture>>();
  const loaded = new Map<string, THREE.Texture>();
  const picture = (url: string) => {
    if (!textures.has(url))
      textures.set(
        url,
        loadTexture(T, url).then((x) => {
          x.colorSpace = T.SRGBColorSpace;
          x.anisotropy = Math.min(8, r.capabilities.getMaxAnisotropy());
          r.initTexture(x);
          loaded.set(url, x);
          return x;
        })
      );
    return textures.get(url)!;
  };

  let fronts: string[] = [], shift = 0, middle = false, dead = false;
  // the cards to the sides stand back in a mist the colour of the page, thicker the further out (the
  // one in the middle, clear of it): each card's own colours are washed toward it
  const MIST = new T.Color(0xf4f2ec);
  const mist = (a: number) => Math.min(0.85, 0.42 * Math.min(1, a) + 0.22 * Math.max(0, a - 1));
  const pose = () => {
    cards.forEach((obj, i) => {
      const k = i - SIDE - shift;
      const m = mist(Math.abs(k));
      for (const mat of [faceOf(obj), backOf(obj)]) {
        mat.color.setScalar(1 - m);
        mat.emissive.copy(MIST).multiplyScalar(m);
      }
      // (and its gold edge, which shines less)
      const edge = edgeOf(obj);
      edge.color.copy(GOLD).multiplyScalar(1 - m);
      edge.emissive.copy(MIST).multiplyScalar(m);
      edge.envMapIntensity = GOLD_SHINE * (1 - m);
      const p = place(k);
      obj.position.set(p.x, 0, p.z);
      obj.rotation.set(p.rx, p.ry, 0, "YXZ");
      const a = seen(Math.abs(k));
      fade(obj, a);
      obj.visible = !!fronts[i] && (Math.abs(k) > 0.001 || middle) && a > 0.001;
    });
  };
  // each card its picture: those already in at once (a turn's end hands the same cards on), the others
  // as they come in
  const wear = () =>
    cards.forEach((obj, i) => {
      const x = (fronts[i] && loaded.get(fronts[i])) || blank;
      if (faceOf(obj).map === x) return;
      faceOf(obj).map = backOf(obj).map = x;
      faceOf(obj).needsUpdate = backOf(obj).needsUpdate = true;
    });
  const dress = () => {
    wear();
    for (const u of fronts)
      if (u && !loaded.has(u))
        picture(u)
          .then(() => {
            if (dead || !fronts.includes(u)) return;
            wear();
            draw();
          })
          .catch(() => {});
  };

  // its canvas fills `el`; the camera is the viewer's, its view carried on out to the canvas's edges
  const cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  Object.assign(cv.style, { position: "absolute", inset: "0", width: "100%", height: "100%", pointerEvents: "none" });
  const ctx = cv.getContext("2d");
  el.prepend(cv);
  let Wr = 0, Hr = 0;
  const frame = () => {
    const v = viewer();
    if (!v) return false;
    const a = el.getBoundingClientRect(), b = v.getBoundingClientRect();
    if (!b.width || !b.height) return false;
    cam.aspect = b.width / b.height;
    cam.position.set(...CAM).divideScalar(REST_Z).add(new T.Vector3(...AIM));
    cam.lookAt(...AIM);
    cam.setViewOffset(b.width, b.height, a.left - b.left, a.top - b.top, Wr, Hr);
    cam.updateProjectionMatrix();
    return true;
  };
  const draw = () => {
    if (dead || !Wr || !Hr || !ctx || !frame()) return;
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
  const v0 = viewer();
  if (v0) ro.observe(v0);

  // a click on a card at the side: that one
  const ray = new T.Raycaster(), ndc = new T.Vector2();
  const onClick = (e: MouseEvent) => {
    const t = e.target as Element;
    if (t.closest("button, a, [aria-roledescription]")) return;
    const b = cv.getBoundingClientRect();
    ndc.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
    if (!frame()) return;
    ray.setFromCamera(ndc, cam);
    const hit = ray.intersectObjects(cards.filter((c) => c.visible), true)[0];
    const i = hit ? cards.findIndex((c) => c === hit.object.parent) : -1;
    if (i >= 0 && i !== SIDE) onPick(i - SIDE);
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const t = e.target as Element;
    let over = false;
    if (!t.closest("button, a, [aria-roledescription]") && frame()) {
      const b = cv.getBoundingClientRect();
      ndc.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
      ray.setFromCamera(ndc, cam);
      const hit = ray.intersectObjects(cards.filter((c) => c.visible), true)[0];
      over = !!hit && hit.object.parent !== cards[SIDE];
    }
    el.style.cursor = over ? "pointer" : "";
  };
  el.addEventListener("click", onClick);
  el.addEventListener("pointermove", onMove);

  // a turn under way: cut short (by a new set of cards, or a new turn), it's still over
  let raf = 0, finish: (() => void) | null = null;
  const stop = () => {
    cancelAnimationFrame(raf);
    const f = finish;
    finish = null;
    f?.();
  };
  const api: CardRingApi = {
    set: (f) => {
      stop();
      fronts = f;
      shift = 0;
      dress();
      draw();
    },
    turn: (n) =>
      new Promise<void>((done) => {
        stop();
        finish = done;
        middle = true;
        const t0 = performance.now(), ms = calm() ? 0 : TURN_MS * Math.min(1.6, 0.7 + 0.3 * Math.abs(n));
        // (eased out with a little settle, like a card dropping into place)
        const e = (t: number) => 1 - Math.pow(1 - t, 3);
        const step = (now: number) => {
          const t = ms ? Math.min(1, (now - t0) / ms) : 1;
          shift = n * e(t);
          draw();
          if (t < 1) raf = requestAnimationFrame(step);
          else {
            finish = null;
            done();
          }
        };
        step(t0);
      }),
    // (drawn there and then, so it's gone in the same frame as the viewer shows)
    showMiddle: (on) => {
      middle = on;
      draw();
    },
    destroy: () => {
      dead = true;
      stop();
      ro.disconnect();
      el.removeEventListener("click", onClick);
      el.removeEventListener("pointermove", onMove);
      el.style.cursor = "";
      sc.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        ([] as THREE.Material[]).concat(m.material || []).forEach((x) => x.dispose());
      });
      textures.forEach((p) => p.then((x) => x.dispose()).catch(() => {}));
      blank.dispose();
      (key.shadow.map as THREE.WebGLRenderTarget | null)?.dispose();
      cv.remove();
    },
  };
  size();
  return api;
}
