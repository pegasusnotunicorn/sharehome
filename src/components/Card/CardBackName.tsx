import { getSpecificPerson } from "../Characters/Characters";
import styles from "../../css/utils/cards.module.css";

interface CardBackProps {
  personName?: string;
}

export const CardBack = (props: CardBackProps) => {
  const character = getSpecificPerson(props.personName || "");

  if (!character) return null;

  const name = character.name;
  const job = character.job;
  const age = `${character.age} year old`;
  const title = character.title ? character.title : `The ${character.race}`;

  return (
    <div className={`noselect ${styles.cardBack} ${styles.name}`}>
      <div className={styles.cardBackText}>
        <h2 className={styles.cardBackName}>{name}</h2>
        <h2 className={styles.cardBackTitle}>—{title}—</h2>
        <h3 className={styles.cardBackAge}>
          {age} {job}
        </h3>
      </div>
    </div>
  );
};

export default CardBack;
