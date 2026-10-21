import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import {
  DIRECTION_DECKS,
  DIRECTION_POINTS,
  EPISODES,
  EPISODE_SECONDS,
  REMOTE_BUTTONS,
  arcDone,
  score,
  type ChatLine,
  type ClientMessage,
  type CompletedCard,
  type LogEntry,
  type DirectionDeck,
  type GameView,
  type RemoteButton,
  type Player,
  type RoomView,
  type TraitKind,
} from "../../../game-server/src/protocol";
import DefaultButton from "../utils/DefaultButton";
import Icon from "../utils/Icons";
import { sized } from "../utils/imageCopies";
import Modal from "../utils/Modal";
import useDialogFocus from "../utils/useDialogFocus";
import initial from "../../utils/initial";
import announce from "../../utils/announce";
import CardViewer from "../utils/CardViewer";
import CharacterDetails from "../Characters/CharacterDetails";
import { CHARACTER_CARD_MM } from "../Characters/characterCardFaces";
import { getAllCharacters } from "../Characters/Characters";
import { ChatBubble, ChatInput, ChatTips, RemoveWatcher, useChatPops } from "./Chat";
import Confirm from "./Confirm";
import Finale from "./Finale";
import { DISCORD_URL, watchingLabel } from "./gameServer";
import { openRulebook, rulebookOpensAt } from "./Rulebook";
import { isMuted, play, setMuted } from "./sounds";
import { useOffline } from "./useRoom";
import modalStyles from "../../css/utils/modal.module.css";
import styles from "../../css/pages/gameTable.module.css";
import chatStyles from "../../css/pages/chat.module.css";
import { local } from "../../utils/safeStorage";

// The table (once the host starts the show), laid out like the real thing on a kitchen table: the
// three direction decks with their face-up cards, the episode card with the cards completed in it,
// a phone with the clock, earlier episodes for callbacks, a sticky note of what's happened, and
// everyone's seat (their character and traits, face up). Cards never move when they're tapped: a new
// one flips over where the last one lay. Between episodes, the wrap; after the fourth, the ratings.

const CAST = getAllCharacters();

export const PLAYER_COLORS = ["#d81e18", "#5f5aa2", "#4f8a73", "#e0a91b", "#3d7fb8", "#d9652b"];

const nn = (i: number) => String(i + 1).padStart(2, "0");
const art = {
  character: (i: number) => `/images/pieces/characters/${nn(i)}.webp`,
  characterBack: (i: number) => `/images/pieces/characters/${nn(i)}-back.webp`,
  episode: (i: number) => `/images/pieces/episodes/${nn(i)}.webp`,
  direction: (deck: DirectionDeck, i: number) => `/images/pieces/${deck}/${nn(i)}.webp`,
  // (the backs only ever show at a deck's size on the table: the 480px copy)
  directionBack: (deck: DirectionDeck) => sized(`/images/pieces/${deck}/back.webp`, 480),
  trait: (kind: TraitKind, i: number) => `/images/pieces/${kind}-traits/${nn(i)}.webp`,
  episodeBack: "/images/pieces/episodes/back.webp",
  // the point tokens: one side's worth 1, the other (the rainbow) 5
  token: "/images/pieces/box/token-front.webp",
  token5: "/images/pieces/box/token-back.webp",
};

// the card backs, fetched as the table opens, so a new card can always show its back at once
export const preloadBacks = () => {
  for (const src of [art.episodeBack, ...["director", "producer", "showrunner"].map((d) => art.directionBack(d as DirectionDeck))]) {
    const img = new Image();
    img.src = src;
  }
};

// everything the table shows as it opens: fetched behind the loading screen, so the table appears
// whole rather than as a pile of blank cards filling in (never more than a few seconds' wait)
const useTableLoaded = (game: GameView) => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const ep = game.episodes[game.episode - 1];
    const srcs = new Set<string>([
      art.episodeBack,
      art.token,
      art.token5,
      "/images/pieces/remote/slate.webp",
      ...(ep ? [art.episode(ep.card)] : []),
      ...DIRECTION_DECKS.flatMap((d) => [art.directionBack(d), ...game.faceUp[d].filter((c): c is number => c !== null).map((c) => art.direction(d, c))]),
      ...Object.values(game.hands).flatMap((h) => [art.character(h.character), ...h.traits.map((t) => art.trait(t.kind, t.i))]),
    ]);
    const one = (src: string) =>
      new Promise<void>((done) => {
        const img = new Image();
        img.onload = img.onerror = () => done();
        img.src = src;
      });
    const enough = new Promise((r) => setTimeout(r, 6000));
    let live = true;
    Promise.race([Promise.all([...srcs].map(one)), enough]).then(() => live && setLoaded(true));
    return () => {
      live = false;
    };
    // (once, as the table opens)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return loaded;
};

// the loading screen: the deck's backs shuffling over the tablecloth
// the curtains: closed for at least one whole shuffle of the deck between them, however quickly
// what's behind them is `ready`; then they sweep open, all the way, and go
const CURTAIN_CLOSED_MS = 1500; // (the shuffle's length: gameTable.module.css .loadingCard)
const CURTAIN_OPEN_MS = 1300; // (the curtains' and the pelmet's sweep, and a beat)
export const useCurtain = (ready: boolean) => {
  const [since] = useState(Date.now);
  const [stage, setStage] = useState<"closed" | "opening" | "gone">("closed");
  useEffect(() => {
    if (!ready || stage === "gone") return;
    const t =
      stage === "closed"
        ? setTimeout(() => setStage("opening"), Math.max(0, since + CURTAIN_CLOSED_MS - Date.now()))
        : setTimeout(() => setStage("gone"), CURTAIN_OPEN_MS);
    return () => clearTimeout(t);
  }, [ready, stage, since]);
  return stage;
};

// the loading screen: the stage's curtains drawn, the deck's backs shuffling in the spotlight between
// them; once the table's in, the curtains sweep open on it
export const Loading = ({ out }: { out: boolean }) => {
  useEffect(() => {
    if (out) play("curtain");
  }, [out]);
  return (
  <div className={`${styles.loading}${out ? ` ${styles.loadingOut}` : ""}`} role="status" aria-label="Setting the table">
    <span className={`${styles.curtain} ${styles.curtainLeft}`} aria-hidden />
    <span className={`${styles.curtain} ${styles.curtainRight}`} aria-hidden />
    <span className={styles.valance} aria-hidden />
    <div className={styles.loadingDeck} aria-hidden>
      {(["director", "producer", "showrunner"] as DirectionDeck[]).map((d, i) => (
        // (a plain back in the deck's colour, until its picture's in: it never shows half-loaded)
        <span key={d} className={`${styles.loadingCard} ${styles[d]}`} style={{ "--i": i } as CSSProperties}>
          <img src={art.directionBack(d)} alt="" onLoad={(e) => e.currentTarget.classList.add(styles.loadingIn)} />
        </span>
      ))}
    </div>
    <span className={styles.loadingWord}>Setting the table</span>
  </div>
  );
};

// a number that counts its way up (or down) to where it's going, and pops as it gets there
const CountUp = ({ value, className }: { value: number; className?: string }) => {
  const [shown, setShown] = useState(value);
  const [pop, setPop] = useState(0);
  const from = useRef(value);
  useEffect(() => {
    const start = from.current;
    if (start === value) return;
    from.current = value;
    if (reducedMotion()) return setShown(value);
    const t0 = performance.now(), ms = Math.min(700, 120 * Math.abs(value - start) + 200);
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      setShown(Math.round(start + (value - start) * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
      else setPop((p) => p + 1);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <b key={pop} className={`${className ?? ""}${pop ? ` ${styles.scorePop}` : ""}`}>
      {shown}
    </b>
  );
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
  tilt = 0,
  wait = 220,
}: {
  front: string;
  back: string;
  alt: string;
  width: number;
  height: number;
  from?: HTMLElement | null;
  tilt?: number; // (the angle it lies at, in degrees: it leaves the deck square, and settles to it)
  wait?: number; // (how long it stays on the deck before it's dealt, in ms)
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
    // (from exactly where the deck's top card lies, at its angle: it lifts off the top of the pile)
    const top = from.querySelector("img") ?? from;
    const a = top.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    const deckTilt = parseFloat(getComputedStyle(top).getPropertyValue("--tilt")) || 0;
    // (till it goes, it's not there: the deck's own top card is)
    el.style.visibility = "hidden";
    const show = setTimeout(() => (el.style.visibility = ""), wait);
    const anim = el.animate(
      [
        { transform: `translate(${a.left + a.width / 2 - (b.left + b.width / 2)}px, ${a.top + a.height / 2 - (b.top + b.height / 2)}px) rotate(${deckTilt - tilt}deg) scale(${a.width / b.width})` },
        { transform: "none" },
      ],
      { duration: 420, delay: wait, easing: "cubic-bezier(0.25, 0.8, 0.3, 1)", fill: "backwards" }
    );
    anim.onfinish = () => setDealt(true);
    return () => {
      clearTimeout(show);
      el.style.visibility = "";
      anim.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <span ref={dealer} className={styles.dealer} data-dealing={loaded && dealt ? undefined : ""}>
      <span className={`${styles.flipper}${loaded && dealt ? ` ${styles.flipped}` : ""}`}>
        <img ref={ref} className={styles.face} src={front} alt={alt} width={width} height={height} onLoad={() => setLoaded(true)} />
        <img className={`${styles.face} ${styles.faceBack}`} src={back} alt="" width={width} height={height} aria-hidden />
      </span>
    </span>
  );
};

// (a swap: how long the new card waits on the deck, while the old one goes back into it)
const SWAP_WAIT = 600;

// where a played card lands in the play area: from the card itself, so it stays put
const landing = (id: string) => {
  const h = hash(id);
  return { x: (h % 46) + 4, y: ((h >> 6) % 38) + 14, tilt: ((h >> 12) % 24) - 12 };
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
  away?: boolean; // (into the deck: it goes as it gets there)
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
        { transform: `translate(${dx}px, ${dy}px) rotate(${plan.tilt}deg) scale(${to.width / from.width})`, ...(plan.away ? { opacity: 0 } : {}) },
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
  const c = local.get(CLOTH_KEY);
  return CLOTHS.some((x) => x.id === c) ? (c as Cloth) : "blue";
};
const clothClass = (c: Cloth) => (c === "blue" ? "" : ` ${styles[`cloth-${c}`]}`);

const DECK_LABEL: Record<DirectionDeck, string> = { director: "Director", producer: "Producer", showrunner: "Showrunner" };
const pts = (n: number) => `${n} point${n === 1 ? "" : "s"}`;

// the phone's apps, along its dock
type PhoneApp = "clock" | "log" | "remote";
const PHONE_APPS: { id: PhoneApp; label: string; icon: React.ReactNode }[] = [
  {
    id: "clock",
    label: "Timer",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2.5 2.5M9.5 2.5h5" />
      </svg>
    ),
  },
  {
    id: "log",
    label: "Chat",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden>
        <path d="M4 5h16v11H8l-4 4z" />
        <path d="M8 9h8M8 12h5" />
      </svg>
    ),
  },
  {
    id: "remote",
    label: "Remote",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden>
        <rect x="7" y="2.5" width="10" height="19" rx="3" />
        <path d="M10 7h.01M14 7h.01M10 11h.01M14 11h.01M10 15h.01M14 15h.01" strokeWidth="3" />
      </svg>
    ),
  },
];
// (where the table's laid out as on a phone: the phone a strip along the top; as in gameTable.module.css)
const PHONE_LAYOUT = "(max-width: 1100px), (max-height: 500px)";

// each card lies a little askew, always the same way (so nothing shifts when the table changes)
const tiltDeg = (seed: number) => (((seed * 37) % 7) - 3) * 0.6;
const tilt = (seed: number) => `${tiltDeg(seed)}deg`;

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

export const useNames = () => {
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
  // (the time now, not as it was at the last tick: the clock that's just started reads right at once)
  void now;
  const at = Date.now() + offset;
  const left =
    game.endsAt !== null
      ? Math.max(0, game.endsAt - at)
      : game.pausedLeft !== null
        ? game.pausedLeft
        : game.phase === "ready"
          ? EPISODE_SECONDS * 1000
          : 0;
  const seconds = Math.ceil(left / 1000);
  const lastTick = useRef(seconds);
  useEffect(() => {
    if (game.endsAt !== null && seconds !== lastTick.current && seconds > 0 && seconds <= 10) play(seconds <= 3 ? "countdown" : "tick");
    lastTick.current = seconds;
  }, [seconds, game.endsAt]);
  return left;
};

// the time of day, for the phone's status bar
const useWallClock = () => {
  const fmt = () => new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
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

// the phone's clock: the episode (or time's up, or paused), the time left, and its bar. The only part
// of the table that ticks (four times a second while the clock runs): nothing else is redrawn for it
const PhoneClock = ({ game, serverNow }: { game: GameView; serverNow: number }) => {
  const left = useClock(game, serverNow);
  const ticking = game.phase === "playing" && game.endsAt !== null;
  const paused = game.phase === "playing" && game.pausedLeft !== null;
  return (
    <>
      <span className={styles.phoneLabel}>{game.phase === "break" ? "Time’s up!" : paused ? "Paused" : `Episode ${game.episode} of ${EPISODES}`}</span>
      <span className={`${styles.phoneTime}${ticking && left < 10_000 ? ` ${styles.phoneLow}` : ""}`}>{mmss(left)}</span>
      <span className={styles.phoneTrack}>
        <span style={{ transform: `scaleX(${left / (EPISODE_SECONDS * 1000)})` }} />
      </span>
    </>
  );
};

// the sounds for whatever just changed at the table, whoever did it
const useTableSounds = (game: GameView) => {
  const before = useRef<GameView | null>(null);
  useEffect(() => {
    const was = before.current;
    before.current = game;
    if (!was) return;
    const done = (g: GameView) => g.episodes.reduce((n, e) => n + e.completed.length, 0);
    const tokens = (g: GameView) => g.episodes.reduce((n, e) => n + e.tokens, 0);
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
    // (a card changed with none completed: before an episode, that's a swap)
    if (JSON.stringify(game.faceUp) !== JSON.stringify(was.faceUp)) play(game.phase === "ready" ? "swap" : "deal");
  }, [game]);
};

interface TableProps {
  room: RoomView;
  me: string;
  isHost: boolean;
  send: (msg: ClientMessage) => void;
  chat: ChatLine[];
  chatSlow: number; // (when a line was last turned back for coming too fast)
  leave: () => void; // (out of the show: a spectator, or anyone once the ratings are in)
}

const GameTable = ({ room, me, isHost, send, chat, chatSlow, leave }: TableProps) => {
  const game = room.game!;
  const name = useNames();
  useTableSounds(game);
  useEffect(preloadBacks, []);
  // (while the game's on, the rulebook opens on the game's rules)
  useEffect(() => {
    rulebookOpensAt("rules");
    return () => void rulebookOpensAt(null);
  }, []);
  const curtain = useCurtain(useTableLoaded(game));
  const loadingGone = curtain === "gone";
  const [muted, setMutedState] = useState(isMuted);
  const [ending, setEnding] = useState(false);
  // a button just pressed on the R.E.M.O.T.E., by anyone: shown to everyone for a moment
  const [remoteShown, setRemoteShown] = useState<RemoteButton | null>(null);
  const lastRemote = useRef(game.remote?.id ?? null);
  useEffect(() => {
    const r = game.remote;
    if (!r || r.id === lastRemote.current) return;
    lastRemote.current = r.id;
    setRemoteShown(r.button);
    play("remote");
    const t = setTimeout(() => setRemoteShown(null), 5000);
    return () => clearTimeout(t);
  }, [game.remote]);
  const [cloth, setCloth] = useState<Cloth>(readCloth);
  const [picking, setPicking] = useState(false);
  const [phoneTab, setPhoneTab] = useState<PhoneApp>("clock");
  // the phone picked up off the table: big, in the middle of the screen, for reading the chat
  const [held, setHeld] = useState(false);
  // (picked up, put down: a sound for each)
  const wasHeld = useRef(held);
  useEffect(() => {
    if (held !== wasHeld.current) play(held ? "pickUp" : "putDown");
    wasHeld.current = held;
  }, [held]);
  // an app on the phone; on a phone-sized screen, where the phone's a slim strip, the chat holds the
  // phone up (so there's room to read it)
  const openApp = (app: PhoneApp) => {
    setPhoneTab(app);
    if (app === "log" && matchMedia(PHONE_LAYOUT).matches) setHeld(true);
  };
  const onTabKey = (e: React.KeyboardEvent) => {
    const at = PHONE_APPS.findIndex((a) => a.id === phoneTab);
    const to = e.key === "ArrowRight" ? at + 1 : e.key === "ArrowLeft" ? at - 1 : e.key === "Home" ? 0 : e.key === "End" ? PHONE_APPS.length - 1 : null;
    if (to === null) return;
    e.preventDefault();
    const app = PHONE_APPS[(to + PHONE_APPS.length) % PHONE_APPS.length].id;
    setPhoneTab(app);
    document.getElementById(`phone-tab-${app}`)?.focus();
  };
  // the chat and what's happened, one feed on the phone, oldest first
  const feed = useMemo(
    () =>
      [...game.log.map((entry) => ({ kind: "log" as const, at: entry.at, id: entry.id, entry })), ...chat.map((line) => ({ kind: "chat" as const, at: line.at, id: line.id, line }))].sort(
        (a, b) => a.at - b.at,
      ),
    [game.log, chat],
  );
  useChatPops(chat, me);
  const [removing, setRemoving] = useState<ChatLine | null>(null);
  // the newest thing seen on the phone (a dot on the tab when there's something newer, not your own)
  const [seenAt, setSeenAt] = useState(() => room.now);
  const latestAt = feed.length ? feed[feed.length - 1].at : 0;
  const feedList = useRef<HTMLOListElement>(null);
  const clockTime = useWallClock();
  const pickCloth = (c: Cloth) => {
    if (c !== cloth) play("whoosh");
    setCloth(c);
    local.set(CLOTH_KEY, c);
  };
  const [zoom, setZoom] = useState<{ player: Player; character: number } | null>(null);
  const [playedOpen, setPlayedOpen] = useState(false);
  // the "+2" that rises off a card when someone completes it
  const [floaters, setFloaters] = useState<{ id: string; deck: DirectionDeck; slot: number; points: number }[]>([]);
  const seen = useRef<Set<string> | null>(null);
  const lastCompleted = useRef<CompletedCard[]>([]);
  // (the cards the log's lines are about, by the line's id)
  const logCards = useRef<Record<string, CompletedCard>>({});
  // a log line as it reads on the phone: whoever's id in it as their name, and the card named
  const logText = (entry: LogEntry) => {
    const text = entry.text.replace(/\{([^}]+)\}/g, (_, id) => nameOf(id));
    const c = logCards.current[entry.id];
    const card = c && name(c.deck, c.i);
    return card ? text.replace(` a ${c.deck} card`, ` “${card}”`) : text;
  };
  // the decks, the face-up slots and the play area on the screen, for cards moving between them
  const stackRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const playCardsRef = useRef<HTMLSpanElement>(null);
  const [flights, setFlights] = useState<FlightPlan[]>([]);
  // time's up, across the whole screen for a moment
  const [timeUp, setTimeUp] = useState<{ episode: number; points: number } | null>(null);
  const lastPhase = useRef(game.phase);
  // the phone, held up full screen: what to do now, with the one thing to press. It comes up by
  // itself at each step (before the first episode, before each one after, and once time's up),
  // once each; put down, it goes back to the table.
  const phoneRef = useRef<HTMLDivElement>(null);
  // (held up, it's a dialog: focus in it, Tab kept in it, Escape puts it down, focus back after)
  useDialogFocus(phoneRef, () => setHeld(false), { open: held });
  // (the connection's down: what's in a dialog over the table, off the table itself, is off too)
  const offline = useOffline();
  const step = `${game.phase}-${game.episode}`;
  const [coachSeen, setCoachSeen] = useState<string | null>(null);
  // (a spectator has nothing to do: no phone held up for them)
  const spectating = !game.hands[me];
  const coachOpen = !spectating && coachSeen !== step && (game.phase === "ready" || game.phase === "break") && !timeUp && loadingGone;
  const stepNow = useRef(step);
  stepNow.current = step;
  // (put down: not again until the next step; whichever step it's on as it's put down)
  const closeCoach = () => setCoachSeen(stepNow.current);
  const endTimeUp = () => setTimeUp(null);
  useEffect(() => {
    if (game.phase === "break" && lastPhase.current === "playing") {
      const e = game.episodes[game.episode - 1];
      setTimeUp({ episode: game.episode, points: e.completed.reduce((n, c) => n + DIRECTION_POINTS[c.deck], 0) });
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
  // a card done from the keyboard: once it's gone, focus goes to whatever's dealt into its slot (or
  // the play area, if nothing is), rather than off the page
  const refocus = useRef<string | null>(null);
  useLayoutEffect(() => {
    const key = refocus.current;
    if (!key) return;
    refocus.current = null;
    if (document.activeElement && document.activeElement !== document.body) return;
    (slotRefs.current[key]?.querySelector<HTMLElement>("button:not(:disabled)") ?? playCardsRef.current?.closest("button"))?.focus();
  }, [game.faceUp]);
  const complete = (deck: DirectionDeck, slot: number) => {
    // (a card done while the clock's paused starts it again)
    if (paused) send({ t: "resume" });
    send({ t: "complete", deck, slot });
  };

  const unread = phoneTab !== "log" && feed.some((i) => i.at > seenAt && !(i.kind === "chat" && i.line.by === me));
  useEffect(() => {
    if (phoneTab === "log") setSeenAt((s) => Math.max(s, latestAt));
  }, [phoneTab, latestAt]);
  // (the newest in view)
  useLayoutEffect(() => {
    const l = feedList.current;
    if (l) l.scrollTop = l.scrollHeight;
  }, [phoneTab, feed.length, held]);
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
    // a card swapped away: back it goes, into its deck (a new one's dealt in its place)
    if (seen.current && !reducedMotion()) {
      const done = new Set(ep.completed.filter((c) => !seen.current!.has(c.id)).map((c) => `${c.deck}-${c.i}`));
      for (const deck of DIRECTION_DECKS) {
        lastFaceUp.current[deck]?.forEach((was, slot) => {
          if (was === null || was === game.faceUp[deck][slot] || done.has(`${deck}-${was}`)) return;
          const slotEl = slotRefs.current[`${deck}-${slot}`];
          const stack = stackRefs.current[deck];
          if (!slotEl || !stack) return;
          const r = (el: HTMLElement) => {
            const b = el.getBoundingClientRect();
            return { left: b.left, top: b.top, width: b.width, height: b.height };
          };
          const plan = { id: `away-${deck}-${was}-${Date.now()}`, src: art.direction(deck, was), from: r(slotEl), to: r(stack), tilt: -8, away: true };
          setFlights((all) => [...all, plan]);
        });
      }
    }
    // which card each new "completed a card" (or "undid") line in the log is about: the log only says
    // which deck, the page knows which card
    if (seen.current) {
      const named = (c: CompletedCard, did: string) => {
        const line = game.log.find((l) => l.by === c.by && !logCards.current[l.id] && l.text.includes(`${did} a ${c.deck} card`));
        if (line) logCards.current[line.id] = c;
      };
      for (const c of ep.completed) if (!seen.current.has(c.id)) named(c, "completed");
      for (const c of lastCompleted.current) if (!ids.has(c.id)) named(c, "undid");
    }
    seen.current = ids;
    lastCompleted.current = ep.completed;
    lastFaceUp.current = game.faceUp;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ep.completed, game.faceUp]);

  // what's happened, and what's said, read out as it happens, whichever app the phone's on (the
  // log's own list is only on the page on the Chat app)
  const heard = useRef<Set<string> | null>(null);
  useEffect(() => {
    const ids = feed.map((i) => i.id);
    if (heard.current)
      for (const i of feed) {
        if (heard.current.has(i.id)) continue;
        if (i.kind === "log") announce(logText(i.entry));
        else if (i.line.by !== me) announce(`${i.line.name}: ${i.line.text.replace(/:([A-Za-z]+):/g, "$1")}`);
      }
    heard.current = new Set(ids);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feed]);

  // a card just swapped out of this slot (not completed): the new one waits on the deck till the old
  // one's back in it, then it's dealt (else the old one, flying in over the deck, hides it leaving)
  const swappedOut = (deck: DirectionDeck, slot: number, card: number) => {
    const was = lastFaceUp.current[deck]?.[slot];
    return was !== null && was !== undefined && was !== card && !ep.completed.some((c) => c.deck === deck && c.i === was);
  };

  const players = room.players.filter((p) => game.hands[p.id]);
  const mine = players.find((p) => p.id === me);
  const others = players.filter((p) => p.id !== me);
  const nameOf = (id: string) => room.players.find((p) => p.id === id)?.name ?? "Someone";
  const points = score(game);
  const epPoints = ep.completed.reduce((n, c) => n + DIRECTION_POINTS[c.deck], 0);
  const paused = game.phase === "playing" && game.pausedLeft !== null;

  const seatProps = { game, me, name, send, zoom: (player: Player, character: number) => setZoom({ player, character }) };

  if (game.phase === "over") {
    return (
      <div className={styles.room}>
        <div className={`${styles.tabletop}${clothClass(cloth)}`}>
          <Finale room={room} game={game} me={me} isHost={isHost} send={send} leave={leave} />
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.room}${spectating ? ` ${styles.watchOnly}` : ""}`}>
      {/* (the tooltips for the chat's emoji and badges and the watching count, wherever they are) */}
      <ChatTips />
      {!loadingGone && <Loading out={curtain === "opening"} />}
      <h1 className="visually-hidden">
        Game {room.code}: episode {game.episode} of {EPISODES}
      </h1>
      <div className={`${styles.tabletop}${clothClass(cloth)}`}>

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
                    }} className={styles.stack}>
                    <img src={art.directionBack(deck)} alt="" width="768" height="497" />
                    <span className={styles.stackCount} aria-hidden>
                      {game.left[deck]}
                    </span>
                    <span className="visually-hidden">
                      {game.left[deck]} {DECK_LABEL[deck]} card{game.left[deck] === 1 ? "" : "s"} left
                    </span>
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
                          disabled={spectating || game.phase !== "playing"}
                          onClick={(e) => {
                            // (a card still on its way out of the deck, or not turned over yet: not
                            // there to play)
                            if (e.currentTarget.querySelector("[data-dealing]")) return;
                            if (e.currentTarget === document.activeElement) refocus.current = `${deck}-${slot}`;
                            complete(deck, slot);
                          }}
                          aria-label={spectating ? `“${name(deck, card)}” (${pts(DIRECTION_POINTS[deck])})` : `Complete “${name(deck, card)}” (${pts(DIRECTION_POINTS[deck])})`}
                        >
                          <FlipCard
                            front={art.direction(deck, card)}
                            back={art.directionBack(deck)}
                            alt=""
                            width={768}
                            height={497}
                            from={dealing ? stackRefs.current[deck] : null}
                            tilt={tiltDeg(card + slot)}
                            wait={swappedOut(deck, slot, card) ? SWAP_WAIT : undefined}
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
                      {!spectating && card !== null && game.phase === "ready" && game.episode > 1 && game.left[deck] > 0 && (
                        <button type="button" className={styles.swap} onClick={() => send({ t: "discard", deck, slot })} aria-label={`Swap “${name(deck, card)}”`}>
                          <Icon name="again" strokeWidth={2.4} />
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
            {held && <div className={styles.phoneBackdrop} onClick={() => setHeld(false)} aria-hidden />}
            <div
              ref={phoneRef}
              className={`${styles.phone}${game.phase === "break" ? ` ${styles.phoneUp}` : ""}${coachOpen ? ` ${styles.phoneAway}` : ""}${held ? ` ${styles.phoneHeld}` : ""}`}
              role={held ? "dialog" : undefined}
              aria-modal={held || undefined}
              aria-label={held ? "Phone" : undefined}
            >
              <span className={styles.phoneIsland} aria-hidden />
              <div className={styles.statusBar}>
                <span aria-hidden>{clockTime}</span>
                <span className={styles.statusIcons}>
                  {(room.watching > 0 || !room.watchOpen) && <Watching room={room} />}
                  <svg viewBox="0 0 18 12" aria-hidden>
                    <rect x="0" y="8" width="3" height="4" rx="1" />
                    <rect x="5" y="5" width="3" height="7" rx="1" />
                    <rect x="10" y="2" width="3" height="10" rx="1" />
                    <rect x="15" y="0" width="3" height="12" rx="1" />
                  </svg>
                  <span className={styles.batteryLevel} aria-hidden>
                    67%
                  </span>
                  <span className={styles.battery} aria-hidden>
                    <span />
                  </span>
                </span>
              </div>

              <div className={styles.screen} role="tabpanel" id="phone-screen" aria-labelledby={`phone-tab-${phoneTab}`}>
                {phoneTab === "clock" ? (
                  <div className={styles.clockApp} role="timer" aria-live="off">
                    <PhoneClock game={game} serverNow={room.now} />
                    {spectating && (
                      <span className={styles.phoneWatching}>
                        <Icon name="eye" strokeWidth={2.2} /> You’re watching
                      </span>
                    )}
                    <div className={styles.phoneActions}>
                      {game.phase === "ready" && <DefaultButton onClick={() => send({ t: "startClock" })} text="Start" icon="play" color="red" className="tap-area" />}
                      {paused && <DefaultButton onClick={() => send({ t: "resume" })} text="Resume" icon="play" color="red" className="tap-area" />}
                      {game.phase === "break" && (
                        <DefaultButton
                          onClick={() => send({ t: "nextEpisode" })}
                          text={game.episode >= EPISODES ? "Ratings" : `Episode ${game.episode + 1}`}
                          icon={game.episode >= EPISODES ? "trophy" : "forward"}
                          color="yellow"
                          className="tap-area"
                        />
                      )}
                    </div>
                    <div className={styles.phoneFoot}>
                      <span>
                        <CountUp value={points.total} className={styles.score} /> pts
                      </span>
                      <button type="button" className={`${styles.clothButton} tap-area`} onClick={() => setHeld((h) => !h)} aria-pressed={held} aria-label="Hold the phone up" title={held ? "Put down" : "Hold"}>
                        {held ? (
                          <svg viewBox="0 0 24 24" aria-hidden>
                            <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" aria-hidden>
                            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                          </svg>
                        )}
                      </button>
                      <button type="button" className={`${styles.clothButton} tap-area`} onClick={() => setPicking(true)} aria-label="Settings" title="Settings">
                        <SettingsIcon />
                      </button>
                      <button
                        type="button"
                        className={`${styles.mute} tap-area`}
                        onClick={() => {
                          setMuted(!muted);
                          setMutedState(!muted);
                        }}
                        aria-label="Sound"
                        aria-pressed={!muted}
                        title={muted ? "Sound off" : "Sound on"}
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
                ) : phoneTab === "remote" ? (
                  <div className={styles.remoteApp}>
                    <div className={styles.logHead}>
                      <span>R.E.M.O.T.E.</span>
                      {held && (
                        <button type="button" className={`${styles.clothButton} ${styles.headHold} tap-area`} onClick={() => setHeld(false)} aria-label="Set the phone back down" title="Put down">
                          <svg viewBox="0 0 24 24" aria-hidden>
                            <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
                          </svg>
                        </button>
                      )}
                      <button type="button" className={styles.remoteInfo} onClick={() => openRulebook("remote")} aria-label="What's the R.E.M.O.T.E.? (the rulebook)" title="What's this?">
                        <Icon name="info" strokeWidth={2.4} />
                      </button>
                    </div>
                    {/* the R.E.M.O.T.E. card itself: its six painted buttons */}
                    <div className={styles.remotePad}>
                      {REMOTE_BUTTONS.map((b) => (
                        <button
                          key={b}
                          type="button"
                          disabled={spectating}
                          className={styles.remotePadKey}
                          onClick={() => send({ t: "remote", button: b })}
                          aria-label={`${REMOTE[b].label}: ${REMOTE[b].text}`}
                          title={REMOTE[b].label}
                        >
                          <img src={remoteArt(b)} alt="" draggable={false} />
                          <span>{REMOTE[b].label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={`${styles.logApp} ${chatStyles.compact}`}>
                    <div className={styles.logHead}>
                      <span>Chat</span>
                      <Watching room={room} />
                      <button type="button" className={`${styles.clothButton} ${styles.headHold} tap-area`} onClick={() => setPicking(true)} aria-label="Settings" title="Settings">
                        <SettingsIcon />
                      </button>
                      <button type="button" className={`${styles.clothButton} ${styles.headHold} tap-area`} onClick={() => setHeld((h) => !h)} aria-pressed={held} aria-label="Hold the phone up" title={held ? "Put down" : "Hold"}>
                        {held ? (
                          <svg viewBox="0 0 24 24" aria-hidden>
                            <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" aria-hidden>
                            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                          </svg>
                        )}
                      </button>

                    </div>
                    <ol ref={feedList} className={styles.logList}>
                      {feed.length === 0 && <li className={styles.logEmpty}>Say hi! 👋</li>}
                      {feed.map((i) => {
                        if (i.kind === "chat") return <ChatBubble key={i.id} line={i.line} me={me} onRemove={isHost ? setRemoving : undefined} />;
                        const who = i.entry.by && room.players.find((p) => p.id === i.entry.by);
                        return (
                          <li key={i.id} className={styles.logEntry} style={{ "--who": who ? PLAYER_COLORS[who.color % PLAYER_COLORS.length] : "#8a86c9" } as CSSProperties}>
                            <span className={styles.logDot} aria-hidden>
                              {who ? initial(who.name) : "★"}
                            </span>
                            <span>{logText(i.entry)}</span>
                          </li>
                        );
                      })}
                    </ol>
                    <ChatInput send={send} slow={chatSlow} />
                  </div>
                )}
              </div>

              <div className={styles.dock}>
                {/* the phone's apps, as tabs (the arrow keys go between them) */}
                <div className={styles.dockTabs} role="tablist" aria-label="Phone" onKeyDown={onTabKey}>
                  {PHONE_APPS.map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      role="tab"
                      id={`phone-tab-${app.id}`}
                      aria-selected={phoneTab === app.id}
                      aria-controls="phone-screen"
                      tabIndex={phoneTab === app.id ? 0 : -1}
                      className={`${phoneTab === app.id ? styles.dockOn : ""} tap-area`}
                      onClick={() => openApp(app.id)}
                    >
                      {app.icon}
                      {app.label}
                      {app.id === "log" && unread && (
                        <>
                          <span className={styles.unread} aria-hidden />
                          <span className="visually-hidden">, new messages</span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
                {/* (not an app on the phone: the rulebook, opened on the rules) */}
                <button type="button" onClick={() => openRulebook("rules")}>
                  <Icon name="rulebook" />
                  Rules
                </button>
              </div>
              <span className={styles.homeBar} aria-hidden />
            </div>

            {game.episode > 1 && (
            <section className={styles.callbacks} aria-labelledby="callbacks-title">
              <div className={styles.deckHead}>
                <h3 id="callbacks-title">Callbacks</h3>
                <span className={styles.points}>1 pt</span>
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
                        disabled={spectating}
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
                          disabled={spectating || past.tokens === 0}
                          onMinus={() => send({ t: "token", on: "episode", episode: i + 1, add: false })}
                          label={`Take a callback token off episode ${i + 1}`}
                        />
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </section>
            )}

          </aside>
          {/* #endregion */}

          {/* your own seat: in the same grid, under the episode and the decks (beside the phone's
              column, however long that gets) */}
          {mine && (
            <div className={styles.mineRow}>
              <Seat player={mine} big {...seatProps} />
            </div>
          )}
        </div>
      </div>


      {zoom && (
        <Modal onClose={() => setZoom(null)} panelClassName={`${modalStyles.panel} ${styles.zoomPanel}`} ariaLabel={name("character", zoom.character)}>
          <h2 className={`${modalStyles.title} ${styles.zoomTitle}`}>{name("character", zoom.character) || zoom.player.name}</h2>
          {/* their card in 3D, as on their page: drag to turn it, zoom in; their story and hobbies below */}
          <div className={styles.zoomCard}>
            <CardViewer
              mm={CHARACTER_CARD_MM}
              edge="gold"
              faces={async () => ({ front: art.character(zoom.character), back: art.characterBack(zoom.character) })}
              label={`${name("character", zoom.character)}'s card`}
              still={art.character(zoom.character)}
              hold
              fallback={
                <div className={styles.zoomCards}>
                  <img src={art.character(zoom.character)} alt="" width="768" height="444" />
                  <img src={art.characterBack(zoom.character)} alt={`${name("character", zoom.character)}: details`} width="768" height="444" />
                </div>
              }
            />
          </div>
          {CAST[zoom.character] && <CharacterDetails character={CAST[zoom.character]} className={styles.zoomDetails} />}
        </Modal>
      )}
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
      {coachOpen && (
        <Coach origin={phoneRef.current} onClose={closeCoach} label={game.phase === "break" ? `Episode ${game.episode} done` : `Episode ${game.episode}`}>
          {(close) =>
            game.phase === "break" ? (
              <>
                <span className={styles.coachEyebrow}>Episode {game.episode} done</span>
                <h2 className={styles.coachTitle}>
                  +{epPoints} point{epPoints === 1 ? "" : "s"}!
                </h2>
                {game.hands[me] && game.hands[me].traits.some((t) => t.done === null || t.done === game.episode) && (
                  <>
                    <p className={styles.coachText}>Did you play one of your traits? Tap&nbsp;it.</p>
                    <div className={styles.traitPick}>
                      {game.hands[me].traits.map((t, slot) =>
                        t.done === null || t.done === game.episode ? (
                          <button
                            key={t.kind}
                            type="button"
                            className={`${styles.traitPickCard}${t.done === game.episode ? ` ${styles.traitPickOn}` : ""}`}
                            disabled={offline || (t.done === null && game.hands[me].traits.some((x) => x.done === game.episode))}
                            onClick={() => send({ t: "trait", player: me, slot })}
                            aria-pressed={t.done === game.episode}
                            aria-label={name(t.kind, t.i) || `${t.kind} trait`}
                          >
                            <img src={art.trait(t.kind, t.i)} alt="" width="768" height="219" />
                            {t.done === game.episode && <span className={styles.traitStamp}>✓ Ep {t.done}</span>}
                          </button>
                        ) : null
                      )}
                    </div>
                  </>
                )}
                {/* (the phone stays up: the next episode's on it) */}
                <DefaultButton
                  onClick={() => send({ t: "nextEpisode" })}
                  disabled={offline}
                  text={game.episode >= EPISODES ? "See the ratings" : `On to episode ${game.episode + 1}`}
                  icon={game.episode >= EPISODES ? "trophy" : "forward"}
                  color="red"
                  className={styles.coachCta}
                />
              </>
            ) : game.episode === 1 ? (
              <>
                <span className={styles.coachEyebrow}>Before the show</span>
                <h2 className={styles.coachTitle}>Introduce yourselves</h2>
                <p className={styles.coachText}>Oldest character first: who you are, and what you’re after. Then start the clock.</p>
                <DefaultButton
                  onClick={() => close(() => send({ t: "startClock" }))}
                  disabled={offline}
                  text="Start episode 1"
                  icon="play"
                  color="red"
                  className={styles.coachCta}
                />
                <a className={`${styles.coachLink} tap-area`} href={DISCORD_URL} target="_blank" rel="noreferrer">
                  <Icon name="discord" /> Not on a call? Voice chat on Discord
                </a>
              </>
            ) : (
              <>
                <span className={styles.coachEyebrow}>
                  Episode {game.episode} of {EPISODES}
                </span>
                <h2 className={styles.coachTitle}>New episode!</h2>
                <p className={styles.coachText}>Swap any cards you don’t want, then start the clock.</p>
                <DefaultButton onClick={() => close()} text="Swap cards" icon="again" color="red" className={styles.coachCta} />
              </>
            )
          }
        </Coach>
      )}
      {flights.map((f) => (
        <Flight key={f.id} plan={f} done={() => setFlights((all) => all.filter((x) => x.id !== f.id))} />
      ))}
      {remoteShown && (
        <div className={styles.remoteShown} role="alert" onClick={() => setRemoteShown(null)} style={{ "--c": REMOTE[remoteShown].color } as CSSProperties}>
          <div className={styles.remoteShownCard}>
            <img src={remoteArt(remoteShown)} alt="" draggable={false} />
            <h2>{REMOTE[remoteShown].label}</h2>
            <p>{REMOTE[remoteShown].text}</p>
          </div>
        </div>
      )}
      {playedOpen && (
        <PlayedDialog
          episode={game.episode}
          cards={ep.completed}
          points={epPoints}
          name={name}
          nameOf={nameOf}
          undo={spectating || offline ? undefined : (id) => send({ t: "undo", id })}
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
          {isHost && (
            <>
              <h3 className={styles.settingsHead}>Spectators</h3>
              <div className={styles.doors}>
                <span>
                  <Icon name="eye" strokeWidth={2.2} />
                  {watchingLabel(room)}
                </span>
                <DefaultButton
                  onClick={() => {
                    send({ t: "watchOpen", open: !room.watchOpen });
                    play(room.watchOpen ? "doorsClose" : "doorsOpen");
                  }}
                  disabled={offline}
                  text={room.watchOpen ? "Close the doors" : "Open the doors"}
                  icon={room.watchOpen ? "close" : "enter"}
                  variant="secondary"
                  border="dark"
                />
              </div>
              <p className={styles.doorsNote}>{room.watchOpen ? "Anyone with the link can come in to watch." : "No more spectators can come in."}</p>
            </>
          )}
          <div className={`${modalStyles.actions} ${styles.settingsActions}`}>
            {spectating && <DefaultButton onClick={leave} text="Leave the show" icon="leave" variant="secondary" border="dark" />}
            {isHost && (
              <DefaultButton
                onClick={() => {
                  setPicking(false);
                  setEnding(true);
                }}
                text="End the game"
                icon="flag"
                variant="secondary"
                border="dark"
                disabled={offline}
              />
            )}
            <DefaultButton onClick={() => setPicking(false)} text="Done" icon="check" color="red" />
          </div>
        </Modal>
      )}
      {removing && <RemoveWatcher line={removing} send={send} onClose={() => setRemoving(null)} />}
      {ending && (
        <Confirm
          title="End the game?"
          text="Everyone goes back to the room, and this season’s score is lost."
          action="End the game"
          icon="flag"
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

// the settings cog
const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
);

// how many are watching, on the phone (with a lock when the host's closed the doors)
// (just the eye and the number: what it means, on pointing or tapping, in the chat's own tooltip)
const Watching = ({ room }: { room: RoomView }) => (
  <span className={styles.watchCount} data-tip={watchingLabel(room)} aria-label={watchingLabel(room)} tabIndex={0}>
    <Icon name="eye" strokeWidth={2.4} />
    {room.watching}
    {!room.watchOpen && (
      <svg viewBox="0 0 24 24" aria-label="doors closed">
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
    )}
  </span>
);

// The R.E.M.O.T.E. (the rulebook's safety tool, after Script Change by Beau Jágr Sheldon): a tap on a
// button, shown to everyone without who pressed it, and everyone goes along with it, no fuss
const REMOTE: Record<RemoteButton, { label: string; text: string; color: string }> = {
  pause: { label: "Pause", text: "Let’s stop for a moment and talk.", color: "#e05a5a" },
  play: { label: "Play", text: "All good, carry on.", color: "#3f5f9a" },
  rewind: { label: "Rewind", text: "Let’s take that last bit back and redo it.", color: "#e0962f" },
  forward: { label: "Fast-forward", text: "Let’s skip past this and move on.", color: "#4f9a5a" },
  replay: { label: "Instant replay", text: "That was great: more of that, please!", color: "#8a4fa8" },
  frame: { label: "Frame by frame", text: "Let’s slow down and go gently here.", color: "#e06a3a" },
};
// (each button as it's painted on the card in the box)
const remoteArt = (b: RemoteButton) => `/images/pieces/remote/keys/${b}.webp`;

// pressing and holding: once at once, then again and again, faster (until it's let go, or there's
// nothing left to do: `disabled`)
const useHold = (action: () => void, disabled = false) => {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const act = useRef(action);
  act.current = action;
  const stop = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  useEffect(() => stop, [stop]);
  useEffect(() => {
    if (disabled) stop();
  }, [disabled, stop]);
  const start = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    stop();
    act.current();
    let delay = 380;
    const again = () => {
      act.current();
      delay = Math.max(100, delay * 0.75);
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
  const hold = useHold(onMinus, disabled);
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
  areaRef: React.RefObject<HTMLSpanElement>;
}) => {
  // (the eight newest; the one before them fades away as the next lands)
  const shown = cards.slice(-9);
  const fading = cards.length > 8 ? shown[0].id : null;
  return (
    <button
      type="button"
      className={styles.playArea}
      onClick={open}
      disabled={cards.length === 0}
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
              className={c.id === fading ? styles.playFading : undefined}
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

// everything played this episode: search it, a page at a time; undo for each card (for the players:
// `undo`)
const PlayedDialog = ({
  episode,
  cards,
  points,
  name,
  nameOf,
  undo,
  close,
}: {
  episode: number;
  cards: Played;
  points: number;
  name: (kind: string, i: number) => string;
  nameOf: (id: string) => string;
  undo?: (id: string) => void;
  close: () => void;
}) => {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  // a card undone: once it's gone from the list, focus goes to the undo where it was (or the one
  // before, or back to the table), not off the page
  const grid = useRef<HTMLUListElement>(null);
  const back = useRef<HTMLSpanElement>(null);
  const undone = useRef<number | null>(null);
  useLayoutEffect(() => {
    const at = undone.current;
    if (at === null) return;
    undone.current = null;
    const undos = grid.current?.querySelectorAll<HTMLElement>("[data-undo]") ?? [];
    (undos[Math.min(at, undos.length - 1)] ?? back.current?.querySelector("button"))?.focus();
  }, [cards]);
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
        <ul ref={grid} className={styles.playedGrid}>
          {shown.map((c, index) => (
            <li key={c.id}>
              <img src={art.direction(c.deck, c.i)} alt={name(c.deck, c.i)} width="768" height="497" />
              <div className={styles.playedMeta}>
                <span>
                  <b>+{DIRECTION_POINTS[c.deck]}</b> {nameOf(c.by)}
                </span>
                {undo && (
                  <button
                    type="button"
                    data-undo
                    className={`${styles.chipButton} ${styles.chipDanger} ${styles.chipIcon}`}
                    onClick={() => {
                      undone.current = index;
                      undo(c.id);
                    }}
                    aria-label={`Undo “${name(c.deck, c.i)}”`}
                    title="Undo"
                  >
                    <Icon name="undo" strokeWidth={2.4} />
                  </button>
                )}
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
        <span ref={back} className={styles.playedBack}>
          <DefaultButton onClick={close} text="Back to the table" icon="prev" color="red" />
        </span>
      </div>
    </Modal>
  );
};

// The phone, held up to the screen: from where it lies on the table it comes up, big, in the middle,
// over everything (the table dimmed behind it); put down, it goes back to its place.
const Coach = ({
  origin,
  onClose,
  label,
  children,
}: {
  origin: HTMLElement | null;
  onClose: () => void;
  label: string;
  children: (close: (then?: () => void) => void) => React.ReactNode;
}) => {
  const panel = useRef<HTMLDivElement>(null);
  const [leaving, setLeaving] = useState(false);
  // (from the phone on the table to here, and back)
  const fromPhone = () => {
    const el = panel.current;
    if (!origin || !el || reducedMotion()) return null;
    const a = origin.getBoundingClientRect(), b = el.getBoundingClientRect();
    return `translate(${a.left + a.width / 2 - (b.left + b.width / 2)}px, ${a.top + a.height / 2 - (b.top + b.height / 2)}px) scale(${a.width / b.width}, ${a.height / b.height})`;
  };
  useLayoutEffect(() => {
    const t = fromPhone();
    if (t) panel.current!.animate([{ transform: t, opacity: 0.6 }, { transform: "none", opacity: 1 }], { duration: 420, easing: "cubic-bezier(0.2, 1, 0.3, 1)" });
    play("pickUp");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // put down (then, whatever was pressed to put it down happens)
  const close = (then?: () => void) => {
    if (leaving) return;
    setLeaving(true);
    play("putDown");
    const done = () => {
      onClose();
      then?.();
    };
    const t = fromPhone();
    if (!t) return done();
    panel.current!.animate([{ transform: "none" }, { transform: t, opacity: 0.4 }], { duration: 340, easing: "cubic-bezier(0.5, 0, 0.75, 0)", fill: "forwards" }).onfinish = done;
  };
  // (focus in it, Tab kept in it, Escape puts it down, focus back after)
  useDialogFocus(panel, () => close());
  return createPortal(
    <div className={`${styles.coach}${leaving ? ` ${styles.coachLeaving}` : ""}`} onClick={() => close()}>
      <div ref={panel} className={styles.coachPhone} role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()}>
        <span className={styles.coachIsland} aria-hidden />
        <button type="button" className={`${styles.coachClose} tap-area`} onClick={() => close()} aria-label="Put the phone down">
          <Icon name="close" strokeWidth={2.6} />
        </button>
        {/* (focus starts on what to do, not on putting it down) */}
        <div className={styles.coachScreen} data-autofocus>
          {children(close)}
        </div>
        <span className={styles.coachHome} aria-hidden />
      </div>
    </div>,
    document.body
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
      aria-label={`${player.name}${mine ? " (you)" : ""}${player.online ? "" : ", disconnected"}`}
    >
      {!player.online && (
        <span className={styles.offlineBanner} aria-hidden>
          Disconnected
        </span>
      )}
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
          <span className={styles.nameToken} aria-hidden>
            {initial(player.name)}
          </span>
          <span className={styles.nameText}>{player.name}</span>
          {mine && <span className={styles.you}>You</span>}
          {arcDone(hand) && <span className={styles.arc}>Arc +10</span>}
        </div>
      </div>
      <ul className={styles.traits} aria-label={`${player.name}’s traits`}>
        {hand.traits.map((t, slot) => {
          const done = t.done !== null;
          const locked = !done && playedNow;
          return (
            <li key={t.kind}>
              <button
                type="button"
                className={`${styles.trait}${done ? ` ${styles.traitDone}` : ""}${locked ? ` ${styles.traitLocked}` : ""} tap-area`}
                disabled={!mine || game.phase !== "break" || locked || (done && t.done !== game.episode)}
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

export default GameTable;
