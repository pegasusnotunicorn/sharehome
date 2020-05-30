import React from 'react';

import * as cardConstants from '../utils/cardConstants.js';
import { reducerForArrays } from '../utils/reducerForArrays.js';
import { useStickyState, useStickyReducer } from '../utils/stickyHooks.js';
import { downloadPDFFile } from '../PDFDocument/downloadPDFFile.js';

import PDFDocument from '../PDFDocument/PDFDocument.js';
import Sidebar from './Sidebar.js';
import CardEditor from '../CardEditor/CardEditor.js';

//wrapper for card editor section (including input + PDF)
const DeckEditor = (props) => {

  //store in local window storage
  const [cards, dispatch] = useStickyReducer(reducerForArrays, [cardConstants.getDefaultCardObject()], "cards");
  const [currentCardIndex, setcurrentCardIndex] = useStickyState(0, "currentCardIndex");

  //updates the current card and updates it in the cards array
  const updateCurrentCard = (card) => {
    dispatch({
      type: 'update',
      index: currentCardIndex,
      item: card
    });

    //to implement an undo, i have access to what the card WAS here
    //just need to keep this in an array and access it whenever
  }

  //download the PDF file
  const downloadAllCards = () => {
    downloadPDFFile(<PDFDocument
      cards={cards}
    />, "SHAREHOME_Deck.pdf");
  }

  //deletes all cards and resets index to 0
  const resetAllCards = () => {
    setcurrentCardIndex(0);
    dispatch({
      type: 'reset',
      item: cardConstants.getDefaultCardObject()
    });
  }

  //adds a new card and sets the index to last
  const addNewCard = () => {
    setcurrentCardIndex(cards.length);
    dispatch({
      type: 'add',
      item: cardConstants.getDefaultCardObject()
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
      setcurrentCardIndex(newCurrentCardIndex);
      dispatch({
        type: 'remove',
        index: currentCardIndex
      });
    }
  }

  //duplicates the current card and sets the index to it
  const duplicateCurrentCard = () => {
    setcurrentCardIndex(cards.length);
    dispatch({
      type: 'add',
      item: {...cards[currentCardIndex]}
    });
  }

  //renders a specific card
  const goToCard = (cardIndex) => {
    setcurrentCardIndex(cardIndex);
  }

  return (
    <>
      <CardEditor
        cards={cards}
        currentCardIndex={currentCardIndex}
        viewerMagnifyValue={props.viewerMagnifyValue}
        cardFunctions={{
          updateCurrentCard:updateCurrentCard,
          removeCurrentCard:removeCurrentCard,
          duplicateCurrentCard:duplicateCurrentCard,
        }}
      />
      <Sidebar
        designing={props.designing}             //what type of deck am i currently editing
        setDesigning={props.setDesigning}       //function to go back and select a new deck
        cards={cards}                           //the cards i am editing
        currentCardIndex={currentCardIndex}     //the current index of the current card i am editing
        cardFunctions={{                        //various functions to edit cards / decks
          downloadAllCards:downloadAllCards,
          resetAllCards:resetAllCards,
          addNewCard:addNewCard,
          goToCard:goToCard,
        }}
      />
    </>
  );
}

export default DeckEditor;
