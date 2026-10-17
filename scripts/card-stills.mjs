// Renders each character's card in 3D at rest, as the character page's card viewer first draws it
// (cardViewer3d.ts), into public/images/pieces/characters/stills/: the picture the page shows until its
// 3D card is in, then swaps for it in one frame (CardViewer.tsx `render`). Run it again whenever a card's
// art, or the viewer's camera, pose or lighting, changes. Needs the site running (npm start).
//
//   npm run card-stills [-- http://localhost:3000]
//
// (CHROMIUM: a Chromium to use, where Playwright's own isn't installed)
/* global document -- (in the page) */
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright-core";
import { getAllCharacters } from "../src/components/Characters/Characters.ts";

const SITE = process.argv[2] || "http://localhost:3000";
const OUT = new URL("../public/images/pieces/characters/stills/", import.meta.url);
// (as wide as the card viewer is drawn on a wide screen, at twice the pixels; and a copy for phones)
const WIDTH = 1120;
const COPY = 720;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM, args: ["--enable-unsafe-swiftshader"] });
// (less motion: the card stays at rest, without its first slow turn)
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
mkdirSync(new URL(`${COPY}/`, OUT), { recursive: true });

const cast = getAllCharacters();
for (const [i, c] of cast.entries()) {
  await page.goto(`${SITE}/characters/${c.urlName}`);
  await page.waitForSelector('[aria-roledescription="3D card"].ready', { timeout: 60000 });
  const [full, copy] = await page.evaluate(
    ([width, copyWidth]) => {
      const cv = document.querySelector('[aria-roledescription="3D card"] canvas[data-card-canvas]');
      if (cv.width !== width) throw new Error(`the card's canvas is ${cv.width}px wide, not ${width}px`);
      const small = document.createElement("canvas");
      small.width = copyWidth;
      small.height = Math.round((cv.height * copyWidth) / cv.width);
      const g = small.getContext("2d");
      g.imageSmoothingQuality = "high";
      g.drawImage(cv, 0, 0, small.width, small.height);
      return [cv, small].map((x) => x.toDataURL("image/webp", 0.88).split(",")[1]);
    },
    [WIDTH, COPY]
  );
  const name = `${String(i + 1).padStart(2, "0")}.webp`;
  writeFileSync(new URL(name, OUT), Buffer.from(full, "base64"));
  writeFileSync(new URL(`${COPY}/${name}`, OUT), Buffer.from(copy, "base64"));
  console.log(name, c.name);
}
await browser.close();
