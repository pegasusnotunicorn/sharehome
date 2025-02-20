const { SitemapStream, streamToPromise } = require("sitemap");
const fs = require("fs");
const path = require("path");

// Import character data dynamically
const {
  getAllCharacters,
} = require("./src/components/Characters/Characters.js");

const hostname = "https://lovecareermagic.com"; // Replace with your actual domain

// List static routes
const routes = [
  "/",
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
const allCharacters = getAllCharacters(); // This should return an array of character objects

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
