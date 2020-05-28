import React from 'react';
import { getRandomEventGoal } from './ExampleEventGoal.js';

export const EventGoalCard = (props) => {
  let eventGoalDetails = getRandomEventGoal(props.type);
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
