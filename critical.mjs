import { generate } from "critical";
import fs from "fs/promises";

(async () => {
  try {
    const { html } = await generate({
      base: "dist/",
      src: "index.html",
      target: {
        html: "index-critical.html", // Temporary file to verify output
      },
      css: ["dist/assets/*.css"],
      width: 1200,
      height: 900,
      inline: true,
      extract: true, // Extract inlined styles from referenced stylesheets
      ignore: {
        atrule: ["@font-face"], // Ignore fonts if needed
      },
    });

    // Write the modified output directly into index.html
    await fs.writeFile("dist/index.html", html);
    console.log("✅ Critical CSS successfully inlined into index.html");
  } catch (error) {
    console.error("❌ Error generating critical CSS:", error);
  }
})();
