import React, { useState, useEffect, useRef } from 'react';
import CardFrontPerson from './CardFrontPerson.js';
import CardFrontEventGoal from './CardFrontEventGoal.js';
import CardBack from "./CardBack.js";
import CardBackName from "./CardBackName.js";
import "../../css/utils/cards.css"

//a flip-able card based on the actual cards
//props are - showFront, disableFlip, id, type, mainStyle (width/height/fontSize)
export const Card = (props) => {
  const cardRef = useRef();
  const [isClicked, setIsClicked] = useState(false);
  const [disableFlip] = useState(props.disableFlip || false);
  const [disableShadow] = useState(props.disableShadow || false);

  //flipped = back of the card
  let flipped = false; //showing the front
  let flipPercentage = (typeof props.flipPercentage !== "undefined") ? props.flipPercentage : 0.5;
  const [showFront] = useState(props.showFront);      //forcibly show front (true) or back (false), undefined = flippable
  const [randomFlip] = useState(Math.random());

  //turn off random flip if force show front or back
  if (typeof showFront !== "undefined"){
    flipped = !props.showFront;
  }
  //chance of showing front of the card
  else if (randomFlip > flipPercentage){
    flipped = true;
  }

  const [isFlipped, setIsFlipped] = useState(flipped);
  const [initialFlipped] = useState(flipped);   //to remember the initial flipped state post click

  //don't render the front or the back
  const [hideFront] = useState(props.hideFront);
  const [hideBack] = useState(props.hideBack);

  //show person name on card back instead
  const [cardBackName] = useState(props.cardBackName);

  //disable stuff via classes
  let classes = "";
  if (disableShadow) classes += " disable-shadow ";
  if (disableFlip || isClicked) {
    classes += " disable-flip ";
  }

  //not clicked but flipped
  if (!isClicked && isFlipped){
    classes += " is-flipped ";
  }

  //if clicked show front and bring to center
  if (isClicked){
    classes += " is-clicked ";
  }

  //any props classnames
  if (props.className) classes += " " + props.className;

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
        + classes}
      style={cardStyle}
      onClick={()=>{
        //click only footer stuff
        if (typeof props.randomDegree !== "undefined"){
          setIsClicked(!isClicked);

          //clicking
          if (!isClicked){
            setIsFlipped(true);
          }
          else {
            setIsFlipped(initialFlipped);
          }
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
              disableText={props.disableText}
            />
          </div>
        }
        {
          cardBackName &&
          <div className="noselect flipcardBack name">
            <CardBackName {...props} />
          </div>
        }
        { !hideBack && !cardBackName &&
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
          disableText={props.disableText}
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
