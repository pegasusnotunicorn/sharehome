import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { Player, RoomView } from "../../../game-server/src/protocol";
import CardCarousel from "../utils/CardCarousel";
import DefaultButton from "../utils/DefaultButton";
import Icon from "../utils/Icons";
import useDialogFocus from "../utils/useDialogFocus";
import announce from "../../utils/announce";
import { useOffline } from "./useRoom";
import { play } from "./sounds";
import { CHARACTER_CARD_MM } from "../Characters/characterCardFaces";
import { getAllCharacters } from "../Characters/Characters";
import { PLAYER_COLORS } from "./GameTable";
import modalStyles from "../../css/utils/modal.module.css";
import styles from "../../css/pages/chooser.module.css";

// The waiting room's character picker, a big dialog: the cast's cards in 3D like on the character pages
// (CardCarousel), turned through one at a time; under the card, a button to play them (or
// who has already); and under that the whole cast as a grid of faces, a fighting game's select screen:
// a tap goes straight to one, and who's taken whom is marked on it.

const CAST = getAllCharacters();
// the cards to turn through: a "?" card first (someone at random), then the cast (card i is CAST[i - 1])
const COUNT = CAST.length + 1;
const RANDOM = 0;
const front = (i: number) => (i === RANDOM ? "/images/pieces/characters/random-card.webp" : `/images/pieces/characters/${String(i).padStart(2, "0")}.webp`);
const back = (i: number) => (i === RANDOM ? "/images/pieces/characters/random-card-back.webp" : `/images/pieces/characters/${String(i).padStart(2, "0")}-back.webp`);
const nameOf = (i: number) => (i === RANDOM ? "Random" : CAST[i - 1].name);
// what they're called for short: "Köttr, The Grumpy" → Köttr, "Elias & Maya" stays two
const short = (name: string) => {
  if (name === "Domination Armor Set") return "Dommy"; // (what everyone calls them, as their card says)
  const n = name.replace(/["“”]/g, "");
  return /^\S+ & \S+/.test(n) ? n.split(" ").slice(0, 3).join(" ") : n.split(/[ ,]/)[0];
};
const colorOf = (p: Player) => PLAYER_COLORS[p.color % PLAYER_COLORS.length];

interface Props {
  room: RoomView;
  me: string;
  pick: (c: number) => void;
  close: () => void;
}

const CharacterChooser = ({ room, me, pick, close }: Props) => {
  const mine = room.picks?.[me];
  const takenBy = (c: number) => room.players.find((p) => p.id !== me && room.picks?.[p.id] === c);
  // (it opens on yours, or on the "?" card)
  const [at, setAt] = useState(() => (mine === undefined ? RANDOM : mine + 1));
  const [turning, setTurning] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const offline = useOffline();
  // focus in it, Tab kept in it, Escape closes it, focus back after
  useDialogFocus(panel, close);
  // the page behind doesn't scroll
  useEffect(() => {
    const root = document.documentElement, was = root.style.overflow;
    root.style.overflow = "hidden";
    return () => void (root.style.overflow = was);
  }, []);

  // a pick sent, waiting on the room: it closes once it's yours; if someone else got there first, it
  // stays open and says so
  const [asked, setAsked] = useState<number | null>(null);
  const [beaten, setBeaten] = useState<string | null>(null);
  useEffect(() => {
    if (asked === null) return;
    if (mine === asked) return close();
    const winner = room.players.find((p) => p.id !== me && room.picks?.[p.id] === asked);
    if (!winner) return;
    const text = `${winner.name} just took ${short(CAST[asked].name)}. Pick someone else!`;
    setBeaten(text);
    announce(text);
    setAsked(null);
  }, [asked, mine, room, me, close]);
  // (no word back at all, the connection gone, say: the button's free again)
  useEffect(() => {
    if (asked === null) return;
    const t = setTimeout(() => setAsked(null), 6000);
    return () => clearTimeout(t);
  }, [asked]);
  const choose = (c: number) => {
    setBeaten(null);
    setAsked(c);
    pick(c);
  };

  const c = at === RANDOM ? null : at - 1;
  const other = c === null ? undefined : takenBy(c);
  const me_ = room.players.find((p) => p.id === me);
  // someone nobody else has, at random (not the one you've got, if there's another)
  const pickRandom = () => {
    const free = CAST.map((_, i) => i).filter((i) => !takenBy(i));
    const fresh = free.filter((i) => i !== mine);
    const pool = fresh.length ? fresh : free;
    if (pool.length) choose(pool[Math.floor(Math.random() * pool.length)]);
    else close();
  };

  return createPortal(
    <div className={styles.backdrop} onClick={close}>
    <div ref={panel} className={styles.chooser} role="dialog" aria-modal="true" aria-label="Pick your character" onClick={(e) => e.stopPropagation()}>
      <header className={styles.head}>
        <h2 className={styles.title}>Pick your character</h2>
        <button type="button" className={`${modalStyles.closeBtn} ${styles.close}`} onClick={close} aria-label="Close">
          <Icon name="close" strokeWidth={2.6} className={modalStyles.closeIcon} />
        </button>
      </header>

      <CardCarousel
        index={at}
        count={COUNT}
        mm={CHARACTER_CARD_MM}
        front={front}
        back={back}
        name={nameOf}
        label={(i) => (i === RANDOM ? "A random character" : `${nameOf(i)}'s card`)}
        onTurnStart={() => {
          setTurning(true);
          play("turn");
        }}
        onTurn={(i) => {
          setAt(i);
          requestAnimationFrame(() => setTurning(false));
        }}
        keys
        hold
        cardWidth="min(420px, 100%, max(220px, calc((100dvh - var(--chrome)) * 1.45)))"
        className={styles.carousel}
      />

      <div className={`${styles.who}${turning ? ` ${styles.hushed}` : ""}`} aria-live="polite">
        {beaten && <p className={styles.beaten}>{beaten}</p>}
        {c === null ? (
          <DefaultButton onClick={pickRandom} text="Play anyone" icon="shuffle" color="red" disabled={offline} loading={asked !== null} />
        ) : other ? (
          <DefaultButton disabled text={`Taken by ${other.name}`} icon="removePerson" />
        ) : (
          <DefaultButton onClick={() => choose(c)} text={`Play ${short(CAST[c].name)}`} icon="check" color="red" disabled={offline} loading={asked === c} />
        )}
      </div>

      {/* the whole cast: a tap goes straight to one */}
      <ul className={styles.roster} aria-label="The cast">
        <li>
          <button
            type="button"
            className={`${styles.tile} ${styles.tileRandom}${at === RANDOM ? ` ${styles.tileOn}` : ""}`}
            onClick={() => !turning && setAt(RANDOM)}
            aria-label="Anyone, at random"
            aria-current={at === RANDOM}
          >
            <span className={styles.tileQ} aria-hidden>
              ?
            </span>
            <span className={styles.tileName}>Random</span>
          </button>
        </li>
        {CAST.map((ch, i) => {
          const taken = takenBy(i);
          const who = mine === i ? me_ : taken;
          return (
            <li key={ch.urlName}>
              <button
                type="button"
                className={`${styles.tile}${i + 1 === at ? ` ${styles.tileOn}` : ""}${taken ? ` ${styles.tileTaken}` : ""}${who ? ` ${styles.tilePicked}` : ""}`}
                style={{ "--seat": who ? colorOf(who) : undefined } as CSSProperties}
                onClick={() => !turning && setAt(i + 1)}
                aria-label={`${ch.name}${taken ? `, ${taken.name} is playing them` : mine === i ? ", yours" : ""}`}
                aria-current={i + 1 === at}
              >
                <img src={`/images/emojis/${ch.emoji?.[0]}.webp`} alt="" draggable={false} onLoad={(e) => e.currentTarget.classList.add(styles.tileIn)} />
                {/* (a shimmer where the face will be, till it's in) */}
                <span className={styles.tileSkel} aria-hidden />
                <span className={styles.tileName}>{short(ch.name)}</span>
                {who && <span className={styles.tileWho}>{mine === i ? "You" : who.name}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
    </div>,
    document.body
  );
};

export default CharacterChooser;
