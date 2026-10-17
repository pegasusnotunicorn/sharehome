## Love, Career & Magic

A party game where fantasy meets reality TV. The site, store, checkout and online play for it live at
[lovecareermagic.com](https://lovecareermagic.com).

React + Vite, with three.js for the 3D cards and box, hosted on Netlify. Online play's room server
(`game-server/`) is a Cloudflare Worker. Node 22.

### Running it

- `npm start`: the site on localhost:3000. Enough for every page except checkout.
- `netlify dev`: the site with its Netlify functions and edge functions, on localhost:8888 (it runs
  `npm start` and proxies to it). Checkout, sign-ups and the order webhook need this, and a `.env`
  with the Stripe, Shippo and MailerLite keys (the `_DEV` / `_TEST` variants are the ones used
  locally).
- Online play (/play): run the room server too, with `npm install` then `npx wrangler dev` in
  `game-server/` (localhost:8787, which the site uses by default when it's run locally). Anywhere
  else the site finds the server from `VITE_GAME_SERVER_URL`, set on Netlify; without it /play says
  "Coming soon". `game-server/README.md` has the rest: deploying it, and keeping its bill small.
- `npm run build`: the production build in `dist/`. It regenerates `public/sitemap.xml` first.

Analytics (GTM, MailerLite) stay off everywhere but the live site.

### Checks

- `npm run lint`: ESLint (its rules are in `eslint.config.js`).
- `npx tsc --noEmit -p .`: the site's types; the same in `game-server/` for the room server's.
- `npm run check-cards`: checks the home page's 3D cards never pass through each other.

### Where things are

- `src/components`: the pages and their parts. Routes are in `src/Router.tsx`; online play is
  `src/components/Play`.
- `src/pageMeta.ts`: every page's tab title, description and share image, and which addresses are
  pages. The `track-utm` edge function writes them into the page as it's sent (link previews and
  search engines don't run JavaScript), and sends an address with no page as a 404.
- `src/utils/links.ts`: the addresses elsewhere that several pages link to (Kickstarter, Discord…).
  `src/utils/tracking.ts`: the UTM tags a visit keeps for the checkout.
- `src/components/utils/*3d.ts`: the three.js scenes. They share one WebGL renderer (`card3d.ts`).
- `src/css`: styles, mostly CSS modules. The shared button tokens (`--btn-*`, `--chip-*`) are in
  `src/css/index.css`.
- `netlify/functions`: checkout sessions, the Stripe webhook (shipping labels through Shippo, emails
  through MailerLite, alerts to Discord), sign-ups. `netlify/edge-functions`: each page's meta and
  UTM tracking (`track-utm`), conversion tracking, the `/buy` redirect.
- `game-server/`: the online game's room server, with its own README.
- `public/images`: images, served as they are. `public/images/pieces`: the game's pieces for
  What's in the box, written by `scripts/import-pieces.py`.

### Scripts

- `node scripts/card-atlas.mjs`: rebuilds the character card sheets the footer's 3D cards use (run
  with `npm start` going).
- `node scripts/test-shippo.mjs`, `node scripts/test-shippo-webhook.mjs`: try label buying with
  Shippo's test key (read from `.env`).
- `node scripts/preview-discord.mjs [session_id]`: shows the Discord order alerts without buying a
  label.
