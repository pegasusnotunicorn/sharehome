import React from 'react';

export const EventGoalCard = (props) => {
  let mainText = "Goal\nCard";
  let subText = "ゴールカード";
  let color = "#2A188B";

  if (props.type === "event"){
    mainText = "Event\nCard";
    subText = "イベントカード";
    color = "#FF3A20";
  }

  return (
    <div id={props.id} className="noselect eventGoalCard footerCard" style={props.mainStyle}>
      <div className="eventGoalCardText">
        <div className="eventGoalCardMainText">
          {mainText}
        </div>
        <div className="eventGoalCardSubText" style={{
          background: color,
        }}>
          {subText}
        </div>
      </div>
    </div>
  )
}
