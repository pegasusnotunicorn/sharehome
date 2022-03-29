import React, { useState } from 'react';
import { getRandomEventGoal } from './ExampleEventGoal.js';

export const EventGoalCard = (props) => {

  let [eventGoalDetails] = useState(getRandomEventGoal(props.type));
  let eventGoalBackgroundColor = (props.type === "goal") ? "greenBackground" : "yellowBackground";
  let eventGoalNumber = (eventGoalDetails.exampleID) ? eventGoalDetails.exampleID : Math.round(Math.random() * 25);

  return (
    <div className={`eventGoalCardWrapper ${eventGoalBackgroundColor}`}>
      <div className="eventGoalTextWrapper">
        {eventGoalDetails.description}
      </div>
      <div className={`eventGoalBottomTextWrapper ${eventGoalBackgroundColor}`}>
        <span>{eventGoalDetails.deckName}</span>
        <span>#{eventGoalNumber}</span>
      </div>
    </div>
  )
}

export default EventGoalCard;
