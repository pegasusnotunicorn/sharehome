import React, { useState } from "react";
import { getRandomEventGoal } from "./ExampleEventGoal.js";

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
    <div className={`eventGoalCardWrapper`}>
      <div className={`eventGoalTextWrapper ${type}`}>
        {eventGoalDetails.description}
      </div>
      <img
        className={type}
        src={`/images/illustrations/${type}cardfront${props.randomNumber}.webp`}
        alt={`${type} card`}
      />
    </div>
  );
};

export default EventGoalCard;
