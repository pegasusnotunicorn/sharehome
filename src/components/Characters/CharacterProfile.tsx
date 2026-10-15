import { useState } from "react";
import { Link } from "react-router";
import CardTurn from "../utils/CardTurn";
import CardViewer from "../utils/CardViewer";
import DefaultButton from "../utils/DefaultButton";
import { CHARACTER_CARD_MM, characterCardFaces } from "./characterCardFaces";
import { getAllCharacters } from "./Characters";
import type { CharacterWithNav } from "../../types/character";
import styles from "../../css/pages/characterProfile.module.css";

// The top of a character's page: who they are over their card in 3D, centred, with the characters
// either side of them a step away, round the cast (above the fold, on a phone too); below, their hobbies and their
// story side by side, and their emoji. On a phone the story waits behind a button.
const CharacterProfile = ({ character: c }: { character: CharacterWithNav }) => {
  const [story, setStory] = useState(false);
  const work = (job: string, employer: string | false | undefined) => (employer ? `${job} at ${employer}` : job);
  const jobs = [work(c.job, c.employer), c.job2 && work(c.job2, c.employer2)].filter(Boolean).join(" · ");
  // (round the cast: the last one's next is the first)
  const all = getAllCharacters(), at = c.index - 1;
  const prev = all[(at - 1 + all.length) % all.length], next = all[(at + 1) % all.length];
  const step = (to: typeof prev, dir: "prev" | "next") => (
      <Link to={`/characters/${to.urlName}`} className={`${styles.step} ${styles[dir]}`} aria-label={`${dir === "prev" ? "Previous" : "Next"}: ${to.name}`}>
        <span className={styles.stepArrow} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d={dir === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
          </svg>
        </span>
        <span className={styles.stepName}>{to.name}</span>
      </Link>
  );

  return (
    <article className={styles.profile} aria-labelledby="character-name">
      <div className={styles.topRow}>
        <Link to="/characters" className={styles.back}>
          <span aria-hidden="true">←</span> All characters
        </Link>
        <span className={styles.count}>
          {c.index} of {c.total}
        </span>
      </div>

      <header className={styles.head}>
        <p className={styles.eyebrow}>{c.title || `The ${c.race}`}</p>
        <h1 id="character-name" className={styles.name}>
          {c.name}
        </h1>
        <p className={styles.meta}>
          {c.age} years old · {jobs}
          {!c.employer && " (self employed)"}
        </p>
      </header>

      <div className={styles.stage}>
        {step(prev, "prev")}
        <div className={styles.card}>
          <CardViewer
            key={c.urlName}
            mm={CHARACTER_CARD_MM}
            edge="gold"
            faces={characterCardFaces(c)}
            label={`${c.name}'s card from Love, Career & Magic`}
            still={c.image.url}
            fallback={
              <CardTurn
                src={`/images/mockups/${c.urlName}.webp?v=2`}
                alt={`${c.name}'s card from Love, Career & Magic, front and back`}
              />
            }
          />
        </div>
        {step(next, "next")}
      </div>

      <div className={styles.details}>
        <section className={styles.box} aria-labelledby="hobbies-title">
          <h2 id="hobbies-title" className={styles.label}>
            Hobbies
          </h2>
          <ul className={styles.hobbies}>
            {c.hobbies.map((h) => (
              <li key={h}>{h.trim()}</li>
            ))}
          </ul>
        </section>

        <section className={styles.box} aria-labelledby="story-title">
          <h2 id="story-title" className={styles.label}>
            Their story
          </h2>
          <div className={`${styles.story} ${story ? styles.storyOpen : ""}`} id="character-story">
            {c.description.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
          <button
            type="button"
            className={styles.storyToggle}
            aria-expanded={story}
            aria-controls="character-story"
            onClick={() => setStory((s) => !s)}
          >
            {story ? "Show less" : "Read their story"}
          </button>
          <div className={styles.emojis}>
            {c.emoji.map((e) => (
              <DefaultButton key={e} variant="secondary" emoji={e} text="Download emoji" compact className={styles.emojiButton} />
            ))}
          </div>
        </section>
      </div>
    </article>
  );
};

export default CharacterProfile;
