// The table: dealing, the clock, and every move, as the rulebook has them. Every card is face up, so
// the whole game goes to every player; only what's left in the decks stays here.

import {
  DECK_SIZES,
  DIRECTION_DECKS,
  DIRECTION_POINTS,
  EPISODES,
  EPISODE_SECONDS,
  FACE_UP_PER_DECK,
  TRAIT_KINDS,
  type ClientMessage,
  type DirectionDeck,
  type GameView,
  type Hand,
} from "./protocol";

export interface StoredGame extends GameView {
  // what's left in each deck, in draw order (the next card first)
  piles: Record<DirectionDeck | "episodes" | "characters" | "good" | "bad" | "chaotic", number[]>;
  // for undoing a completed card: the card that was drawn into its slot
  drawnFor: Record<string, { deck: DirectionDeck; slot: number; drawn: number | null }>;
}

const LOG_MAX = 12;
// the same R.E.M.O.T.E. button again this soon, while it's still up on everyone's screen, changes nothing
const REMOTE_AGAIN = 3000;

const shuffled = (n: number) => {
  const cards = Array.from({ length: n }, (_, i) => i);
  const rand = new Uint32Array(n);
  crypto.getRandomValues(rand);
  for (let i = n - 1; i > 0; i--) {
    const j = rand[i] % (i + 1);
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
};

const id = () => crypto.randomUUID().slice(0, 8);

const dealHand = (game: StoredGame): Hand | null => {
  const character = game.piles.characters.shift();
  if (character === undefined) return null;
  return {
    character,
    traits: TRAIT_KINDS.map((kind) => ({ kind, i: game.piles[kind].shift() ?? 0, done: null })),
  };
};

// (picks: the characters players chose in the waiting room; everyone else is dealt one)
export function newGame(playerIds: string[], picks: Record<string, number> = {}): StoredGame {
  const game: StoredGame = {
    phase: "ready",
    episode: 1,
    endsAt: null,
    pausedLeft: null,
    faceUp: { director: [], producer: [], showrunner: [] },
    left: { director: 0, producer: 0, showrunner: 0 },
    episodes: [],
    hands: {},
    log: [],
    piles: {
      characters: shuffled(DECK_SIZES.characters),
      episodes: shuffled(DECK_SIZES.episodes),
      director: shuffled(DECK_SIZES.director),
      producer: shuffled(DECK_SIZES.producer),
      showrunner: shuffled(DECK_SIZES.showrunner),
      good: shuffled(DECK_SIZES.good),
      bad: shuffled(DECK_SIZES.bad),
      chaotic: shuffled(DECK_SIZES.chaotic),
    },
    drawnFor: {},
  };
  for (const deck of DIRECTION_DECKS) {
    for (let s = 0; s < FACE_UP_PER_DECK; s++) game.faceUp[deck].push(game.piles[deck].shift() ?? null);
  }
  game.episodes.push({ card: game.piles.episodes.shift()!, tokens: 0, completed: [] });
  for (const p of playerIds) {
    const chosen = picks[p];
    if (chosen !== undefined && game.piles.characters.includes(chosen)) {
      game.piles.characters.splice(game.piles.characters.indexOf(chosen), 1);
      game.piles.characters.unshift(chosen);
    }
    addPlayer(game, p);
  }
  countLeft(game);
  return game;
}

// a player who joins mid-game is dealt in; one who's removed gives their cards back
export function addPlayer(game: StoredGame, playerId: string) {
  if (game.hands[playerId]) return;
  const hand = dealHand(game);
  if (hand) game.hands[playerId] = hand;
}

export function removePlayer(game: StoredGame, playerId: string) {
  const hand = game.hands[playerId];
  if (!hand) return;
  game.piles.characters.push(hand.character);
  for (const t of hand.traits) game.piles[t.kind].push(t.i);
  delete game.hands[playerId];
}

const countLeft = (game: StoredGame) => {
  for (const deck of DIRECTION_DECKS) game.left[deck] = game.piles[deck].length;
};

const log = (game: StoredGame, by: string, text: string) => {
  game.log.unshift({ id: id(), by, text, at: Date.now() });
  game.log.length = Math.min(game.log.length, LOG_MAX);
};

// someone's connection dropped, or they're back (the page puts their name in)
export const logPresence = (game: StoredGame, by: string, online: boolean) => log(game, by, `{${by}} ${online ? "is back" : "disconnected"}`);

const current = (game: StoredGame) => game.episodes[game.episode - 1];

const startClock = (game: StoredGame, now: number) => {
  game.phase = "playing";
  game.endsAt = now + EPISODE_SECONDS * 1000;
  game.pausedLeft = null;
};

// the clock ran out (checked on every move, and by the room's alarm)
export function tick(game: StoredGame, now: number) {
  if (game.phase === "playing" && game.endsAt !== null && now >= game.endsAt) {
    game.phase = "break";
    game.endsAt = null;
    return true;
  }
  return false;
}

// One player's move (checked at the door: see parseClientMessage). It returns false when it changes
// nothing (a move that doesn't fit the moment, or an out-of-date one from a slow connection), so the
// room needn't save or tell anyone.
export function move(game: StoredGame, by: string, msg: ClientMessage, now: number): boolean {
  tick(game, now);
  const ep = current(game);
  const name = `{${by}}`; // (the page puts the player's name in)

  switch (msg.t) {
    case "startClock": {
      if (game.phase !== "ready") return false;
      startClock(game, now);
      log(game, by, `${name} started episode ${game.episode}`);
      return true;
    }

    case "pause": {
      if (game.phase !== "playing" || game.endsAt === null) return false;
      game.pausedLeft = Math.max(0, game.endsAt - now);
      game.endsAt = null;
      log(game, by, `${name} paused the clock`);
      return true;
    }

    case "resume": {
      if (game.phase !== "playing" || game.pausedLeft === null) return false;
      game.endsAt = now + game.pausedLeft;
      game.pausedLeft = null;
      log(game, by, `${name} restarted the clock`);
      return true;
    }

    case "complete": {
      // (only while the clock's running: the episode's started with the phone's Start; a card
      // done while it's paused starts it again)
      if (game.phase === "playing" && game.pausedLeft !== null) {
        game.endsAt = now + game.pausedLeft;
        game.pausedLeft = null;
      }
      if (game.phase !== "playing") return false;
      const cards = game.faceUp[msg.deck];
      const card = cards?.[msg.slot];
      if (card === undefined || card === null) return false;
      const drawn = game.piles[msg.deck].shift() ?? null;
      cards[msg.slot] = drawn;
      const done = { id: id(), deck: msg.deck, slot: msg.slot, i: card, by };
      ep.completed.push(done);
      game.drawnFor[done.id] = { deck: msg.deck, slot: msg.slot, drawn };
      countLeft(game);
      log(game, by, `${name} completed a ${msg.deck} card (+${DIRECTION_POINTS[msg.deck]})`);
      // every direction card played: that's the end of the season
      if (DIRECTION_DECKS.every((d) => game.faceUp[d].every((c) => c === null))) {
        game.phase = "over";
        game.endsAt = null;
        game.pausedLeft = null;
        game.outOfCards = true;
        log(game, by, "That’s a wrap on the season!");
      }
      return true;
    }

    case "undo": {
      const index = ep.completed.findIndex((c) => c.id === msg.id);
      if (index < 0 || game.phase === "over") return false;
      const [card] = ep.completed.splice(index, 1);
      const was = game.drawnFor[card.id];
      delete game.drawnFor[card.id];
      const cards = game.faceUp[card.deck];
      // back where it was, and the card drawn for it back on its deck; or, if that's gone too, into
      // an empty slot, or on top of its deck
      const at = was ? cards.indexOf(was.drawn) : -1;
      if (at >= 0) {
        if (was.drawn !== null) game.piles[card.deck].unshift(was.drawn);
        cards[at] = card.i;
      } else {
        const empty = cards.indexOf(null);
        if (empty >= 0) cards[empty] = card.i;
        else game.piles[card.deck].unshift(card.i);
      }
      countLeft(game);
      log(game, by, `${name} undid a ${card.deck} card (−${DIRECTION_POINTS[card.deck]})`);
      return true;
    }

    case "discard": {
      // (between episodes: before the first, the cards dealt are the ones played)
      if (game.phase !== "ready" || game.episode === 1) return false;
      const cards = game.faceUp[msg.deck];
      const card = cards?.[msg.slot];
      if (card === undefined || card === null) return false;
      const next = game.piles[msg.deck].shift();
      if (next === undefined) return false;
      game.piles[msg.deck].push(card);
      cards[msg.slot] = next;
      return true;
    }

    case "token": {
      // callbacks: from episode two, onto an earlier episode's card
      if (game.phase === "over") return false;
      const target = game.episodes[msg.episode - 1];
      if (!target || msg.episode >= game.episode) return false;
      if (!msg.add && target.tokens === 0) return false;
      target.tokens += msg.add ? 1 : -1;
      log(game, by, `${name} ${msg.add ? "made a callback to" : "took a token off"} episode ${msg.episode} (${msg.add ? "+1" : "−1"})`);
      return true;
    }

    case "trait": {
      const hand = game.hands[msg.player];
      const trait = hand?.traits[msg.slot];
      // (your own, and only once the episode's over: did you play it?)
      if (!trait || game.phase !== "break" || msg.player !== by) return false;
      if (trait.done !== null) {
        // (undone: only in the episode it was played, so an earlier one stays settled)
        if (trait.done !== game.episode) return false;
        trait.done = null;
      } else {
        // one trait per player per episode
        if (hand.traits.some((t) => t.done === game.episode)) return false;
        trait.done = game.episode;
      }
      log(game, by, `${name} ${trait.done !== null ? "played" : "took back"} their ${trait.kind} trait`);
      return true;
    }

    case "remote": {
      if (game.remote?.button === msg.button && now - game.remote.at < REMOTE_AGAIN) return false;
      game.remote = { id: id(), button: msg.button, at: now };
      // (pause stops the clock; play starts it again)
      if (msg.button === "pause" && game.phase === "playing" && game.endsAt !== null) {
        game.pausedLeft = Math.max(0, game.endsAt - now);
        game.endsAt = null;
      } else if (msg.button === "play" && game.phase === "playing" && game.pausedLeft !== null) {
        game.endsAt = now + game.pausedLeft;
        game.pausedLeft = null;
      }
      return true;
    }

    case "nextEpisode": {
      if (game.phase !== "break") return false;
      if (game.episode >= EPISODES) {
        game.phase = "over";
        log(game, by, "That’s a wrap on the season!");
        return true;
      }
      game.episode++;
      game.episodes.push({ card: game.piles.episodes.shift() ?? 0, tokens: 0, completed: [] });
      game.phase = "ready";
      return true;
    }

    default:
      return false;
  }
}

// the game as it goes to the players: everything but what's left in the decks
export function gameView(game: StoredGame): GameView {
  const { piles: _piles, drawnFor: _drawnFor, ...view } = game;
  return view;
}
