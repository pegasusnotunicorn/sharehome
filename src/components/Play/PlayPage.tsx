import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router";
import { EPISODES, EPISODE_SECONDS, MAX_PLAYERS, MIN_PLAYERS, NAME_MAX, cleanName, type Player, type RoomView } from "../../../game-server/src/protocol";
import CustomHelmet from "../utils/CustomHelmet";
import DefaultButton from "../utils/DefaultButton";
import Icon from "../utils/Icons";
import Modal from "../utils/Modal";
import modalStyles from "../../css/utils/modal.module.css";
import PageIntro from "../utils/PageIntro";
import usePageTitle from "../utils/usePageTitle";
import { DISCORD_URL, GAME_SERVER, createRoom, isCode, normalizeCode, playerId, roomInfo, saveName, savedName } from "./gameServer";
import Confirm from "./Confirm";
import GameTable, { PLAYER_COLORS, preloadBacks, useNames } from "./GameTable";
import Toast from "./Toast";
import Rulebook from "./Rulebook";
import CharacterChooser from "./CharacterChooser";
import { getAllCharacters } from "../Characters/Characters";
import useRoom from "./useRoom";
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
  const [joined, setJoined] = useState(() => !!savedName());
  usePageTitle(code ? `Game ${code} | Play online` : "Play online");
  // (a game's for tapping, not selecting: no highlighting text on these pages, dialogs included)
  useEffect(() => {
    document.body.classList.add("no-select");
    return () => document.body.classList.remove("no-select");
  }, []);
  // (no banner or navbar in a room: the page starts at the top)
  useEffect(() => {
    if (!code) return;
    document.body.classList.add("in-room");
    return () => document.body.classList.remove("in-room");
  }, [code]);

  return (
    <div className={`content ${styles.playPage}`}>
      <CustomHelmet
        title="Play Love, Career & Magic online"
        description="Make a game room, send your friends the link and play Love, Career & Magic together online."
      />
      {/* (in a room, the rulebook's where the navbar would be) */}
      {code && GAME_SERVER && <Rulebook />}
      {!GAME_SERVER ? (
        <Stage eyebrow="Play online" title="Coming soon" lead="Online games are almost ready. Check back soon!" art />
      ) : !code ? (
        <Start name={name} setName={setName} created={() => setJoined(true)} />
      ) : !isCode(code) ? (
        <Missing code={code} />
      ) : joined && name ? (
        <Lobby code={code} name={name} />
      ) : (
        <JoinByLink
          code={code}
          name={name}
          setName={setName}
          join={() => {
            saveName(name);
            setJoined(true);
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

const NameField = ({ name, setName, autoFocus }: { name: string; setName: (n: string) => void; autoFocus?: boolean }) => (
  <label className={styles.field}>
    <span className={styles.fieldLabel}>Your name</span>
    <input
      className={styles.input}
      value={name}
      onChange={(e) => setName(e.target.value.slice(0, NAME_MAX))}
      placeholder="What should we call you?"
      autoComplete="nickname"
      maxLength={NAME_MAX}
      autoFocus={autoFocus}
      required
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
    if (!clean || busy) return;
    setBusy(true);
    setProblem("");
    try {
      const room = await createRoom();
      saveName(clean);
      setName(clean);
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

// Four letter tiles over a real text field (so typing, pasting and the keyboard all just work)
const CodeInput = ({ code, setCode }: { code: string; setCode: (c: string) => void }) => {
  const [focused, setFocused] = useState(false);
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
          onChange={(e) => setCode(normalizeCode(e.target.value))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={8}
          aria-label="Room code"
          required
        />
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
const JoinByLink = ({ code, name, setName, join }: { code: string; name: string; setName: (n: string) => void; join: () => void }) => {
  const [info, setInfo] = useState<{ exists: boolean; full: boolean } | null>(null);
  useEffect(() => {
    let live = true;
    roomInfo(code)
      .then((i) => live && setInfo(i))
      .catch(() => live && setInfo({ exists: true, full: false }));
    return () => {
      live = false;
    };
  }, [code]);

  if (info && !info.exists) return <Missing code={code} />;
  if (info?.full) return <Missing code={code} full />;

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
      </form>
      <Voice stacked />
    </div>
  );
};

// #endregion

// #region--------------------------------------THE LOBBY

const Lobby = ({ code, name }: { code: string; name: string }) => {
  const navigate = useNavigate();
  const { room, status, error, bye, send } = useRoom(code, name);
  const [removing, setRemoving] = useState<Player | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [startCheck, setStartCheck] = useState(false);
  const me = playerId();
  // (the loading screen's cards, fetched while everyone's still in the waiting room)
  useEffect(() => {
    const t = setTimeout(preloadBacks, 1500);
    return () => clearTimeout(t);
  }, []);

  if (status === "refused") return <Missing code={code} full={error === "full"} />;
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
  if (!room) {
    return <PageIntro eyebrow="Game room" title="Getting ready" lead="Finding your seat…" className={styles.intro} />;
  }

  const isHost = room.hostId === me;
  const seats = Array.from({ length: MAX_PLAYERS }, (_, i) => room.players[i] ?? null);
  const canStart = isHost && room.players.length >= MIN_PLAYERS;
  const notReady = room.players.filter((p) => !room.ready?.[p.id]);
  const reconnecting = status === "reconnecting" && (
    <p className={styles.reconnecting} role="status">
      <span className={styles.reconnectingDot} /> Reconnecting…
    </p>
  );

  // the show's started: the table
  if (room.phase === "game" && room.game) {
    return (
      <>
        {reconnecting}
        <GameTable room={room} me={me} isHost={isHost} send={send} />
      </>
    );
  }

  return (
    <>
      <PageIntro
        eyebrow="Game room"
        title="Getting ready"
        lead="Send your friends the link."
        className={styles.intro}
      />

      {reconnecting}

      {/* (on a phone, your character comes first: it's the thing to do) */}
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
          </ul>
          {/* (the host's to press: the others wait for it) */}
          {isHost && (
            <DefaultButton
              onClick={() => (notReady.length ? setStartCheck(true) : send({ t: "start" }))}
              disabled={!canStart}
              text="Start the show"
              icon="clapper"
              color="red"
              className={styles.startButton}
            />
          )}
        </section>
      </div>

      <CharacterPicker room={room} me={me} send={send} />

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
              <Seat key={p.id} player={p} room={room} me={me} isHost={isHost} send={send} remove={() => setRemoving(p)} />
            ) : (
              <EmptySeat key={`empty-${i}`} code={room.code} first={i === room.players.length} />
            )
          )}
        </ul>
      </section>

      <Voice />
      </div>

      <div className={styles.leave}>
        <button type="button" className={styles.textButton} onClick={() => setLeaving(true)}>
          Leave the game
        </button>
      </div>

      {startCheck && (
        <Confirm
          title="Start without everyone ready?"
          text={`${notReady.map((p) => p.name).join(", ")} ${notReady.length === 1 ? "isn’t" : "aren’t"} ready yet. Anyone without a character gets a random one.`}
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
          text="They’ll be taken out of this room. They can come back with the invite link."
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
    </>
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
  remove,
}: {
  player: Player;
  room: RoomView;
  me: string;
  isHost: boolean;
  send: ReturnType<typeof useRoom>["send"];
  remove: () => void;
}) => {
  const mine = player.id === me;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(player.name);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // (the host's menu closes on a click or tap anywhere else, or Escape)
  useEffect(() => {
    if (!menu) return;
    const away = (e: PointerEvent) => !menuRef.current?.contains(e.target as Node) && setMenu(false);
    const key = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", key);
    };
  }, [menu]);

  return (
    <li
      className={`${styles.seat}${player.online ? "" : ` ${styles.seatAway}`}${mine ? ` ${styles.seatMine}` : ""}`}
      style={{ "--seat": colorOf(player) } as React.CSSProperties}
    >
      <span className={styles.seatTokenWrap}>
        {room.picks?.[player.id] !== undefined ? (
          <span className={`${styles.seatToken} ${styles.seatPicked}`} aria-hidden>
            <img src={`/images/emojis/${CHARACTERS[room.picks[player.id]]?.emoji?.[0]}.webp`} alt="" draggable={false} />
          </span>
        ) : (
          <span className={styles.seatToken} aria-hidden>
            {player.name.charAt(0).toUpperCase()}
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
          className={styles.seatCorner}
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
            type="button"
            className={styles.seatCorner}
            onClick={() => setMenu((m) => !m)}
            aria-label={`Options for ${player.name}`}
            aria-expanded={menu}
            aria-haspopup="menu"
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              <circle cx="5" cy="12" r="1.4" />
              <circle cx="12" cy="12" r="1.4" />
              <circle cx="19" cy="12" r="1.4" />
            </svg>
          </button>
          {menu && (
            <div className={styles.seatMenu} role="menu">
              {player.online && (
                <button
                  type="button"
                  role="menuitem"
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
                role="menuitem"
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
              }
              setEditing(false);
            }}
          >
            <h2 className={modalStyles.title}>Change your name</h2>
            <NameField name={draft} setName={setDraft} autoFocus />
            <div className={`${modalStyles.actions} ${styles.dialogFoot}`}>
              <DefaultButton onClick={() => setEditing(false)} text="Cancel" icon="close" variant="secondary" border="dark" />
              <DefaultButton button="submit" text="Save" icon="check" color="red" />
            </div>
          </form>
        </Modal>
      )}
    </li>
  );
};

const EmptySeat = ({ code, first }: { code: string; first: boolean }) => {
  const copy = useCopyLink(code);
  return (
    <li className={`${styles.seatEmpty}${first ? "" : ` ${styles.seatOpen}`}`}>
      {first ? (
        <button type="button" className={styles.seatInvite} onClick={copy.copy}>
          <span className={styles.seatPlus} aria-hidden>
            +
          </span>
          <span className={styles.seatEmptyText}>{copy.copied ? "Link copied!" : "Invite a friend"}</span>
        </button>
      ) : (
        <span className={styles.seatEmptyText}>Open seat</span>
      )}
    </li>
  );
};

const useCopyLink = (code: string) => {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const link = `${window.location.origin}/play/${code}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setFailed(true);
    }
  };
  return { link, copied, failed, setFailed, copy };
};

// The invite: the room's code (a tap copies it) and its link, to copy, and the faces of the cast so far
// a player who's ready: a tick on their face
const ReadyTick = () => (
  <span className={styles.readyTick} role="img" aria-label="Ready">
    <Icon name="check" strokeWidth={3.4} />
  </span>
);

const Invite = ({ code, room }: { code: string; room: RoomView }) => {
  const { link, copied, failed, setFailed, copy } = useCopyLink(code);
  const [codeCopied, setCodeCopied] = useState(false);
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      setFailed(true);
    }
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
      <DefaultButton onClick={copy} text={copied ? "Link copied!" : "Copy invite link"} icon={copied ? "check" : "link"} color="yellow" className={styles.inviteButton} />
      {failed && (
        <Modal onClose={() => setFailed(false)} ariaLabel="Invite link">
          <h2 className={modalStyles.title}>Your invite link</h2>
          <p className={modalStyles.text}>Copy it and send it to your friends.</p>
          <input className={styles.input} value={link} readOnly onFocus={(e) => e.target.select()} autoFocus />
        </Modal>
      )}
    </section>
  );
};

// #endregion

export default PlayPage;
