import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import CardCarousel from "../utils/CardCarousel";
import CardTurn from "../utils/CardTurn";
import CharacterDetails from "./CharacterDetails";
import announce from "../../utils/announce";
import { CHARACTER_CARD_MM } from "./characterCardFaces";
import { characterTitle, getAllCharacters } from "./Characters";
import type { CharacterWithNav } from "../../types/character";
import styles from "../../css/pages/characterProfile.module.css";

// a character's printed card, by their place in the cast
const cardFront = (i: number) => `/images/pieces/characters/${String(i + 1).padStart(2, "0")}.webp`;
const cardBack = (i: number) => `/images/pieces/characters/${String(i + 1).padStart(2, "0")}-back.webp`;
// and a render of it in 3D, at rest (scripts/card-stills.mjs)
const cardStill = (i: number) => `/images/pieces/characters/stills/${String(i + 1).padStart(2, "0")}.webp`;

// The top of a character's page: who they are, over their card in 3D. Either side of it stand the cards
// of the characters round the cast from them, angled back like a rotary card file on its side
// (cardRing3d.ts): Prev / Next (or a click on one of them) swings them all round, the next card in to
// face you, and then it's that character's page. Below: their story and their hobbies side by side. On a
// phone the rest of their story waits behind a button.
const CharacterProfile = ({ character: c }: { character: CharacterWithNav }) => {
  const navigate = useNavigate();
  const work = (job: string, employer: string | false | undefined) => (employer ? `${job} at ${employer}` : `${job} (self-employed)`);
  const jobs = [work(c.job, c.employer), c.job2 && work(c.job2, c.employer2)].filter(Boolean).join(" · ");
  const all = getAllCharacters();
  // the words fade out while the cards swing round, and back in as the next character's
  const [hush, setHush] = useState(false);
  const from = useRef("");
  // on to the next character (Prev / Next, where focus stays): who it is now, read out
  const firstShown = useRef(c.urlName);
  useEffect(() => {
    if (c.urlName !== firstShown.current) announce(`${c.name}, ${c.index} of ${c.total}`);
  }, [c.urlName, c.name, c.index, c.total]);

  return (
    <article className={styles.profile} aria-labelledby="character-name">
      <div className={`${styles.topRow} ${styles.words} ${hush ? styles.hushed : ""}`}>
        <Link to="/characters" className={`${styles.back} tap-area`}>
          <span aria-hidden="true">←</span> All characters
        </Link>
        <span className={styles.count}>
          {c.index} of {c.total}
        </span>
      </div>

      <header className={`${styles.head} ${styles.words} ${hush ? styles.hushed : ""}`}>
        <p className={styles.eyebrow}>{characterTitle(c)}</p>
        <h1 id="character-name" className={styles.name}>
          {c.name}
        </h1>
        <p className={styles.meta}>
          {c.age} years old · {jobs}
        </p>
      </header>

      <CardCarousel
        index={c.index - 1}
        count={all.length}
        mm={CHARACTER_CARD_MM}
        front={cardFront}
        back={cardBack}
        render={cardStill}
        name={(i) => all[i].name}
        label={(i) => `${all[i].name}'s card from Love, Career & Magic`}
        href={(i) => `/characters/${all[i].urlName}`}
        fallback={(i) => (
          <CardTurn
            src={`/images/mockups/${all[i].urlName}.webp?v=2`}
            alt={`${all[i].name}'s card from Love, Career & Magic, front and back`}
          />
        )}
        onTurnStart={() => {
          from.current = window.location.pathname;
          setHush(true);
        }}
        onTurn={(i) => {
          // (cut short by leaving: another page, or Back to another character. Not this turn's to finish)
          if (window.location.pathname === from.current) navigate(`/characters/${all[i].urlName}`);
          requestAnimationFrame(() => setHush(false));
        }}
      />

      <CharacterDetails character={c} className={`${styles.words} ${hush ? styles.hushed : ""}`} />
    </article>
  );
};

export default CharacterProfile;
