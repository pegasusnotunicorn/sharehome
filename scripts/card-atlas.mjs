// Builds the character card sprite sheets the footer's 3D cards use: every character's front and back,
// drawn by the same code as the home page's character deck (characterCardFaces.ts), 5 across and 5 down.
//
//   npm start                                  (in another terminal)
//   node scripts/card-atlas.mjs [http://localhost:3000]
//
// It drives your installed Chrome; set CHROMIUM_PATH to use another Chromium.
//
// Writes public/images/cards/character-fronts.webp and character-backs.webp, and half-size copies of them
// for phones in public/images/cards/1000/. Run it again when a
// character's art or text changes, or a character is added (then update the cols/rows in footerCards3d.ts's
// ATLAS and Footer.tsx's SHEET to match).
import { chromium } from "playwright-core";
import fs from "fs";

const base = process.argv[2] || "http://localhost:3000";
const COLS = 5, ROWS = 5, CELL_W = 400, CELL_H = 232, PAD = 4;

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : { channel: "chrome" }
);
const page = await browser.newPage();
await page.goto(base + "/characters", { waitUntil: "networkidle" });
const sheets = await page.evaluate(
  async ({ COLS, ROWS, CELL_W, CELL_H, PAD }) => {
    const { characterCardFaces } = await import("/src/components/Characters/characterCardFaces.ts");
    const { getAllCharacters } = await import("/src/components/Characters/Characters.ts");
    const all = getAllCharacters();
    const make = () => {
      const c = document.createElement("canvas");
      c.width = COLS * CELL_W;
      c.height = ROWS * CELL_H;
      return c;
    };
    const fronts = make(), backs = make();
    for (let i = 0; i < all.length; i++) {
      const f = await characterCardFaces(all[i])();
      const x = (i % COLS) * CELL_W, y = Math.floor(i / COLS) * CELL_H;
      for (const [sheet, face] of [[fronts, f.front], [backs, f.back]]) {
        const ctx = sheet.getContext("2d");
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(face, x, y, CELL_W, CELL_H); // fills the gutter, so mipmaps don't bleed in a neighbour
        ctx.drawImage(face, x + PAD, y + PAD, CELL_W - 2 * PAD, CELL_H - 2 * PAD);
      }
    }
    const half = (sheet) => {
      const c = document.createElement("canvas");
      c.width = sheet.width / 2;
      c.height = sheet.height / 2;
      const ctx = c.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(sheet, 0, 0, c.width, c.height);
      return c;
    };
    return {
      count: all.length,
      fronts: fronts.toDataURL("image/webp", 0.76),
      backs: backs.toDataURL("image/webp", 0.55),
      "1000/fronts": half(fronts).toDataURL("image/webp", 0.8),
      "1000/backs": half(backs).toDataURL("image/webp", 0.6),
    };
  },
  { COLS, ROWS, CELL_W, CELL_H, PAD }
);
fs.mkdirSync("public/images/cards/1000", { recursive: true });
for (const name of ["fronts", "backs", "1000/fronts", "1000/backs"]) {
  const file = `public/images/cards/${name.replace(/[a-z]+$/, "character-$&")}.webp`;
  fs.writeFileSync(file, Buffer.from(sheets[name].split(",")[1], "base64"));
  console.log(file, (fs.statSync(file).size / 1024).toFixed(0) + " KB");
}
console.log(sheets.count, "characters");
await browser.close();
