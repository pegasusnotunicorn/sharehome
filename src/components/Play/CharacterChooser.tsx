import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { Player, RoomView } from "../../../game-server/src/protocol";
import CardCarousel from "../utils/CardCarousel";
import DefaultButton from "../utils/DefaultButton";
import Icon from "../utils/Icons";
import { CHARACTER_CARD_MM } from "../Characters/characterCardFaces";
import { getAllCharacters } from "../Characters/Characters";
import { PLAYER_COLORS } from "./GameTable";
import styles from "../../css/pages/chooser.module.css";

// The waiting room's character picker: the whole screen, the cast's cards in 3D like on the character
// pages (CardCarousel), turned through one at a time; under the card, who it is and a button to play
// them (or who has already). The cast's faces along the bottom jump straight to one.

const CAST = getAllCharacters();
const front = (i: number) => `/images/pieces/characters/${String(i + 1).padStart(2, "0")}.webp`;
const back = (i: number) => `/images/pieces/characters/${String(i + 1).padStart(2, "0")}-back.webp`;
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
  const faces = useRef<HTMLDivElement>(null);

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
  // (the face of the one on show stays in view along the bottom)
  useEffect(() => {
    faces.current?.querySelector<HTMLElement>(`[data-i="${at}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [at]);

  const c = CAST[at];
  const other = takenBy(at);
  const me_ = room.players.find((p) => p.id === me);

  return createPortal(
    <div className={styles.chooser} role="dialog" aria-modal="true" aria-label="Pick your character">
      <header className={styles.head}>
        <h2 className={styles.title}>Pick your character</h2>
        <button type="button" className={styles.close} onClick={close} aria-label="Close">
          <Icon name="close" strokeWidth={2.6} />
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
        cardWidth="min(560px, 100%, calc((100dvh - 330px) * 1.45))"
        className={styles.carousel}
      />

      <div className={`${styles.who}${turning ? ` ${styles.hushed}` : ""}`} aria-live="polite">
        <p className={styles.eyebrow}>{c.title || `The ${c.race}`}</p>
        <p className={styles.name}>{c.name}</p>
        {mine === at ? (
          <DefaultButton onClick={close} text="That’s you!" icon="check" color="green" />
        ) : other ? (
          <DefaultButton disabled text={`${other.name} is playing them`} icon="removePerson" />
        ) : (
          <DefaultButton
            onClick={() => {
              pick(at);
              close();
            }}
            text={`Play ${c.name.split(/[ ,]/)[0]}`}
            icon="check"
            color="red"
          />
        )}
      </div>

      {/* the cast's faces: a tap goes straight to one */}
      <div className={styles.faces} ref={faces}>
        {CAST.map((ch, i) => {
          const taken = takenBy(i);
          const who = mine === i ? me_ : taken;
          return (
            <button
              key={ch.urlName}
              type="button"
              data-i={i}
              className={`${styles.face}${i === at ? ` ${styles.faceOn}` : ""}${taken ? ` ${styles.faceTaken}` : ""}`}
              style={{ "--seat": who ? colorOf(who) : undefined } as CSSProperties}
              onClick={() => !turning && setAt(i)}
              aria-label={`${ch.name}${taken ? `, ${taken.name} is playing them` : mine === i ? ", yours" : ""}`}
              aria-current={i === at}
            >
              <img src={`/images/emojis/${ch.emoji?.[0]}.webp`} alt="" draggable={false} loading="lazy" />
            </button>
          );
        })}
      </div>
    </div>,
    document.body
  );
};

export default CharacterChooser;
