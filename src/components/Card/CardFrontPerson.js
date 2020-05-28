import React from 'react';
import { getRandomPerson, getSpecificPerson } from './ExamplePeople.js';

export const CardFrontPerson = (props) => {

  //check if there is a person name, if not get a random
  let cardPerson = (props.personName) ? getSpecificPerson(props.personName) : getRandomPerson(props.type);

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
        alt="Background for Card"
        src={cardPerson.image.url}
      />
    </div>
  )
}

export default CardFrontPerson;
