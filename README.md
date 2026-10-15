## Love, Career & Magic

A party game where fantasy meets reality TV. The site, store and checkout for it live at
[lovecareermagic.com](https://lovecareermagic.com).

React + Vite, with three.js for the 3D cards and box, hosted on Netlify.

### Running it

- `npm start`: the site on localhost:3000. Enough for every page except checkout.
- `netlify dev`: the site with its Netlify functions and edge functions, on localhost:8888 (it runs
  `npm start` and proxies to it). Checkout, sign-ups and the order webhook need this, and a `.env`
  with the Stripe, Shippo and MailerLite keys (the `_DEV` / `_TEST` variants are the ones used
  locally).
- `npm run build`: the production build in `dist/`. It regenerates `public/sitemap.xml` first.

Analytics (GTM, MailerLite) stay off on localhost.

### Where things are

- `src/components`: the pages and their parts. Routes are in `src/Router.tsx`.
- `src/components/utils/*3d.ts`: the three.js scenes. They share one WebGL renderer (`card3d.ts`).
- `src/css`: styles, mostly CSS modules. The shared button tokens (`--btn-*`, `--chip-*`) are in
  `src/css/index.css`.
- `netlify/functions`: checkout sessions, the Stripe webhook (shipping labels through Shippo, emails
  through MailerLite, alerts to Discord), sign-ups. `netlify/edge-functions`: UTM tracking,
  conversion tracking, the `/buy` redirect and per-character share tags.
- `public/images`: images, served as they are. `public/images/pieces`: the game's pieces for
  What's in the box, written by `scripts/import-pieces.py`.

### Scripts

- `npm run check-cards`: checks the home page's 3D cards never pass through each other.
- `node scripts/card-atlas.mjs`: rebuilds the character card sheets the footer's 3D cards use (run
  with `npm start` going).
- `node scripts/test-shippo.mjs`, `node scripts/test-shippo-webhook.mjs`: try label buying with
  Shippo's test key.
- `node scripts/preview-discord.mjs [session_id]`: shows the Discord order alerts without buying a
  label.
