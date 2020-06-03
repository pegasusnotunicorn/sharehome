import React from 'react';
import { NavLink, Redirect, Switch, Route } from 'react-router-dom';

import DeckCreator from './DeckCreator.js';
import DeckSelector from './DeckSelector.js';
import { getDefaultDeck } from '../utils/deckConstants.js';

import '../../../css/Designer/deckManager.css';

//show create a new deck or edit an existing deck
const DeckManager = (props) => {

  let decks = props.decks;
  let dispatchDeck = props.dispatchDeck;
  let currentDeckIndex = props.currentDeckIndex;
  let setCurrentDeckIndex = props.setCurrentDeckIndex;

  //create a new type of deck and start editing it
  let createNewDeck = (type) => {
    dispatchDeck({
      type:"add",
      item:getDefaultDeck(type),
    });
    setCurrentDeckIndex(decks.length);
  }

  //deletes a specific deck
  let deleteDeck = (index) => {
    dispatchDeck({
      type:"remove",
      index:index,
    });
    setCurrentDeckIndex(false);
  }

  //deletes a specific deck
  let duplicateDeck = (index) => {
    dispatchDeck({
      type:"add",
      item:{
        ...decks[index],
        createdOn: new Date(),
      },
    });
    setCurrentDeckIndex(decks.length);
  }

  return (
    <>
      <div className="subcontentWrapper border-bottom">
        <h2 className="subtitle">Design your own cards</h2>
        <p>
          Design custom cards of you and your friends to play with. Share the cards with the world so that anyone can play with them. The possibilities are endless!
        </p>
        <p>For more details on how these cards work, visit the <NavLink to="/about">How to Play page</NavLink>.</p>
      </div>
      { (Number.isInteger(currentDeckIndex))    //editing something
        ? <Redirect to="/designer/edit" />
        : (
          <Switch>
            <Route exact path="/designer/create" render={()=>{
              return (
                <DeckCreator
                  decks={decks}
                  createNewDeck={createNewDeck}
                />
              )
            }} />
            <Route render={()=>{
              //show selector if we have decks to choose from
              if (decks.length > 0){
                return <DeckSelector
                  decks={decks}
                  setCurrentDeckIndex={setCurrentDeckIndex}
                  deleteDeck={deleteDeck}
                  duplicateDeck={duplicateDeck}
                />
              }
              //if no decks, redirect to creator
              else {
                return <Redirect to="/designer/create" />
              }
            }} />
          </Switch>
        )
      }
    </>
  )
}

export default DeckManager;
