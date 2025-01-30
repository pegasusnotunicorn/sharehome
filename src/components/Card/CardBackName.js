import { getSpecificPerson } from "../Characters/Characters.js";
import PropTypes from "prop-types";

export const CardBack = (props) => {
  let character = getSpecificPerson(props.personName);

  const name = character.name;
  const job = character.job;
  const age = `${character.age} year old`;
  const title = character.title ? character.title : `The ${character.race}`;

  return (
    <div className="noselect cardBack name">
      <div className="cardBackText">
        <h2 className="cardBackName">{name}</h2>
        <h2 className="cardBackTitle">—{title}—</h2>
        <h3 className="cardBackAge">
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
