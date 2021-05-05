import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeft } from 'react-feather';

import { getDefaultDeck } from '../utils/deckConstants.js';
import Card from '../../Card/Card.js';
import '../../../css/Designer/deckCreator.css';

//CTA buttons to create a new deck
const DeckCreator = (props) => {

  let deckTypes = [
    {
      type:"member",
      description:"Create custom Member Cards of your friends or family!",
    },
    {
      type:"commentator",
      description:"Create custom Commentator Cards of your friends or family!",
    },
    {
      type:"event",
      description:"Create a custom deck of Event Cards filled with your own adventures!",
    },
    {
      type:"goal",
      description:"Create a custom deck of your own dreams and goals!",
    },
  ].map((elem, index)=>{
    return (
      <div
        key={elem.type + index}
        className="deckCreator noselect"
        onClick={()=>{
          props.createNewDeck(getDefaultDeck(elem.type));
        }}
      >
        <Card
          type={elem.type}
          showFront={false}
          mainStyle={{
            width:"175px",
            height:"125px",
            fontSize:"4.75px",
          }}
        />
        <p>{elem.description}</p>
      </div>
    )
  });

  return (
    <div className="subcontentWrapper">
      <h3 className="subsubtitle">
        { props.decks.length > 0 &&
          <NavLink to="/designer"><ArrowLeft className="subtitleBackPageArrow" /></NavLink>
        }
        <span>Select a type of deck to make</span>
      </h3>
      <p>
        <NavLink to="/designer/copy">
          ...or click here to copy someone else's deck
        </NavLink>
      </p>
      <div className="deckCreatorWrapper">
        {deckTypes}
      </div>
    </div>
  )
}

export default DeckCreator;
