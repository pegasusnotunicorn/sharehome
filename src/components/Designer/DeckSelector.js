import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';

import { reducerForArrays } from './utils/reducerForArrays.js';
import { useStickyReducer } from './utils/stickyHooks.js';

import DeckEditor from './DeckEditor/DeckEditor.js';
import Card from '../Card/Card.js';

//CTA buttons to actually select the deck
const DeckSelectorCTA = (props) => {

  //flip once on page load to get rid of no back page visible bug
  useEffect(()=>{
    document.querySelectorAll(".content .flipcard").forEach((elem)=>{
      elem.classList.add("is-flipped");
    });
  });

  let deckSelectors = [
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
        className="deckSelecter noselect"
        onClick={()=>{
          props.selectDeck(elem.type);
        }}
      >
        <Card
          type={elem.type}
          showFront={true}
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
    <>
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
    </>
  )
}

//logic for handling deck selection
const DeckSelector = (props) => {

  //current deck using local storage if it exists
  let currentDeck = {};
  if (window.localStorage.currentDeckIndex && window.localStorage.decks){
    currentDeck = JSON.parse(window.localStorage.decks)[JSON.parse(window.localStorage.currentDeckIndex)];
  }

  const [decks, dispatch] = useStickyReducer(reducerForArrays, [currentDeck], "decks");

  //select a deck and remember it as selected
  let selectDeck = (type) => {
    props.setDesigning(true);     //we are now designing so hide the deck selector
  }

  //show deck editor if we're designing something, otherwise show deck selector
  return (
    <>
      { props.designing
        ? <DeckEditor
            viewerMagnifyValue={3}
            setDesigning={props.setDesigning}
          />
        : <DeckSelectorCTA
            selectDeck={selectDeck}
          />
      }
    </>
  )
}

export default DeckSelector;
