import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router";
import { MAX_PLAYERS, MIN_PLAYERS, NAME_MAX, cleanName, type Player, type RoomView } from "../../../game-server/src/protocol";
import CustomHelmet from "../utils/CustomHelmet";
import DefaultButton from "../utils/DefaultButton";
import PageIntro from "../utils/PageIntro";
import usePageTitle from "../utils/usePageTitle";
import { DISCORD_URL, GAME_SERVER, createRoom, isCode, normalizeCode, playerId, roomInfo, saveName, savedName } from "./gameServer";
import useRoom from "./useRoom";
import styles from "../../css/pages/playPage.module.css";

// Play online (/play, and a room at /play/CODE): make a room or join one by its code, then the
// room's lobby: who's in, who's host, the invite link, and the call on Discord. The table comes next.

const PLAYER_COLORS = ["#d81e18", "#5f5aa2", "#4f8a73", "#e0a91b", "#3d7fb8", "#d9652b"];

const PlayPage = () => {
  const { code: rawCode } = useParams();
  const code = rawCode ? normalizeCode(rawCode) : null;
  // (the name this browser plays as: a room joins straight away once there is one)
  const [name, setName] = useState(savedName);
  const [joined, setJoined] = useState(() => !!savedName());
  usePageTitle(code ? `Game ${code} | Play online` : "Play online");

  return (
    <div className={`content ${styles.playPage}`}>
      <CustomHelmet
        title="Play Love, Career & Magic online"
        description="Make a game room, send your friends the link and play Love, Career & Magic together online."
      />
      {!GAME_SERVER ? (
        <PageIntro eyebrow="Play online" title="Coming soon" lead="Online games are almost ready. Check back soon!" />
      ) : !code ? (
        <Start name={name} setName={setName} />
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

// #region--------------------------------------BEFORE A ROOM

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

const Start = ({ name, setName }: { name: string; setName: (n: string) => void }) => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");

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
      navigate(`/play/${room}`);
    } catch {
      setProblem("We couldn’t make a room just now. Try again in a moment.");
      setBusy(false);
    }
  };

  const join = (e: FormEvent) => {
    e.preventDefault();
    if (isCode(code)) navigate(`/play/${code}`);
  };

  return (
    <>
      <PageIntro
        eyebrow={`${MIN_PLAYERS}–${MAX_PLAYERS} players · on a call`}
        title="Play online"
        lead="Make a game room, send your friends the link, and hop on a call together. Every card is on the table for everyone to see."
      />
      <div className={styles.startCards}>
        <form className={styles.card} onSubmit={create}>
          <h2 className={styles.cardTitle}>Host a game</h2>
          <NameField name={name} setName={setName} />
          <DefaultButton button="submit" text={busy ? "Making a room…" : "Create a game"} color="red" className={styles.wide} />
          {problem && (
            <p className={styles.problem} role="alert">
              {problem}
            </p>
          )}
        </form>
        <form className={styles.card} onSubmit={join}>
          <h2 className={styles.cardTitle}>Join a game</h2>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Room code</span>
            <input
              className={`${styles.input} ${styles.codeInput}`}
              value={code}
              onChange={(e) => setCode(normalizeCode(e.target.value))}
              placeholder="ABCD"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              inputMode="text"
              required
            />
          </label>
          <DefaultButton button="submit" text="Join" color="dark" className={styles.wide} />
          <p className={styles.note}>Got a link from a friend? Just open it.</p>
        </form>
      </div>
      <Voice />
    </>
  );
};

const Missing = ({ code, full }: { code: string; full?: boolean }) => (
  <PageIntro
    eyebrow={`Game ${code}`}
    title={full ? "This game is full" : "No game here"}
    lead={
      full
        ? `A game has room for ${MAX_PLAYERS} players, and this one has them all. Ask the host to make another, or start your own.`
        : "This room doesn’t exist, or it ended a while ago. Check the code with whoever sent it, or start your own game."
    }
  >
    <DefaultButton navlink="/play" text="Start a game" color="red" />
  </PageIntro>
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
    <>
      <PageIntro eyebrow="You’re invited" title={`Game ${code}`} lead="Pop your name in and you’re at the table." />
      <form
        className={`${styles.card} ${styles.narrow}`}
        onSubmit={(e) => {
          e.preventDefault();
          const clean = cleanName(name);
          if (!clean) return;
          setName(clean);
          join();
        }}
      >
        <NameField name={name} setName={setName} autoFocus />
        <DefaultButton button="submit" text="Join the game" color="red" className={styles.wide} />
      </form>
      <Voice />
    </>
  );
};

// #endregion

// #region--------------------------------------THE LOBBY

const Lobby = ({ code, name }: { code: string; name: string }) => {
  const navigate = useNavigate();
  const { room, status, error, bye, send } = useRoom(code, name);
  const me = playerId();

  if (status === "refused") return <Missing code={code} full={error === "full"} />;
  if (status === "gone") {
    return (
      <PageIntro
        eyebrow={`Game ${code}`}
        title={bye === "kicked" ? "You were removed" : bye === "replaced" ? "Open in another tab" : "You left the game"}
        lead={
          bye === "kicked"
            ? "The host took you out of this game."
            : bye === "replaced"
              ? "This game is open in another tab or window, so it carries on there."
              : "Thanks for playing!"
        }
      >
        {bye === "replaced" ? (
          <DefaultButton onClick={() => window.location.reload()} text="Play here instead" color="red" />
        ) : (
          <DefaultButton navlink="/play" text="Start a new game" color="red" />
        )}
      </PageIntro>
    );
  }
  if (!room) {
    return <PageIntro eyebrow={`Game ${code}`} title="Joining…" lead="Finding your seat at the table." />;
  }

  const isHost = room.hostId === me;
  return (
    <>
      <PageIntro
        eyebrow="Game room"
        title={<span className={styles.code}>{room.code}</span>}
        lead="Send your friends the link (or the code, to type in at lovecareermagic.com/play). Everyone joins from their own device."
      >
        <InviteButton code={room.code} />
      </PageIntro>

      {status === "reconnecting" && (
        <p className={styles.reconnecting} role="status">
          Reconnecting…
        </p>
      )}

      <div className={styles.lobby}>
        <section className={styles.card} aria-labelledby="players-title">
          <h2 className={styles.cardTitle} id="players-title">
            Players <span className={styles.count}>{room.players.length} of {MAX_PLAYERS}</span>
          </h2>
          <ul className={styles.players}>
            {room.players.map((p) => (
              <PlayerRow key={p.id} player={p} room={room} me={me} isHost={isHost} send={send} />
            ))}
          </ul>
        </section>

        <div className={styles.side}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Start the show</h2>
            <StartNote room={room} isHost={isHost} />
            <DefaultButton
              text="Start the game"
              color="red"
              className={`${styles.wide} ${styles.disabled}`}
            />
            <p className={styles.note}>The game table is on its way. For now, this room gets everyone together.</p>
          </section>
          <Voice compact />
        </div>
      </div>

      <div className={styles.leave}>
        <DefaultButton
          onClick={() => {
            send({ t: "leave" });
            navigate("/play");
          }}
          text="Leave the game"
          variant="ghost"
          compact
        />
      </div>
    </>
  );
};

const StartNote = ({ room, isHost }: { room: RoomView; isHost: boolean }) => {
  const host = room.players.find((p) => p.id === room.hostId);
  const short = MIN_PLAYERS - room.players.length;
  if (short > 0) return <p className={styles.note}>Waiting for at least {short} more player{short > 1 ? "s" : ""}.</p>;
  if (isHost) return <p className={styles.note}>Everyone in? You’re the host, so you start the game.</p>;
  return <p className={styles.note}>Waiting for {host?.name || "the host"} to start the game.</p>;
};

const PlayerRow = ({
  player,
  room,
  me,
  isHost,
  send,
}: {
  player: Player;
  room: RoomView;
  me: string;
  isHost: boolean;
  send: ReturnType<typeof useRoom>["send"];
}) => {
  const mine = player.id === me;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(player.name);

  return (
    <li className={`${styles.player}${player.online ? "" : ` ${styles.away}`}`}>
      <span className={styles.token} style={{ background: PLAYER_COLORS[player.color % PLAYER_COLORS.length] }} aria-hidden>
        {player.name.charAt(0).toUpperCase()}
      </span>
      {editing ? (
        <form
          className={styles.rename}
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
          <input
            className={`${styles.input} ${styles.renameInput}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, NAME_MAX))}
            maxLength={NAME_MAX}
            aria-label="Your name"
            autoFocus
          />
          <button type="submit" className={styles.rowButton}>
            Save
          </button>
        </form>
      ) : (
        <span className={styles.playerName}>
          {player.name}
          {mine && <span className={styles.tag}>You</span>}
          {room.hostId === player.id && <span className={`${styles.tag} ${styles.hostTag}`}>Host</span>}
          {!player.online && <span className={styles.awayNote}>away</span>}
        </span>
      )}
      {!editing && (
        <span className={styles.rowActions}>
          {mine && (
            <button
              type="button"
              className={styles.rowButton}
              onClick={() => {
                setDraft(player.name);
                setEditing(true);
              }}
            >
              Rename
            </button>
          )}
          {isHost && !mine && (
            <>
              <button type="button" className={styles.rowButton} onClick={() => send({ t: "makeHost", id: player.id })}>
                Make host
              </button>
              <button
                type="button"
                className={styles.rowButton}
                onClick={() => window.confirm(`Remove ${player.name} from the game?`) && send({ t: "kick", id: player.id })}
              >
                Remove
              </button>
            </>
          )}
        </span>
      )}
    </li>
  );
};

const InviteButton = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/play/${code}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      window.prompt("Copy the invite link:", link);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return <DefaultButton onClick={copy} text={copied ? "Link copied!" : "Copy invite link"} color="red" />;
};

// #endregion

// The game is played out loud: the call happens on our Discord
const Voice = ({ compact }: { compact?: boolean }) => (
  <section className={`${styles.card} ${styles.voice}${compact ? "" : ` ${styles.narrow}`}`}>
    <h2 className={styles.cardTitle}>Talk it out on Discord</h2>
    <p className={styles.note}>
      Love, Career &amp; Magic is all improv, so you’ll want to hear each other. Grab a free voice room on our Discord
      server, or use any call you like.
    </p>
    <DefaultButton href={DISCORD_URL} text="Open our Discord" color="purple" className={styles.wide} />
  </section>
);

export default PlayPage;
