import React from 'react';

import * as cardConstants from '../utils/cardConstants.js';
import { downloadDeck } from '../utils/downloadPDFFile.js';

import Sidebar from './Sidebar.js';
import CardEditor from '../CardEditor/CardEditor.js';

//wrapper for card editor section (including input + PDF)
const DeckEditor = (props) => {
  const currentDeck = props.currentDeck;
  const updateCurrentDeck = props.updateCurrentDeck;
  const setCurrentDeckIndex = props.setCurrentDeckIndex;

  const cards = currentDeck.cards;
  const currentCardIndex = currentDeck.currentCardIndex;

  const viewerMagnifyValue = props.viewerMagnifyValue;

  //updates the current card and updates it in the cards array
  const updateCurrentCard = (card) => {
    let newCards = [...cards];
    newCards[currentCardIndex] = card;

    updateCurrentDeck({
      ...currentDeck,
      currentCardIndex:currentCardIndex,
      cards:newCards,
    });

    //to implement an undo, i have access to what the card WAS here
    //just need to keep this in an array and access it whenever
  }

  //deletes all cards and resets index to 0
  const resetAllCards = () => {
    let newCard = (["member", "commentator"].indexOf(currentDeck.type) !== -1)
                ? cardConstants.getDefaultPersonCard(cards[cards.length - 1].name)
                : cardConstants.getDefaultEventGoalCard(currentDeck.type);

    updateCurrentDeck({
      ...currentDeck,
      currentCardIndex:0,
      cards:[newCard],
    });
  }

  //adds a new card and sets the index to last
  const addNewCard = () => {
    let newCards = [...cards];
    let newCard = (["member", "commentator"].indexOf(currentDeck.type) !== -1)
                ? cardConstants.getDefaultPersonCard(cards[cards.length - 1].name)
                : cardConstants.getDefaultEventGoalCard(currentDeck.type, cards[cards.length - 1].exampleID);
    newCards.push(newCard);

    updateCurrentDeck({
      ...currentDeck,
      currentCardIndex:newCards.length - 1,
      cards:newCards,
    });
  }

  //deletes the current card and sets the index to last
  const removeCurrentCard = () => {
    const newLength = cards.length - 1;
    //if there are no more cards left, just reset
    if (newLength <= 0){
      resetAllCards();
    }
    else {
      let newCurrentCardIndex = (currentCardIndex - 1 <= 0 ) ? 0 : currentCardIndex - 1;
      let newCards = [...cards];
      newCards.splice(currentCardIndex, 1);

      updateCurrentDeck({
        ...currentDeck,
        currentCardIndex:newCurrentCardIndex,
        cards:newCards,
      });
    }
  }

  //duplicates the current card and sets the index to it
  const duplicateCurrentCard = () => {
    let newCards = [...cards];
    newCards.push(cards[currentCardIndex]);

    updateCurrentDeck({
      ...currentDeck,
      currentCardIndex:newCards.length - 1,
      cards:newCards,
    });
  }

  //renders a specific card
  const goToCard = (cardIndex) => {
    updateCurrentDeck({
      ...currentDeck,
      currentCardIndex:cardIndex,
    });
  }

  return (
    <>
      <CardEditor
        currentDeck={currentDeck}
        viewerMagnifyValue={viewerMagnifyValue}
        cardFunctions={{
          updateCurrentCard:updateCurrentCard,
          removeCurrentCard:removeCurrentCard,
          duplicateCurrentCard:duplicateCurrentCard,
        }}
      />
      <Sidebar
        currentDeck={currentDeck}
        deckFunctions={{
          updateCurrentDeck:updateCurrentDeck,
          setCurrentDeckIndex:setCurrentDeckIndex,
        }}
        cardFunctions={{
          downloadDeck:()=>{
            downloadDeck(currentDeck);
          },
          resetAllCards:resetAllCards,
          addNewCard:addNewCard,
          goToCard:goToCard,
        }}
      />
    </>
  );
}

export default DeckEditor;
