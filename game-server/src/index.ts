// The online game's server: a Worker in front, and one Durable Object per game room, which holds the
// room (its players and the table, see game.ts) and every player's socket. Rooms sleep between messages
// (the hibernation API keeps the sockets open meanwhile) and are deleted after IDLE_TTL with nobody in.
//
//   POST /rooms               → { code }           a new room
//   GET  /rooms/:code         → { exists, full }   for the join screen
//   GET  /rooms/:code/socket?player=…&name=…&v=…  the room's socket (see protocol.ts; &watch=1 to watch)
//
// `player` is a secret the browser keeps: it's how the room knows a player again. Everyone else only
// ever sees a public id made from it (see publicId), so nobody can take over another's seat.

import { DurableObject } from "cloudflare:workers";
import {
  CLOSE_KICKED,
  CLOSE_LEFT,
  CLOSE_REFUSED,
  CLOSE_REPLACED,
  CODE_LENGTH,
  CODE_LETTERS,
  CODE_PATTERN,
  MAX_PLAYERS,
  MIN_PLAYERS,
  PROTOCOL_VERSION,
  cleanName,
  parseClientMessage,
  type ByeReason,
  type RoomError,
  type RoomView,
  type ServerMessage,
  CHAT_MAX,
  cleanChat,
  type ChatLine,
} from "./protocol";
import { gameView, logPresence, move, newGame, removePlayer as removeFromGame, tick, type StoredGame } from "./game";

export interface Env {
  ROOMS: DurableObjectNamespace<Room>;
  // the site's addresses, comma separated, that may use the server (localhost always may)
  ALLOWED_ORIGINS: string;
  // the site's Netlify name: its deploy previews (deploy-preview-N--NAME.netlify.app) may use it too
  NETLIFY_SITE: string;
  // the off switch: "1" turns every request away at the door, before any room is woken (set it in
  // the Cloudflare dashboard, Worker → Settings → Variables, if the bill ever looks wrong)
  PAUSED?: string;
  // the most spectators one room takes at once (a cap on what one popular game can cost; "0" turns
  // watching off). Unset: WATCH_MAX
  MAX_SPECTATORS?: string;
  // a Discord webhook (a secret: Worker → Settings → Variables): a word there whenever a show starts,
  // with the link to come and watch. Unset: no word
  DISCORD_WEBHOOK_URL?: string;
  // how often one address may make a room, and open a room; and how often Discord's told of a show,
  // from all the rooms together (see wrangler.jsonc)
  CREATE_LIMIT: RateLimit;
  JOIN_LIMIT: RateLimit;
  ANNOUNCE_LIMIT: RateLimit;
}

// (every limit below is about the bill: a room woken is paid for, so anything that would wake rooms
// over and over, a bot or a stuck page, is turned away as early and cheaply as possible)
const IDLE_TTL = 60 * 60 * 1000; // a room with nobody in it is deleted after this
const MAX_AGE = 12 * 60 * 60 * 1000; // and any room at all, after this
// a socket sending more than this many messages in FLOOD_WINDOW is closed (a held button sends at
// most ten a second, and only for as long as there's something to take off)
const FLOOD_LIMIT = 40;
const FLOOD_WINDOW = 10 * 1000;
// a room saving more than this often in FLOOD_WINDOW (many sockets each just under their limit)
// closes whichever socket's sending the most
const WRITE_BUDGET = 80;
// a show's start is told to Discord at most once per room in this long (a host starting and ending
// over and over can't flood the channel)
const ANNOUNCE_GAP = 10 * 60 * 1000;
// the chat: the lines kept (older ones go), and how fast one socket may send them: one at a time at
// least CHAT_GAP apart, and no more than CHAT_BURST in CHAT_WINDOW (whatever's over is turned back)
const CHAT_KEEP = 40;
const CHAT_GAP = 1000;
const CHAT_BURST = 8;
const CHAT_WINDOW = 30 * 1000;

// spectators: their sockets' tag, and how many one room takes (unless MAX_SPECTATORS says otherwise)
const WATCH = "watch";
const WATCH_MAX = 50;
const maxWatching = (env: Env) => {
  const n = Number(env.MAX_SPECTATORS);
  return env.MAX_SPECTATORS !== undefined && Number.isFinite(n) && n >= 0 ? n : WATCH_MAX;
};
const HOST_GRACE = 60 * 1000; // a host offline this long hands the room to the next player online
const PLAYER_ID = /^[A-Za-z0-9-]{8,64}$/;
const MAX_MESSAGE = 2048;

// a player's public id: the start of a hash of the secret one their browser sends. The room knows
// players by it, and it's all anyone else is ever sent (the secret alone proves who's who)
const publicId = async (secret: string) => {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return Array.from(new Uint8Array(hash).slice(0, 6), (b) => b.toString(16).padStart(2, "0")).join("");
};

// what an address is counted as by the rate limits: an IPv6 one by its /64 (a home or a phone has a
// whole /64 to itself, so counting each address would let one device be a crowd)
const rateKey = (ip: string) => {
  if (!ip.includes(":")) return ip;
  const [head, tail = ""] = ip.split("::");
  const left = head ? head.split(":") : [];
  const right = tail ? tail.split(":") : [];
  const groups = [...left, ...Array(Math.max(0, 8 - left.length - right.length)).fill("0"), ...right];
  return `${groups.slice(0, 4).map((g) => (parseInt(g, 16) || 0).toString(16)).join(":")}::/64`;
};

// #region--------------------------------------THE WORKER

const allowedOrigin = (origin: string | null, env: Env) => {
  if (!origin) return null;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return origin;
  const allowed = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());
  if (allowed.includes(origin)) return origin;
  const site = env.NETLIFY_SITE;
  if (site && new RegExp(`^https://([a-z0-9-]+--)?${site}\\.netlify\\.app$`).test(origin)) return origin;
  return null;
};

const json = (body: unknown, origin: string | null, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...(origin ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" } : {}),
    },
  });

const randomCode = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));
  return Array.from(bytes, (b) => CODE_LETTERS[b % CODE_LETTERS.length]).join("");
};

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    const origin = allowedOrigin(request.headers.get("Origin"), env);
    // (a browser always sends its page's address: anything else is refused)
    if (!origin) return new Response("Forbidden", { status: 403 });

    if (env.PAUSED === "1") return json({ error: "paused" }, origin, 503);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "GET, POST",
          "Access-Control-Max-Age": "86400",
          Vary: "Origin",
        },
      });
    }

    const ip = rateKey(request.headers.get("CF-Connecting-IP") || "local");

    if (url.pathname === "/rooms" && request.method === "POST") {
      if (!(await env.CREATE_LIMIT.limit({ key: ip })).success) return json({ error: "slow-down" }, origin, 429);
      // (a code already in use is drawn again: with 160,000 codes a few tries is plenty)
      for (let i = 0; i < 8; i++) {
        const code = randomCode();
        if (await env.ROOMS.getByName(code).create(code)) return json({ code }, origin);
      }
      return json({ error: "busy" }, origin, 503);
    }

    const match = url.pathname.match(/^\/rooms\/([A-Za-z]+)(\/socket)?$/);
    const code = match?.[1].toUpperCase();
    if (!match || !code || !CODE_PATTERN.test(code)) return json({ error: "not-found" }, origin, 404);
    if (!(await env.JOIN_LIMIT.limit({ key: ip })).success) return json({ error: "slow-down" }, origin, 429);
    const room = env.ROOMS.getByName(code);

    if (!match[2] && request.method === "GET") return json(await room.info(), origin);

    if (match[2] && request.headers.get("Upgrade") === "websocket") return room.fetch(request);

    return json({ error: "bad-request" }, origin, 400);
  },
} satisfies ExportedHandler<Env>;

// #endregion

// #region--------------------------------------A ROOM

interface StoredPlayer {
  id: string;
  name: string;
  color: number;
}

interface StoredRoom {
  code: string;
  createdAt: number;
  hostId: string | null;
  players: StoredPlayer[];
  // when the host's last socket closed (null while they're here)
  hostAwaySince: number | null;
  // when the room's last socket closed (null while anyone's here)
  emptySince: number | null;
  // the game on the table (null: in the lobby)
  game?: StoredGame | null;
  // devices the host has removed: they can't come back (to play or watch)
  removed?: string[];
  // the host's closed the doors to more spectators
  watchClosed?: boolean;
  // in the waiting room: who picked which character, and who's ready
  picks?: Record<string, number>;
  ready?: Record<string, boolean>;
  // when a show's start in this room was last told to Discord
  announcedAt?: number;
}

export class Room extends DurableObject<Env> {
  private room: StoredRoom | null = null;
  // each socket's messages in the current window, and the room's saves in its own (in memory: a room
  // that's slept has had a quiet spell)
  private traffic = new WeakMap<WebSocket, { since: number; count: number }>();
  private writes = { since: 0, count: 0 };
  // when the clock's set for, as last set (undefined: not known yet, since the room woke)
  private alarmDue: number | null | undefined;
  // the chat so far (saved with each line, so it's there when the room wakes)
  private chat: ChatLine[] = [];
  // each socket's chat lines lately, to hold back a flood
  private chatting = new WeakMap<WebSocket, number[]>();

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    // (the browser's keep-alive is answered without waking the room)
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong"));
    ctx.blockConcurrencyWhile(async () => {
      this.room = (await ctx.storage.get<StoredRoom>("room")) ?? null;
      this.chat = (await ctx.storage.get<ChatLine[]>("chat")) ?? [];
    });
  }

  // #region the worker's calls

  async create(code: string): Promise<boolean> {
    if (this.room) return false;
    this.room = {
      code,
      createdAt: Date.now(),
      hostId: null,
      players: [],
      hostAwaySince: null,
      emptySince: Date.now(),
    };
    await this.save();
    return true;
  }

  async info() {
    const room = this.room;
    // (full, or the show's started: a newcomer watches)
    return { exists: !!room, full: !!room && room.players.length >= MAX_PLAYERS, started: !!room?.game };
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const [client, server] = Object.values(new WebSocketPair());
    const secret = url.searchParams.get("player") || "";
    const name = cleanName(url.searchParams.get("name")) || "Player";

    const refuse = (error: RoomError) => {
      // (the socket is opened just to say why, so the page can show it)
      server.accept();
      this.send(server, { t: "error", error });
      server.close(CLOSE_REFUSED, error);
      return new Response(null, { status: 101, webSocket: client });
    };

    if (url.searchParams.get("v") !== String(PROTOCOL_VERSION)) return refuse("outdated");
    if (!PLAYER_ID.test(secret)) return refuse("bad-request");
    const playerId = await publicId(secret);
    const room = this.room;
    if (!room) return refuse("not-found");

    let player = room.players.find((p) => p.id === playerId);
    if (!player && room.removed?.includes(playerId)) return refuse("removed");

    // a spectator: anyone not already playing who asks to watch, or arrives once the room's full or
    // the show's started. Cheap by design: nothing's saved, and the players are sent just the new
    // count of watchers; the room sends the spectator the table as it is, and the chat
    if (!player && (url.searchParams.get("watch") === "1" || room.players.length >= MAX_PLAYERS || room.game)) {
      if (room.watchClosed) return refuse("watch-closed");
      if (this.openSockets(undefined, WATCH).length >= maxWatching(this.env)) return refuse("watch-full");
      this.ctx.acceptWebSocket(server, [WATCH]);
      server.serializeAttachment({ playerId, watch: true, name: cleanName(url.searchParams.get("name")) });
      this.send(server, { t: "you", id: playerId });
      this.send(server, { t: "state", room: this.view() });
      if (this.chat.length) this.send(server, { t: "chatLog", lines: this.chat });
      this.tellPlayersWatching();
      return new Response(null, { status: 101, webSocket: client });
    }

    // (back after their connection dropped, in a game: everyone's told)
    if (player && room.game && !this.isOnline(playerId)) logPresence(room.game, playerId, true);
    if (!player) {
      const taken = new Set(room.players.map((p) => p.color));
      let color = 0;
      while (taken.has(color)) color++;
      player = { id: playerId, name, color };
      room.players.push(player);
      if (!room.hostId) room.hostId = playerId;
    }

    // the same player in another tab: that one's closed, this one takes over
    for (const old of this.ctx.getWebSockets(playerId)) this.bye(old, "replaced", CLOSE_REPLACED);

    this.ctx.acceptWebSocket(server, [playerId]);
    server.serializeAttachment({ playerId });
    this.send(server, { t: "you", id: playerId });
    room.emptySince = null;
    if (room.hostId === playerId) room.hostAwaySince = null;
    await this.save();
    this.broadcast();
    if (this.chat.length) this.send(server, { t: "chatLog", lines: this.chat });
    return new Response(null, { status: 101, webSocket: client });
  }

  // #endregion

  // #region the sockets

  async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer) {
    const room = this.room;
    // (a socket on its way out, closed for flooding, say: whatever it had sent after is dropped)
    if (!room || typeof raw !== "string" || raw.length > MAX_MESSAGE || ws.readyState !== WebSocket.OPEN) return;
    const now = Date.now();
    const seen = this.traffic.get(ws);
    if (!seen || now - seen.since > FLOOD_WINDOW) this.traffic.set(ws, { since: now, count: 1 });
    else if (++seen.count > FLOOD_LIMIT) {
      ws.close(1008, "too many messages");
      return;
    }
    const { playerId, watch, name: watcherName } = ws.deserializeAttachment() as { playerId: string; watch?: boolean; name?: string };
    const msg = parseClientMessage(raw);
    if (!msg) return;
    // the chat: players and spectators alike
    if (msg.t === "chat") {
      const player = room.players.find((p) => p.id === playerId);
      if (!watch && !player) return;
      return this.say(ws, {
        by: playerId,
        name: player?.name ?? (watcherName || "Audience"),
        color: player ? player.color : null,
        watching: !player,
      }, msg.text);
    }
    // (a spectator can't touch the table: anything else they send is dropped)
    if (watch) return;
    const isHost = room.hostId === playerId;

    // (each case returns when it changes nothing: nothing's saved, and nobody's sent anything)
    switch (msg.t) {
      case "rename": {
        const name = cleanName(msg.name);
        const me = room.players.find((p) => p.id === playerId);
        if (!name || !me || me.name === name) return;
        me.name = name;
        break;
      }
      case "kick": {
        if (!isHost || msg.id === playerId) return;
        if (!this.removePlayer(msg.id, "kicked")) return;
        this.bar(msg.id);
        break;
      }
      case "removeWatcher": {
        if (!isHost || msg.id === playerId || room.players.some((p) => p.id === msg.id)) return;
        const theirs = this.ctx.getWebSockets(WATCH).filter((ws) => (ws.deserializeAttachment() as { playerId?: string } | null)?.playerId === msg.id);
        const said = this.chat.some((l) => l.by === msg.id);
        if (!theirs.length && !said) return;
        for (const ws of theirs) this.bye(ws, "kicked", CLOSE_KICKED);
        this.bar(msg.id);
        // (and what they said goes too)
        if (said) {
          this.chat = this.chat.filter((l) => l.by !== msg.id);
          await this.ctx.storage.put("chat", this.chat);
          this.spend();
          const log = JSON.stringify({ t: "chatLog", lines: this.chat } satisfies ServerMessage);
          for (const ws of this.openSockets()) {
            try {
              ws.send(log);
            } catch {
              // (gone)
            }
          }
        }
        break;
      }
      case "watchOpen": {
        if (!isHost || !room.watchClosed === msg.open) return;
        room.watchClosed = !msg.open;
        break;
      }
      case "makeHost": {
        // (only to someone who's here: a host who's gone can't run the room)
        if (!isHost || msg.id === playerId || !room.players.some((p) => p.id === msg.id) || !this.isOnline(msg.id)) return;
        room.hostId = msg.id;
        room.hostAwaySince = null;
        break;
      }
      case "toAudience": {
        // (their seat's free again; they come back in as a spectator. Before the show only: once it's
        // started, a seat holds a hand of cards)
        if (room.game || !this.removePlayer(playerId, "toAudience")) return;
        break;
      }
      case "leave": {
        if (!this.removePlayer(playerId, "left")) return;
        break;
      }
      case "start": {
        if (!isHost || room.game || room.players.length < MIN_PLAYERS) return;
        room.game = newGame(
          room.players.map((p) => p.id),
          room.picks ?? {}
        );
        room.ready = {};
        this.announceShow(room);
        break;
      }
      case "pick": {
        if (room.game) return;
        const picks = (room.picks ??= {});
        const ready = (room.ready ??= {});
        if (msg.character === null) {
          if (picks[playerId] === undefined && !ready[playerId]) return;
          delete picks[playerId];
          delete ready[playerId];
          break;
        }
        const c = msg.character;
        if (picks[playerId] === c) return;
        // (one player per character)
        if (Object.entries(picks).some(([id, pick]) => pick === c && id !== playerId)) return;
        picks[playerId] = c;
        break;
      }
      case "ready": {
        if (room.game) return;
        const ready = (room.ready ??= {});
        if (msg.ready && room.picks?.[playerId] === undefined) return;
        if (!!ready[playerId] === msg.ready) return;
        if (msg.ready) ready[playerId] = true;
        else delete ready[playerId];
        break;
      }
      case "toLobby": {
        if (!isHost || !room.game) return;
        room.game = null;
        break;
      }
      default: {
        // a move at the table
        if (!room.game || !room.players.some((p) => p.id === playerId)) return;
        if (!move(room.game, playerId, msg, Date.now())) return;
      }
    }
    await this.save();
    this.broadcast();
  }

  async webSocketClose(ws: WebSocket) {
    const room = this.room;
    if (!room) return;
    const { playerId, watch } = (ws.deserializeAttachment() as { playerId?: string; watch?: boolean }) || {};
    // (a spectator going: nothing to save; the players see the count go down)
    if (watch) return this.tellPlayersWatching(ws);
    const now = Date.now();
    // (a tab closed while another's still open, like one that's been replaced, changes nothing)
    const gone = !!playerId && !this.isOnline(playerId, ws);
    let changed = false;
    if (gone && room.hostId === playerId) {
      room.hostAwaySince = now;
      changed = true;
    }
    // (gone from a game: everyone's told)
    if (gone && room.game && room.players.some((p) => p.id === playerId)) {
      logPresence(room.game, playerId, false);
      changed = true;
    }
    // (empty: no player here. Spectators alone don't keep a room going: it's deleted an hour on, as ever)
    if (room.emptySince === null && this.playerSockets(ws).length === 0) {
      room.emptySince = now;
      changed = true;
    }
    if (changed) await this.save();
    if (gone) this.broadcast(ws);
  }

  async webSocketError(ws: WebSocket) {
    await this.webSocketClose(ws);
  }

  // #endregion

  // #region the clock: handing over the room from an absent host, and deleting an empty room

  async alarm() {
    // (it's gone off, so it's set for nothing now)
    this.alarmDue = null;
    const room = this.room;
    if (!room) return;
    const now = Date.now();
    if ((room.emptySince !== null && now - room.emptySince >= IDLE_TTL) || now - room.createdAt >= MAX_AGE) {
      for (const ws of this.ctx.getWebSockets()) this.bye(ws, "expired", CLOSE_LEFT);
      this.room = null;
      await this.ctx.storage.deleteAll();
      return;
    }
    let changed = false;
    // the episode's clock ran out
    if (room.game && tick(room.game, now)) changed = true;
    if (room.hostAwaySince !== null && now - room.hostAwaySince >= HOST_GRACE) {
      const next = room.players.find((p) => p.id !== room.hostId && this.isOnline(p.id));
      if (next) {
        room.hostId = next.id;
        room.hostAwaySince = null;
        changed = true;
      }
    }
    if (!changed) return this.setClock();
    await this.save();
    this.broadcast();
  }

  // #endregion

  // #region helpers

  // the room is saved after every change, and the clock set for whatever's next due
  private async save() {
    const room = this.room;
    if (!room) return;
    await this.ctx.storage.put("room", room);
    this.spend();
    await this.setClock();
  }

  // the clock, set for whatever's next due (and left alone when that hasn't changed)
  private async setClock() {
    const room = this.room;
    if (!room) return;
    const due = [
      room.emptySince !== null ? room.emptySince + IDLE_TTL : Infinity,
      room.createdAt + MAX_AGE,
      // (only while there's someone online to hand it to: otherwise, once the grace was up, the clock
      // would come due again and again, a few times a second, until someone came back)
      room.hostAwaySince !== null && room.players.some((p) => p.id !== room.hostId && this.isOnline(p.id))
        ? room.hostAwaySince + HOST_GRACE
        : Infinity,
      room.game?.phase === "playing" && room.game.endsAt !== null ? room.game.endsAt : Infinity,
    ];
    const next = Math.min(...due);
    if (this.alarmDue === undefined) this.alarmDue = await this.ctx.storage.getAlarm();
    if (next === (this.alarmDue ?? Infinity)) return;
    if (next === Infinity) await this.ctx.storage.deleteAlarm();
    else await this.ctx.storage.setAlarm(Math.max(next, Date.now() + 250));
    this.alarmDue = next === Infinity ? null : next;
  }

  // one save more in the room's window: past WRITE_BUDGET, the socket sending the most is closed
  private spend() {
    const now = Date.now();
    if (now - this.writes.since > FLOOD_WINDOW) this.writes = { since: now, count: 0 };
    if (++this.writes.count <= WRITE_BUDGET) return;
    let noisiest: WebSocket | null = null;
    let most = 10; // (a socket that's sent less than this isn't the trouble)
    for (const ws of this.openSockets()) {
      const seen = this.traffic.get(ws);
      if (seen && now - seen.since <= FLOOD_WINDOW && seen.count > most) [noisiest, most] = [ws, seen.count];
    }
    if (!noisiest) return;
    noisiest.close(1008, "too many messages");
    // (and the room starts counting again: one socket at a time goes, not everyone who's busy)
    this.writes = { since: now, count: 0 };
  }

  private removePlayer(id: string, reason: ByeReason) {
    const room = this.room!;
    const index = room.players.findIndex((p) => p.id === id);
    if (index < 0) return false;
    room.players.splice(index, 1);
    if (room.game) removeFromGame(room.game, id);
    if (room.picks) delete room.picks[id];
    if (room.ready) delete room.ready[id];
    for (const ws of this.ctx.getWebSockets(id)) this.bye(ws, reason, reason === "kicked" ? CLOSE_KICKED : CLOSE_LEFT);
    if (room.hostId === id) {
      const next = room.players.find((p) => this.isOnline(p.id)) ?? room.players[0];
      room.hostId = next?.id ?? null;
      room.hostAwaySince = next && !this.isOnline(next.id) ? Date.now() : null;
    }
    return true;
  }

  // (`closing`: a socket that's on its way out, and so doesn't count)
  // the players' sockets (not the spectators')
  private playerSockets(closing?: WebSocket) {
    return this.openSockets(closing).filter((ws) => !(ws.deserializeAttachment() as { watch?: boolean } | null)?.watch);
  }

  private openSockets(closing?: WebSocket, tag?: string) {
    return this.ctx
      .getWebSockets(tag)
      .filter((ws) => ws !== closing && ws.readyState === WebSocket.OPEN);
  }

  private isOnline(id: string, closing?: WebSocket) {
    return this.openSockets(closing, id).length > 0;
  }

  private view(closing?: WebSocket): RoomView {
    const room = this.room!;
    return {
      code: room.code,
      hostId: room.hostId,
      phase: room.game ? "game" : "lobby",
      players: room.players.map((p) => ({ ...p, online: this.isOnline(p.id, closing) })),
      picks: room.picks ?? {},
      ready: room.ready ?? {},
      game: room.game ? gameView(room.game) : null,
      watching: this.openSockets(closing, WATCH).length,
      watchOpen: !room.watchClosed,
      now: Date.now(),
    };
  }

  private send(ws: WebSocket, msg: ServerMessage) {
    try {
      ws.send(JSON.stringify(msg));
    } catch {
      // (a socket that's just gone: the close handler tidies up)
    }
  }

  // a show's started: a word in Discord, who's in it and the link to watch (a plain room link: once
  // the show's on, it opens as a spectator). Sent alongside, never held up for, and nothing if it fails
  // or if the rooms together have told Discord enough lately (ANNOUNCE_LIMIT)
  private announceShow(room: StoredRoom) {
    const hook = this.env.DISCORD_WEBHOOK_URL;
    if (!hook || !/^https:\/\/(?:canary\.|ptb\.)?discord(?:app)?\.com\/api\/webhooks\//.test(hook)) return;
    if (room.announcedAt && Date.now() - room.announcedAt < ANNOUNCE_GAP) return;
    room.announcedAt = Date.now();
    // (names as typed, with Discord's markdown taken as plain text and no links)
    const plain = (t: string) => t.replace(/[\\*_~`|>#\[\]()-]/g, "\\$&").replace(/:\/\//g, ":\u200b//");
    const site = this.env.ALLOWED_ORIGINS.split(",")[0].trim();
    const names = room.players.map((p) => `**${plain(p.name)}**`).join(", ");
    const content = `🎬 A show just started: ${room.players.length} players (${names}).\nCome watch: ${site}/play/${room.code}`;
    const tell = async () => {
      if (!(await this.env.ANNOUNCE_LIMIT.limit({ key: "discord" })).success) return;
      await fetch(hook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        // (no one's pinged, whatever a name says)
        body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
      });
    };
    this.ctx.waitUntil(tell().catch(() => {}));
  }

  // how many are watching, to the players alone (a handful of tiny messages, however big the audience)
  private tellPlayersWatching(closing?: WebSocket) {
    if (!this.room) return;
    const n = this.openSockets(closing, WATCH).length;
    const msg = JSON.stringify({ t: "watching", n, open: !this.room.watchClosed } satisfies ServerMessage);
    for (const ws of this.playerSockets()) {
      try {
        ws.send(msg);
      } catch {
        // (gone)
      }
    }
  }

  // someone the host's removed: not to come back (the last 100 kept)
  private bar(id: string) {
    const room = this.room!;
    room.removed = [...(room.removed ?? []).filter((x) => x !== id), id].slice(-100);
  }

  private bye(ws: WebSocket, reason: ByeReason, code: number) {
    this.send(ws, { t: "bye", reason });
    ws.close(code, reason);
  }

  // a line in the chat: cleaned, held back if this socket's sending too fast, kept (the last CHAT_KEEP)
  // and sent to everyone. Nothing else about the room changes, so nothing else is sent
  private async say(ws: WebSocket, from: Omit<ChatLine, "id" | "text" | "at">, raw: unknown) {
    const text = cleanChat(raw);
    if (!text || text.length > CHAT_MAX * 2) return;
    const now = Date.now();
    const recent = (this.chatting.get(ws) ?? []).filter((t) => now - t < CHAT_WINDOW);
    if (recent.length >= CHAT_BURST || (recent.length && now - recent[recent.length - 1] < CHAT_GAP)) {
      this.chatting.set(ws, recent);
      return this.send(ws, { t: "chatSlow" });
    }
    recent.push(now);
    this.chatting.set(ws, recent);
    const line: ChatLine = { ...from, id: crypto.randomUUID().slice(0, 8), text, at: now };
    this.chat = [...this.chat, line].slice(-CHAT_KEEP);
    await this.ctx.storage.put("chat", this.chat);
    this.spend();
    const out = JSON.stringify({ t: "chat", line } satisfies ServerMessage);
    for (const s of this.openSockets()) {
      try {
        s.send(out);
      } catch {
        // (gone: the close handler tidies up)
      }
    }
  }

  // (the message is made once, however many are here)
  private broadcast(closing?: WebSocket) {
    if (!this.room) return;
    const msg = JSON.stringify({ t: "state", room: this.view(closing) } satisfies ServerMessage);
    for (const ws of this.openSockets(closing)) {
      try {
        ws.send(msg);
      } catch {
        // (a socket that's just gone: the close handler tidies up)
      }
    }
  }

  // #endregion
}

// #endregion
