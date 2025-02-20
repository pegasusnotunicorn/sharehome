import { SitemapStream, streamToPromise } from "sitemap";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Dynamically import character data
import { getAllCharacters } from "./src/components/Characters/Characters.js";

// Convert __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const hostname = "https://lovecareermagic.com";

// Define static routes
const routes = [
  "/",
  "/ttrpg",
  "/howtoplay",
  "/freeartbook",
  "/digitalartbook",
  "/characters",
  "/contact",
  "/thankyou",
  "/terms",
  "/rulebook",
  "/buy",
];

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

const sitemap = new SitemapStream({ hostname });

// Add each route to the sitemap
routes.forEach((route) => sitemap.write(route));
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
