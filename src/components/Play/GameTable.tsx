import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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
  token: "/images/pieces/box/token-front.webp",
};

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
  const [muted, setMutedState] = useState(isMuted);
  const [ending, setEnding] = useState(false);
  const [zoom, setZoom] = useState<{ player: Player; character: number } | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  // the "+2" that rises off a card when someone completes it
  const [floaters, setFloaters] = useState<{ id: string; deck: DirectionDeck; slot: number; points: number }[]>([]);
  const seen = useRef<Set<string> | null>(null);

  const ep = game.episodes[game.episode - 1];
  useEffect(() => {
    const ids = new Set(ep.completed.map((c) => c.id));
    if (seen.current) {
      for (const c of ep.completed) {
        if (seen.current.has(c.id)) continue;
        const f = { id: c.id, deck: c.deck, slot: c.slot ?? 0, points: DIRECTION_POINTS[c.deck] };
        setFloaters((all) => [...all, f]);
        setTimeout(() => setFloaters((all) => all.filter((x) => x.id !== f.id)), 1100);
      }
    }
    seen.current = ids;
  }, [ep.completed]);

  const players = room.players.filter((p) => game.hands[p.id]);
  const mine = players.find((p) => p.id === me);
  const others = players.filter((p) => p.id !== me);
  const nameOf = (id: string) => room.players.find((p) => p.id === id)?.name ?? "Someone";
  const points = score(game);
  const epPoints = ep.completed.reduce((n, c) => n + DIRECTION_POINTS[c.deck] + c.tokens, 0);
  const running = game.phase === "playing" && game.endsAt !== null;
  const paused = game.phase === "playing" && game.pausedLeft !== null;
  const pickedCard = ep.completed.find((c) => c.id === picked) ?? null;

  const seatProps = { game, me, name, send, zoom: (player: Player, character: number) => setZoom({ player, character }) };

  if (game.phase === "over") {
    return (
      <div className={styles.room}>
        <div className={styles.tabletop}>
          <Finale room={room} game={game} isHost={isHost} send={send} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.room}>
      <div className={styles.tabletop}>
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
            <div className={styles.placard}>
              <span>
                Episode {game.episode} <small>of {EPISODES}</small>
              </span>
              <b>+{epPoints}</b>
            </div>
            <img
              key={ep.card}
              className={`${styles.episodeCard} ${styles.flipIn}`}
              src={art.episode(ep.card)}
              alt={name("episode", ep.card)}
              width="768"
              height="549"
              style={{ "--tilt": tilt(ep.card + 3) } as CSSProperties}
            />
            <div className={styles.pile} aria-label="Completed this episode">
              {ep.completed.length === 0 ? (
                <span className={styles.pileEmpty}>Completed cards go here</span>
              ) : (
                ep.completed.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`${styles.pileCard}${picked === c.id ? ` ${styles.pileCardPicked}` : ""}`}
                    style={{ "--i": i, "--tilt": tilt(c.i + i) } as CSSProperties}
                    onClick={() => setPicked((p) => (p === c.id ? null : c.id))}
                    aria-pressed={picked === c.id}
                    aria-label={`${name(c.deck, c.i)}, +${DIRECTION_POINTS[c.deck] + c.tokens}, by ${nameOf(c.by)}`}
                  >
                    <img src={art.direction(c.deck, c.i)} alt="" width="768" height="497" />
                    {c.tokens > 0 && (
                      <span className={styles.pileTokens}>
                        <img src={art.token} alt="" />
                        {c.tokens}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
            {pickedCard && (
              <div className={styles.pickedBar}>
                <span>
                  <b>+{DIRECTION_POINTS[pickedCard.deck] + pickedCard.tokens}</b> {nameOf(pickedCard.by)}
                </span>
                <button type="button" className={styles.chipButton} onClick={() => send({ t: "token", on: "card", id: pickedCard.id, add: true })}>
                  <img src={art.token} alt="" /> +1 token
                </button>
                {pickedCard.tokens > 0 && (
                  <button type="button" className={styles.chipButton} onClick={() => send({ t: "token", on: "card", id: pickedCard.id, add: false })}>
                    −1 token
                  </button>
                )}
                <button
                  type="button"
                  className={styles.chipButton}
                  onClick={() => {
                    send({ t: "undo", id: pickedCard.id });
                    setPicked(null);
                  }}
                >
                  Undo
                </button>
              </div>
            )}
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
                          className={`${styles.card} ${styles.flipIn}`}
                          style={{ "--tilt": tilt(card + slot) } as CSSProperties}
                          disabled={game.phase === "break"}
                          onClick={() => send({ t: "complete", deck, slot })}
                          aria-label={`Complete “${name(deck, card)}” (${DIRECTION_POINTS[deck]} points)`}
                        >
                          <img src={art.direction(deck, card)} alt="" width="768" height="497" />
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

          {/* #region the phone (the clock), callbacks, and the sticky note */}
          <aside className={styles.side}>
            <div className={`${styles.phone}${game.phase === "break" ? ` ${styles.phoneUp}` : ""}`} role="timer" aria-live="off">
              <span className={styles.phoneNotch} aria-hidden />
              <span className={styles.phoneLabel}>{game.phase === "break" ? "Time’s up!" : paused ? "Paused" : `Episode ${game.episode}`}</span>
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

            <section className={`${styles.callbacks}${game.episode === 1 ? ` ${styles.callbacksOff}` : ""}`} aria-labelledby="callbacks-title">
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
              <p className={styles.callbacksNote}>
                {game.episode === 1
                  ? "Open from episode 2: mention something from an earlier episode, tap that episode."
                  : "Someone mentioned an earlier episode? Tap it for a point."}
              </p>
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

            <section className={styles.note} aria-labelledby="note-title">
              <h3 id="note-title">What’s happened</h3>
              {game.log.length === 0 ? (
                <p>Nothing yet!</p>
              ) : (
                <ul>
                  {game.log.slice(0, 5).map((l) => (
                    <li key={l.id}>{l.text.replace(/\{([^}]+)\}/g, (_, id) => nameOf(id))}</li>
                  ))}
                </ul>
              )}
            </section>
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
