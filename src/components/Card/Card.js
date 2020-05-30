import React from 'react';
import CardFrontPerson from './CardFrontPerson.js';
import CardFrontEventGoal from './CardFrontEventGoal.js';
import CardBack from "./CardBack.js";
import "../../css/cards.css"

//a flip-able card based on the actual cards
//props are - showFront, disableFlip, id, type, mainStyle
export const Card = (props) => {

  //turn off random flip
  let isFlippedClass = "";
  if (typeof props.showFront !== "undefined"){
    isFlippedClass = (props.showFront) ? "" : "is-flipped";
  }
  else {
    let flipPercentage = (typeof props.flipPercentage !== "undefined") ? props.flipPercentage : 0.5;
    isFlippedClass = (Math.random() > flipPercentage) ? "" : "is-flipped";
  }

  //disable flip
  let disableFlippedClass = (props.disableFlip) ? "disable-flip" : "";

  //the front of the card
  const CardFront = (props) => {
    let cardType = props.type;

    switch (cardType){
      case ("member"):
      case ("commentator"):
        return (<CardFrontPerson {...props} />);
      case ("goal"):
      case ("event"):
      default:
        return (<CardFrontEventGoal {...props} />);
    }
  }

  return (
    <div id={props.id} className={"flipcard " + isFlippedClass + " " + disableFlippedClass} style={props.mainStyle}>
      <div className="flipcardInner">
        <div className="noselect flipcardFront">
          <CardFront {...props} />
        </div>
        <div className="noselect flipcardBack">
          <CardBack {...props} />
        </div>
      </div>
    </div>
  )
}

export default Card;
