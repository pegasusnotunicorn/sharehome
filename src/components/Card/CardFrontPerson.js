import React, { useState } from 'react';
import { getRandomPerson, getSpecificPerson } from './ExamplePeople.js';
import { pdfDimensions, getCoverFitObject } from '../Designer/utils/cardConstants.js';

export const CardFrontPerson = (props) => {

  let [cardPersonState] = useState(getRandomPerson());

  //check if there is a person name, if not get a random
  let cardPerson = (props.personName) ? getSpecificPerson(props.personName) : cardPersonState;

  //object position offset (ratio scales according to size of the card set in parent)
  let cardWidth = Number.parseInt(props.mainStyle.width);
  let cardHeight = Number.parseInt(props.mainStyle.height);
  let imageXY = getCoverFitObject(cardPerson.image.width, cardPerson.image.height, pdfDimensions.width, pdfDimensions.height);
  let cardXY = getCoverFitObject(cardPerson.image.width, cardPerson.image.height, cardWidth, cardHeight);
  let objectPositionX = (typeof cardPerson.image.x !== "undefined") ? Math.round(cardPerson.image.x * (cardXY.width / imageXY.width)) + "px" : "50%";
  let objectPositionY = (typeof cardPerson.image.y !== "undefined") ? Math.round(cardPerson.image.y * (cardXY.height / imageXY.height)) + "px" : "50%";

  return (
    <div className="memberCommCardWrapper">
      <div className="memberCommCardShadow"></div>
      <div className="memberCommCardText">
        <div className="memberCommCardMainText">
          {cardPerson.name} ({cardPerson.age})
        </div>
        <div className="memberCommCardSubText">
          {cardPerson.job}&nbsp;<span className="japaneseName">{cardPerson.japaneseName}</span>
        </div>
      </div>
      <img
        draggable={false}
        className="memberCommCardImage nopointerevent"
        alt={"Image credit - " + cardPerson.image.credit}
        src={cardPerson.image.url}
        style={{
          objectPosition:objectPositionX + " " + objectPositionY,
          transition:"all 0.5s",
        }}
      />
    </div>
  )
}

export default CardFrontPerson;
