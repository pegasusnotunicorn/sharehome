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

## Keeping the bill small

Cloudflare has no spending cap, so the server turns away anything that would wake rooms over and over:

- **The off switch:** set the variable `PAUSED` to `1` (Cloudflare dashboard → Workers → lcm-game →
  Settings → Variables and Secrets) and every request is refused at the door, before any room wakes.
  The site says online play is taking a break. Delete the variable to turn it back on.
- **Per address, a minute:** 5 new rooms and 60 room visits (the join screen, a socket). Set in
  `wrangler.jsonc`.
- **A flooding socket** (over 200 messages in 10 seconds) is closed.
- **Rooms don't linger:** an empty room is deleted after an hour, and every room after 12 hours.
- **The page:** a tab left in the background lets go of its room after 10 minutes (and comes back
  when it's looked at), and doesn't retry a dropped connection while it's hidden.
- **Logs:** 2% of requests.

Set a budget alert too: Cloudflare dashboard → Manage Account → Billing → Billable Usage → Set Budget Alert.

## Working on it locally

```sh
cd game-server && npm install && npm run dev   # the server, at localhost:8787
npm start                                      # the site (in the repo root), which uses it in dev
```
