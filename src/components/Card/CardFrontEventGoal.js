import React, { useState } from 'react';
import { getRandomEventGoal } from './ExampleEventGoal.js';

export const EventGoalCard = (props) => {

  let [eventGoalDetails] = useState(getRandomEventGoal(props.type));
  let eventGoalBorderColor = (props.type === "goal") ? "blueBorder" : "redBorder";
  let eventGoalNumber = (eventGoalDetails.exampleID) ? eventGoalDetails.exampleID : Math.round(Math.random() * 25);

  return (
    <div className={"eventGoalCardWrapper " + eventGoalBorderColor}>
      <div className="eventGoalTextWrapper">
        {eventGoalDetails.description}
      </div>
      <div className="eventGoalBottomTextWrapper">
        <span>{eventGoalDetails.deckName}</span>
        <span>#{eventGoalNumber}</span>
      </div>
    </div>
  )
}

export default EventGoalCard;
