# Online game server

The room server behind lovecareermagic.com/play: a Cloudflare Worker with one Durable Object per game
room. A room holds its players, the table, the chat and every socket. The site stays on Netlify and
talks to this server directly.

- `src/protocol.ts`: the messages between the room and the page, and the checks and sums both share
  (the site imports it too). Every message is checked at the door (`parseClientMessage`)
- `src/index.ts`: the Worker (make a room, look one up, open its socket) and the `Room` object
- `src/game.ts`: the table: dealing, the clock, and every move

Each browser keeps a secret player id and opens a room's socket with it. The room knows the player by
a public id made from it (the start of its SHA-256), tells the page that id first thing, and sends
everyone else only public ids, so nobody can take over someone else's seat.

`PROTOCOL_VERSION` in `protocol.ts` goes up whenever a message changes shape. The page sends its
version with the socket; a page from before is turned away and shows "A new version is out" with a
reload button.

## Deploying

`.github/workflows/deploy-game-server.yml` deploys it whenever `game-server/` changes on main (or by
hand from the Actions tab). It needs two repo secrets from the **business** Cloudflare account:

- `CLOUDFLARE_API_TOKEN`: Cloudflare → My Profile → API Tokens → Create Token → "Edit Cloudflare Workers"
- `CLOUDFLARE_ACCOUNT_ID`: shown on the account's Workers & Pages page

The first deploy prints the server's address (`https://lcm-game.<subdomain>.workers.dev`). Set it on
Netlify as `VITE_GAME_SERVER_URL` and redeploy the site; until then /play says "Coming soon".

The site addresses allowed to use the server are `ALLOWED_ORIGINS` in `wrangler.jsonc`.

## A word in Discord when a show starts

Add a secret `DISCORD_WEBHOOK_URL` (Cloudflare dashboard → Workers → lcm-game → Settings → Variables
and Secrets → Add → type Secret) holding a channel's webhook URL (Discord: the channel's settings →
Integrations → Webhooks → New Webhook → Copy Webhook URL). Each time a host starts a show, the channel
gets who's playing and the room's link, which opens as a spectator. At most once per room in 10
minutes, and at most one show a minute from all the rooms together (`ANNOUNCE_LIMIT` in
`wrangler.jsonc`), and no one is ever pinged. Delete the secret to stop.

## Keeping the bill small

Cloudflare has no spending cap, so the server turns away anything that would wake rooms over and over:

- **The off switch:** set the variable `PAUSED` to `1` (Cloudflare dashboard → Workers → lcm-game →
  Settings → Variables and Secrets) and every request is refused at the door, before any room wakes.
  The site says online play is taking a break. Delete the variable to turn it back on.
- **Per address, a minute:** 5 new rooms and 60 room visits (the join screen, a socket). An IPv6
  address counts by its /64. Set in `wrangler.jsonc`.
- **Messages that change nothing** (a rename to the same name, a second "ready", a move that doesn't
  fit the moment, anything malformed) save nothing and send nobody anything, and the room's alarm is
  only set again when its time changes.
- **A flooding socket** (over 40 messages in 10 seconds) is closed.
- **A busy room** (saving more than 80 times in 10 seconds, from many sockets each under that limit)
  closes whichever socket is sending the most.
- **Spectators** (anyone on a room's link who isn't playing: they asked to watch, or the room was
  full, or the show had started) are cheap by design: joining or leaving saves nothing and sends the
  players only the new count. They can chat (each line is saved with the chat and sent to everyone,
  at most one a second and 8 in 30 seconds); anything else they send is dropped. A room with only
  spectators left is deleted after an hour like an empty one. Each room takes at most 50 at once; set
  the variable `MAX_SPECTATORS` (same place as `PAUSED`) to change that, or to `0` to turn watching
  off.
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
