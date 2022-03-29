import React from 'react';

export const CardBackEventGoal = (props) => {
  return (
    <div className="noselect cardBack">
      <img src={`/images/${props.type}card.jpg`} alt={`${props.type} card`} />
    </div>
  )
}

export default CardBackEventGoal;
