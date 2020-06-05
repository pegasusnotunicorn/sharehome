import React, { useState } from 'react';
import { getRandomEventGoal } from './ExampleEventGoal.js';

export const EventGoalCard = (props) => {

  let [eventGoalDetails] = useState(getRandomEventGoal(props.type));
  let eventGoalBorderColor = (props.type === "goal") ? "blueBorder" : "redBorder";

  return (
    <div className={"eventGoalCardWrapper " + eventGoalBorderColor}>
      <div className="eventGoalTextWrapper">
        {eventGoalDetails.description}
      </div>
    </div>
  )
}

export default EventGoalCard;
