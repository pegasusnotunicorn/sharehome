// What the room server and the site's /play page say to each other over the room's socket. Types
// and limits only, so the site can import this file as is.

export const MAX_PLAYERS = 6;
export const MIN_PLAYERS = 2;
export const NAME_MAX = 20;
// Room codes: four letters, consonants only (no words), and no letters that read alike
export const CODE_LETTERS = "BCDFGHJKLMNPQRSTVWXZ";
export const CODE_LENGTH = 4;
export const CODE_PATTERN = new RegExp(`^[${CODE_LETTERS}]{${CODE_LENGTH}}$`);

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
  phase: "lobby";
  players: Player[];
}

// browser → room
export type ClientMessage =
  | { t: "rename"; name: string }
  | { t: "kick"; id: string } // host only
  | { t: "makeHost"; id: string } // host only
  | { t: "leave" };

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
