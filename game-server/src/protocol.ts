// What the room server and the site's /play page say to each other over the room's socket. Types,
// limits and the game's numbers only, so the site can import this file as is.

export const MAX_PLAYERS = 6;
export const MIN_PLAYERS = 2;
export const NAME_MAX = 20;
// Room codes: four letters, consonants only (no words), and no letters that read alike
export const CODE_LETTERS = "BCDFGHJKLMNPQRSTVWXZ";
export const CODE_LENGTH = 4;
export const CODE_PATTERN = new RegExp(`^[${CODE_LETTERS}]{${CODE_LENGTH}}$`);

// #region--------------------------------------THE GAME (from the rulebook)

// how many cards each deck has (a card is its deck and its place in it, as in pieces.json)
export const DECK_SIZES = {
  characters: 25,
  episodes: 50,
  director: 50,
  producer: 50,
  showrunner: 50,
  good: 30,
  bad: 30,
  chaotic: 30,
} as const;

export const DIRECTION_DECKS = ["director", "producer", "showrunner"] as const;
export type DirectionDeck = (typeof DIRECTION_DECKS)[number];
export const TRAIT_KINDS = ["good", "bad", "chaotic"] as const;
export type TraitKind = (typeof TRAIT_KINDS)[number];

// Director's cards are worth one point, the Producer's two (and need a second player to answer
// "What happens?"), the Showrunner's three
export const DIRECTION_POINTS: Record<DirectionDeck, number> = { director: 1, producer: 2, showrunner: 3 };
export const FACE_UP_PER_DECK = 2;
export const EPISODES = 4;
export const EPISODE_SECONDS = 180;
// a Character Arc (all three traits) is worth ten; one trait at most per episode
export const ARC_POINTS = 10;

// Final scoring: all the points, divided by the number of players
export const RATINGS: [min: number, name: string][] = [
  [36, "Six seasons and a movie!"],
  [31, "Binge-worthy."],
  [26, "Decent mealtime show."],
  [21, "If nothing else is on."],
  [16, "Shows to fall asleep to."],
  [11, "STR8-2-DVD clearance bin."],
  [6, "Guilty pleasure trash TV."],
  [0, "So bad, it’s good. Cult classic."],
];

export interface Trait {
  kind: TraitKind;
  i: number;
  // the episode it was played in (null: not yet)
  done: number | null;
}

export interface Hand {
  character: number;
  traits: Trait[];
}

export interface CompletedCard {
  id: string;
  deck: DirectionDeck;
  // where it lay face up
  slot: number;
  i: number;
  // tokens from players who'd had something to say for it too
  tokens: number;
  by: string;
}

export interface Episode {
  card: number;
  // callbacks to it, from later episodes
  tokens: number;
  completed: CompletedCard[];
}

// "ready": the episode's card is out, the clock not started; "playing": the clock's running (or
// paused); "break": time's up; "over": the four episodes are done
export type GamePhase = "ready" | "playing" | "break" | "over";

export interface LogEntry {
  id: string;
  by: string;
  text: string;
  at: number;
}

export interface GameView {
  phase: GamePhase;
  // the game ended early: every direction card has been played
  outOfCards?: boolean;
  // the current episode, from 1
  episode: number;
  // when the clock runs out (server time), or how long's left while it's paused
  endsAt: number | null;
  pausedLeft: number | null;
  faceUp: Record<DirectionDeck, (number | null)[]>;
  left: Record<DirectionDeck, number>;
  episodes: Episode[];
  hands: Record<string, Hand>;
  log: LogEntry[];
}

// #endregion

export interface Player {
  id: string;
  name: string;
  // which of the player colors they wear (0 to MAX_PLAYERS - 1), kept for the whole game
  color: number;
  online: boolean;
}

export interface RoomView {
  code: string;
  hostId: string | null;
  phase: "lobby" | "game";
  players: Player[];
  game: GameView | null;
  // the server's clock as it sent this, so the page can line its own clock up with it
  now: number;
}

// a card's place at the table: a face-up direction card by its deck and slot
export interface Slot {
  deck: DirectionDeck;
  slot: number;
}

// browser → room
export type ClientMessage =
  | { t: "rename"; name: string }
  | { t: "kick"; id: string } // host only
  | { t: "makeHost"; id: string } // host only
  | { t: "leave" }
  | { t: "start" } // host only
  | { t: "newCharacter" } // your own, before the first episode starts
  | { t: "startClock" }
  | { t: "pause" }
  | { t: "resume" }
  | ({ t: "complete" } & Slot)
  | { t: "undo"; id: string }
  | ({ t: "discard" } & Slot) // between episodes
  | { t: "token"; on: "episode"; episode: number; add: boolean }
  | { t: "token"; on: "card"; id: string; add: boolean }
  | { t: "trait"; player: string; slot: number }
  | { t: "nextEpisode" }
  | { t: "toLobby" }; // host only

// room → browser
export type ServerMessage =
  | { t: "state"; room: RoomView }
  | { t: "error"; error: RoomError }
  // sent just before the room closes a socket for good (a socket's own close can be slow to arrive)
  | { t: "bye"; reason: ByeReason };

export type ByeReason = "kicked" | "left" | "replaced";

export type RoomError = "not-found" | "full" | "bad-request";

// Why the room closed a socket, so the page knows not to reconnect
export const CLOSE_KICKED = 4003;
export const CLOSE_LEFT = 4004;
export const CLOSE_REPLACED = 4005; // the same player opened the room in another tab
export const CLOSE_REFUSED = 4006; // see the error sent just before

export const cleanName = (name: unknown) =>
  typeof name === "string" ? name.replace(/\s+/g, " ").trim().slice(0, NAME_MAX) : "";

// #region--------------------------------------SCORING (the page and the server both count)

export const arcDone = (hand: Hand) => hand.traits.every((t) => t.done !== null);

export function score(game: GameView) {
  let cards = 0;
  let tokens = 0;
  for (const ep of game.episodes) {
    tokens += ep.tokens;
    for (const c of ep.completed) {
      cards += DIRECTION_POINTS[c.deck];
      tokens += c.tokens;
    }
  }
  const arcs = Object.values(game.hands).filter(arcDone).length * ARC_POINTS;
  const total = cards + tokens + arcs;
  const players = Math.max(1, Object.keys(game.hands).length);
  const perPlayer = Math.floor(total / players);
  const rating = RATINGS.find(([min]) => perPlayer >= min)![1];
  return { cards, tokens, arcs, total, players, perPlayer, rating };
}

// #endregion
