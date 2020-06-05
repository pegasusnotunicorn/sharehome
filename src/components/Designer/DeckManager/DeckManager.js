import React from 'react';
import { NavLink, Redirect, Switch, Route, useHistory } from 'react-router-dom';

import DeckCreator from './DeckCreator.js';
import DeckSelector from './DeckSelector.js';
import { getDefaultDeck } from '../utils/deckConstants.js';

//show create a new deck or edit an existing deck
const DeckManager = (props) => {

  let decks = props.decks;
  let dispatchDeck = props.dispatchDeck;
  let currentDeckIndex = props.currentDeckIndex;
  let setCurrentDeckIndex = props.setCurrentDeckIndex;

  const history = useHistory();

  //create a new type of deck and go back to selector
  let createNewDeck = (type) => {
    dispatchDeck({
      type:"add",
      item:getDefaultDeck(type),
    });
    history.goBack();
  }

  //select or deselect an array of decks
  let selectDecks = (arrayOfIndex, selected) => {
    for (let i = 0; i < arrayOfIndex.length; i++){
      dispatchDeck({
        type:"update",
        index:arrayOfIndex[i],
        item:{
          ...decks[arrayOfIndex[i]],
          selected:selected,
        },
      });
    }
  }

  //deletes an array of decks
  let deleteDecks = (arrayOfIndex) => {
    dispatchDeck({
      type:"removemulti",
      indexes:arrayOfIndex,
    });
  }

  //duplicates an array of decks
  let duplicateDecks = (arrayOfIndex) => {
    for (let i = 0; i < arrayOfIndex.length; i++){
      dispatchDeck({
        type:"add",
        item:{
          ...decks[arrayOfIndex[i]],
          createdOn: new Date(),
        },
      });
    }
  }

  //add a new decks
  let addNewDeck = (newDeck) => {
    dispatchDeck({
      type:"add",
      item:{
        ...newDeck,
        createdOn: new Date(),
      }
    });
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
                  deckFunctions={{
                    setCurrentDeckIndex:setCurrentDeckIndex,
                    selectDecks:selectDecks,
                    deleteDecks:deleteDecks,
                    duplicateDecks:duplicateDecks,
                    addNewDeck:addNewDeck,
                  }}
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
