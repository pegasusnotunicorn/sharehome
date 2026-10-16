import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { Player, RoomView } from "../../../game-server/src/protocol";
import CardCarousel from "../utils/CardCarousel";
import DefaultButton from "../utils/DefaultButton";
import Icon from "../utils/Icons";
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
const front = (i: number) => `/images/pieces/characters/${String(i + 1).padStart(2, "0")}.webp`;
const back = (i: number) => `/images/pieces/characters/${String(i + 1).padStart(2, "0")}-back.webp`;
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
  // (it opens on yours, or the first one nobody has)
  const [at, setAt] = useState(() => mine ?? Math.max(0, CAST.findIndex((_, i) => !takenBy(i))));
  const [turning, setTurning] = useState(false);

  // Escape closes it, and the page behind doesn't scroll
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    addEventListener("keydown", onKey);
    const root = document.documentElement, was = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      removeEventListener("keydown", onKey);
      root.style.overflow = was;
    };
  }, [close]);

  const c = CAST[at];
  const other = takenBy(at);
  const me_ = room.players.find((p) => p.id === me);

  return createPortal(
    <div className={styles.backdrop} onClick={close}>
    <div className={styles.chooser} role="dialog" aria-modal="true" aria-label="Pick your character" onClick={(e) => e.stopPropagation()}>
      <header className={styles.head}>
        <h2 className={styles.title}>Pick your character</h2>
        <button type="button" className={`${modalStyles.closeBtn} ${styles.close}`} onClick={close} aria-label="Close">
          <Icon name="close" strokeWidth={2.6} className={modalStyles.closeIcon} />
        </button>
      </header>

      <CardCarousel
        index={at}
        count={CAST.length}
        mm={CHARACTER_CARD_MM}
        front={front}
        back={back}
        name={(i) => CAST[i].name}
        label={(i) => `${CAST[i].name}'s card`}
        onTurnStart={() => setTurning(true)}
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
        {mine === at ? (
          <DefaultButton onClick={close} text="That’s you!" icon="check" color="green" />
        ) : other ? (
          <DefaultButton disabled text={`Taken by ${other.name}`} icon="removePerson" />
        ) : (
          <DefaultButton
            onClick={() => {
              pick(at);
              close();
            }}
            text={`Play ${short(c.name)}`}
            icon="check"
            color="red"
          />
        )}
      </div>

      {/* the whole cast: a tap goes straight to one */}
      <ul className={styles.roster} aria-label="The cast">
        {CAST.map((ch, i) => {
          const taken = takenBy(i);
          const who = mine === i ? me_ : taken;
          return (
            <li key={ch.urlName}>
              <button
                type="button"
                className={`${styles.tile}${i === at ? ` ${styles.tileOn}` : ""}${taken ? ` ${styles.tileTaken}` : ""}${who ? ` ${styles.tilePicked}` : ""}`}
                style={{ "--seat": who ? colorOf(who) : undefined } as CSSProperties}
                onClick={() => !turning && setAt(i)}
                aria-label={`${ch.name}${taken ? `, ${taken.name} is playing them` : mine === i ? ", yours" : ""}`}
                aria-current={i === at}
              >
                <img src={`/images/emojis/${ch.emoji?.[0]}.webp`} alt="" draggable={false} loading="lazy" />
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
