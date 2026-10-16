import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  DIRECTION_DECKS,
  DIRECTION_POINTS,
  EPISODES,
  EPISODE_SECONDS,
  REMOTE_BUTTONS,
  arcDone,
  score,
  type ClientMessage,
  type DirectionDeck,
  type GameView,
  type RemoteButton,
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
  // the point tokens: one side's worth 1, the other (the rainbow) 5
  token: "/images/pieces/box/token-front.webp",
  token5: "/images/pieces/box/token-back.webp",
};

// the card backs, fetched as the table opens, so a new card can always show its back at once
const preloadBacks = () => {
  for (const src of [art.episodeBack, ...["director", "producer", "showrunner"].map((d) => art.directionBack(d as DirectionDeck))]) {
    const img = new Image();
    img.src = src;
  }
};

const reducedMotion = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

// A card dealt onto the table: it slides out of its deck face down (when `from`, the deck, is given),
// then turns over once its face has loaded, so the picture never shows up half-loaded
const FlipCard = ({
  front,
  back,
  alt,
  width,
  height,
  from,
}: {
  front: string;
  back: string;
  alt: string;
  width: number;
  height: number;
  from?: HTMLElement | null;
}) => {
  const [loaded, setLoaded] = useState(false);
  const [dealt, setDealt] = useState(!from);
  const ref = useRef<HTMLImageElement>(null);
  const dealer = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    // (a face that's already here, from the cache, is ready at once)
    if (ref.current?.complete && ref.current.naturalWidth) setLoaded(true);
  }, []);
  useLayoutEffect(() => {
    const el = dealer.current;
    if (!from || !el || reducedMotion()) return setDealt(true);
    const a = from.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    const anim = el.animate(
      [
        { transform: `translate(${a.left + a.width / 2 - (b.left + b.width / 2)}px, ${a.top + a.height / 2 - (b.top + b.height / 2)}px) scale(${a.width / b.width})` },
        { transform: "none" },
      ],
      { duration: 420, delay: 220, easing: "cubic-bezier(0.25, 0.8, 0.3, 1)", fill: "backwards" }
    );
    anim.onfinish = () => setDealt(true);
    return () => anim.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <span ref={dealer} className={styles.dealer}>
      <span className={`${styles.flipper}${loaded && dealt ? ` ${styles.flipped}` : ""}`}>
        <img ref={ref} className={styles.face} src={front} alt={alt} width={width} height={height} onLoad={() => setLoaded(true)} />
        <img className={`${styles.face} ${styles.faceBack}`} src={back} alt="" width={width} height={height} aria-hidden />
      </span>
    </span>
  );
};

// where a played card lands in the play area: from the card itself, so it stays put
const landing = (id: string) => {
  const h = hash(id);
  return { x: (h % 46) + 4, y: ((h >> 6) % 34) + 6, tilt: ((h >> 12) % 24) - 12 };
};

// a number from a card's id, the same every time
function hash(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return h >>> 0;
}

type Rect = { left: number; top: number; width: number; height: number };
interface FlightPlan {
  id: string;
  src: string;
  from: Rect;
  to: Rect;
  tilt: number;
}

// a played card on its way from its slot to the play area (over everything, then gone)
const Flight = ({ plan, done }: { plan: FlightPlan; done: () => void }) => {
  const ref = useRef<HTMLImageElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { from, to } = plan;
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    const anim = el.animate(
      [
        { transform: "translate(0, 0) rotate(0deg) scale(1)" },
        { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 30}px) rotate(${plan.tilt / 2}deg) scale(${(1 + to.width / from.width) / 2 + 0.05})`, offset: 0.5 },
        { transform: `translate(${dx}px, ${dy}px) rotate(${plan.tilt}deg) scale(${to.width / from.width})` },
      ],
      { duration: 560, easing: "cubic-bezier(0.45, 0, 0.3, 1)", fill: "forwards" }
    );
    anim.onfinish = done;
    return () => anim.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <img
      ref={ref}
      className={styles.flight}
      src={plan.src}
      alt=""
      aria-hidden
      style={{ left: plan.from.left, top: plan.from.top, width: plan.from.width, height: plan.from.height }}
    />
  );
};

// a pile of point tokens: a rainbow one for each 5, a plain one for each 1 left over
const TokenStack = ({ count }: { count: number }) => {
  // (at most three pieces shown, so the pile keeps its size: the number says the rest)
  const fives = Math.min(3, Math.floor(count / 5));
  const ones = Math.min(3 - fives, count % 5);
  return (
    <span className={styles.tokenStack} aria-label={`${count} point${count === 1 ? "" : "s"} in tokens`}>
      {Array.from({ length: fives }, (_, i) => (
        <img key={`f${i}`} src={art.token5} alt="" />
      ))}
      {Array.from({ length: ones }, (_, i) => (
        <img key={`o${i}`} src={art.token} alt="" />
      ))}
      {count === 0 && <img className={styles.tokenNone} src={art.token} alt="" />}
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
  const [remoteOpen, setRemoteOpen] = useState(false);
  // a button just pressed on the R.E.M.O.T.E., by anyone: shown to everyone for a moment
  const [remoteShown, setRemoteShown] = useState<RemoteButton | null>(null);
  const lastRemote = useRef(game.remote?.id ?? null);
  useEffect(() => {
    const r = game.remote;
    if (!r || r.id === lastRemote.current) return;
    lastRemote.current = r.id;
    setRemoteShown(r.button);
    play("deal");
    const t = setTimeout(() => setRemoteShown(null), 5000);
    return () => clearTimeout(t);
  }, [game.remote]);
  const [cloth, setCloth] = useState<Cloth>(readCloth);
  const [picking, setPicking] = useState(false);
  const [phoneTab, setPhoneTab] = useState<"clock" | "log">("clock");
  // the newest log entry seen on the phone (a dot on the tab when there's something newer)
  const [seenLog, setSeenLog] = useState<string | null>(null);
  const clockTime = useWallClock();
  const pickCloth = (c: Cloth) => {
    if (c !== cloth) play("whoosh");
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
  // the decks, the face-up slots and the play area on the screen, for cards moving between them
  const stackRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const playCardsRef = useRef<HTMLSpanElement>(null);
  const [flights, setFlights] = useState<FlightPlan[]>([]);
  // time's up, across the whole screen for a moment
  const [timeUp, setTimeUp] = useState<{ episode: number; points: number } | null>(null);
  const lastPhase = useRef(game.phase);
  // then: did you play one of your traits this episode?
  const [traitPick, setTraitPick] = useState(false);
  const endTimeUp = () => {
    setTimeUp(null);
    const hand = game.hands[me];
    if (game.phase === "break" && hand && hand.traits.some((t) => t.done === null) && !hand.traits.some((t) => t.done === game.episode))
      setTraitPick(true);
  };
  useEffect(() => {
    if (game.phase === "break" && lastPhase.current === "playing") {
      const e = game.episodes[game.episode - 1];
      setTimeUp({ episode: game.episode, points: e.completed.reduce((n, c) => n + DIRECTION_POINTS[c.deck] + c.tokens, 0) });
    }
    lastPhase.current = game.phase;
  }, [game.phase, game.episode, game.episodes]);
  const inFlight = useMemo(() => new Set(flights.map((f) => f.id)), [flights]);
  // (cards on the table when it first opens are just there: only cards dealt after come from a deck)
  const [dealing, setDealing] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDealing(true), 50);
    return () => clearTimeout(t);
  }, []);
  // the face-up cards as they were, to tell which slot a completed card came from
  const lastFaceUp = useRef(game.faceUp);

  const unread = phoneTab !== "log" && game.log.length > 0 && game.log[0].id !== seenLog;
  useEffect(() => {
    if (phoneTab === "log") setSeenLog(game.log[0]?.id ?? null);
  }, [phoneTab, game.log]);
  const ep = game.episodes[game.episode - 1];
  // a callback just made on an earlier episode: its card bounces, a token drops on, +1 rises
  const [callbackBumps, setCallbackBumps] = useState<Record<number, number>>({});
  const lastCallbacks = useRef(game.episodes.map((e) => e.tokens));
  useEffect(() => {
    const now = game.episodes.map((e) => e.tokens);
    now.forEach((n, i) => {
      if (n > (lastCallbacks.current[i] ?? 0) && i < game.episode - 1) setCallbackBumps((b) => ({ ...b, [i]: (b[i] ?? 0) + 1 }));
    });
    lastCallbacks.current = now;
  }, [game.episodes, game.episode]);
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
        // the card flies from its slot to where it lands in the play area
        const slotEl = slotRefs.current[`${c.deck}-${f.slot}`];
        const area = playCardsRef.current;
        if (slotEl && area && !reducedMotion()) {
          const from = slotEl.getBoundingClientRect();
          const a = area.getBoundingClientRect();
          const at = landing(c.id);
          const w = a.width * 0.46;
          const to = { left: a.left + (a.width * at.x) / 100, top: a.top + (a.height * at.y) / 100, width: w, height: (w * 497) / 768 };
          const plan = { id: c.id, src: art.direction(c.deck, c.i), from: { left: from.left, top: from.top, width: from.width, height: from.height }, to, tilt: at.tilt };
          setFlights((all) => [...all, plan]);
        }
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
            <PlayArea cards={ep.completed} points={epPoints} open={() => setPlayedOpen(true)} hidden={inFlight} areaRef={playCardsRef} />
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
                  <div ref={(el) => {
                      stackRefs.current[deck] = el;
                    }} className={styles.stack} aria-label={`${game.left[deck]} cards left`}>
                    <img src={art.directionBack(deck)} alt="" width="768" height="497" />
                    <span className={styles.stackCount}>{game.left[deck]}</span>
                  </div>
                  {game.faceUp[deck].map((card, slot) => (
                    <div key={slot} ref={(el) => {
                        slotRefs.current[`${deck}-${slot}`] = el;
                      }} className={styles.slot}>
                      {card === null ? (
                        <span className={styles.slotEmpty} />
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
                          <FlipCard
                            front={art.direction(deck, card)}
                            back={art.directionBack(deck)}
                            alt=""
                            width={768}
                            height={497}
                            from={dealing ? stackRefs.current[deck] : null}
                          />
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
                      <button type="button" className={styles.clothButton} onClick={() => setPicking(true)} aria-label="Settings" title="Settings">
                        <svg viewBox="0 0 24 24" aria-hidden>
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
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
                  const bumped = callbackBumps[i] ?? 0;
                  return past ? (
                    <div key={i} className={styles.pastSlot}>
                      <button
                        key={bumped}
                        type="button"
                        className={`${styles.past}${bumped ? ` ${styles.pastBump}` : ""}`}
                        style={{ "--tilt": tilt(past.card) } as CSSProperties}
                        onClick={() => send({ t: "token", on: "episode", episode: i + 1, add: true })}
                        aria-label={`Callback to episode ${i + 1}, ${name("episode", past.card)}: +1 (${past.tokens} so far)`}
                      >
                        <img src={art.episode(past.card)} alt="" width="768" height="549" />
                        {bumped > 0 && (
                          <>
                            <img className={styles.tokenDrop} src={past.tokens % 5 === 0 ? art.token5 : art.token} alt="" aria-hidden />
                            <span className={styles.callbackPlus} aria-hidden>
                              +1
                            </span>
                          </>
                        )}
                      </button>
                      <div className={styles.pastCount}>
                        <span key={`n${bumped}`} className={`${styles.pastTokensLine}${bumped ? ` ${styles.countPop}` : ""}`}>
                          <TokenStack count={past.tokens} />
                          <b>{past.tokens > 0 ? past.tokens : ""}</b>
                        </span>
                        <MinusButton
                          disabled={past.tokens === 0}
                          onMinus={() => send({ t: "token", on: "episode", episode: i + 1, add: false })}
                          label={`Take a callback token off episode ${i + 1}`}
                        />
                      </div>
                    </div>
                  ) : (
                    <span key={i} className={styles.pastEmpty} aria-hidden />
                  );
                })}
              </div>
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


      {zoom && (
        <Modal onClose={() => setZoom(null)} panelClassName={`${modalStyles.panel} ${styles.zoomPanel}`} ariaLabel={name("character", zoom.character)}>
          <h2 className={modalStyles.title}>{name("character", zoom.character) || zoom.player.name}</h2>

          <div className={styles.zoomCards}>
            <img src={art.character(zoom.character)} alt="" width="768" height="444" />
            <img src={art.characterBack(zoom.character)} alt={`${name("character", zoom.character)}: details`} width="768" height="444" />
          </div>
        </Modal>
      )}
      <button type="button" className={styles.remoteOnTable} onClick={() => setRemoteOpen(true)} aria-label="The R.E.M.O.T.E. (safety tool)" title="R.E.M.O.T.E.">
        <span className={styles.remoteDots} aria-hidden>
          {REMOTE_BUTTONS.map((b) => (
            <i key={b} style={{ background: REMOTE[b].color }} />
          ))}
        </span>
      </button>
      {timeUp && (
        <div className={styles.timeUp} onClick={endTimeUp} role="alert" onAnimationEnd={(e) => e.animationName.includes("timeUpOut") && endTimeUp()}>
          <div className={styles.timeUpCard}>
            <span className={styles.timeUpClock} aria-hidden>
              ⏰
            </span>
            <h2 className={styles.timeUpTitle}>Time’s up!</h2>
            <span className={styles.timeUpPoints}>
              Episode {timeUp.episode}: +{timeUp.points}
            </span>
          </div>
        </div>
      )}
      {traitPick && game.hands[me] && (
        <Modal onClose={() => setTraitPick(false)} panelClassName={`${modalStyles.panel} ${styles.traitPanel}`} ariaLabel="Your traits">
          <h2 className={modalStyles.title}>Did you play a trait?</h2>
          <div className={styles.traitPick}>
            {game.hands[me].traits.map((t, slot) =>
              t.done === null ? (
                <button
                  key={t.kind}
                  type="button"
                  className={styles.traitPickCard}
                  onClick={() => {
                    send({ t: "trait", player: me, slot });
                    setTraitPick(false);
                  }}
                  aria-label={name(t.kind, t.i) || `${t.kind} trait`}
                >
                  <img src={art.trait(t.kind, t.i)} alt="" width="768" height="219" />
                </button>
              ) : (
                <span key={t.kind} className={`${styles.traitPickCard} ${styles.traitPickDone}`}>
                  <img src={art.trait(t.kind, t.i)} alt="" width="768" height="219" />
                  <span className={styles.traitStamp}>✓ Ep {t.done}</span>
                </span>
              )
            )}
          </div>
          <div className={modalStyles.actions}>
            <DefaultButton onClick={() => setTraitPick(false)} text="Not this time" variant="secondary" border="dark" />
          </div>
        </Modal>
      )}
      {flights.map((f) => (
        <Flight key={f.id} plan={f} done={() => setFlights((all) => all.filter((x) => x.id !== f.id))} />
      ))}
      {rules && <RulesDialog close={() => setRules(false)} />}
      {remoteOpen && <RemoteDialog press={(button) => send({ t: "remote", button })} close={() => setRemoteOpen(false)} />}
      {remoteShown && (
        <div className={styles.remoteShown} role="alert" onClick={() => setRemoteShown(null)} style={{ "--c": REMOTE[remoteShown].color } as CSSProperties}>
          <span className={styles.remoteKey}>
            <RemoteIcon d={REMOTE[remoteShown].icon} stroke={remoteShown === "replay"} />
          </span>
          <span>
            <b>{REMOTE[remoteShown].label}</b>
            {REMOTE[remoteShown].text}
          </span>
        </div>
      )}
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
        <Modal onClose={() => setPicking(false)} panelClassName={`${modalStyles.panel} ${styles.settingsPanel}`} ariaLabel="Settings">
          <h2 className={modalStyles.title}>Settings</h2>
          <h3 className={styles.settingsHead}>Tablecloth</h3>

          <div className={styles.clothGrid}>
            {CLOTHS.map((c) => (
              <button key={c.id} type="button" className={styles.clothSwatch} aria-pressed={cloth === c.id} onClick={() => pickCloth(c.id)}>
                <span className={`${styles.tabletop}${clothClass(c.id)}`} aria-hidden />
                <span>{c.name}</span>
              </button>
            ))}
          </div>
          <div className={`${modalStyles.actions} ${styles.settingsActions}`}>
            {isHost && (
              <DefaultButton
                onClick={() => {
                  setPicking(false);
                  setEnding(true);
                }}
                text="End the game"
                variant="secondary"
                border="dark"
              />
            )}
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

// The R.E.M.O.T.E. (the rulebook's safety tool, after Script Change by Beau Jágr Sheldon): a tap on a
// button, shown to everyone without who pressed it, and everyone goes along with it, no fuss
const REMOTE: Record<RemoteButton, { label: string; text: string; color: string; icon: string }> = {
  pause: { label: "Pause", text: "Let’s stop for a moment and talk.", color: "#e05a5a", icon: "M7 5h3v14H7zM14 5h3v14h-3z" },
  play: { label: "Play", text: "All good, carry on.", color: "#4f7fd1", icon: "M8 5l11 7-11 7z" },
  rewind: { label: "Rewind", text: "Let’s take that last bit back and redo it.", color: "#e0962f", icon: "M11 6v12L3 12zM20 6v12l-8-6z" },
  forward: { label: "Fast-forward", text: "Let’s skip past this and move on.", color: "#4f9a5a", icon: "M4 6v12l8-6zM13 6v12l8-6z" },
  replay: { label: "Instant replay", text: "That was great: more of that, please!", color: "#9a5fc0", icon: "M12 5a7 7 0 1 1-6.6 4.7M5 4v5h5" },
  frame: { label: "Frame by frame", text: "Let’s slow down and go gently here.", color: "#e06a3a", icon: "M6 5h2v14H6zM11 5l9 7-9 7z" },
};

const RemoteIcon = ({ d, stroke }: { d: string; stroke?: boolean }) => (
  <svg viewBox="0 0 24 24" aria-hidden>
    <path d={d} fill={stroke ? "none" : "currentColor"} stroke={stroke ? "currentColor" : "none"} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RemoteDialog = ({ press, close }: { press: (b: RemoteButton) => void; close: () => void }) => (
  <Modal onClose={close} panelClassName={`${modalStyles.panel} ${styles.remotePanel}`} ariaLabel="The R.E.M.O.T.E.">
    <h2 className={modalStyles.title}>The R.E.M.O.T.E.</h2>
    <p className={modalStyles.text}>Everyone sees the button, not who pressed it.</p>
    <div className={styles.remoteGrid}>
      {REMOTE_BUTTONS.map((b) => (
        <button
          key={b}
          type="button"
          className={styles.remoteButton}
          style={{ "--c": REMOTE[b].color } as CSSProperties}
          onClick={() => {
            press(b);
            close();
          }}
        >
          <span className={styles.remoteKey}>
            <RemoteIcon d={REMOTE[b].icon} stroke={b === "replay"} />
          </span>
          {REMOTE[b].label}
        </button>
      ))}
    </div>
  </Modal>
);

// pressing and holding: once at once, then again and again, faster
const useHold = (action: () => void) => {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const act = useRef(action);
  act.current = action;
  const stop = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  useEffect(() => stop, [stop]);
  const start = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    stop();
    act.current();
    let delay = 380;
    const again = () => {
      act.current();
      delay = Math.max(60, delay * 0.75);
      timer.current = setTimeout(again, delay);
    };
    timer.current = setTimeout(again, delay);
  };
  return {
    onPointerDown: start,
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
    // (a key press, or a click with no pointer: once)
    onClick: (e: React.MouseEvent) => e.detail === 0 && act.current(),
  };
};

const MinusButton = ({ disabled, onMinus, label }: { disabled: boolean; onMinus: () => void; label: string }) => {
  const hold = useHold(onMinus);
  return (
    <button type="button" className={styles.minus} disabled={disabled} aria-label={label} {...hold}>
      −
    </button>
  );
};

type Played = GameView["episodes"][number]["completed"];

// The play area: the cards completed this episode, dropped one over the other in a space that never
// grows (the newest on top, the oldest gone past eight). It's one thing to tap: it opens the list of
// them all.
const PlayArea = ({
  cards,
  points,
  open,
  hidden,
  areaRef,
}: {
  cards: Played;
  points: number;
  open: () => void;
  hidden: Set<string>;
  areaRef: React.RefObject<HTMLSpanElement | null>;
}) => {
  const shown = cards.slice(-8);
  return (
    <button
      type="button"
      className={styles.playArea}
      onClick={open}
      aria-label={`Played this episode: ${cards.length} card${cards.length === 1 ? "" : "s"}, +${points}. See them all`}
    >
      <span ref={areaRef} className={styles.playCards} aria-hidden>
        {shown.map((c) => {
          // (where a card lands comes from the card itself, so it stays put as others come and go)
          const at = landing(c.id);
          return (
            <img
              key={c.id}
              src={art.direction(c.deck, c.i)}
              alt=""
              style={
                {
                  "--x": `${at.x}%`,
                  "--y": `${at.y}%`,
                  "--tilt": `${at.tilt}deg`,
                  visibility: hidden.has(c.id) ? "hidden" : undefined,
                } as CSSProperties
              }
            />
          );
        })}
      </span>
      {cards.length > 0 && (
        <span className={styles.playLabel}>
          <b>+{points}</b> · {cards.length}
        </span>
      )}
    </button>
  );
};


const PAGE = 6;

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
      <h2 className={`${modalStyles.title} ${styles.playedTitle}`}>
        Episode {episode} <b>+{points}</b>
      </h2>
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
        <ul className={styles.playedGrid}>
          {shown.map((c) => (
            <li key={c.id}>
              <img src={art.direction(c.deck, c.i)} alt={name(c.deck, c.i)} width="768" height="497" />
              <div className={styles.playedMeta}>
                <span>
                  <b>+{DIRECTION_POINTS[c.deck] + c.tokens}</b> {nameOf(c.by)}
                </span>
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
        <b>Introduce yourselves,</b> oldest character first, then start the clock.
      </>
    );
  else if (game.phase === "ready")
    text = (
      <>
        <b>Episode {game.episode} is next.</b> Swap any cards you don’t want, then start the clock.
      </>
    );
  else if (game.phase === "break")
    text = (
      <>
        <b>Episode {game.episode} done, +{epPoints}.</b> Tap any traits you played, then go on.
      </>
    );
  if (!text) return null;
  return (
    <div className={styles.prompt} role="status">
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
      <p className={styles.finaleKicker}>{game.outOfCards ? "Out of direction cards · the ratings are in" : "Season finale · the ratings are in"}</p>
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
