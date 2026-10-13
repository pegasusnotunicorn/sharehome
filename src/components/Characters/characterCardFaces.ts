import type { Character } from "../../types/character";
import type { CardFaces } from "../utils/cardViewer3d";

// A character card's two faces, drawn the way the printed card is laid out:
// front, the illustration with their name and "— THE ORC —"; back, their bio and details.
export const CHARACTER_CARD_MM: [number, number] = [120, 69.44];
const W = 1536;
const H = Math.round((W * CHARACTER_CARD_MM[1]) / CHARACTER_CARD_MM[0]);
const INK = "#323232";

const canvas = () => {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  return c;
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = reject;
    im.src = src;
  });

const fontsReady = () =>
  Promise.all(
    ['80px "Rowdies-Bold"', '30px "Roboto Light"', '30px "Roboto Regular"'].map((f) =>
      document.fonts.load(f).catch(() => [])
    )
  );

// the biggest size (up to `px`) at which `text` fits in `max` pixels
const fitFont = (ctx: CanvasRenderingContext2D, text: string, family: string, px: number, max: number) => {
  ctx.font = `${px}px "${family}"`;
  const w = ctx.measureText(text).width;
  if (w > max) ctx.font = `${Math.floor((px * max) / w)}px "${family}"`;
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

async function drawFront(c: Character) {
  const cv = canvas(), ctx = cv.getContext("2d")!;
  const im = await loadImage(c.image.url);
  const k = Math.max(W / im.naturalWidth, H / im.naturalHeight); // cover
  const dw = im.naturalWidth * k, dh = im.naturalHeight * k;
  ctx.drawImage(im, (W - dw) / 2, (H - dh) / 2, dw, dh);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#fff";
  ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 3;
  fitFont(ctx, c.name, "Rowdies-Bold", 92, W * 0.86);
  ctx.fillText(c.name, W / 2, H * 0.855);
  ctx.font = '40px "Rowdies-Bold"';
  ctx.fillText(`— THE ${c.race.toUpperCase()} —`, W / 2, H * 0.94);
  return cv;
}

function drawBack(c: Character) {
  const cv = canvas(), ctx = cv.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = INK;
  ctx.textBaseline = "top";

  const left = W * 0.05, colW = W * 0.4, right = W * 0.555, rightW = W * 0.4, top = H * 0.07, bottom = H * 0.93;
  const details: [string, string][] = [
    ["Age", String(c.age)],
    ["Race", c.race],
    ["Occupation", [c.job, c.job2].filter(Boolean).join(" / ")],
    ["Employer", [c.employer, c.employer2].filter(Boolean).join(" / ")],
  ];

  // lay both columns out at scale s; returns whether they fit
  const layout = (s: number, paint: boolean) => {
    const body = 31 * s, lh = body * 1.38;
    // left: name, then the bio
    fitFont(ctx, c.name, "Rowdies-Bold", Math.round(60 * s), colW);
    if (paint) ctx.fillText(c.name, left, top);
    let y = top + 60 * s * 1.45;
    ctx.font = `${body}px "Roboto Light"`;
    for (const para of c.description) {
      for (const line of wrap(ctx, para, colW)) {
        if (paint) ctx.fillText(line, left, y);
        y += lh;
      }
      y += lh * 0.35;
    }
    const leftEnd = y;
    // right: the details, then interests / hobbies
    const valueX = right + W * 0.115, valueW = rightW - W * 0.115;
    y = top + 4 * s;
    for (const [label, value] of details) {
      if (!value) continue;
      ctx.font = `${body * 0.92}px "Roboto Regular"`;
      if (paint) ctx.fillText(label, right, y + body * 0.06);
      ctx.font = `${body}px "Roboto Light"`;
      for (const line of wrap(ctx, value, valueW)) {
        if (paint) ctx.fillText(line, valueX, y);
        y += lh;
      }
      y += lh * 0.25;
    }
    y += lh * 0.15;
    ctx.font = `${body}px "Roboto Regular"`;
    if (paint) ctx.fillText("Interests / Hobbies", right, y);
    y += lh * 1.15;
    ctx.font = `${body}px "Roboto Light"`;
    const indent = body * 1.1;
    for (const hobby of c.hobbies) {
      if (paint) ctx.fillText("•", right + body * 0.2, y);
      for (const line of wrap(ctx, hobby.trim(), rightW - indent)) {
        if (paint) ctx.fillText(line, right + indent, y);
        y += lh;
      }
      y += lh * 0.25;
    }
    return Math.max(leftEnd, y) <= bottom;
  };
  let s = 1;
  while (s > 0.5 && !layout(s, false)) s -= 0.04;
  layout(s, true);

  // the line between the columns
  ctx.fillStyle = "rgba(50, 50, 50, 0.7)";
  ctx.fillRect(W * 0.5 - 1, H * 0.08, 2, H * 0.82);
  return cv;
}

export const characterCardFaces = (c: Character) => async (): Promise<CardFaces> => {
  await fontsReady();
  return { front: await drawFront(c), back: drawBack(c) };
};
