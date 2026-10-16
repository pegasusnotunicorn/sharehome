import { useEffect, useMemo, useState } from "react";
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
import Confirm from "./Confirm";
import styles from "../../css/pages/gameTable.module.css";

// The table (once the host starts the show): the clock and the episode up top, the six direction
// cards anyone can tap to complete (and anyone can undo), earlier episodes for callbacks, and every
// player's character and traits, all face up. Between episodes: the episode's wrap; after the
// fourth: the season's ratings.

export const PLAYER_COLORS = ["#d81e18", "#5f5aa2", "#4f8a73", "#e0a91b", "#3d7fb8", "#d9652b"];

const nn = (i: number) => String(i + 1).padStart(2, "0");
const art = {
  character: (i: number) => `/images/pieces/characters/${nn(i)}.webp`,
  characterBack: (i: number) => `/images/pieces/characters/${nn(i)}-back.webp`,
  episode: (i: number) => `/images/pieces/episodes/${nn(i)}.webp`,
  direction: (deck: DirectionDeck, i: number) => `/images/pieces/${deck}/${nn(i)}.webp`,
  directionBack: (deck: DirectionDeck) => `/images/pieces/${deck}/back.webp`,
  trait: (kind: TraitKind, i: number) => `/images/pieces/${kind}-traits/${nn(i)}.webp`,
};

const DECK_LABEL: Record<DirectionDeck, string> = { director: "Director", producer: "Producer", showrunner: "Showrunner" };
const DECK_NOTE: Record<DirectionDeck, string> = {
  director: "1 point",
  producer: "2 points · someone else answers “What happens?”",
  showrunner: "3 points",
};

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

// the clock, lined up with the server's
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
  return left;
};

const mmss = (ms: number) => {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
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
  const players = room.players.filter((p) => game.hands[p.id]);
  const nameOf = (id: string) => room.players.find((p) => p.id === id)?.name ?? "Someone";
  const ep = game.episodes[game.episode - 1];
  const points = score(game);
  const [ending, setEnding] = useState(false);

  if (game.phase === "over")
    return (
      <div className={styles.table}>
        <Finale room={room} game={game} isHost={isHost} send={send} />
      </div>
    );

  const running = game.phase === "playing" && game.endsAt !== null;
  const paused = game.phase === "playing" && game.pausedLeft !== null;
  const epPoints = ep.completed.reduce((n, c) => n + DIRECTION_POINTS[c.deck] + c.tokens, 0);

  return (
    <div className={styles.table}>
      {/* #region the clock */}
      <header className={`${styles.bar}${game.phase === "break" ? ` ${styles.barWrapped}` : ""}`}>
        <div className={styles.barEpisode}>
          <span className={styles.barLabel}>Episode</span>
          <span className={styles.barValue}>
            {game.episode}
            <small> of {EPISODES}</small>
          </span>
          <span className={styles.dots} aria-hidden>
            {Array.from({ length: EPISODES }, (_, i) => (
              <span key={i} className={i < game.episode - 1 ? styles.dotDone : i === game.episode - 1 ? styles.dotNow : ""} />
            ))}
          </span>
        </div>

        <div className={styles.clock} role="timer" aria-live="off">
          <span className={`${styles.clockTime}${running && left < 30_000 ? ` ${styles.clockLow}` : ""}`}>{mmss(left)}</span>
          <span className={styles.clockTrack}>
            <span style={{ transform: `scaleX(${left / (EPISODE_SECONDS * 1000)})` }} />
          </span>
        </div>

        <div className={styles.barActions}>
          {game.phase === "ready" && <DefaultButton onClick={() => send({ t: "startClock" })} text="Start the clock" color="red" />}
          {running && <DefaultButton onClick={() => send({ t: "pause" })} text="Pause" variant="secondary" color="white" />}
          {paused && <DefaultButton onClick={() => send({ t: "resume" })} text="Resume" color="red" />}
          {game.phase === "break" && (
            <DefaultButton
              onClick={() => send({ t: "nextEpisode" })}
              text={game.episode >= EPISODES ? "See the ratings" : `On to episode ${game.episode + 1}`}
              color="yellow"
            />
          )}
          <span className={styles.score}>
            <b>{points.total}</b> pts
          </span>
        </div>
      </header>
      {/* #endregion */}

      <Prompt game={game} epPoints={epPoints} />

      <div className={styles.stageRow}>
        {/* #region the episode, and its completed cards */}
        <section className={styles.location} aria-label="This episode">
          <p className={styles.kicker}>On location</p>
          <img className={styles.episodeCard} src={art.episode(ep.card)} alt={name("episode", ep.card)} width="768" height="549" />
          <div className={styles.doneHead}>
            <span>Completed this episode</span>
            <b>+{epPoints}</b>
          </div>
          {ep.completed.length === 0 ? (
            <p className={styles.empty}>Tap a direction card once someone’s done it.</p>
          ) : (
            <ul className={styles.doneList}>
              {[...ep.completed].reverse().map((c) => (
                <li key={c.id} className={styles.done}>
                  <img src={art.direction(c.deck, c.i)} alt={name(c.deck, c.i)} width="768" height="497" />
                  <span className={styles.doneInfo}>
                    <b>+{DIRECTION_POINTS[c.deck] + c.tokens}</b>
                    <span>{nameOf(c.by)}</span>
                  </span>
                  <span className={styles.doneActions}>
                    <TokenButtons
                      count={c.tokens}
                      label="a token for someone who had something to say too"
                      add={() => send({ t: "token", on: "card", id: c.id, add: true })}
                      remove={() => send({ t: "token", on: "card", id: c.id, add: false })}
                    />
                    <button type="button" className={styles.undo} onClick={() => send({ t: "undo", id: c.id })}>
                      Undo
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
        {/* #endregion */}

        {/* #region the direction cards */}
        <section className={styles.directions} aria-label="Direction cards">
          {DIRECTION_DECKS.map((deck) => (
            <div key={deck} className={`${styles.deck} ${styles[deck]}`}>
              <div className={styles.deckHead}>
                <h3>{DECK_LABEL[deck]}</h3>
                <span>{DECK_NOTE[deck]}</span>
              </div>
              <div className={styles.deckCards}>
                {game.faceUp[deck].map((card, slot) =>
                  card === null ? (
                    <span key={slot} className={styles.cardEmpty}>
                      Deck’s empty
                    </span>
                  ) : (
                    <div key={`${slot}-${card}`} className={styles.cardWrap}>
                      <button
                        type="button"
                        className={styles.card}
                        disabled={game.phase === "break"}
                        onClick={() => send({ t: "complete", deck, slot })}
                        aria-label={`Complete “${name(deck, card)}” (${DIRECTION_POINTS[deck]} points)`}
                      >
                        <img src={art.direction(deck, card)} alt="" width="768" height="497" />
                        <span className={styles.cardDone}>Done! +{DIRECTION_POINTS[deck]}</span>
                      </button>
                      {game.phase === "ready" && game.left[deck] > 0 && (
                        <button type="button" className={styles.swap} onClick={() => send({ t: "discard", deck, slot })}>
                          Swap
                        </button>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </section>
        {/* #endregion */}
      </div>

      {/* #region earlier episodes (callbacks) and what's happened */}
      <div className={styles.lowerRow}>
        <section className={styles.callbacks} aria-labelledby="callbacks-title">
          <h3 className={styles.sectionTitle} id="callbacks-title">
            Callbacks
          </h3>
          <p className={styles.sectionNote}>
            Someone mentioned something from an earlier episode? Put a token on that episode for an extra point.
          </p>
          {game.episode === 1 ? (
            <p className={styles.empty}>From episode 2 on.</p>
          ) : (
            <ul className={styles.pastList}>
              {game.episodes.slice(0, game.episode - 1).map((past, i) => (
                <li key={i} className={styles.past}>
                  <img src={art.episode(past.card)} alt={name("episode", past.card)} width="768" height="549" />
                  <span className={styles.pastLabel}>Episode {i + 1}</span>
                  <TokenButtons
                    count={past.tokens}
                    label={`a callback to episode ${i + 1}`}
                    add={() => send({ t: "token", on: "episode", episode: i + 1, add: true })}
                    remove={() => send({ t: "token", on: "episode", episode: i + 1, add: false })}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.activity} aria-labelledby="activity-title">
          <h3 className={styles.sectionTitle} id="activity-title">
            What’s happened
          </h3>
          {game.log.length === 0 ? (
            <p className={styles.empty}>Nothing yet.</p>
          ) : (
            <ul className={styles.log}>
              {game.log.slice(0, 6).map((l) => (
                <li key={l.id}>{l.text.replace(/\{([^}]+)\}/g, (_, id) => nameOf(id))}</li>
              ))}
            </ul>
          )}
        </section>
      </div>
      {/* #endregion */}

      {/* #region the cast */}
      <section className={styles.cast} aria-labelledby="cast-title">
        <div className={styles.castHead}>
          <h3 className={styles.sectionTitle} id="cast-title">
            The cast
          </h3>
          <span className={styles.sectionNote}>
            Played one of your traits? Tap it (one per episode). All three is a Character Arc: +10.
          </span>
        </div>
        <div className={styles.castGrid}>
          {players.map((p) => (
            <CastMember key={p.id} player={p} game={game} me={me} name={name} send={send} />
          ))}
        </div>
      </section>
      {/* #endregion */}

      {isHost && (
        <div className={styles.hostRow}>
          <button type="button" className={styles.textButton} onClick={() => setEnding(true)}>
            End the game and go back to the room
          </button>
        </div>
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

// what to do now: a line over the table for the moment the game is in
const Prompt = ({ game, epPoints }: { game: GameView; epPoints: number }) => {
  if (game.phase === "ready" && game.episode === 1)
    return (
      <div className={styles.prompt}>
        <b>Introduce yourselves!</b> Oldest character first: who you are, and your Character Arc. Then start the clock,
        or just complete a card and it starts on its own.
      </div>
    );
  if (game.phase === "ready")
    return (
      <div className={styles.prompt}>
        <b>Episode {game.episode} is about to start.</b> Talk over what just happened, swap any direction cards you
        don’t want, then start the clock.
      </div>
    );
  if (game.phase === "break")
    return (
      <div className={`${styles.prompt} ${styles.promptWrap}`}>
        <b>That’s a wrap on episode {game.episode}! +{epPoints}</b> Did anyone play one of their traits? Tap it below
        before moving on.
      </div>
    );
  if (game.pausedLeft !== null)
    return (
      <div className={styles.prompt}>
        <b>Paused.</b> Resume the clock when you’re ready.
      </div>
    );
  return null;
};

const TokenButtons = ({ count, label, add, remove }: { count: number; label: string; add: () => void; remove: () => void }) => (
  <span className={styles.tokens}>
    {count > 0 && (
      <button type="button" className={styles.tokenMinus} onClick={remove} aria-label={`Take back ${label}`}>
        −
      </button>
    )}
    <button type="button" className={styles.token} onClick={add} aria-label={`Add ${label}`}>
      <img src="/images/pieces/box/token-front.webp" alt="" width="512" height="512" />
      {count > 0 ? <b>{count}</b> : <b>+1</b>}
    </button>
  </span>
);

const CastMember = ({
  player,
  game,
  me,
  name,
  send,
}: {
  player: Player;
  game: GameView;
  me: string;
  name: (kind: string, i: number) => string;
  send: (msg: ClientMessage) => void;
}) => {
  const hand = game.hands[player.id];
  const [flipped, setFlipped] = useState(false);
  const mine = player.id === me;
  const playedNow = hand.traits.some((t) => t.done === game.episode);
  const color = PLAYER_COLORS[player.color % PLAYER_COLORS.length];

  return (
    <article className={`${styles.member}${player.online ? "" : ` ${styles.memberAway}`}`} style={{ "--seat": color } as React.CSSProperties}>
      <header className={styles.memberHead}>
        <span className={styles.memberToken}>{player.name.charAt(0).toUpperCase()}</span>
        <span className={styles.memberName}>
          {player.name}
          {mine && <span className={styles.you}>You</span>}
        </span>
        {arcDone(hand) && <span className={styles.arc}>Arc complete +10</span>}
      </header>
      <button
        type="button"
        className={styles.character}
        onClick={() => setFlipped((f) => !f)}
        aria-label={`${name("character", hand.character)}: tap to ${flipped ? "see the picture" : "read their details"}`}
      >
        <img
          src={flipped ? art.characterBack(hand.character) : art.character(hand.character)}
          alt=""
          width="768"
          height="444"
        />
        <span className={styles.flipHint}>{flipped ? "Picture" : "Details"}</span>
      </button>
      {mine && game.phase === "ready" && game.episode === 1 && (
        <button type="button" className={styles.textButton} onClick={() => send({ t: "newCharacter" })}>
          Draw a different character
        </button>
      )}
      <ul className={styles.traits}>
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
