import { useState } from "react";
import { Link } from "react-router";
import CardTurn from "../utils/CardTurn";
import CardViewer from "../utils/CardViewer";
import DefaultButton from "../utils/DefaultButton";
import { CHARACTER_CARD_MM, characterCardFaces } from "./characterCardFaces";
import type { CharacterWithNav } from "../../types/character";
import styles from "../../css/pages/characterProfile.module.css";

// The top of a character's page, laid out like the emoji section: one panel, their card in 3D on
// one side; on the other who they are, their hobbies (ticked off), their story and their emoji.
// On a phone the story waits behind a button.
const CharacterProfile = ({ character: c }: { character: CharacterWithNav }) => {
  const [story, setStory] = useState(false);
  const work = (job: string, employer: string | false | undefined) => (employer ? `${job} at ${employer}` : job);
  const jobs = [work(c.job, c.employer), c.job2 && work(c.job2, c.employer2)].filter(Boolean).join(" · ");

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

      <div className={styles.panel}>
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

        <div className={styles.copy}>
          <p className={styles.eyebrow}>{c.title || `The ${c.race}`}</p>
          <h1 id="character-name" className={styles.name}>
            {c.name}
          </h1>
          <p className={styles.lede}>
            {c.age} years old · {jobs}
            {!c.employer && " (self employed)"}
          </p>

          <h2 className={styles.label}>Hobbies</h2>
          <ul className={styles.ticks}>
            {c.hobbies.map((h) => (
              <li key={h}>{h.trim()}</li>
            ))}
          </ul>

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
              <DefaultButton key={e} variant="primary" color="dark" emoji={e} text="Download emoji" className={styles.emojiButton} />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
};

export default CharacterProfile;
