import type { CardFaces } from "../utils/cardViewer3d";

// A Direction or Episode card's two faces, as the flat cards show them (Card.tsx): front, its
// painted frame with the card's words in the middle; back, the illustration.
export const DIRECTION_EPISODE_MM: [number, number] = [88, 63];
const W = 1024;
const H = Math.round((W * DIRECTION_EPISODE_MM[1]) / DIRECTION_EPISODE_MM[0]);
const SERIF = '"Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif';

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = reject;
    im.src = src;
  });

const canvas = () => {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  return c;
};

const wrap = (ctx: CanvasRenderingContext2D, text: string, max: number) => {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > max) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
};

// `art`: which of the three Direction frames (Episode cards have one)
export const directionEpisodeFaces =
  (type: "direction" | "episode", text: string, art: number) => async (): Promise<CardFaces> => {
    const n = type === "direction" ? art % 3 : "";
    const [frame, illustration] = await Promise.all([
      loadImage(`/images/illustrations/${type}cardfront${n}.webp`),
      loadImage(`/images/illustrations/${type}card${n}.webp`),
    ]);

    // the front: the words on white, the frame (with its hands holding the card) over them
    const front = canvas(), f = front.getContext("2d")!;
    f.fillStyle = "#fff";
    f.fillRect(0, 0, W, H);
    const direction = type === "direction";
    let px = W * 0.087;
    const max = W * (direction ? 0.6 : 0.66);
    let lines: string[];
    for (;;) {
      f.font = `${Math.round(px)}px ${SERIF}`;
      lines = wrap(f, text, max);
      if (lines.length <= 4 || px < W * 0.05) break;
      px *= 0.92;
    }
    f.fillStyle = "#323232";
    f.textAlign = "center";
    f.textBaseline = "middle";
    const lh = px * 1.2, mid = H * (direction ? 0.48 : 0.5);
    lines.forEach((l, i) => f.fillText(l, W / 2, mid + (i - (lines.length - 1) / 2) * lh));
    const grow = direction ? 1.1 : 1.05; // the flat cards crop the frame's outer edge a little
    f.drawImage(frame, (W - W * grow) / 2, (H - H * grow) / 2, W * grow, H * grow);

    // the back: the illustration, cropped to fill
    const back = canvas(), b = back.getContext("2d")!;
    const k = Math.max(W / illustration.naturalWidth, H / illustration.naturalHeight);
    const dw = illustration.naturalWidth * k, dh = illustration.naturalHeight * k;
    b.drawImage(illustration, (W - dw) / 2, (H - dh) / 2, dw, dh);
    return { front, back };
  };
