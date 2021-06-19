import React from 'react';
import { NavLink, Redirect, Switch, Route, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import DeckCreator from './DeckCreator.js';
import DeckCopier from './DeckCopier.js';
import DeckSelector from './DeckSelector.js';

//show create a new deck or edit an existing deck
const DeckManager = (props) => {
  const { t } = useTranslation();

  let decks = props.decks;
  let dispatchDeck = props.dispatchDeck;
  let setCurrentDeckIndex = props.setCurrentDeckIndex;

  const history = useHistory();

  //create a new type of deck and go back to selector
  let createNewDeck = (newDeck) => {
    selectDecks([...Array(decks.length).keys()], false);
    dispatchDeck({
      type:"add",
      item:newDeck,
    });
    history.push("/designer");
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
        <h2 className="subtitle">{t("designer page.manager.title")}</h2>
        <p>
          {t("designer page.manager.description1")}
        </p>
        <p>{t("designer page.manager.description2")}<NavLink to="/about">{t("designer page.manager.description3")}</NavLink>{t("designer page.manager.description4")}</p>
      </div>
      <Switch>
        <Route exact path="/designer/create" render={()=>{
          return (
            <DeckCreator
              decks={decks}
              createNewDeck={createNewDeck}
            />
          )
        }} />
        <Route exact path="/designer/copy" render={()=>{
          return (
            <DeckCopier
              decks={decks}
              createNewDeck={createNewDeck}
              setCurrentDeckIndex={setCurrentDeckIndex}
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
    </>
  )
}

export default DeckManager;
