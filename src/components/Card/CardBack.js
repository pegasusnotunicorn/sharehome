import React from 'react';

export const cardBackConstants = {
  member:{
    mainText:"Member\nCard",
    japaneseText:"メンバーカード",
    background:"#03C04E",
    color:"white",
    width:120,
    left:70,
  },
  commentator:{
    mainText:"Commentator\nCard",
    japaneseText:"コメンテーターカード",
    background:"#F9C22E",
    color:"black",
    width:160,
    left:50,
  },
  goal:{
    mainText:"Goal\nCard",
    japaneseText:"ゴールカード",
    background:"#2A188B",
    color:"white",
    width:100,
    left:80,
  },
  event:{
    mainText:"Event\nCard",
    japaneseText:"イベントカード",
    background:"#FF3A20",
    color:"white",
    width:120,
    left:70,
  }
}

export const CardBack = (props) => {

  let mainText = cardBackConstants[props.type].mainText;
  let subText = cardBackConstants[props.type].japaneseText;
  let mainTextStyle = {};

  let subTextStyle = {
    background : cardBackConstants[props.type].background,
    color : cardBackConstants[props.type].color,
  };

  //different spacing for commentator cards
  if (props.type === "commentator"){
    mainTextStyle.letterSpacing = "-.025em";
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
