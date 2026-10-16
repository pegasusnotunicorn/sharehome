import { useId, useState } from "react";
import type { Character } from "../../types/character";
import styles from "../../css/pages/characterProfile.module.css";

// A character's story and hobbies, two white boxes side by side (on a phone, the rest of the story
// waits behind a button). The character pages have them under the card, and so does the card's close-up
// at the game table.
const CharacterDetails = ({ character: c, className }: { character: Character; className?: string }) => {
  const [story, setStory] = useState(false);
  const id = useId();
  return (
    <div className={`${styles.details}${className ? ` ${className}` : ""}`}>
      <section className={styles.box} aria-labelledby={`${id}-story`}>
        <h2 id={`${id}-story`} className={styles.label}>
          Their story
        </h2>
        <div className={`${styles.story} ${story ? styles.storyOpen : ""}`} id={`${id}-text`}>
          {c.description.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
        {c.description.length > 1 && (
          <button type="button" className={styles.storyToggle} aria-expanded={story} aria-controls={`${id}-text`} onClick={() => setStory((s) => !s)}>
            {story ? "Show less" : "Read more"}
          </button>
        )}
      </section>

      <section className={styles.box} aria-labelledby={`${id}-hobbies`}>
        <h2 id={`${id}-hobbies`} className={styles.label}>
          Hobbies
        </h2>
        <ul className={styles.hobbies}>
          {c.hobbies.map((h) => (
            <li key={h}>{h.trim()}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default CharacterDetails;
