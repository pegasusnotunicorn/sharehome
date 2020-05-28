import React from 'react';

export const CardBack = (props) => {

  let mainText = "Goal\nCard";
  let mainTextStyle = {};

  let subText = "ゴールカード";
  let subTextStyle = {
    background : "#2A188B",
    color : "white",
  };

  //different types of cards
  if (props.type === "event"){
    mainText = "Event\nCard";
    subText = "イベントカード";
    subTextStyle.background = "#FF3A20";
  }
  else if (props.type === "member"){
    mainText = "Member\nCard";
    subText = "メンバーカード";
    subTextStyle.background = "#03C04E";
  }
  else if (props.type === "commentator"){
    mainText = "Commentator\nCard";
    mainTextStyle.letterSpacing = "-.025em";
    subText = "コメンテーターカード";
    subTextStyle.background = "#F9C22E";
    subTextStyle.color = "black";
  }

  return (
    <div className="noselect cardBack">
      <div className="cardBackText">
        <div className="cardBackMainText" style={mainTextStyle}>
          {mainText}
        </div>
        <div className="cardBackSubText" style={subTextStyle}>
          {subText}
        </div>
      </div>
    </div>
  )
}

export default CardBack;
