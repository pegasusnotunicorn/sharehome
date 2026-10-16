// ---- DEV TOOLS: for trying the UI out (this file, devTools.module.css and the lines marked
// DEV TOOLS in PlayPage.tsx and the game server; take them all out before merging) ----
import { useState } from "react";
import type { ClientMessage, DevAction, RoomView } from "../../../game-server/src/protocol";
import styles from "../../css/pages/devTools.module.css";

const ACTIONS: { action: DevAction; label: string; when: "any" | "game" | "playing" }[] = [
  { action: "addPlayer", label: "Add a test player", when: "any" },
  { action: "removePlayer", label: "Remove a test player", when: "any" },
  { action: "playersAway", label: "Test players: disconnect / reconnect", when: "any" },
  { action: "botCard", label: "Test player plays a card", when: "playing" },
  { action: "botRemote", label: "Test player presses the remote", when: "game" },
  { action: "tenSeconds", label: "Clock to 10 seconds", when: "playing" },
  { action: "endEpisode", label: "End the episode now", when: "playing" },
  { action: "finale", label: "Skip to the finale", when: "game" },
];

const DevTools = ({ room, send }: { room: RoomView; send: (msg: ClientMessage) => void }) => {
  const [open, setOpen] = useState(false);
  const game = room.game;
  const ok = (when: "any" | "game" | "playing") => when === "any" || (when === "game" && !!game && game.phase !== "over") || (when === "playing" && game?.phase === "playing");
  return (
    <div className={styles.dev}>
      {open && (
        <div className={styles.panel} role="menu" aria-label="Dev tools">
          <b>Dev tools</b>
          {ACTIONS.map((a) => (
            <button key={a.action} type="button" role="menuitem" disabled={!ok(a.when)} onClick={() => send({ t: "dev", action: a.action })}>
              {a.label}
            </button>
          ))}
        </div>
      )}
      <button type="button" className={styles.toggle} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        DEV
      </button>
    </div>
  );
};

export default DevTools;
// ---- END DEV TOOLS ----
