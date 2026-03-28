import { useState } from "react";
import { getRandomEventGoal } from "./ExampleEventGoal.js";
import PropTypes from "prop-types";
import styles from "../../css/utils/cards.module.css";

export const EventGoalCard = (props) => {
  let [eventGoalDetails] = useState(getRandomEventGoal(props.type));

  let type = props.type;
  if (
    props.type === "goal" ||
    props.type === "location" ||
    props.type === "episode"
  )
    type = "location";

  return (
    <div className={styles.eventGoalCardWrapper}>
      <div className={`${styles.eventGoalTextWrapper} ${styles[type]}`}>
        {eventGoalDetails.description}
      </div>
      <img
        loading="lazy"
        className={styles[type]}
        src={`/images/illustrations/${type}cardfront${props.randomNumber}.webp`}
        alt={`${type} card`}
      />
    </div>
  );
};

EventGoalCard.propTypes = {
  type: PropTypes.string.isRequired,
  randomNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default EventGoalCard;
