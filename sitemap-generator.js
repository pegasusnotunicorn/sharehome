const { SitemapStream, streamToPromise } = require("sitemap");
const fs = require("fs");
const path = require("path");

(async () => {
  // Dynamically import the module
  const { getAllCharacters } = await import(
    "./src/components/Characters/Characters.js"
  );

  const hostname = "https://yourdomain.com";
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
  routes.forEach((route) => sitemap.write(route));
  sitemap.end();

  streamToPromise(sitemap)
    .then((data) => {
      fs.writeFileSync(
        path.join(__dirname, "public", "sitemap.xml"),
        data.toString()
      );
      console.log("✅ Sitemap successfully generated with character URLs!");
    })
    .catch((err) => console.error("❌ Error generating sitemap:", err));
})();
