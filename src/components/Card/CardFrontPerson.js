import { useState } from "react";
import {
  getRandomPerson,
  getSpecificPerson,
} from "../Characters/Characters.js";
import { pdfDimensions, getCoverFitObject } from "../utils/cardConstants.js";
import PropTypes from "prop-types";

export const CardFrontPerson = (props) => {
  let [cardPersonState] = useState(getRandomPerson());

  //check if there is a person name, if not get a random
  let cardPerson = props.personName
    ? getSpecificPerson(props.personName)
    : cardPersonState;
  let disableText =
    typeof props.disableText !== "undefined" ? props.disableText : false;
  let enableQuestionMark = props.enableQuestionMark
    ? props.enableQuestionMark
    : false;

  //object position offset (ratio scales according to size of the card set in parent)
  let cardWidth = Number.parseInt(props.mainStyle.width);
  let cardHeight = Number.parseInt(props.mainStyle.height);
  let imageXY = getCoverFitObject(
    cardPerson.image.width,
    cardPerson.image.height,
    pdfDimensions.width,
    pdfDimensions.height
  );
  let cardXY = getCoverFitObject(
    cardPerson.image.width,
    cardPerson.image.height,
    cardWidth,
    cardHeight
  );
  let objectPositionX =
    typeof cardPerson.image.x !== "undefined"
      ? Math.round(cardPerson.image.x * (cardXY.width / imageXY.width)) + "px"
      : "50%";
  let objectPositionY =
    typeof cardPerson.image.y !== "undefined"
      ? Math.round(cardPerson.image.y * (cardXY.height / imageXY.height)) + "px"
      : "50%";

  let mainText = disableText ? (
    ""
  ) : (
    <>
      <div className="memberCommCardShadow"></div>
      <div className="memberCommCardText">
        <div className="memberCommCardMainText">
          {cardPerson.name} ({cardPerson.age})
        </div>
        <div className="memberCommCardSubText">
          {cardPerson.job}&nbsp;
          <span className="japaneseName">{cardPerson.japaneseName}</span>
        </div>
      </div>
    </>
  );

  //enable question mark to signify random character card
  if (enableQuestionMark) {
    mainText = (
      <>
        <h1 className="memberCommCardQuestionMark">?</h1>
        <div className="memberCommCardFullShadow"></div>
      </>
    );
  }

  return (
    <div className="memberCommCardWrapper">
      {mainText}
      <img
        draggable={false}
        className="memberCommCardImage nopointerevent"
        alt={"Image credit - " + cardPerson.image.credit}
        src={cardPerson.image.url}
        style={{
          objectPosition: objectPositionX + " " + objectPositionY,
          transition: "all 0.5s",
        }}
      />
    </div>
  );
};

CardFrontPerson.propTypes = {
  mainStyle: PropTypes.object.isRequired,
  personName: PropTypes.string,
  disableText: PropTypes.bool,
  enableQuestionMark: PropTypes.bool,
};

export default CardFrontPerson;
