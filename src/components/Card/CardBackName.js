import { getSpecificPerson } from "../Characters/Characters.js";
import PropTypes from "prop-types";
import styles from "../../css/utils/cards.module.css";

export const CardBack = (props) => {
  let character = getSpecificPerson(props.personName);

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

CardBack.propTypes = {
  personName: PropTypes.string,
};

export default CardBack;
