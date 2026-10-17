import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router";
import { CODE_LENGTH, CODE_LETTERS, EPISODES, EPISODE_SECONDS, MAX_PLAYERS, MIN_PLAYERS, NAME_MAX, cleanName, type Player, type RoomView } from "../../../game-server/src/protocol";
import DefaultButton from "../utils/DefaultButton";
import Icon from "../utils/Icons";
import Modal from "../utils/Modal";
import modalStyles from "../../css/utils/modal.module.css";
import PageIntro from "../utils/PageIntro";
import { DISCORD_URL, GAME_SERVER, createRoom, isCode, normalizeCode, forgetRoom, rememberRoom, roomInfo, saveName, savedName, wasInRoom } from "./gameServer";
import Confirm from "./Confirm";
import GameTable, { Loading, PLAYER_COLORS, preloadBacks, useCurtain, useNames } from "./GameTable";
import Toast from "./Toast";
import Rulebook from "./Rulebook";
import CharacterChooser from "./CharacterChooser";
import Chat from "./Chat";
import { isMuted, play, setMuted } from "./sounds";
import { getAllCharacters } from "../Characters/Characters";
import useRoom, { RoomOffline, useOffline } from "./useRoom";
import Live from "./Live";
import initial from "../../utils/initial";
import announce from "../../utils/announce";
import styles from "../../css/pages/playPage.module.css";

// Play online (/play, and a room at /play/CODE), dressed as the show's backstage: a stage-lit panel
// up top, then making or joining a room; in a room, the page's own heading, then the invite (a
// stage-lit card) beside the start of the show, and the cast's six seats. The table comes next.

// (in the deck's order: a character's face, its emoji, by its place in the deck)
const CHARACTERS = getAllCharacters();
const colorOf = (p: Player) => PLAYER_COLORS[p.color % PLAYER_COLORS.length];

const PlayPage = () => {
  const { code: rawCode } = useParams();
  const code = rawCode ? normalizeCode(rawCode) : null;
  // (the name this browser plays as: a room joins straight away once there is one)
  const [name, setName] = useState(savedName);
  // (joined this room just now, or before: in it goes; a new room's link asks first)
  const [joinedNow, setJoined] = useState(false);
  const joined = joinedNow || (!!code && wasInRoom(code));
  // (another room's link: it asks again)
  useEffect(() => setJoined(false), [code]);
  // watching, not playing (asked to, or the room was full, or the show had started)
  const [watch, setWatch] = useState(false);
  // (a game's for tapping, not selecting: no highlighting text on these pages, dialogs included)
  useEffect(() => {
    document.body.classList.add("no-select");
    return () => document.body.classList.remove("no-select");
  }, []);
  // (no banner or navbar in a room: the page starts at the top, from its first frame)
  useLayoutEffect(() => {
    if (!code) return;
    document.body.classList.add("in-room");
    return () => document.body.classList.remove("in-room");
  }, [code]);

  return (
    <div className={`content ${styles.playPage}`}>
      {/* (in a room, the rulebook's where the navbar would be) */}
      {code && GAME_SERVER && <Rulebook />}
      {!GAME_SERVER ? (
        <Stage eyebrow="Play online" title="Coming soon" lead="Online games are almost ready. Check back soon!" art />
      ) : !code ? (
        <Start name={name} setName={setName} created={() => setJoined(true)} />
      ) : !isCode(code) ? (
        <Missing code={code} />
      ) : watch || (joined && name) ? (
        <Lobby
          code={code}
          name={name}
          watch={watch}
          rename={setName}
          takeSeat={() => {
            // (a spectator taking a free seat: in as a player, by name)
            setWatch(false);
            if (name) {
              rememberRoom(code);
              setJoined(true);
            } else setJoined(false);
          }}
          toAudience={() => {
            // (a player giving up their seat to watch: back on the link, it asks again)
            forgetRoom(code);
            setJoined(false);
            setWatch(true);
          }}
        />
      ) : (
        <JoinByLink
          code={code}
          name={name}
          setName={setName}
          join={() => {
            saveName(name);
            rememberRoom(code);
            setJoined(true);
          }}
          watch={(as) => {
            // (watching by name: this browser's name from now on)
            if (as) saveName(as);
            setWatch(true);
          }}
        />
      )}
    </div>
  );
};

// #region--------------------------------------PIECES

// The stage-lit panel every screen opens with
const Stage = ({
  eyebrow,
  title,
  lead,
  art,
  children,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  art?: boolean;
  children?: ReactNode;
}) => (
  <header className={`${styles.stage}${art ? ` ${styles.stageWithArt}` : ""}`}>
    <div className={styles.stageText}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1 className={styles.title}>{title}</h1>
      {lead && <p className={styles.lead}>{lead}</p>}
      {children && <div className={styles.stageActions}>{children}</div>}
    </div>
    {art && (
      <img
        className={styles.stageArt}
        src="/images/illustrations/splash-1000.webp"
        alt="Six of the game's characters around a kitchen table"
        width="1000"
        height="600"
      />
    )}
  </header>
);

// A room code as letter tiles
const CodeTiles = ({ code, small }: { code: string; small?: boolean }) => (
  <span className={`${styles.tiles}${small ? ` ${styles.tilesSmall}` : ""}`} aria-label={`Room code ${code.split("").join(" ")}`}>
    {code.split("").map((c, i) => (
      <span key={i} className={styles.tile} aria-hidden>
        {c}
      </span>
    ))}
  </span>
);

const DiscordIcon = () => <Icon name="discord" className={styles.discordIcon} />;

// (optional: for watching, where a name's only for the chat)
const NameField = ({ name, setName, autoFocus, optional }: { name: string; setName: (n: string) => void; autoFocus?: boolean; optional?: boolean }) => (
  <label className={styles.field}>
    <span className={styles.fieldLabel}>{optional ? "Your name, for the chat (if you like)" : "Your name"}</span>
    <input
      className={styles.input}
      value={name}
      onChange={(e) => setName(e.target.value.slice(0, NAME_MAX))}
      placeholder="What should we call you?"
      autoComplete="nickname"
      maxLength={NAME_MAX}
      autoFocus={autoFocus}
      required={!optional}
    />
  </label>
);

// The game is played out loud: the call happens on our Discord
const Voice = ({ stacked }: { stacked?: boolean }) => (
  <aside className={`${styles.voice}${stacked ? ` ${styles.voiceStacked}` : ""}`}>
    <span className={styles.voiceBadge}>
      <DiscordIcon />
    </span>
    <div className={styles.voiceText}>
      <h2 className={styles.voiceTitle}>Talk it out on Discord</h2>
      <p>The game’s played out loud, so get everyone on a voice call.</p>
    </div>
    <DefaultButton href={DISCORD_URL} text="Open our Discord" icon="discord" color="purple" className={styles.voiceButton} />
  </aside>
);

// #endregion

// #region--------------------------------------BEFORE A ROOM

const Start = ({ name, setName, created }: { name: string; setName: (n: string) => void; created: () => void }) => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const clearProblem = useCallback(() => setProblem(""), []);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    const clean = cleanName(name);
    if (busy) return;
    if (!clean) return setProblem("Pop your name in first: it’s how the others will know you.");
    setBusy(true);
    setProblem("");
    try {
      const room = await createRoom();
      saveName(clean);
      setName(clean);
      rememberRoom(room);
      created();
      navigate(`/play/${room}`);
    } catch (err) {
      const why = (err as Error).message;
      setProblem(
        why === "slow-down"
          ? "That’s a lot of new rooms! Wait a minute, then try again."
          : why === "paused"
            ? "Online play is taking a short break. Please try again later."
            : "We couldn’t make a room just now. Try again in a moment."
      );
      setBusy(false);
    }
  };

  const join = (e: FormEvent) => {
    e.preventDefault();
    if (isCode(code)) navigate(`/play/${code}`);
  };

  return (
    <>
      <Stage
        eyebrow={`${MIN_PLAYERS}–${MAX_PLAYERS} players`}
        title="Play online"
        lead="Make a room and send your friends the link."
        art
      />

      <div className={styles.doors}>
        <form className={`${styles.door} ${styles.doorHost}`} onSubmit={create}>
          <h2 className={styles.doorTitle}>Host a game</h2>
          <NameField name={name} setName={setName} />
          <DefaultButton button="submit" text={busy ? "Making a room…" : "Create a game"} icon="plus" loading={busy} color="red" className={`${styles.wide} ${styles.doorButton}`} />
        </form>

        <form className={`${styles.door} ${styles.doorJoin}`} onSubmit={join}>
          <h2 className={styles.doorTitle}>Join a game</h2>
          <CodeInput code={code} setCode={setCode} />
          <DefaultButton button="submit" text="Join" icon="enter" color="dark" disabled={!isCode(code)} className={`${styles.wide} ${styles.doorButton}`} />
        </form>
      </div>


      <Voice />
      {problem && <Toast message={problem} onClose={clearProblem} />}
    </>
  );
};

// what's typed or pasted into the room code, as a code: an invite link gives its code; letters a
// code never has (vowels, look-alikes) are left out, and said so
const typedCode = (text: string) => {
  const link = text.match(/\/play\/([a-z]{4})\b/i);
  const letters = (link ? link[1] : text).toUpperCase().replace(/[^A-Z]/g, "");
  const kept = [...letters].filter((c) => CODE_LETTERS.includes(c)).join("");
  return { code: kept.slice(0, CODE_LENGTH), dropped: kept.length < letters.length };
};

// Four letter tiles over a real text field (so typing, pasting and the keyboard all just work)
const CodeInput = ({ code, setCode }: { code: string; setCode: (c: string) => void }) => {
  const [focused, setFocused] = useState(false);
  const [dropped, setDropped] = useState(false);
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>Room code</span>
      <span className={styles.codeInput}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`${styles.codeSlot}${code[i] ? ` ${styles.codeSlotFilled}` : ""}${focused && i === Math.min(code.length, 3) ? ` ${styles.codeSlotNext}` : ""}`}
            aria-hidden
          >
            {code[i] || ""}
          </span>
        ))}
        <input
          className={styles.codeField}
          value={code}
          onChange={(e) => {
            const typed = typedCode(e.target.value);
            setCode(typed.code);
            setDropped(typed.dropped);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-label="Room code"
          aria-describedby="code-hint"
          required
        />
      </span>
      <span className={styles.codeHint} id="code-hint" role="status">
        {dropped ? "Room codes have no vowels: check the letters." : ""}
      </span>
    </label>
  );
};

const Missing = ({ code, full }: { code: string; full?: boolean }) => (
  <Stage
    eyebrow={<>Game {code}</>}
    title={full ? "This show is full" : "No game here"}
    lead={
      full
        ? `A game has room for ${MAX_PLAYERS} players, and this one has them all. Ask the host to make another, or start your own.`
        : "This room doesn’t exist, or it ended a while ago. Check the code with whoever sent it, or start your own game."
    }
  >
    <DefaultButton navlink="/play" text="Start a game" icon="plus" color="red" />
  </Stage>
);

// someone's link, the first time: their name, then in
const JoinByLink = ({ code, name, setName, join, watch }: { code: string; name: string; setName: (n: string) => void; join: () => void; watch: (as?: string) => void }) => {
  const [info, setInfo] = useState<{ exists: boolean; full: boolean; started?: boolean } | null>(null);
  useEffect(() => {
    let live = true;
    roomInfo(code)
      .then((i) => live && setInfo(i))
      .catch(() => live && setInfo({ exists: true, full: false }));
    return () => {
      live = false;
    };
  }, [code]);

  // (full, or the show's on: in to watch, by name, so the chat knows who's talking)
  const watchOnly = !!info && info.exists && (info.full || !!info.started);

  if (info && !info.exists) return <Missing code={code} />;
  if (watchOnly)
    return (
      <div className={styles.narrowPage}>
        <Stage
          eyebrow={<>Game {code}</>}
          title={info.started ? "The show’s on!" : "This show is full"}
          lead={info.started ? "Come and watch, and chat with the audience." : "Every seat’s taken, but you can watch, or start a game of your own."}
        />
        <form
          className={`${styles.door} ${styles.doorHost} ${styles.doorAlone}`}
          onSubmit={(e) => {
            e.preventDefault();
            const clean = cleanName(name);
            if (clean) setName(clean);
            watch(clean || undefined);
          }}
        >
          <h2 className={styles.doorTitle}>Who’s watching?</h2>
          <NameField name={name} setName={setName} autoFocus optional />
          <DefaultButton button="submit" text="Watch the show" icon="eye" color="red" className={styles.wide} />
          <DefaultButton navlink="/play" text="Start your own game" icon="plus" variant="secondary" border="dark" className={`${styles.wide} ${styles.doorAlt}`} />
        </form>
      </div>
    );

  return (
    <div className={styles.narrowPage}>
      <Stage eyebrow="You’re invited" title="Join the game" lead="Pop your name in to join.">
        <CodeTiles code={code} small />
      </Stage>
      <form
        className={`${styles.door} ${styles.doorHost} ${styles.doorAlone}`}
        onSubmit={(e) => {
          e.preventDefault();
          const clean = cleanName(name);
          if (!clean) return;
          setName(clean);
          join();
        }}
      >
        <h2 className={styles.doorTitle}>Who’s playing?</h2>
        <NameField name={name} setName={setName} autoFocus />
        <DefaultButton button="submit" text="Join the game" icon="enter" color="red" className={styles.wide} />
        <button type="button" className={styles.justWatch} onClick={() => watch()}>
          Just watch
        </button>
      </form>
      <Voice stacked />
    </div>
  );
};

// #endregion

// #region--------------------------------------THE LOBBY

const Lobby = ({
  code,
  name,
  watch,
  rename,
  takeSeat,
  toAudience,
}: {
  code: string;
  name: string;
  watch: boolean;
  rename: (name: string) => void;
  takeSeat: () => void;
  toAudience: () => void;
}) => {
  const navigate = useNavigate();
  const { room, status, connected, unreachable, retry, error, bye, send, chat, chatSlow, me } = useRoom(code, name, watch);
  // (out of their seat, into the audience: back in as a spectator)
  useEffect(() => {
    if (bye === "toAudience") toAudience();
  }, [bye, toAudience]);
  const [removing, setRemoving] = useState<Player | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [startCheck, setStartCheck] = useState(false);
  useLobbyNews(room, me);
  // the curtains, from the first moment: drawn while the room connects, then they open on the waiting
  // room (or, for a show under way, the table's own curtains take over, drawn the same)
  const curtain = useCurtain(!!room);
  const curtains = curtain !== "gone" && room?.phase !== "game" && <Loading out={curtain === "opening"} />;
  // (the loading screen's cards, fetched while everyone's still in the waiting room)
  useEffect(() => {
    const t = setTimeout(preloadBacks, 1500);
    return () => clearTimeout(t);
  }, []);

  if (status === "refused" && error === "watch-full")
    return (
      <Stage eyebrow={<>Game {code}</>} title="The studio’s packed" lead="This show has all the spectators it can take. Try again in a bit, or start your own game.">
        <DefaultButton navlink="/play" text="Start a game" icon="plus" color="red" />
      </Stage>
    );
  if (status === "refused" && error === "watch-closed")
    return (
      <Stage eyebrow={<>Game {code}</>} title="The doors are closed" lead="The host isn’t letting any more spectators in to this show. Start your own game instead!">
        <DefaultButton navlink="/play" text="Start a game" icon="plus" color="red" />
      </Stage>
    );
  if (status === "refused" && error === "removed")
    return (
      <Stage eyebrow={<>Game {code}</>} title="You’ve been written out" lead="The host took you out of this show.">
        <DefaultButton navlink="/play" text="Start a game" icon="plus" color="red" />
      </Stage>
    );
  if (status === "refused" && error === "outdated")
    return (
      <Stage eyebrow={<>Game {code}</>} title="A new version is out" lead="Online play has just been updated. Reload the page to get the new version, and you’ll be right back in your game.">
        <DefaultButton onClick={() => window.location.reload()} text="Reload" icon="again" color="red" />
      </Stage>
    );
  if (status === "refused") return <Missing code={code} full={error === "full"} />;
  if (status === "gone" && bye === "toAudience") return <PageIntro eyebrow="Watching" title="To the audience" lead="Finding you a spot…" className={styles.intro} />;
  if (status === "gone") {
    return (
      <Stage
        eyebrow={<>Game {code}</>}
        title={bye === "kicked" ? "You’ve been written out" : bye === "replaced" ? "Open in another tab" : "That’s a wrap"}
        lead={
          bye === "kicked"
            ? "The host took you out of this game."
            : bye === "replaced"
              ? "This game is open in another tab or window, so it carries on there."
              : bye === "expired"
                ? "This room has closed. Start a new game to play again."
                : "You left the game. Thanks for playing!"
        }
      >
        {bye === "replaced" ? (
          <DefaultButton onClick={() => window.location.reload()} text="Play here instead" icon="enter" color="red" />
        ) : (
          <DefaultButton navlink="/play" text="Start a new game" icon="plus" color="red" />
        )}
      </Stage>
    );
  }
  // (no room yet: the curtains, while it connects; a while with no answer, and the page says so)
  if (!room)
    return unreachable ? (
      <Stage eyebrow={<>Game {code}</>} title="Can’t reach the game" lead="We can’t get through to the game right now. Check your connection, then try again.">
        <DefaultButton onClick={retry} text="Try again" icon="again" color="red" />
        <DefaultButton navlink="/play" text="Back to Play" icon="prev" variant="secondary" border="dark" />
      </Stage>
    ) : (
      // (in the same place as the waiting room's, so it's the same curtains, shuffle and all, that open)
      <RoomOffline.Provider value={!connected}>{curtains}</RoomOffline.Provider>
    );

  const isHost = room.hostId === me;
  // watching: in the room, but not one of its players
  const spectating = !room.players.some((p) => p.id === me);
  const seats = Array.from({ length: MAX_PLAYERS }, (_, i) => room.players[i] ?? null);
  const canStart = isHost && room.players.length >= MIN_PLAYERS;
  const notReady = room.players.filter((p) => !room.ready?.[p.id]);
  // (the host's starting it: they're ready by doing so)
  const othersNotReady = notReady.filter((p) => p.id !== me);
  const chatCorner = <Chat lines={chat} me={me} send={send} slow={chatSlow} isHost={isHost} />;
  // (the connection's dropped: said at the top of the screen, wherever it's scrolled to, and every
  // control's off till it's back)
  const reconnecting = !connected && (
    <p className={styles.reconnecting} role="status">
      <span className={styles.reconnectingDot} /> Reconnecting…
    </p>
  );

  // the show's started: the table
  if (room.phase === "game" && room.game) {
    return (
      <RoomOffline.Provider value={!connected}>
        {reconnecting}
        {/* (the chat, how many are watching and the doors: all on the table's phone) */}
        <Live>
          <GameTable room={room} me={me} isHost={isHost} send={send} chat={chat} chatSlow={chatSlow} leave={() => navigate("/play")} />
        </Live>
      </RoomOffline.Provider>
    );
  }

  return (
    <RoomOffline.Provider value={!connected}>
      {curtains}
      <PageIntro
        eyebrow={spectating ? "Watching" : "Game room"}
        title={spectating ? "The show’s about to start" : "Getting ready"}
        lead={spectating ? "You’re in the audience. The cast is getting ready." : "Send your friends the link."}
        className={styles.intro}
      />

      {reconnecting}
      {chatCorner}
      <SoundToggle />
      {/* (taking a seat or leaving is this page's own doing: never off) */}
      {spectating && <Audience room={room} takeSeat={takeSeat} leave={() => navigate("/play")} />}

      <Live>
        {/* (on a phone, the invite's a slim row up top, then your character: it's the thing to do) */}
        <div className={styles.lobby}>
          <div className={styles.lobbyTop}>
            <Invite code={room.code} room={room} />
            <section className={styles.showtime}>
              <div className={styles.showtimeText}>
                <span className={styles.onAir}>
                  <span className={styles.onAirLight} /> {canStart ? "Ready when you are" : "On air soon"}
                </span>
                <StartNote room={room} isHost={isHost} />
              </div>
              <ul className={styles.checklist}>
                <li className={room.players.length >= MIN_PLAYERS ? styles.checkDone : ""}>
                  <Icon name="players" />
                  <b>
                    {room.players.length}/{MAX_PLAYERS}
                  </b>
                  <span>players</span>
                  {room.players.length >= MIN_PLAYERS ? (
                    <Icon name="check" strokeWidth={2.8} className={styles.checkTick} />
                  ) : (
                    <span className={styles.checkNeed}>need {MIN_PLAYERS - room.players.length} more</span>
                  )}
                </li>
                <li>
                  <Icon name="timer" />
                  <b>
                    {EPISODES} × {EPISODE_SECONDS / 60} min
                  </b>
                  <span>episodes</span>
                </li>
                <li>
                  <Icon name="discord" />
                  <a href={DISCORD_URL} target="_blank" rel="noreferrer">
                    Voice chat on Discord
                  </a>
                </li>
                {(isHost || room.watching > 0) && <Watchers room={room} isHost={isHost} send={send} />}
              </ul>
              {/* (the host's to press: the others wait for it) */}
              {isHost && (
                <DefaultButton
                  onClick={() => (othersNotReady.length ? setStartCheck(true) : send({ t: "start" }))}
                  disabled={!canStart}
                  text="Start the show"
                  icon="clapper"
                  color="red"
                  className={`${styles.startButton}${canStart && !othersNotReady.length ? ` ${styles.startGlow}` : ""}`}
                />
              )}
            </section>
          </div>

          {!spectating && <CharacterPicker room={room} me={me} send={send} />}

          <section className={styles.cast} aria-labelledby="cast-title">
            <div className={styles.castHead}>
              <h2 className={styles.sectionTitle} id="cast-title">
                The cast
              </h2>
              <span className={styles.castCount}>
                {room.players.length} of {MAX_PLAYERS} seats
              </span>
            </div>
            <ul className={styles.seats}>
              {seats.map((p, i) =>
                p ? (
                  <Seat key={p.id} player={p} room={room} me={me} isHost={isHost} send={send} rename={rename} remove={() => setRemoving(p)} />
                ) : (
                  <EmptySeat key={`empty-${i}`} code={room.code} first={i === room.players.length} />
                )
              )}
            </ul>
          </section>

          <Voice />
        </div>

        {!spectating && (
          <div className={styles.leave}>
            <button type="button" className={styles.textButton} onClick={() => send({ t: "toAudience" })}>
              Just watch instead
            </button>
            <span className={styles.leaveDot} aria-hidden>
              ·
            </span>
            <button type="button" className={styles.textButton} onClick={() => setLeaving(true)}>
              Leave the game
            </button>
          </div>
        )}
      </Live>

      {startCheck && (
        <Confirm
          title="Start without everyone ready?"
          text={`${othersNotReady.map((p) => p.name).join(", ")} ${othersNotReady.length === 1 ? "isn’t" : "aren’t"} ready yet. Anyone without a character gets a random one.`}
          action="Start anyway"
          icon="clapper"
          onConfirm={() => {
            setStartCheck(false);
            send({ t: "start" });
          }}
          onClose={() => setStartCheck(false)}
        />
      )}
      {removing && (
        <Confirm
          title={`Remove ${removing.name}?`}
          text="They’ll be taken out of this game, and they won’t be able to come back to it."
          action="Remove"
          icon="removePerson"
          onConfirm={() => {
            send({ t: "kick", id: removing.id });
            setRemoving(null);
          }}
          onClose={() => setRemoving(null)}
        />
      )}
      {leaving && (
        <Confirm
          title="Leave the game?"
          text={isHost && room.players.length > 1 ? "Someone else will take over as host." : "You can rejoin with the invite link."}
          action="Leave"
          icon="leave"
          onConfirm={() => {
            send({ t: "leave" });
            navigate("/play");
          }}
          onClose={() => setLeaving(false)}
        />
      )}
    </RoomOffline.Provider>
  );
};

// the waiting room's characters: pick yours (one player each), then say you're ready
const CharacterPicker = ({ room, me, send }: { room: RoomView; me: string; send: ReturnType<typeof useRoom>["send"] }) => {
  const name = useNames();
  const [open, setOpen] = useState(false);
  const mine = room.picks?.[me];
  const ready = !!room.ready?.[me];
  const meP = room.players.find((p) => p.id === me);
  const card = (c: number) => `/images/pieces/characters/${String(c + 1).padStart(2, "0")}.webp`;
  const closePicker = useCallback(() => setOpen(false), []);
  return (
    <section className={styles.picker} aria-labelledby="picker-title">
      <h2 className={styles.sectionTitle} id="picker-title">
        Your character
      </h2>
      <div className={styles.myPick} style={{ "--seat": meP ? colorOf(meP) : undefined } as CSSProperties}>
        <button type="button" className={`${styles.myPickCard}${mine === undefined ? ` ${styles.myPickEmpty}` : ""}`} onClick={() => setOpen(true)} aria-label={mine === undefined ? "Pick a character" : `Change your character, ${name("character", mine)}`}>
          {mine === undefined ? <span aria-hidden>?</span> : <img src={card(mine)} alt="" width="768" height="444" />}
        </button>
        <b className={styles.myPickName}>{mine === undefined ? "No one yet" : name("character", mine) || `Character ${mine + 1}`}</b>
        <div className={styles.myPickActions}>
          <DefaultButton
            onClick={() => setOpen(true)}
            text={mine === undefined ? "Pick a character" : "Change"}
            icon={mine === undefined ? "plus" : "again"}
            variant={mine === undefined ? "primary" : "secondary"}
            color={mine === undefined ? "red" : undefined}
            border={mine === undefined ? undefined : "dark"}
          />
          {/* a tick box: ticked, you're ready (the same button, the same words, either way) */}
          <button
            type="button"
            role="checkbox"
            aria-checked={ready}
            disabled={mine === undefined}
            onClick={() => send({ t: "ready", ready: !ready })}
            className={`${styles.readyToggle}${ready ? ` ${styles.readyOn}` : ""}`}
          >
            <span className={styles.readyBox} aria-hidden>
              <Icon name="check" strokeWidth={3.2} />
            </span>
            I’m ready
          </button>
        </div>
      </div>

      {open && <CharacterChooser room={room} me={me} pick={(c) => send({ t: "pick", character: c })} close={closePicker} />}
    </section>
  );
};

const StartNote = ({ room, isHost }: { room: RoomView; isHost: boolean }) => {
  const host = room.players.find((p) => p.id === room.hostId);
  const short = MIN_PLAYERS - room.players.length;
  if (short > 0)
    return (
      <p className={styles.showtimeLine}>
        Waiting for {short} more player{short > 1 ? "s" : ""} to join.
      </p>
    );
  const ready = room.players.filter((p) => room.ready?.[p.id]).length;
  if (ready < room.players.length)
    return (
      <p className={styles.showtimeLine}>
        {ready} of {room.players.length} ready
      </p>
    );
  if (isHost) return <p className={styles.showtimeLine}>Everyone’s ready. Start the show!</p>;
  return <p className={styles.showtimeLine}>Waiting for {host?.name || "the host"} to start the show.</p>;
};

const Seat = ({
  player,
  room,
  me,
  isHost,
  send,
  rename,
  remove,
}: {
  player: Player;
  room: RoomView;
  me: string;
  isHost: boolean;
  send: ReturnType<typeof useRoom>["send"];
  rename: (name: string) => void;
  remove: () => void;
}) => {
  const mine = player.id === me;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(player.name);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const menuId = `seat-menu-${player.id}`;
  const offline = useOffline();

  // (the host's options: a little list of buttons under the ⋯. It closes on a click or tap anywhere
  // else, or Escape, which puts focus back on the ⋯)
  useEffect(() => {
    if (!menu) return;
    menuRef.current?.querySelector<HTMLElement>(`[id="${menuId}"] button`)?.focus();
    const away = (e: PointerEvent) => !menuRef.current?.contains(e.target as Node) && setMenu(false);
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      e.preventDefault();
      setMenu(false);
      toggle.current?.focus();
    };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", key);
    };
  }, [menu, menuId]);

  return (
    <li
      className={`${styles.seat}${player.online ? "" : ` ${styles.seatAway}`}${mine ? ` ${styles.seatMine}` : ""}${menu ? ` ${styles.seatMenuOpen}` : ""}`}
      style={{ "--seat": colorOf(player) } as React.CSSProperties}
    >
      <span className={styles.seatTokenWrap}>
        {room.picks?.[player.id] !== undefined ? (
          <span className={`${styles.seatToken} ${styles.seatPicked}`} aria-hidden>
            <img src={`/images/emojis/${CHARACTERS[room.picks[player.id]]?.emoji?.[0]}.webp`} alt="" draggable={false} />
          </span>
        ) : (
          <span className={styles.seatToken} aria-hidden>
            {initial(player.name)}
          </span>
        )}
        {room.ready?.[player.id] && <ReadyTick />}
      </span>

      <span className={styles.seatName}>{player.name}</span>

      <span className={styles.seatTags}>
        {room.hostId === player.id && <span className={`${styles.tag} ${styles.tagHost}`}>Host</span>}
        {mine && <span className={styles.tag}>You</span>}
        {!player.online && <span className={styles.awayNote}>stepped out</span>}
      </span>

      {mine && (
        <button
          type="button"
          className={`${styles.seatCorner} tap-area`}
          onClick={() => {
            setDraft(player.name);
            setEditing(true);
          }}
          aria-label="Change your name"
          title="Change your name"
        >
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M4 20h4L18.5 9.5a2.83 2.83 0 0 0-4-4L4 16v4M13.5 6.5l4 4" />
          </svg>
        </button>
      )}

      {isHost && !mine && (
        <div className={styles.seatMenuWrap} ref={menuRef}>
          <button
            ref={toggle}
            type="button"
            className={`${styles.seatCorner} tap-area`}
            onClick={() => setMenu((m) => !m)}
            aria-label={`Options for ${player.name}`}
            aria-expanded={menu}
            aria-controls={menu ? menuId : undefined}
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              <circle cx="5" cy="12" r="1.4" />
              <circle cx="12" cy="12" r="1.4" />
              <circle cx="19" cy="12" r="1.4" />
            </svg>
          </button>
          {menu && (
            <div className={styles.seatMenu} id={menuId}>
              {player.online && (
                <button
                  type="button"
                  onClick={() => {
                    setMenu(false);
                    send({ t: "makeHost", id: player.id });
                  }}
                >
                  Make host
                </button>
              )}
              <button
                type="button"
                className={styles.danger}
                onClick={() => {
                  setMenu(false);
                  remove();
                }}
              >
                Remove from game
              </button>
            </div>
          )}
        </div>
      )}

      {editing && (
        <Modal onClose={() => setEditing(false)} ariaLabel="Change your name">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const clean = cleanName(draft);
              if (clean) {
                send({ t: "rename", name: clean });
                saveName(clean);
                rename(clean);
              }
              setEditing(false);
            }}
          >
            <h2 className={modalStyles.title}>Change your name</h2>
            <NameField name={draft} setName={setDraft} autoFocus />
            <div className={`${modalStyles.actions} ${styles.dialogFoot}`}>
              <DefaultButton onClick={() => setEditing(false)} text="Cancel" icon="close" variant="secondary" border="dark" />
              <DefaultButton button="submit" text="Save" icon="check" color="red" disabled={offline} />
            </div>
          </form>
        </Modal>
      )}
    </li>
  );
};

const EmptySeat = ({ code, first }: { code: string; first: boolean }) => {
  const invite = useCopyLink(code);
  return (
    <li className={`${styles.seatEmpty}${first ? "" : ` ${styles.seatOpen}`}`}>
      {first ? (
        <button type="button" className={styles.seatInvite} onClick={invite.share}>
          <span className={styles.seatPlus} aria-hidden>
            +
          </span>
          <span className={styles.seatEmptyText} aria-live="polite">
            {invite.copied ? "Link copied!" : "Invite a friend"}
          </span>
        </button>
      ) : (
        <span className={styles.seatEmptyText}>Open seat</span>
      )}
      {invite.fallback}
    </li>
  );
};

// a word that shows for a moment ("copied!"), then goes
const useFlash = (ms = 2000) => {
  const [on, setOn] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const flash = useCallback(() => {
    setOn(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOn(false), ms);
  }, [ms]);
  return [on, flash] as const;
};

// the room's invite link: copied, or on a phone, handed to its share sheet (and if the clipboard's
// out of reach, shown in a dialog to copy by hand)
const useCopyLink = (code: string) => {
  const [copied, flash] = useFlash();
  const [failed, setFailed] = useState(false);
  const link = `${window.location.origin}/play/${code}`;
  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      flash();
      play("copy");
      return true;
    } catch {
      setFailed(true);
      return false;
    }
  };
  const copy = () => void copyText(link);
  const share = () => {
    if (typeof navigator.share === "function" && matchMedia("(pointer: coarse)").matches)
      navigator.share({ title: "Love, Career & Magic", text: "Come and play Love, Career & Magic with us!", url: link }).catch(() => {});
    else copy();
  };
  const fallback = failed && (
    <Modal onClose={() => setFailed(false)} ariaLabel="Invite link">
      <h2 className={modalStyles.title}>Your invite link</h2>
      <p className={modalStyles.text}>Copy it and send it to your friends.</p>
      <input className={styles.input} value={link} readOnly onFocus={(e) => e.target.select()} autoFocus aria-label="Invite link" />
    </Modal>
  );
  return { link, copied, copy, copyText, share, fallback };
};

// the waiting room's news, whoever made it: someone in or out, a character picked, someone ready (or
// not), and the show starting. A sound for each, and a word for screen readers
const useLobbyNews = (room: RoomView | null, me: string) => {
  const was = useRef<RoomView | null>(null);
  useEffect(() => {
    const before = was.current;
    was.current = room;
    if (!room || !before) return;
    if (room.phase === "game" && before.phase === "lobby") {
      announce("The show’s starting!");
      return play("showtime");
    }
    if (room.phase !== "lobby") return;
    const who = (id: string) => (id === me ? "You" : (room.players.find((p) => p.id === id) ?? before.players.find((p) => p.id === id))?.name ?? "Someone");
    const then = new Set(before.players.map((p) => p.id));
    const now = new Set(room.players.map((p) => p.id));
    const came = room.players.filter((p) => !then.has(p.id));
    const went = before.players.filter((p) => !now.has(p.id));
    const readied = room.players.filter((p) => room.ready?.[p.id] && !before.ready?.[p.id]);
    const unreadied = room.players.filter((p) => !room.ready?.[p.id] && before.ready?.[p.id] && room.picks?.[p.id] !== undefined);
    const picked = room.players.filter((p) => room.picks?.[p.id] !== undefined && room.picks[p.id] !== before.picks?.[p.id]);
    for (const p of came) announce(`${who(p.id)} joined.`);
    for (const p of went) announce(`${p.name} left.`);
    for (const p of picked) announce(`${who(p.id)} picked ${CHARACTERS[room.picks[p.id]]?.name ?? "a character"}.`);
    for (const p of readied) announce(`${who(p.id)} ${p.id === me ? "are" : "is"} ready.`);
    for (const p of unreadied) announce(`${who(p.id)} ${p.id === me ? "aren’t" : "isn’t"} ready.`);
    if (came.length) return play("join");
    if (went.length) return play("leave");
    if (readied.length) return play("ready");
    if (unreadied.length) return play("unready");
    if (picked.length) return play("pick");
  }, [room, me]);
};

// sound on or off, in the waiting room's corner (the table has it on the phone)
const SoundToggle = () => {
  const [muted, setMutedState] = useState(isMuted);
  return (
    <button
      type="button"
      className={styles.soundToggle}
      onClick={() => {
        setMuted(!muted);
        setMutedState(!muted);
        if (muted) play("copy");
      }}
      aria-label="Sound"
      aria-pressed={!muted}
      title={muted ? "Sound off" : "Sound on"}
    >
      <svg viewBox="0 0 24 24" aria-hidden>
        {muted ? <path d="M11 5 6 9H3v6h3l5 4zM17 9l4 6M21 9l-4 6" /> : <path d="M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />}
      </svg>
    </button>
  );
};

// the audience, to the cast: how many are watching (just the number's read out as it changes), and
// for the host, the doors to open or close
const Watchers = ({ room, isHost, send }: { room: RoomView; isHost: boolean; send: ReturnType<typeof useRoom>["send"] }) => (
  <li className={styles.watchers}>
    <Icon name="eye" />
    <span aria-live="polite">
      <b>{room.watching}</b> watching{room.watchOpen ? "" : " · doors closed"}
    </span>
    {isHost && (
      <button
        type="button"
        className={styles.watchersDoors}
        onClick={() => {
          send({ t: "watchOpen", open: !room.watchOpen });
          play(room.watchOpen ? "doorsClose" : "doorsOpen");
        }}
        title={room.watchOpen ? "Stop any more spectators coming in" : "Let spectators in again"}
      >
        {room.watchOpen ? "Close the doors" : "Open the doors"}
      </button>
    )}
  </li>
);

// a spectator's bar, under the heading: that they're watching, a seat to take while there's one free
// before the show, and a way out
const Audience = ({ room, takeSeat, leave }: { room: RoomView; takeSeat: () => void; leave: () => void }) => (
  <div className={styles.audience}>
    <span className={styles.audienceText}>
      <Icon name="eye" /> You’re watching
    </span>
    {!room.game && room.players.length < MAX_PLAYERS && <DefaultButton onClick={takeSeat} text="Take a seat" icon="enter" color="red" />}
    <DefaultButton onClick={leave} text="Leave" icon="leave" variant="secondary" border="dark" />
  </div>
);

// a player who's ready: a tick on their face
const ReadyTick = () => (
  <span className={styles.readyTick} role="img" aria-label="Ready">
    <Icon name="check" strokeWidth={3.4} />
  </span>
);

// The invite: the room's code (a tap copies it) and its link, to copy (on a phone, to share), and the
// faces of the cast so far. (On a phone it's a slim row: the code, and Share.)
const Invite = ({ code, room }: { code: string; room: RoomView }) => {
  const invite = useCopyLink(code);
  const [codeCopied, flashCode] = useFlash();
  const copyCode = async () => {
    if (await invite.copyText(code)) flashCode();
  };
  const faces = room.players.filter((p) => room.picks?.[p.id] !== undefined);
  return (
    <section className={styles.invite} aria-labelledby="invite-title">
      <h2 className={styles.inviteTitle} id="invite-title">
        Invite your cast
      </h2>
      <div className={styles.inviteCode}>
        <span className={styles.inviteLabel} aria-live="polite">
          {codeCopied ? "Code copied!" : "Room code"}
        </span>
        <button type="button" className={styles.tilesButton} onClick={copyCode} title="Copy the code">
          <CodeTiles code={code} />
        </button>
      </div>
      {faces.length > 0 && (
        <ul className={styles.inviteFaces} aria-label="Picked so far">
          {faces.map((p, i) => (
            <li
              key={p.id}
              className={styles.inviteFace}
              style={{ "--seat": colorOf(p), "--i": i } as CSSProperties}
              title={p.name}
            >
              <img src={`/images/emojis/${CHARACTERS[room.picks[p.id]]?.emoji?.[0]}.webp`} alt={p.name} draggable={false} />
              {room.ready?.[p.id] && <ReadyTick />}
            </li>
          ))}
        </ul>
      )}
      <DefaultButton onClick={invite.copy} text={invite.copied ? "Link copied!" : "Copy invite link"} icon={invite.copied ? "check" : "link"} color="yellow" className={`${styles.inviteButton} ${styles.inviteCopy}`} />
      <DefaultButton onClick={invite.share} text={invite.copied ? "Link copied!" : "Share invite link"} icon={invite.copied ? "check" : "share"} color="yellow" className={`${styles.inviteButton} ${styles.inviteShare}`} />
      {invite.fallback}
    </section>
  );
};

// #endregion

export default PlayPage;
