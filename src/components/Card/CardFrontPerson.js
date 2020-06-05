import React, { useState } from 'react';
import { getRandomPerson, getSpecificPerson } from './ExamplePeople.js';

export const CardFrontPerson = (props) => {

  let [cardPersonState] = useState(getRandomPerson());

  //check if there is a person name, if not get a random
  let cardPerson = (props.personName) ? getSpecificPerson(props.personName) : cardPersonState;

  let objectPositionX = (typeof cardPerson.image.x !== "undefined") ? cardPerson.image.x + "px" : "50%";
  let objectPositionY = (typeof cardPerson.image.y !== "undefined") ? cardPerson.image.y + "px" : "50%";

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
          objectPosition:objectPositionX + " " + objectPositionY
        }}
      />
    </div>
  )
}

export default CardFrontPerson;
