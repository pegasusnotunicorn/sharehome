import { useState, useEffect, useRef } from "react";
import CardFrontPerson from "./CardFrontPerson";
import CardFrontDirectionEpisode from "./CardFrontDirectionEpisode";
import CardBackName from "./CardBackName";
import CardBackDirectionEpisode from "./CardBackDirectionEpisode";
import styles from "../../css/utils/cards.module.css";
import type { CardMainStyle } from "../../types/card";

interface CardProps {
  showFront?: boolean;
  disableFlip?: boolean;
  id?: string;
  type?: string;
  mainStyle: CardMainStyle;
  disableShadow?: boolean;
  flipPercentage?: number;
  className?: string;
  randomBottom?: string;
  transition?: string;
  randomDegree?: string;
  hideFront?: boolean;
  hideBack?: boolean;
  personName?: string;
  disableText?: boolean;
  enableQuestionMark?: boolean;
  cardBackName?: boolean;
}

//a flip-able card based on the actual cards
//props are - showFront, disableFlip, id, type, mainStyle (width/height/fontSize)
export const Card = (props: CardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isClicked, setIsClicked] = useState(false);
  const [disableFlip] = useState(props.disableFlip || false);
  const [disableShadow] = useState(props.disableShadow || false);

  //flipped = back of the card
  let flipped = false; //showing the front
  const flipPercentage =
    typeof props.flipPercentage !== "undefined" ? props.flipPercentage : 0.5;
  const [showFront] = useState(props.showFront); //forcibly show front (true) or back (false), undefined = flippable
  const [randomFlip] = useState(Math.random());

  //turn off random flip if force show front or back
  if (typeof showFront !== "undefined") {
    flipped = !props.showFront;
  }
  //chance of showing front of the card
  else if (randomFlip > flipPercentage) {
    flipped = true;
  }

  const [isFlipped, setIsFlipped] = useState(flipped);
  const [initialFlipped] = useState(flipped); //to remember the initial flipped state post click

  //disable stuff via classes
  let classes = "";
  if (disableShadow) classes += " disable-shadow ";
  if (disableFlip || isClicked) {
    classes += " disable-flip ";
  }

  //not clicked but flipped
  if (!isClicked && isFlipped) {
    classes += " is-flipped ";
  }

  //if clicked show front and bring to center
  if (isClicked) {
    classes += " is-clicked ";
  }

  //any props classnames
  if (props.className) classes += " " + props.className;

  //click to disable rotation and bring to front
  const cardStyle = {
    ...props.mainStyle,
    zIndex: isClicked ? 100 : props.mainStyle.zIndex,
    transition: isClicked ? "0.25s" : props.mainStyle.transition,
  };

  //only for the footer
  //animate bottom + rotation to simulate "throwing" the cards from bottom
  useEffect(() => {
    if (cardRef.current && typeof props.randomDegree !== "undefined") {
      const cardRefCurrent = cardRef.current;
      cardRefCurrent.style.bottom = isClicked ? "40px" : (props.randomBottom || "");
      cardRefCurrent.style.transform = isClicked
        ? "rotate(0deg)"
        : props.randomDegree;
    }
  }, [isClicked, props.randomBottom, props.transition, props.randomDegree]);

  //click for only footer stuff
  const onclickFunc = () => {
    if (typeof props.randomDegree !== "undefined") {
      setIsClicked(!isClicked);

      //clicking
      if (!isClicked) {
        setIsFlipped(true);
      } else {
        setIsFlipped(initialFlipped);
      }
    }
  };

  // get a random number from 0 to 2 if props is direction
  const randomNumber =
    props.type === "direction" ? Math.floor(Math.random() * 3) : "";

  return (
    <div
      id={props.id}
      ref={cardRef}
      className={`noselect ${styles.flipcard} ` + classes}
      style={cardStyle}
      onClick={onclickFunc}
    >
      <div className={styles.flipcardInner}>
        <CardFront {...props} randomNumber={randomNumber} />
        <CardBackComponent {...props} randomNumber={randomNumber} />
      </div>
    </div>
  );
};

interface CardFrontProps extends CardProps {
  randomNumber: string | number;
}

//the front of the card
const CardFront = (props: CardFrontProps) => {
  const cardType = props.type;

  if (props.hideFront) {
    return null;
  } else {
    switch (cardType) {
      case "member":
      case "commentator":
        return (
          <div className={`noselect ${styles.flipcardFront}`}>
            <CardFrontPerson
              personName={props.personName}
              mainStyle={props.mainStyle}
              disableText={props.disableText}
              enableQuestionMark={props.enableQuestionMark}
            />
          </div>
        );
      case "direction":
      case "episode":
      default:
        return (
          <div className={`noselect ${styles.flipcardFront}`}>
            <CardFrontDirectionEpisode
              type={props.type || ""}
              randomNumber={props.randomNumber}
            />
          </div>
        );
    }
  }
};

interface CardBackComponentProps extends CardProps {
  randomNumber: string | number;
}

//the back of the card (name / details for member, the image for direction / episode)
const CardBackComponent = (props: CardBackComponentProps) => {
  const cardType = props.type;

  if (props.hideBack) {
    return null;
  } else {
    switch (cardType) {
      case "member":
      case "commentator":
        return (
          <div className={`noselect ${styles.flipcardBack} ${styles.name}`}>
            <CardBackName personName={props.personName} />
          </div>
        );
      case "direction":
      case "episode":
      default:
        return (
          <div className={`noselect ${styles.flipcardBack}`}>
            <CardBackDirectionEpisode type={props.type} randomNumber={props.randomNumber} />
          </div>
        );
    }
  }
};

export default Card;
