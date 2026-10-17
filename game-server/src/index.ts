// The online game's server: a Worker in front, and one Durable Object per game room, which holds the
// room (its players and the table, see game.ts) and every player's socket. Rooms sleep between messages
// (the hibernation API keeps the sockets open meanwhile) and are deleted after IDLE_TTL with nobody in.
//
//   POST /rooms               → { code }           a new room
//   GET  /rooms/:code         → { exists, full }   for the join screen
//   GET  /rooms/:code/socket?player=…&name=…      the room's socket (see protocol.ts)

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
  DECK_SIZES,
  cleanName,
  type ByeReason,
  type ClientMessage,
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
  // how often one address may make a room, and open a room (see wrangler.jsonc)
  CREATE_LIMIT: RateLimit;
  JOIN_LIMIT: RateLimit;
}

// (every limit below is about the bill: a room woken is paid for, so anything that would wake rooms
// over and over, a bot or a stuck page, is turned away as early and cheaply as possible)
const IDLE_TTL = 60 * 60 * 1000; // a room with nobody in it is deleted after this
const MAX_AGE = 12 * 60 * 60 * 1000; // and any room at all, after this
// a socket sending more than this many messages in FLOOD_WINDOW is closed (a held button sends ten a second)
const FLOOD_LIMIT = 200;
const FLOOD_WINDOW = 10 * 1000;
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

    const ip = request.headers.get("CF-Connecting-IP") || "local";

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
}

export class Room extends DurableObject<Env> {
  private room: StoredRoom | null = null;
  // each socket's messages in the current window (in memory: a room that's slept has had a quiet spell)
  private traffic = new WeakMap<WebSocket, { since: number; count: number }>();
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
    const playerId = url.searchParams.get("player") || "";
    const name = cleanName(url.searchParams.get("name")) || "Player";

    const refuse = (error: RoomError) => {
      // (the socket is opened just to say why, so the page can show it)
      server.accept();
      this.send(server, { t: "error", error });
      server.close(CLOSE_REFUSED, error);
      return new Response(null, { status: 101, webSocket: client });
    };

    const room = this.room;
    if (!room) return refuse("not-found");
    if (!PLAYER_ID.test(playerId)) return refuse("bad-request");

    let player = room.players.find((p) => p.id === playerId);
    if (!player && room.removed?.includes(playerId)) return refuse("removed");

    // a spectator: anyone not already playing who asks to watch, or arrives once the room's full or
    // the show's started. Cheap by design: nothing's saved and nobody else is sent anything (they see
    // the count of watchers with the room's next change); the room sends them the table as it is
    if (!player && (url.searchParams.get("watch") === "1" || room.players.length >= MAX_PLAYERS || room.game)) {
      if (room.watchClosed) return refuse("watch-closed");
      if (this.ctx.getWebSockets(WATCH).length >= maxWatching(this.env)) return refuse("watch-full");
      this.ctx.acceptWebSocket(server, [WATCH]);
      server.serializeAttachment({ playerId, watch: true, name: cleanName(url.searchParams.get("name")) });
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
    if (!room || typeof raw !== "string" || raw.length > MAX_MESSAGE) return;
    const now = Date.now();
    const seen = this.traffic.get(ws);
    if (!seen || now - seen.since > FLOOD_WINDOW) this.traffic.set(ws, { since: now, count: 1 });
    else if (++seen.count > FLOOD_LIMIT) {
      ws.close(1008, "too many messages");
      return;
    }
    const { playerId, watch, name: watcherName } = ws.deserializeAttachment() as { playerId: string; watch?: boolean; name?: string };
    let msg: ClientMessage;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }
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

    switch (msg.t) {
      case "rename": {
        const name = cleanName(msg.name);
        const me = room.players.find((p) => p.id === playerId);
        if (!name || !me) return;
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
        if (!isHost || typeof msg.id !== "string" || msg.id === playerId || room.players.some((p) => p.id === msg.id)) return;
        const theirs = this.ctx.getWebSockets(WATCH).filter((ws) => (ws.deserializeAttachment() as { playerId?: string } | null)?.playerId === msg.id);
        const said = this.chat.some((l) => l.by === msg.id);
        if (!theirs.length && !said) return;
        for (const ws of theirs) this.bye(ws, "kicked", CLOSE_KICKED);
        this.bar(msg.id);
        // (and what they said goes too)
        if (said) {
          this.chat = this.chat.filter((l) => l.by !== msg.id);
          await this.ctx.storage.put("chat", this.chat);
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
        if (!isHost) return;
        room.watchClosed = !msg.open;
        break;
      }
      case "makeHost": {
        // (only to someone who's here: a host who's gone can't run the room)
        if (!isHost || !room.players.some((p) => p.id === msg.id) || !this.isOnline(msg.id)) return;
        room.hostId = msg.id;
        room.hostAwaySince = this.isOnline(msg.id) ? null : Date.now();
        break;
      }
      case "toAudience": {
        // (their seat's free again; they come back in as a spectator. Before the show only: once it's
        // started, a seat holds a hand of cards)
        if (room.game || !this.removePlayer(playerId, "toAudience")) return;
        break;
      }
      case "leave": {
        this.removePlayer(playerId, "left");
        break;
      }
      case "start": {
        if (!isHost || room.game || room.players.length < MIN_PLAYERS) return;
        room.game = newGame(
          room.players.map((p) => p.id),
          room.picks ?? {}
        );
        room.ready = {};
        break;
      }
      case "pick": {
        if (room.game) return;
        const picks = (room.picks ??= {});
        const ready = (room.ready ??= {});
        if (msg.character === null) {
          delete picks[playerId];
          delete ready[playerId];
          break;
        }
        const c = msg.character;
        if (!Number.isInteger(c) || c < 0 || c >= DECK_SIZES.characters) return;
        // (one player per character)
        if (Object.entries(picks).some(([id, pick]) => pick === c && id !== playerId)) return;
        picks[playerId] = c;
        break;
      }
      case "ready": {
        if (room.game) return;
        const ready = (room.ready ??= {});
        if (msg.ready && room.picks?.[playerId] === undefined) return;
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
    if (playerId && room.hostId === playerId && !this.isOnline(playerId, ws)) room.hostAwaySince = now;
    // (gone from a game, with no other tab still open: everyone's told)
    if (playerId && room.game && room.players.some((p) => p.id === playerId) && !this.isOnline(playerId, ws)) logPresence(room.game, playerId, false);
    // (empty: no player here. Spectators alone don't keep a room going: it's deleted an hour on, as ever)
    if (this.playerSockets(ws).length === 0) room.emptySince = now;
    await this.save();
    this.broadcast(ws);
  }

  async webSocketError(ws: WebSocket) {
    await this.webSocketClose(ws);
  }

  // #endregion

  // #region the clock: handing over the room from an absent host, and deleting an empty room

  async alarm() {
    const room = this.room;
    if (!room) return;
    const now = Date.now();
    if ((room.emptySince !== null && now - room.emptySince >= IDLE_TTL) || now - room.createdAt >= MAX_AGE) {
      for (const ws of this.ctx.getWebSockets()) this.bye(ws, "expired", CLOSE_LEFT);
      this.room = null;
      await this.ctx.storage.deleteAll();
      return;
    }
    // the episode's clock ran out
    if (room.game && tick(room.game, now)) this.broadcast();
    if (room.hostAwaySince !== null && now - room.hostAwaySince >= HOST_GRACE) {
      const next = room.players.find((p) => p.id !== room.hostId && this.isOnline(p.id));
      if (next) {
        room.hostId = next.id;
        room.hostAwaySince = null;
        this.broadcast();
      }
    }
    await this.save();
  }

  // #endregion

  // #region helpers

  // the room is saved after every change, and the clock set for whatever's next due
  private async save() {
    const room = this.room;
    if (!room) return;
    await this.ctx.storage.put("room", room);
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
    if (next === Infinity) await this.ctx.storage.deleteAlarm();
    else await this.ctx.storage.setAlarm(Math.max(next, Date.now() + 250));
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
      watching: this.ctx.getWebSockets(WATCH).filter((ws) => ws !== closing && ws.readyState === WebSocket.OPEN).length,
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

  // how many are watching, to the players alone (a handful of tiny messages, however big the audience)
  private tellPlayersWatching(closing?: WebSocket) {
    if (!this.room) return;
    const n = this.ctx.getWebSockets(WATCH).filter((ws) => ws !== closing && ws.readyState === WebSocket.OPEN).length;
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
