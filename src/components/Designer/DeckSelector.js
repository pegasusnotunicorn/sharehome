import React, { useEffect } from 'react';

//custom files
import Card from '../Card/Card.js';
import { NavLink } from 'react-router-dom';

function DeckSelector(props){

  //flip once on page load to get rid of no back page visible bug
  useEffect(()=>{
    document.querySelectorAll(".content .flipcard").forEach((elem)=>{
      elem.classList.add("is-flipped");
    });
  });

  //sizing for the cards on the CTAs
  let cardStyle = {
    width:"200px",
    height:"140px",
    fontSize:"5px",
  }

  //select a deck and remember it as selected
  let selectDeck = (type) => {
    props.setDesigning(type);
  }

  //details for the CTA buttons to select a deck
  let deckSelectorDetails = [
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
  ];

  //create the JSX from the above detail array
  let deckSelectors = deckSelectorDetails.map((elem, index)=>{
    return (
      <div
        key={elem.type + index}
        className="deckSelecter noselect"
        onClick={()=>{
          selectDeck(elem.type);
        }}
      >
        <Card
          type={elem.type}
          showFront={true}
          mainStyle={cardStyle}
        />
        <p>{elem.description}</p>
      </div>
    )
  });

  return (
    <div>
      <div className="subcontentWrapper border-bottom">
        <h2 className="subtitle">Design your own cards</h2>
        <p>
          Design custom cards of you and your friends to play with. Share the cards with the world so that anyone can play with them. The possibilities are endless!
        </p>
        <p>For more details on how these cards work, visit the <NavLink to="/about">How to Play page</NavLink>.</p>
      </div>
      <h3>Select a type of card to make</h3>
      <div className="deckSelecterWrapper">
        {deckSelectors}
      </div>
    </div>
  )
}

export default DeckSelector;
