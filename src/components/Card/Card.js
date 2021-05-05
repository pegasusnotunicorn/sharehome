import React, { useState, useEffect, useRef } from 'react';
import CardFrontPerson from './CardFrontPerson.js';
import CardFrontEventGoal from './CardFrontEventGoal.js';
import CardBack from "./CardBack.js";
import "../../css/cards.css"

//a flip-able card based on the actual cards
//props are - showFront, disableFlip, id, type, mainStyle (width/height/fontSize)
export const Card = (props) => {

  const cardRef = useRef();
  const [isClicked, setIsClicked] = useState(false);
  const [showFront] = useState(props.showFront);      //forcibly show front (true) or back (false), undefined = flippable
  const [disableFlip] = useState(props.disableFlip || false);
  const [disableShadow] = useState(props.disableShadow || false);
  const [randomFlip] = useState(Math.random());

  //don't render the front or the back
  const [hideFront] = useState(props.hideFront);
  const [hideBack] = useState(props.hideBack);

  //disable stuff via classes
  let classes = "";
  if (disableShadow) classes += " disable-shadow ";
  if (disableFlip || isClicked) {
    classes += " disable-flip ";
  }
  //turn off random flip if force show front or back
  if (typeof showFront !== "undefined"){
    classes += (props.showFront) ? " " : " is-flipped ";
  }
  //else randomly flip the card on load based on flipPercentage
  else {
    let flipPercentage = (typeof props.flipPercentage !== "undefined") ? props.flipPercentage : 0.5;
    classes += (randomFlip > flipPercentage) ? " " : " is-flipped ";
  }

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
        + classes
        + props.className}
      style={cardStyle}
      onClick={()=>{
        if (typeof props.randomDegree !== "undefined"){
          setIsClicked(!isClicked);
        }
      }}
    >
      <div className="flipcardInner">
        { !hideFront &&
          <div className="noselect flipcardFront">
            <CardFront
              type={props.type}
              personName={props.personName}
              mainStyle={props.mainStyle}
            />
          </div>
        }
        { !hideBack &&
          <div className="noselect flipcardBack">
            <CardBack {...props} />
          </div>
        }
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
          mainStyle={props.mainStyle}
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
