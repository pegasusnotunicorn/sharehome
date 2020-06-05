import React from 'react';
import { NavLink } from 'react-router-dom';

import Card from '../../Card/Card.js';
import '../../../css/Designer/deckCreator.css';

//CTA buttons to create a new deck
const DeckCreator = (props) => {

  let deckTypes = [
    {
      type:"member",
      description:"Create and play with custom Member Cards of your friends or family!",
    },
    {
      type:"commentator",
      description:"Create and play with custom Commentator Cards of your friends or family!",
    },
    {
      type:"event",
      description:"Create a custom deck of Event Cards filled with your own adventures!",
    },
    {
      type:"goal",
      description:"Create a custom deck of your own dreams and goals for being in SHAREHOME!",
    },
  ].map((elem, index)=>{
    return (
      <div
        key={elem.type + index}
        className="deckCreator noselect"
        onClick={()=>{
          props.createNewDeck(elem.type);
        }}
      >
        <Card
          type={elem.type}
          showFront={false}
          mainStyle={{
            width:"200px",
            height:"140px",
            fontSize:"5px",
          }}
        />
        <p>{elem.description}</p>
      </div>
    )
  });

  return (
    <div className="subcontentWrapper is-wider">
      <h3>Select a type of deck to make</h3>
      { props.decks.length > 0 &&
        <p><NavLink to="/designer">← Back to all decks</NavLink></p>
      }
      <div className="deckCreatorWrapper">
        {deckTypes}
      </div>
    </div>
  )
}

export default DeckCreator;
