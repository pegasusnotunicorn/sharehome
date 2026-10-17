// The "character arcs" step's traits as 3D trait cards (three.js), the printed ones (a selection,
// in images/cards/traits/): each new set flips the cards over, one after another, as they glide to
// the next character. They sway a little and lean toward the pointer, and a click turns one over to
// its printed back (and again, back to its trait). Each card sits where its flat
// tag is laid out (the tags stay, hidden, so the page keeps its layout). One WebGL renderer serves
// the whole page (card3d.ts).
import type * as THREE from "three";
import { bleedCanvas, calm, ease, loadTexture, loadThree, makeCard, paint, renderer, warm } from "./card3d";
import type { Three } from "./card3d";

export interface Trait {
  text: string;
  type: "good" | "bad" | "chaotic";
}

export interface TraitTilesApi {
  // show traits of these kinds on the cards, which move to where these tags are laid out
  show: (traits: Trait[], tags: HTMLElement[]) => void;
  destroy: () => void;
}

const TRAIT_MM: [number, number] = [88.9, 25.4];
const PER_KIND = 10;
const FLIP_S = 0.75;
const STAGGER_S = 0.12;

// where `el` sits inside `stage`, ignoring transforms (the stage is tilted on wide screens)
const offsetIn = (el: HTMLElement, stage: HTMLElement) => {
  let x = 0, y = 0, e: HTMLElement | null = el;
  while (e && e !== stage) {
    x += e.offsetLeft;
    y += e.offsetTop;
    e = e.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
};

export async function mountTraitTiles(stage: HTMLElement, onFail: () => void): Promise<TraitTilesApi | null> {
  let T: Three, r: THREE.WebGLRenderer;
  try {
    T = await loadThree();
    r = renderer(T);
  } catch {
    onFail();
    return null;
  }
  if (!stage.isConnected) return null;

  // the card images, each loaded once (the cards turn over sideways, so either face reads the right
  // way up)
  const loaded = new Map<string, Promise<THREE.Texture>>();
  const art = (src: string) => {
    if (!loaded.has(src))
      loaded.set(
        src,
        loadTexture(T, src).then((x) => {
          x.colorSpace = T.SRGBColorSpace;
          x.anisotropy = Math.min(8, r.capabilities.getMaxAnisotropy());
          return x;
        })
      );
    return loaded.get(src)!;
  };
  const backOf = (type: Trait["type"]) => `/images/cards/traits/${type}-back.webp`; // the printed back
  // a different card of this kind from the ones showing
  const showing = new Set<string>();
  const pick = (type: Trait["type"]) => {
    let src = "";
    // (a few goes at one that isn't showing; never stuck, if somehow they all are)
    for (let tries = 0; tries < 40; tries++) {
      src = `/images/cards/traits/${type}-${1 + Math.floor(Math.random() * PER_KIND)}.webp`;
      if (!showing.has(src)) break;
    }
    return src;
  };

  const sc = new T.Scene();
  const cam = new T.PerspectiveCamera(30, 1, 10, 8000);
  sc.add(new T.HemisphereLight(0xffffff, 0xd9d2cc, 1.35));
  const key = new T.DirectionalLight(0xffffff, 1.5);
  key.position.set(0.25, 1.2, 1);
  sc.add(key);
  const fill = new T.DirectionalLight(0xffffff, 0.75);
  fill.position.set(-0.6, -0.2, 1);
  sc.add(fill);
  const group = new T.Group();
  sc.add(group);

  interface Tile {
    obj: THREE.Group;
    faces: [THREE.MeshStandardMaterial, THREE.MeshStandardMaterial]; // front, back
    srcs: [string, string];
    type: Trait["type"];
    turns: number; // half turns done (odd: its second face is showing)
    flip: { from: number; at: number; quick?: boolean } | null; // a flip under way: from which angle, starting when (quick: clicked)
    pos: { x: number; y: number; w: number; h: number };
    from: { x: number; y: number };
    phase: number;
  }
  const blank = new T.Texture();
  const tiles: Tile[] = [];
  const tile = () => {
    const obj = makeCard(T, TRAIT_MM, blank, blank, null);
    const [fr, bk] = obj.children as THREE.Mesh[];
    group.add(obj);
    const t: Tile = {
      obj,
      faces: [fr.material as THREE.MeshStandardMaterial, bk.material as THREE.MeshStandardMaterial],
      srcs: ["", ""],
      type: "good",
      turns: 0,
      flip: null,
      pos: { x: 0, y: 0, w: 1, h: 1 },
      from: { x: 0, y: 0 },
      phase: Math.random() * 6,
    };
    obj.visible = false;
    tiles.push(t);
    return t;
  };

  // its own canvas; the shared renderer draws into it
  const cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  const ctx = cv.getContext("2d");
  stage.append(cv);
  let W = 0, H = 0, CW = 0, CH = 0; // the picture's size; the canvas's (it reaches past the picture)
  const draw = () => {
    if (!W || !H || !ctx) return;
    paint(r, sc, cam, ctx, CW, CH);
  };
  let tags: HTMLElement[] = [];
  const place = () => {
    tags.forEach((el, i) => {
      const t = tiles[i];
      if (!t) return;
      const o = offsetIn(el, stage);
      t.pos = { x: o.x + o.w / 2 - W / 2, y: o.y + o.h / 2 - H / 2, w: o.w, h: o.h };
    });
  };
  const size = () => {
    W = stage.offsetWidth;
    H = stage.offsetHeight;
    if (!W || !H) return;
    // the tags sit near (and past) the picture's edges, and the cards lift as they turn over
    const b = Math.round(Math.min(W, H) * 0.35);
    ({ w: CW, h: CH } = bleedCanvas(cv, W, H, b, b, r.getPixelRatio()));
    cam.aspect = CW / CH;
    cam.position.set(0, 0, CH / 2 / Math.tan((cam.fov * Math.PI) / 360));
    cam.updateProjectionMatrix();
    place();
  };
  const resize = () => {
    size();
    for (const t of tiles) t.from = { x: t.pos.x, y: t.pos.y };
    step(true);
    draw();
  };

  const lean = { x: 0, y: 0, tx: 0, ty: 0 };
  let now = 0;
  const step = (instant = false) => {
    const still = calm() || instant;
    lean.x += (lean.tx - lean.x) * (still ? 1 : 0.08);
    lean.y += (lean.ty - lean.y) * (still ? 1 : 0.08);
    group.rotation.set(lean.y * 0.12, lean.x * 0.2, 0);
    for (const t of tiles) {
      // a new character's traits turn over in an even sweep; a clicked card turns over the way the
      // other cards on the page do, fast at first, then settling
      let a = 1, e = 1;
      if (t.flip) {
        const since = Math.max(0, now - t.flip.at);
        if (t.flip.quick) {
          e = still ? 1 : 1 - Math.exp(-7 * since);
          a = e > 0.995 ? 1 : e;
        } else {
          a = still ? 1 : Math.min(1, since / FLIP_S);
          e = ease(a);
        }
        if (a >= 1) {
          t.flip = null;
          e = 1;
        }
      }
      const angle = t.flip ? t.flip.from + (t.turns * Math.PI - t.flip.from) * e : t.turns * Math.PI;
      const sway = still ? 0 : Math.sin(now * 1.3 + t.phase);
      const x = t.from.x + (t.pos.x - t.from.x) * e, y = t.from.y + (t.pos.y - t.from.y) * e;
      if (a >= 1) t.from = { x: t.pos.x, y: t.pos.y };
      // it turns over sideways, lifting off the picture as far as its side swings back
      t.obj.position.set(x, -y, Math.sin(e * Math.PI) * Math.max(40, t.pos.w / 2 + 6));
      t.obj.rotation.set(sway * 0.04, angle + sway * 0.06, 0);
      t.obj.scale.setScalar(t.pos.w);
    }
  };

  // run while it's on screen (and the tab is showing)
  let raf = 0, onScreen = false, dead = false;
  const frame = (ms: number) => {
    now = ms / 1000;
    step();
    draw();
    raf = requestAnimationFrame(frame);
  };
  const run = () => {
    cancelAnimationFrame(raf);
    if (dead || !onScreen || document.hidden) return;
    raf = requestAnimationFrame(frame);
  };
  const io = new IntersectionObserver((e) => {
    onScreen = e.some((x) => x.isIntersecting);
    run();
  });
  io.observe(stage);
  document.addEventListener("visibilitychange", run);

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const b = stage.getBoundingClientRect();
    lean.tx = ((e.clientX - b.left) / b.width) * 2 - 1;
    lean.ty = ((e.clientY - b.top) / b.height) * 2 - 1;
  };
  const onLeave = () => (lean.tx = lean.ty = 0);
  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerleave", onLeave);

  // a click (or a tap) on a card turns it over, to the card on its other side (and back)
  const ray = new T.Raycaster(), ndc = new T.Vector2();
  const area = stage.parentElement ?? stage;
  let down: { x: number; y: number } | null = null;
  const tileAt = (x: number, y: number) => {
    const b = cv.getBoundingClientRect();
    ndc.set(((x - b.left) / b.width) * 2 - 1, -((y - b.top) / b.height) * 2 + 1);
    ray.setFromCamera(ndc, cam);
    const hit = ray.intersectObjects(tiles.filter((t) => t.obj.visible).map((t) => t.obj), true)[0];
    return hit ? tiles.find((t) => hit.object.parent === t.obj || hit.object.parent?.parent === t.obj) : undefined;
  };
  const onDown = (e: PointerEvent) => (down = { x: e.clientX, y: e.clientY });
  const onUp = (e: PointerEvent) => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) return;
    down = null;
    if ((e.target as Element).closest?.("a, button")) return;
    const t = tileAt(e.clientX, e.clientY);
    if (!t) return;
    // showing its trait: its printed back goes on the face that's turned away, then it turns over.
    // Showing its back, it turns back over to its trait (still on the other face)
    const turnOver = () => {
      t.turns += 1;
      t.flip = { from: t.obj.rotation.y, at: now, quick: true };
      if (!onScreen) {
        step(true);
        draw();
      }
    };
    const away = (t.turns + 1) % 2, back = backOf(t.type);
    if (t.srcs[t.turns % 2] === back || t.srcs[away] === back) return turnOver();
    art(back)
      .then((map) => {
        if (dead) return;
        showing.delete(t.srcs[away]);
        t.srcs[away] = back;
        t.faces[away].map = map;
        t.faces[away].needsUpdate = true;
        turnOver();
      })
      .catch(() => {});
  };
  const onHover = (e: PointerEvent) => {
    if (e.pointerType === "mouse") area.style.cursor = tileAt(e.clientX, e.clientY) ? "pointer" : "";
  };
  area.addEventListener("pointerdown", onDown);
  area.addEventListener("pointerup", onUp);
  area.addEventListener("pointermove", onHover);

  const ro = new ResizeObserver(resize);
  await warm(r, sc, cam); // shaders and pictures ready before its first frame
  ro.observe(stage);

  let shown = 0; // the latest set asked for (a slow image can't put an older set over a newer one)
  return {
    show: (traits, els) => {
      const ask = ++shown;
      const first = !tiles.length;
      const srcs = traits.map((t) => pick(t.type));
      srcs.forEach((s) => showing.add(s));
      const next = (t: Tile | undefined) => (!t || first ? 0 : (t.turns + 1) % 2);
      Promise.all(srcs.map((src) => art(src)))
        .then((maps) => {
          // (a newer set's on its way: these were never shown)
          if (dead || ask !== shown) return srcs.forEach((x) => showing.delete(x));
          tags = els;
          // the hidden tags take the cards' shape (CSS) before they're measured
          if (first) stage.classList.add("ready");
          while (tiles.length < traits.length) tile();
          // each card glides from where it is now
          for (const t of tiles) t.from = { x: t.obj.position.x, y: -t.obj.position.y };
          size();
          // they glide together, a beat apart: the one leading the way goes first, so none catches up
          // with the one ahead of it
          const down = tiles.length > 0 && tiles[0].pos.y > tiles[0].from.y;
          maps.forEach((map, i) => {
            const t = tiles[i], face = next(t);
            showing.delete(t.srcs[face]);
            t.srcs[face] = srcs[i];
            t.type = traits[i].type;
            t.faces[face].map = map;
            t.faces[face].needsUpdate = true;
            if (first) {
              t.obj.visible = true;
              t.from = { x: t.pos.x, y: t.pos.y };
              return;
            }
            t.turns += 1;
            t.flip = { from: t.obj.rotation.y, at: now + (down ? maps.length - 1 - i : i) * STAGGER_S };
          });
          step(!onScreen);
          draw();
        })
        .catch(() => {
          srcs.forEach((x) => showing.delete(x));
          if (first) onFail();
        });
    },
    destroy: () => {
      dead = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", run);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      area.removeEventListener("pointerdown", onDown);
      area.removeEventListener("pointerup", onUp);
      area.removeEventListener("pointermove", onHover);
      area.style.cursor = "";
      sc.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        ([] as THREE.Material[]).concat(m.material || []).forEach((x) => x.dispose());
      });
      loaded.forEach((p) => p.then((x) => x.dispose()).catch(() => {}));
      cv.remove();
    },
  };
}
