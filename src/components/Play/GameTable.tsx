import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  DIRECTION_DECKS,
  DIRECTION_POINTS,
  EPISODES,
  EPISODE_SECONDS,
  arcDone,
  score,
  type ClientMessage,
  type DirectionDeck,
  type GameView,
  type Player,
  type RoomView,
  type TraitKind,
} from "../../../game-server/src/protocol";
import DefaultButton from "../utils/DefaultButton";
import Modal from "../utils/Modal";
import Confirm from "./Confirm";
import { isMuted, play, setMuted } from "./sounds";
import modalStyles from "../../css/utils/modal.module.css";
import styles from "../../css/pages/gameTable.module.css";

// The table (once the host starts the show), laid out like the real thing on a kitchen table: the
// three direction decks with their face-up cards, the episode card with the cards completed in it,
// a phone with the clock, earlier episodes for callbacks, a sticky note of what's happened, and
// everyone's seat (their character and traits, face up). Cards never move when they're tapped: a new
// one flips over where the last one lay. Between episodes, the wrap; after the fourth, the ratings.

export const PLAYER_COLORS = ["#d81e18", "#5f5aa2", "#4f8a73", "#e0a91b", "#3d7fb8", "#d9652b"];

const nn = (i: number) => String(i + 1).padStart(2, "0");
const art = {
  character: (i: number) => `/images/pieces/characters/${nn(i)}.webp`,
  characterBack: (i: number) => `/images/pieces/characters/${nn(i)}-back.webp`,
  episode: (i: number) => `/images/pieces/episodes/${nn(i)}.webp`,
  direction: (deck: DirectionDeck, i: number) => `/images/pieces/${deck}/${nn(i)}.webp`,
  directionBack: (deck: DirectionDeck) => `/images/pieces/${deck}/back.webp`,
  trait: (kind: TraitKind, i: number) => `/images/pieces/${kind}-traits/${nn(i)}.webp`,
  episodeBack: "/images/pieces/episodes/back.webp",
  token: "/images/pieces/box/token-front.webp",
};

// the card backs, fetched as the table opens, so a new card can always show its back at once
const preloadBacks = () => {
  for (const src of [art.episodeBack, ...["director", "producer", "showrunner"].map((d) => art.directionBack(d as DirectionDeck))]) {
    const img = new Image();
    img.src = src;
  }
};

// A card dealt onto the table: its back first (always ready), turned over once its face has loaded
const FlipCard = ({ front, back, alt, width, height }: { front: string; back: string; alt: string; width: number; height: number }) => {
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    // (a face that's already here, from the cache, turns over at once)
    if (ref.current?.complete && ref.current.naturalWidth) setReady(true);
  }, []);
  return (
    <span className={`${styles.flipper}${ready ? ` ${styles.flipped}` : ""}`}>
      <img ref={ref} className={styles.face} src={front} alt={alt} width={width} height={height} onLoad={() => setReady(true)} />
      <img className={`${styles.face} ${styles.faceBack}`} src={back} alt="" width={width} height={height} aria-hidden />
    </span>
  );
};

// the tablecloths to choose from (kept in this browser only: everyone picks their own)
const CLOTHS = [
  { id: "blue", name: "Blue gingham" },
  { id: "pink", name: "Pink gingham" },
  { id: "dots", name: "Strawberry dots" },
  { id: "mint", name: "Mint stripes" },
  { id: "hearts", name: "Hearts" },
  { id: "stars", name: "Lavender stars" },
  { id: "picnic", name: "Picnic check" },
] as const;
type Cloth = (typeof CLOTHS)[number]["id"];
const CLOTH_KEY = "lcm-play-cloth";
const readCloth = (): Cloth => {
  try {
    const c = localStorage.getItem(CLOTH_KEY);
    return CLOTHS.some((x) => x.id === c) ? (c as Cloth) : "blue";
  } catch {
    return "blue";
  }
};
const clothClass = (c: Cloth) => (c === "blue" ? "" : ` ${styles[`cloth-${c}`]}`);

const DECK_LABEL: Record<DirectionDeck, string> = { director: "Director", producer: "Producer", showrunner: "Showrunner" };

// each card lies a little askew, always the same way (so nothing shifts when the table changes)
const tilt = (seed: number) => `${(((seed * 37) % 7) - 3) * 0.6}deg`;

// the cards' names (for screen readers and the log), from the pieces list
type Names = Record<string, string[]>;
let namesOnce: Promise<Names> | null = null;
const loadNames = () =>
  (namesOnce ??= fetch("/images/pieces/pieces.json")
    .then((r) => r.json() as Promise<{ decks: { name: string; items: { name: string }[] }[] }>)
    .then(({ decks }) => {
      const by = (n: string) => decks.find((d) => d.name === n)?.items.map((c) => c.name) ?? [];
      return {
        character: by("Characters"),
        episode: by("Episodes"),
        director: by("Director"),
        producer: by("Producer"),
        showrunner: by("Showrunner"),
        good: by("Good traits"),
        bad: by("Bad traits"),
        chaotic: by("Chaotic traits"),
      };
    })
    .catch(() => ({})));

const useNames = () => {
  const [names, setNames] = useState<Names>({});
  useEffect(() => {
    let live = true;
    loadNames().then((n) => live && setNames(n));
    return () => {
      live = false;
    };
  }, []);
  return (kind: string, i: number) => names[kind]?.[i] ?? "";
};

// the clock, lined up with the server's (and a tick for each of the last ten seconds)
const useClock = (game: GameView, serverNow: number) => {
  const offset = useMemo(() => serverNow - Date.now(), [serverNow]);
  const [now, setNow] = useState(() => Date.now() + offset);
  useEffect(() => {
    if (game.endsAt === null) return;
    const timer = setInterval(() => setNow(Date.now() + offset), 250);
    return () => clearInterval(timer);
  }, [game.endsAt, offset]);
  const left =
    game.endsAt !== null
      ? Math.max(0, game.endsAt - now)
      : game.pausedLeft !== null
        ? game.pausedLeft
        : game.phase === "ready"
          ? EPISODE_SECONDS * 1000
          : 0;
  const seconds = Math.ceil(left / 1000);
  const lastTick = useRef(seconds);
  useEffect(() => {
    if (game.endsAt !== null && seconds !== lastTick.current && seconds > 0 && seconds <= 10) play("tick");
    lastTick.current = seconds;
  }, [seconds, game.endsAt]);
  return left;
};

// the time of day, for the phone's status bar
const useWallClock = () => {
  const fmt = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M$/i, "");
  const [t, setT] = useState(fmt);
  useEffect(() => {
    const timer = setInterval(() => setT(fmt()), 15_000);
    return () => clearInterval(timer);
  }, []);
  return t;
};

const mmss = (ms: number) => {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

// the sounds for whatever just changed at the table, whoever did it
const useTableSounds = (game: GameView) => {
  const before = useRef<GameView | null>(null);
  useEffect(() => {
    const was = before.current;
    before.current = game;
    if (!was) return;
    const done = (g: GameView) => g.episodes.reduce((n, e) => n + e.completed.length, 0);
    const tokens = (g: GameView) => g.episodes.reduce((n, e) => n + e.tokens + e.completed.reduce((m, c) => m + c.tokens, 0), 0);
    const traits = (g: GameView) => Object.values(g.hands).reduce((n, h) => n + h.traits.filter((t) => t.done !== null).length, 0);
    if (game.phase === "over" && was.phase !== "over") return play("finale");
    if (game.phase === "break" && was.phase === "playing") return play("timeUp");
    if (game.phase === "ready" && was.phase === "break") return play("deal");
    if (game.phase === "playing" && was.phase === "ready" && done(game) === done(was)) return play("start");
    if (done(game) > done(was)) return play("complete");
    if (done(game) < done(was)) return play("undo");
    if (tokens(game) > tokens(was)) return play("token");
    if (tokens(game) < tokens(was)) return play("undo");
    if (traits(game) > traits(was)) return play("trait");
    if (traits(game) < traits(was)) return play("undo");
    if (JSON.stringify(game.faceUp) !== JSON.stringify(was.faceUp)) play("deal");
  }, [game]);
};

interface TableProps {
  room: RoomView;
  me: string;
  isHost: boolean;
  send: (msg: ClientMessage) => void;
}

const GameTable = ({ room, me, isHost, send }: TableProps) => {
  const game = room.game!;
  const name = useNames();
  const left = useClock(game, room.now);
  useTableSounds(game);
  useEffect(preloadBacks, []);
  const [muted, setMutedState] = useState(isMuted);
  const [ending, setEnding] = useState(false);
  const [rules, setRules] = useState(false);
  const [cloth, setCloth] = useState<Cloth>(readCloth);
  const [picking, setPicking] = useState(false);
  const [phoneTab, setPhoneTab] = useState<"clock" | "log">("clock");
  // the newest log entry seen on the phone (a dot on the tab when there's something newer)
  const [seenLog, setSeenLog] = useState<string | null>(null);
  const clockTime = useWallClock();
  const pickCloth = (c: Cloth) => {
    setCloth(c);
    try {
      localStorage.setItem(CLOTH_KEY, c);
    } catch {
      // (just for this visit)
    }
  };
  const [zoom, setZoom] = useState<{ player: Player; character: number } | null>(null);
  const [playedOpen, setPlayedOpen] = useState(false);
  // the "+2" that rises off a card when someone completes it
  const [floaters, setFloaters] = useState<{ id: string; deck: DirectionDeck; slot: number; points: number }[]>([]);
  const seen = useRef<Set<string> | null>(null);
  // the face-up cards as they were, to tell which slot a completed card came from
  const lastFaceUp = useRef(game.faceUp);

  const unread = phoneTab !== "log" && game.log.length > 0 && game.log[0].id !== seenLog;
  useEffect(() => {
    if (phoneTab === "log") setSeenLog(game.log[0]?.id ?? null);
  }, [phoneTab, game.log]);
  const ep = game.episodes[game.episode - 1];
  useEffect(() => {
    const ids = new Set(ep.completed.map((c) => c.id));
    if (seen.current) {
      for (const c of ep.completed) {
        if (seen.current.has(c.id)) continue;
        // (where it lay: the slot that held it a moment ago, else the one the server names)
        const was = lastFaceUp.current[c.deck]?.indexOf(c.i) ?? -1;
        const f = { id: c.id, deck: c.deck, slot: was >= 0 ? was : (c.slot ?? 0), points: DIRECTION_POINTS[c.deck] };
        setFloaters((all) => [...all, f]);
        setTimeout(() => setFloaters((all) => all.filter((x) => x.id !== f.id)), 1100);
      }
    }
    seen.current = ids;
    lastFaceUp.current = game.faceUp;
  }, [ep.completed, game.faceUp]);

  const players = room.players.filter((p) => game.hands[p.id]);
  const mine = players.find((p) => p.id === me);
  const others = players.filter((p) => p.id !== me);
  const nameOf = (id: string) => room.players.find((p) => p.id === id)?.name ?? "Someone";
  const points = score(game);
  const epPoints = ep.completed.reduce((n, c) => n + DIRECTION_POINTS[c.deck] + c.tokens, 0);
  const running = game.phase === "playing" && game.endsAt !== null;
  const paused = game.phase === "playing" && game.pausedLeft !== null;

  const seatProps = { game, me, name, send, zoom: (player: Player, character: number) => setZoom({ player, character }) };

  if (game.phase === "over") {
    return (
      <div className={styles.room}>
        <div className={`${styles.tabletop}${clothClass(cloth)}`}>
          <Finale room={room} game={game} isHost={isHost} send={send} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.room}>
      <div className={`${styles.tabletop}${clothClass(cloth)}`}>
        <Prompt game={game} epPoints={epPoints} />

        {others.length > 0 && (
          <div className={styles.othersRow}>
            {others.map((p) => (
              <Seat key={p.id} player={p} {...seatProps} />
            ))}
          </div>
        )}

        <div className={styles.middle}>
          {/* #region the episode, and the cards completed in it */}
          <section className={styles.episodeArea} aria-label="This episode">
            <div className={styles.episodeCard} style={{ "--tilt": tilt(ep.card + 3) } as CSSProperties}>
              <FlipCard key={ep.card} front={art.episode(ep.card)} back={art.episodeBack} alt={name("episode", ep.card)} width={768} height={549} />
            </div>
            <PlayArea cards={ep.completed} points={epPoints} open={() => setPlayedOpen(true)} />
          </section>
          {/* #endregion */}

          {/* #region the direction decks, each with its two face-up cards */}
          <section className={styles.decks} aria-label="Direction cards">
            {DIRECTION_DECKS.map((deck) => (
              <div key={deck} className={`${styles.deck} ${styles[deck]}`}>
                <div className={styles.deckHead}>
                  <h3>{DECK_LABEL[deck]}</h3>
                  <span className={styles.points}>
                    {DIRECTION_POINTS[deck]} pt{DIRECTION_POINTS[deck] > 1 ? "s" : ""}
                  </span>
                </div>
                <div className={styles.deckRow}>
                  <div className={styles.stack} aria-label={`${game.left[deck]} cards left`}>
                    <img src={art.directionBack(deck)} alt="" width="768" height="497" />
                    <span className={styles.stackCount}>{game.left[deck]}</span>
                  </div>
                  {game.faceUp[deck].map((card, slot) => (
                    <div key={slot} className={styles.slot}>
                      {card === null ? (
                        <span className={styles.slotEmpty}>Empty</span>
                      ) : (
                        <button
                          key={card}
                          type="button"
                          className={styles.card}
                          style={{ "--tilt": tilt(card + slot) } as CSSProperties}
                          disabled={game.phase === "break"}
                          onClick={() => {
                            // (a card done while the clock's paused starts it again)
                            if (paused) send({ t: "resume" });
                            send({ t: "complete", deck, slot });
                          }}
                          aria-label={`Complete “${name(deck, card)}” (${DIRECTION_POINTS[deck]} points)`}
                        >
                          <FlipCard front={art.direction(deck, card)} back={art.directionBack(deck)} alt="" width={768} height={497} />
                        </button>
                      )}
                      {floaters
                        .filter((f) => f.deck === deck && f.slot === slot)
                        .map((f) => (
                          <span key={f.id} className={styles.floater} aria-hidden>
                            +{f.points}
                          </span>
                        ))}
                      {card !== null && game.phase === "ready" && game.left[deck] > 0 && (
                        <button type="button" className={styles.swap} onClick={() => send({ t: "discard", deck, slot })}>
                          Swap
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
          {/* #endregion */}

          {/* #region the phone (the clock, and what's happened), and callbacks */}
          <aside className={styles.side}>
            <div className={`${styles.phone}${game.phase === "break" ? ` ${styles.phoneUp}` : ""}`}>
              <span className={styles.phoneIsland} aria-hidden />
              <div className={styles.statusBar} aria-hidden>
                <span>{clockTime}</span>
                <span className={styles.statusIcons}>
                  <svg viewBox="0 0 18 12">
                    <rect x="0" y="8" width="3" height="4" rx="1" />
                    <rect x="5" y="5" width="3" height="7" rx="1" />
                    <rect x="10" y="2" width="3" height="10" rx="1" />
                    <rect x="15" y="0" width="3" height="12" rx="1" />
                  </svg>
                  <span className={styles.battery}>
                    <span />
                  </span>
                </span>
              </div>

              <div className={styles.screen}>
                {phoneTab === "clock" ? (
                  <div className={styles.clockApp} role="timer" aria-live="off" id="phone-clock">
                    <span className={styles.phoneLabel}>{game.phase === "break" ? "Time’s up!" : paused ? "Paused" : `Episode ${game.episode} of ${EPISODES}`}</span>
                    <span className={`${styles.phoneTime}${running && left < 10_000 ? ` ${styles.phoneLow}` : ""}`}>{mmss(left)}</span>
                    <span className={styles.phoneTrack}>
                      <span style={{ transform: `scaleX(${left / (EPISODE_SECONDS * 1000)})` }} />
                    </span>
                    <div className={styles.phoneActions}>
                      {game.phase === "ready" && <DefaultButton onClick={() => send({ t: "startClock" })} text="Start" color="red" />}
                      {running && <DefaultButton onClick={() => send({ t: "pause" })} text="Pause" color="white" />}
                      {paused && <DefaultButton onClick={() => send({ t: "resume" })} text="Resume" color="red" />}
                      {game.phase === "break" && (
                        <DefaultButton
                          onClick={() => send({ t: "nextEpisode" })}
                          text={game.episode >= EPISODES ? "Ratings" : `Episode ${game.episode + 1}`}
                          color="yellow"
                        />
                      )}
                    </div>
                    <div className={styles.phoneFoot}>
                      <span>
                        <b>{points.total}</b> pts
                      </span>
                      <button type="button" className={styles.rulesButton} onClick={() => setRules(true)}>
                        Rules
                      </button>
                      <button type="button" className={styles.clothButton} onClick={() => setPicking(true)} aria-label="Change the tablecloth" title="Tablecloth">
                        <svg viewBox="0 0 24 24" aria-hidden>
                          <path d="M12 3a9 9 0 0 0 0 18c1.1 0 1.7-.8 1.7-1.6 0-.5-.2-.8-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.8-1.6 1.7-1.6h2A4.6 4.6 0 0 0 21 10.8C21 6.5 17 3 12 3z" />
                          <circle cx="7.5" cy="11" r="1" />
                          <circle cx="10.5" cy="7.5" r="1" />
                          <circle cx="15" cy="7.5" r="1" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className={styles.mute}
                        onClick={() => {
                          setMuted(!muted);
                          setMutedState(!muted);
                        }}
                        aria-label={muted ? "Turn sound on" : "Turn sound off"}
                        aria-pressed={!muted}
                      >
                        {muted ? (
                          <svg viewBox="0 0 24 24" aria-hidden>
                            <path d="M11 5 6 9H3v6h3l5 4zM17 9l4 6M21 9l-4 6" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" aria-hidden>
                            <path d="M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.logApp} id="phone-log">
                    <div className={styles.logHead}>
                      <span>What’s happened</span>
                      <span className={styles.logClock}>{mmss(left)}</span>
                    </div>
                    {game.log.length === 0 ? (
                      <p className={styles.logEmpty}>Nothing yet!</p>
                    ) : (
                      <ul className={styles.logList}>
                        {game.log.map((l) => {
                          const who = l.by && room.players.find((p) => p.id === l.by);
                          return (
                            <li key={l.id} style={{ "--who": who ? PLAYER_COLORS[who.color % PLAYER_COLORS.length] : "#8a86c9" } as CSSProperties}>
                              <span className={styles.logDot} aria-hidden>
                                {who ? who.name.charAt(0).toUpperCase() : "★"}
                              </span>
                              <span>{l.text.replace(/\{([^}]+)\}/g, (_, id) => nameOf(id))}</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.dock} role="tablist" aria-label="Phone">
                <button
                  type="button"
                  role="tab"
                  aria-selected={phoneTab === "clock"}
                  aria-controls="phone-clock"
                  className={phoneTab === "clock" ? styles.dockOn : ""}
                  onClick={() => setPhoneTab("clock")}
                >
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <circle cx="12" cy="13" r="8" />
                    <path d="M12 9v4l2.5 2.5M9.5 2.5h5" />
                  </svg>
                  Timer
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={phoneTab === "log"}
                  aria-controls="phone-log"
                  className={phoneTab === "log" ? styles.dockOn : ""}
                  onClick={() => {
                    setPhoneTab("log");
                    setSeenLog(game.log[0]?.id ?? null);
                  }}
                >
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <path d="M4 5h16v11H8l-4 4z" />
                    <path d="M8 9h8M8 12h5" />
                  </svg>
                  What’s happened
                  {unread && <span className={styles.unread} aria-label="new" />}
                </button>
              </div>
              <span className={styles.homeBar} aria-hidden />
            </div>

            {game.episode > 1 && (
            <section className={styles.callbacks} aria-labelledby="callbacks-title">
              <div className={styles.deckHead}>
                <h3 id="callbacks-title">Callbacks</h3>
                <span className={styles.points}>+1 each</span>
              </div>
              <div className={styles.pastRow}>
                {Array.from({ length: EPISODES - 1 }, (_, i) => {
                  const past = i < game.episode - 1 ? game.episodes[i] : null;
                  return past ? (
                    <button
                      key={i}
                      type="button"
                      className={styles.past}
                      style={{ "--tilt": tilt(past.card) } as CSSProperties}
                      onClick={() => send({ t: "token", on: "episode", episode: i + 1, add: true })}
                      aria-label={`Callback to episode ${i + 1}, ${name("episode", past.card)} (${past.tokens} so far)`}
                    >
                      <img src={art.episode(past.card)} alt="" width="768" height="549" />
                      <span className={styles.pastTokens}>
                        <img src={art.token} alt="" />
                        {past.tokens > 0 ? past.tokens : "+1"}
                      </span>
                    </button>
                  ) : (
                    <span key={i} className={styles.pastEmpty}>
                      Ep {i + 1}
                    </span>
                  );
                })}
              </div>
              {game.episodes.slice(0, game.episode - 1).some((e) => e.tokens > 0) && (
                <div className={styles.takeBack}>
                  {game.episodes.slice(0, game.episode - 1).map((e, i) =>
                    e.tokens > 0 ? (
                      <button key={i} type="button" className={styles.chipButton} onClick={() => send({ t: "token", on: "episode", episode: i + 1, add: false })}>
                        −1 on ep {i + 1}
                      </button>
                    ) : null
                  )}
                </div>
              )}
            </section>
            )}

          </aside>
          {/* #endregion */}
        </div>

        {mine && (
          <div className={styles.mineRow}>
            <Seat player={mine} big {...seatProps} />
          </div>
        )}
      </div>

      {isHost && (
        <div className={styles.hostRow}>
          <button type="button" className={styles.textButton} onClick={() => setEnding(true)}>
            End the game and go back to the room
          </button>
        </div>
      )}

      {zoom && (
        <Modal onClose={() => setZoom(null)} panelClassName={`${modalStyles.panel} ${styles.zoomPanel}`} ariaLabel={name("character", zoom.character)}>
          <h2 className={modalStyles.title}>{name("character", zoom.character) || zoom.player.name}</h2>
          <p className={modalStyles.text}>Played by {zoom.player.name}</p>
          <div className={styles.zoomCards}>
            <img src={art.character(zoom.character)} alt="" width="768" height="444" />
            <img src={art.characterBack(zoom.character)} alt={`${name("character", zoom.character)}: details`} width="768" height="444" />
          </div>
        </Modal>
      )}
      {rules && <RulesDialog close={() => setRules(false)} />}
      {playedOpen && (
        <PlayedDialog
          episode={game.episode}
          cards={ep.completed}
          points={epPoints}
          name={name}
          nameOf={nameOf}
          send={send}
          close={() => setPlayedOpen(false)}
        />
      )}
      {picking && (
        <Modal onClose={() => setPicking(false)} ariaLabel="Tablecloth">
          <h2 className={modalStyles.title}>Pick a tablecloth</h2>
          <p className={modalStyles.text}>Just for you: everyone else keeps the one they like.</p>
          <div className={styles.clothGrid}>
            {CLOTHS.map((c) => (
              <button key={c.id} type="button" className={styles.clothSwatch} aria-pressed={cloth === c.id} onClick={() => pickCloth(c.id)}>
                <span className={`${styles.tabletop}${clothClass(c.id)}`} aria-hidden />
                <span>{c.name}</span>
              </button>
            ))}
          </div>
          <div className={modalStyles.actions}>
            <DefaultButton onClick={() => setPicking(false)} text="Done" color="red" />
          </div>
        </Modal>
      )}
      {ending && (
        <Confirm
          title="End the game?"
          text="Everyone goes back to the room, and this season’s score is lost."
          action="End the game"
          onConfirm={() => {
            setEnding(false);
            send({ t: "toLobby" });
          }}
          onClose={() => setEnding(false)}
        />
      )}
    </div>
  );
};

type Played = GameView["episodes"][number]["completed"];

// The play area: the cards completed this episode, dropped one over the other in a space that never
// grows (the newest on top, the oldest gone past eight). It's one thing to tap: it opens the list of
// them all.
const PlayArea = ({ cards, points, open }: { cards: Played; points: number; open: () => void }) => {
  const shown = cards.slice(-8);
  return (
    <button
      type="button"
      className={styles.playArea}
      onClick={open}
      aria-label={`Played this episode: ${cards.length} card${cards.length === 1 ? "" : "s"}, +${points}. See them all`}
    >
      <span className={styles.playCards} aria-hidden>
        {shown.map((c) => {
          // (where a card lands comes from the card itself, so it stays put as others come and go)
          const h = hash(c.id);
          return (
            <img
              key={c.id}
              src={art.direction(c.deck, c.i)}
              alt=""
              style={
                {
                  "--x": `${(h % 46) + 4}%`,
                  "--y": `${((h >> 6) % 34) + 6}%`,
                  "--tilt": `${((h >> 12) % 24) - 12}deg`,
                } as CSSProperties
              }
            />
          );
        })}
      </span>
      <span className={styles.playLabel}>
        {cards.length === 0 ? (
          "Played cards land here"
        ) : (
          <>
            <b>+{points}</b> · {cards.length} card{cards.length === 1 ? "" : "s"} · see all
          </>
        )}
      </span>
    </button>
  );
};

// a number from a card's id, the same every time
const hash = (id: string) => {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return h >>> 0;
};

const PAGE = 5;

// everything played this episode: search it, a page at a time; tokens and undo for each card
const PlayedDialog = ({
  episode,
  cards,
  points,
  name,
  nameOf,
  send,
  close,
}: {
  episode: number;
  cards: Played;
  points: number;
  name: (kind: string, i: number) => string;
  nameOf: (id: string) => string;
  send: (msg: ClientMessage) => void;
  close: () => void;
}) => {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const list = [...cards]
    .reverse()
    .filter((c) => {
      const hay = `${name(c.deck, c.i)} ${c.deck} ${nameOf(c.by)}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const at = Math.min(page, pages - 1);
  const shown = list.slice(at * PAGE, at * PAGE + PAGE);

  return (
    <Modal onClose={close} panelClassName={`${modalStyles.panel} ${styles.playedPanel}`} ariaLabel="Played this episode">
      <h2 className={modalStyles.title}>Played this episode</h2>
      <p className={modalStyles.text}>
        Episode {episode}: {cards.length} card{cards.length === 1 ? "" : "s"}, +{points}. Had something to say too? Add a
        token to a card.
      </p>
      {cards.length > PAGE && (
        <input
          className={styles.playedSearch}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder="Search by card or player"
          aria-label="Search the played cards"
        />
      )}
      {cards.length === 0 ? (
        <p className={styles.playedEmpty}>Nothing played yet.</p>
      ) : list.length === 0 ? (
        <p className={styles.playedEmpty}>No card matches that.</p>
      ) : (
        <ul className={styles.playedList}>
          {shown.map((c) => (
            <li key={c.id}>
              <img src={art.direction(c.deck, c.i)} alt={name(c.deck, c.i)} width="768" height="497" />
              <div className={styles.playedInfo}>
                <b>+{DIRECTION_POINTS[c.deck] + c.tokens}</b>
                <span>{nameOf(c.by)}</span>
              </div>
              <div className={styles.playedActions}>
                <span className={styles.tokenCount} aria-label={`${c.tokens} tokens`}>
                  <img src={art.token} alt="" />
                  {c.tokens}
                </span>
                <button type="button" className={styles.chipButton} onClick={() => send({ t: "token", on: "card", id: c.id, add: true })}>
                  +1
                </button>
                <button
                  type="button"
                  className={styles.chipButton}
                  disabled={c.tokens === 0}
                  onClick={() => send({ t: "token", on: "card", id: c.id, add: false })}
                >
                  −1
                </button>
                <button type="button" className={`${styles.chipButton} ${styles.chipDanger}`} onClick={() => send({ t: "undo", id: c.id })}>
                  Undo
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className={styles.playedFoot}>
        {pages > 1 ? (
          <div className={styles.pager}>
            <button type="button" className={styles.chipButton} disabled={at === 0} onClick={() => setPage(at - 1)} aria-label="Previous page">
              ‹
            </button>
            <span>
              {at + 1} of {pages}
            </span>
            <button type="button" className={styles.chipButton} disabled={at >= pages - 1} onClick={() => setPage(at + 1)} aria-label="Next page">
              ›
            </button>
          </div>
        ) : (
          <span />
        )}
        <DefaultButton onClick={close} text="Back to the table" color="red" />
      </div>
    </Modal>
  );
};

// the rules, close at hand: how a round goes, what scores, and the two golden rules
const RulesDialog = ({ close }: { close: () => void }) => (
  <Modal onClose={close} panelClassName={`${modalStyles.panel} ${styles.rulesPanel}`} ariaLabel="How to play">
    <h2 className={modalStyles.title}>How to play</h2>
    <p className={modalStyles.text}>
      You’re the cast of a reality TV show. Tell the story together, out loud, and score points for the ratings.
    </p>
    <div className={styles.rulesBody}>
      <section>
        <h3>Each episode</h3>
        <ul>
          <li>The episode card is where it takes place. You have 3 minutes, and play 4 episodes.</li>
          <li>
            There are no turns: talk over each other, play in real time. Complete a direction card by narrating what your
            character does, then tap it.
          </li>
          <li>Producer cards need two people: someone else answers “What happens?”</li>
          <li>Between episodes, talk over what happened and swap any direction cards you don’t want.</li>
        </ul>
      </section>
      <section>
        <h3>Points</h3>
        <ul>
          <li>
            <b>Direction cards:</b> Director 1, Producer 2, Showrunner 3.
          </li>
          <li>
            <b>Had something to say too?</b> Someone beat you to a card: tap the completed card, add a token (+1) and say
            it anyway.
          </li>
          <li>
            <b>Callbacks</b> (from episode 2): mention something from an earlier episode, tap that episode (+1).
          </li>
          <li>
            <b>Character Arc:</b> play one of your traits per episode (tap it once the table agrees). All three is +10.
          </li>
          <li>At the end, the total is divided by the number of players for your season’s ratings.</li>
        </ul>
      </section>
      <section>
        <h3>The two golden rules</h3>
        <ul>
          <li>
            <b>Everything must make sense,</b> however far-fetched.
          </li>
          <li>
            <b>“Yes, and…”:</b> whatever’s said is true, unless it contradicts something said already.
          </li>
        </ul>
      </section>
    </div>
    <div className={modalStyles.actions}>
      <DefaultButton href="/rulebook" text="Full rulebook" variant="secondary" border="dark" />
      <DefaultButton onClick={close} text="Back to the game" color="red" />
    </div>
  </Modal>
);

// what to do now: a director's note on the table
const Prompt = ({ game, epPoints }: { game: GameView; epPoints: number }) => {
  let text: React.ReactNode = null;
  if (game.phase === "ready" && game.episode === 1)
    text = (
      <>
        <b>Introduce yourselves!</b> Oldest character first: who you are, and your Character Arc. Then start the clock, or
        just complete a card and it starts on its own.
      </>
    );
  else if (game.phase === "ready")
    text = (
      <>
        <b>Episode {game.episode} is next.</b> Talk over what just happened, swap any direction cards you don’t want,
        then start the clock.
      </>
    );
  else if (game.phase === "break")
    text = (
      <>
        <b>That’s a wrap on episode {game.episode}! +{epPoints}</b> Did anyone play one of their traits? Tap it before
        moving on.
      </>
    );
  if (!text) return null;
  return (
    <div className={`${styles.prompt}${game.phase === "break" ? ` ${styles.promptWrap}` : ""}`} role="status">
      {text}
    </div>
  );
};

// a seat at the table: the character in their stand, the name plate, and the three traits
const Seat = ({
  player,
  game,
  me,
  name,
  send,
  zoom,
  big,
}: {
  player: Player;
  game: GameView;
  me: string;
  name: (kind: string, i: number) => string;
  send: (msg: ClientMessage) => void;
  zoom: (player: Player, character: number) => void;
  big?: boolean;
}) => {
  const hand = game.hands[player.id];
  const mine = player.id === me;
  const playedNow = hand.traits.some((t) => t.done === game.episode);
  const color = PLAYER_COLORS[player.color % PLAYER_COLORS.length];

  return (
    <article
      className={`${styles.seat}${big ? ` ${styles.seatBig}` : ""}${player.online ? "" : ` ${styles.seatAway}`}`}
      style={{ "--seat": color } as CSSProperties}
      aria-label={`${player.name}${mine ? " (you)" : ""}`}
    >
      <div className={styles.seatCharacter}>
        <button
          type="button"
          className={styles.characterCard}
          style={{ "--tilt": tilt(hand.character) } as CSSProperties}
          onClick={() => zoom(player, hand.character)}
          aria-label={`${name("character", hand.character)}: see the card up close`}
        >
          <img key={hand.character} className={styles.flipIn} src={art.character(hand.character)} alt="" width="768" height="444" />
          <span className={styles.zoomHint} aria-hidden>
            <svg viewBox="0 0 24 24">
              <circle cx="10.5" cy="10.5" r="6" />
              <path d="M15 15l5 5M10.5 8v5M8 10.5h5" />
            </svg>
          </span>
        </button>
        <div className={styles.nameplate}>
          <span className={styles.nameToken}>{player.name.charAt(0).toUpperCase()}</span>
          <span className={styles.nameText}>{player.name}</span>
          {mine && <span className={styles.you}>You</span>}
          {arcDone(hand) && <span className={styles.arc}>Arc +10</span>}
        </div>
        {mine && game.phase === "ready" && game.episode === 1 && (
          <button type="button" className={styles.textButton} onClick={() => send({ t: "newCharacter" })}>
            Draw a different character
          </button>
        )}
      </div>
      <ul className={styles.traits} aria-label={`${player.name}’s traits`}>
        {hand.traits.map((t, slot) => {
          const done = t.done !== null;
          const locked = !done && playedNow;
          return (
            <li key={t.kind}>
              <button
                type="button"
                className={`${styles.trait}${done ? ` ${styles.traitDone}` : ""}`}
                disabled={locked || (done && t.done !== game.episode)}
                onClick={() => send({ t: "trait", player: player.id, slot })}
                aria-pressed={done}
                aria-label={`${name(t.kind, t.i) || `${t.kind} trait`}${done ? `, played in episode ${t.done}` : ""}`}
              >
                <img src={art.trait(t.kind, t.i)} alt="" width="768" height="219" />
                {done && <span className={styles.traitStamp}>✓ Ep {t.done}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </article>
  );
};

// the season's done: the ratings, as the rulebook has them
const Finale = ({ room, game, isHost, send }: { room: RoomView; game: GameView; isHost: boolean; send: (msg: ClientMessage) => void }) => {
  const s = score(game);
  const host = room.players.find((p) => p.id === room.hostId);
  return (
    <section className={styles.finale}>
      <p className={styles.finaleKicker}>Season finale · the ratings are in</p>
      <h2 className={styles.finaleRating}>{s.rating}</h2>
      <p className={styles.finaleScore}>
        <b>{s.perPlayer}</b> points per player
      </p>
      <dl className={styles.breakdown}>
        <div>
          <dt>Direction cards</dt>
          <dd>{s.cards}</dd>
        </div>
        <div>
          <dt>Tokens</dt>
          <dd>{s.tokens}</dd>
        </div>
        <div>
          <dt>Character Arcs</dt>
          <dd>{s.arcs}</dd>
        </div>
        <div>
          <dt>
            Total ÷ {s.players} player{s.players > 1 ? "s" : ""}
          </dt>
          <dd>
            {s.total} ÷ {s.players}
          </dd>
        </div>
      </dl>
      {isHost ? (
        <DefaultButton onClick={() => send({ t: "toLobby" })} text="Back to the room for another season" color="yellow" />
      ) : (
        <p className={styles.finaleNote}>{host?.name || "The host"} can start another season.</p>
      )}
    </section>
  );
};

export default GameTable;
