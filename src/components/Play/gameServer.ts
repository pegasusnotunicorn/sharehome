import { CODE_PATTERN } from "../../../game-server/src/protocol";
import { local } from "../../utils/safeStorage";

// Where the online game's room server is (game-server/): set on Netlify as VITE_GAME_SERVER_URL;
// `npm run dev` in game-server/ runs it at localhost:8787 for local work
export const GAME_SERVER: string =
  import.meta.env.VITE_GAME_SERVER_URL || (import.meta.env.DEV ? "http://localhost:8787" : "");

export const DISCORD_URL = "https://discord.com/invite/nv89cRgEsS";

// This browser's player id and name, kept so a dropped or reloaded page comes back as the same
// player (in memory only when storage is blocked)
const read = local.get;
const write = local.set;

export const playerId = () => {
  let id = read("lcm-play-id");
  if (!id) {
    id = crypto.randomUUID?.() ?? `p-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    write("lcm-play-id", id);
  }
  return id;
};

export const savedName = () => read("lcm-play-name") || "";
// the rooms this browser's joined (the last 20): back in one, it goes straight in; a new one's link
// asks first (play, by name, or just watch)
const ROOMS_KEY = "lcm-play-rooms";
const joinedRooms = () => (read(ROOMS_KEY) || "").split(",").filter(Boolean);
export const wasInRoom = (code: string) => joinedRooms().includes(code);
export const forgetRoom = (code: string) => write(ROOMS_KEY, joinedRooms().filter((c) => c !== code).join(","));
export const rememberRoom = (code: string) => write(ROOMS_KEY, [...joinedRooms().filter((c) => c !== code), code].slice(-20).join(","));
export const saveName = (name: string) => write("lcm-play-name", name);

export const normalizeCode = (code: string) => code.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);
export const isCode = (code: string) => CODE_PATTERN.test(code);

export async function createRoom(): Promise<string> {
  const res = await fetch(`${GAME_SERVER}/rooms`, { method: "POST" });
  if (!res.ok) throw new Error(res.status === 429 ? "slow-down" : res.status === 503 ? "paused" : `create ${res.status}`);
  return ((await res.json()) as { code: string }).code;
}

export async function roomInfo(code: string): Promise<{ exists: boolean; full: boolean; started?: boolean }> {
  const res = await fetch(`${GAME_SERVER}/rooms/${code}`);
  if (res.status === 404) return { exists: false, full: false };
  if (!res.ok) throw new Error(`info ${res.status}`);
  return res.json();
}

// (watch: as a spectator, if they're not playing already)
export const socketUrl = (code: string, name: string, watch?: boolean) =>
  `${GAME_SERVER.replace(/^http/, "ws")}/rooms/${code}/socket?player=${encodeURIComponent(playerId())}&name=${encodeURIComponent(name)}${watch ? "&watch=1" : ""}`;
