# Online game server

The room server behind lovecareermagic.com/play: a Cloudflare Worker with one Durable Object per game
room. A room holds its players (and, next, the table) and every player's socket. The site stays on
Netlify and talks to this server directly.

- `src/protocol.ts`: the messages between the room and the page (the site imports it too)
- `src/index.ts`: the Worker (make a room, look one up, open its socket) and the `Room` object

## Deploying

`.github/workflows/deploy-game-server.yml` deploys it whenever `game-server/` changes on main (or by
hand from the Actions tab). It needs two repo secrets from the **business** Cloudflare account:

- `CLOUDFLARE_API_TOKEN`: Cloudflare → My Profile → API Tokens → Create Token → "Edit Cloudflare Workers"
- `CLOUDFLARE_ACCOUNT_ID`: shown on the account's Workers & Pages page

The first deploy prints the server's address (`https://lcm-game.<subdomain>.workers.dev`). Set it on
Netlify as `VITE_GAME_SERVER_URL` and redeploy the site; until then /play says "Coming soon".

The site addresses allowed to use the server are `ALLOWED_ORIGINS` in `wrangler.jsonc`.

## Working on it locally

```sh
cd game-server && npm install && npm run dev   # the server, at localhost:8787
npm start                                      # the site (in the repo root), which uses it in dev
```
