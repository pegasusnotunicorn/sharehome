// The site's lint rules: the recommended sets for JavaScript, TypeScript, React and its hooks.
// (game-server/ is its own project, with its own TypeScript check; the CSS isn't linted)
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default tseslint.config(
  { ignores: ["dist/", "game-server/", "public/"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // the site (React, in the browser)
  { files: ["src/**/*.{ts,tsx}"], ...react.configs.flat.recommended },
  { files: ["src/**/*.{ts,tsx}"], ...react.configs.flat["jsx-runtime"] },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
    settings: { react: { version: "detect" } },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // Netlify's functions (Node) and edge functions (Deno), the build's scripts and config
  {
    files: ["netlify/**/*.js", "scripts/**/*.mjs", "*.{js,mjs}"],
    languageOptions: { globals: { ...globals.node, Deno: "readonly" } },
  },

  // (a name starting with _ is one that's deliberately not used)
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" }],
    },
  }
);
