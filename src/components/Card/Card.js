import React, { useState, useEffect, useRef } from 'react';
import CardFrontPerson from './CardFrontPerson.js';
import CardFrontEventGoal from './CardFrontEventGoal.js';
import CardBack from "./CardBack.js";
import "../../css/cards.css"

//a flip-able card based on the actual cards
//props are - showFront, disableFlip, id, type, mainStyle
export const Card = (props) => {

  const [isClicked, setIsClicked] = useState(false);
  const [randomFlip] = useState(Math.random());
  const cardRef = useRef();

  let isFlippedClass, disableFlippedClass, disableShadowClass = "";

  //turn off random flip
  if (typeof props.showFront !== "undefined"){
    isFlippedClass = (props.showFront) ? "" : "is-flipped";
  }
  else {
    let flipPercentage = (typeof props.flipPercentage !== "undefined") ? props.flipPercentage : 0.5;
    isFlippedClass = (randomFlip > flipPercentage) ? "" : "is-flipped";
  }

  //disable flip
  disableFlippedClass = (props.disableFlip) ? "disable-flip" : "";

  //disable shadow
  disableShadowClass = (props.disableShadow) ? "disable-shadow" : "";

  //if clicked, dont flip
  isFlippedClass = (isClicked) ? "" : isFlippedClass;
  disableFlippedClass = (isClicked) ? "disable-flip" : disableFlippedClass;

  //click to disable rotation and bring to front
  const cardStyle = {
    ...props.mainStyle,
    zIndex: (isClicked) ? 100 : props.mainStyle.zIndex,
    transition: (isClicked) ? "0.25s" : props.mainStyle.transition,
  }

  //only for the footer
  //animate bottom + rotation to simulate "throwing" the cards from bottom
  useEffect(()=>{
    if (cardRef.current && typeof props.randomDegree !== "undefined"){
      let cardRefCurrent = cardRef.current;
      cardRefCurrent.style.bottom = props.randomBottom;
      cardRefCurrent.style.bottom = (isClicked) ? "40px" : props.randomBottom;
      cardRefCurrent.style.transform = (isClicked) ? "rotate(0deg)" : props.randomDegree;
    }
  }, [isClicked, props.randomBottom, props.transition, props.randomDegree]);

  return (
    <div
      id={props.id}
      ref={cardRef}
      className={
        "noselect flipcard "
        + isFlippedClass + " "
        + disableFlippedClass + " "
        + disableShadowClass + " "
        + props.className}
      style={cardStyle}
      onClick={()=>{
        if (typeof props.randomDegree !== "undefined"){
          setIsClicked(!isClicked);
        }
      }}
    >
      <div className="flipcardInner">
        <div className="noselect flipcardFront">
          <CardFront
            type={props.type}
            personName={props.personName}
          />
        </div>
        <div className="noselect flipcardBack">
          <CardBack {...props} />
        </div>
      </div>
    </div>
  )
}

//the front of the card
const CardFront = (props) => {
  let cardType = props.type;

  switch (cardType){
    case ("member"):
    case ("commentator"):
      return (
        <CardFrontPerson
          personName={props.personName}
        />
      );
    case ("goal"):
    case ("event"):
    default:
      return (
        <CardFrontEventGoal
          type={props.type}
        />
      );
  }
}

export default Card;
