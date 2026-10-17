import { SitemapStream, streamToPromise } from "sitemap";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { execSync } from "child_process";

// Dynamically import character data
import { getAllCharacters } from "./src/components/Characters/Characters.ts";

// Convert __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const hostname = "https://lovecareermagic.com";

// Define static routes
const routes = [
  "/",
  "/howtoplay",
  "/digitalartbook",
  "/characters",
  "/play",
  "/signup",
  "/contact",
  "/terms",
  "/privacy",
  "/rulebook",
];
// (not listed: /thankyou, /checkout and the game rooms, which robots.txt keeps out; /buy, a redirect
// that records a checkout event each time it's fetched, crawlers included)

// Get character names dynamically
const allCharacters = getAllCharacters();

if (Array.isArray(allCharacters)) {
  allCharacters.forEach((character) => {
    if (character.urlName) {
      routes.push(`/characters/${character.urlName}`);
    }
  });
} else {
  console.error("❌ Error: getAllCharacters did not return an array");
}

// when the site last changed: the last commit's date (or today, outside a git checkout)
let lastmod = new Date().toISOString().slice(0, 10);
try {
  lastmod = execSync("git log -1 --format=%cs", { encoding: "utf8" }).trim() || lastmod;
} catch {
  // (not a git checkout)
}

const sitemap = new SitemapStream({ hostname });

// Add each route to the sitemap
routes.forEach((url) => sitemap.write({ url, lastmod }));
sitemap.end();

// Convert stream to XML file
streamToPromise(sitemap)
  .then((data) => {
    fs.writeFileSync(
      path.join(__dirname, "public", "sitemap.xml"),
      data.toString()
    );
    console.log("✅ Sitemap successfully generated with character URLs!");
  })
  .catch((err) => console.error("❌ Error generating sitemap:", err));
