import React from 'react';

//custom files
import * as CardConstants from '../utils/CardConstants.js';
import DownloadPDFFile from '../PDFDocument/DownloadPDFFile.js';
import PDFDocument from '../PDFDocument/PDFDocument.js';
import Sidebar from './Sidebar.js';
import CardEditor from '../CardEditor/CardEditor.js';
import { useStickyState, useStickyReducer } from '../utils/stickyHooks.js';

//reducer to change state in react
//to add a new card use dispatch({ type: 'add', item: movie })
//to remove an existing card use dispatch({ type: 'remove', index })
//to update an existing card use dispatch({ type: 'update', index, value, property })
function reducer(state, action) {
  switch (action.type) {
    case 'add':
      return [...state, action.card];
    case 'remove':
      return state.filter((item, index) => {
        //remove item at index
        if(index === action.index) {
          return false;
        }
        // //remove item with property with value
        // else if (item[action.property] === action.value){
        //   return false;
        // }
        //every other item stays
        return true;
      });
    case 'update':
      return state.map((item, index) => {
        //replace the item at index
        if(index === action.index) {
          return action.card;
        }
        //leave every other item unchanged
        return item;
      });
    case 'reset':
      return [action.card];
    default:
      throw new Error();
  }
}

//current card using local storage if it exists
let currentCard = CardConstants.getDefaultCardObject();
if (window.localStorage.currentIndex && window.localStorage.cards){
  currentCard = JSON.parse(window.localStorage.cards)[JSON.parse(window.localStorage.currentIndex)];
}

//wrapper for card editor section (including input + PDF)
function DeckEditor(props){
  const [cards, dispatch] = useStickyReducer(reducer, [currentCard], "cards");;
  const [currentIndex, setCurrentIndex] = useStickyState(0, "currentIndex");

  //updates the current card and updates it in the cards array
  const updateCurrentCard = (card) => {
    currentCard = card;
    dispatch({
      type: 'update',
      index: currentIndex,
      card: currentCard
    });

    //if i want to implement an undo, i have access to what the card WAS here
    //just need to keep this in an array and access it whenever
    // console.log(cards[currentIndex]);
  }

  //download the PDF file
  const downloadAllCards = () => {
    DownloadPDFFile(<PDFDocument
      cards={cards}
    />, "SHAREHOME_Deck.pdf");
  }

  //deletes all cards and resets index to 0
  const resetAllCards = () => {
    currentCard = CardConstants.getDefaultCardObject();
    dispatch({
      type: 'reset',
      card: currentCard
    });
    setCurrentIndex(0);
  }

  //adds a new card and sets the index to last
  const addNewCard = () => {
    currentCard = CardConstants.getDefaultCardObject();
    dispatch({
      type: 'add',
      card: currentCard
    });
    setCurrentIndex(cards.length);
  }

  //deletes the current card and sets the index to last
  const removeCurrentCard = () => {
    const newLength = cards.length - 1;
    //if there are no more cards left, just reset
    if (newLength <= 0){
      resetAllCards();
    }
    else {
      let newCurrentIndex = (currentIndex - 1 <=0 ) ? 0 : currentIndex - 1;
      currentCard = cards[newCurrentIndex];
      dispatch({
        type: 'remove',
        index: currentIndex
      });
      setCurrentIndex(newCurrentIndex);
    }
  }

  //duplicates the current card and sets the index to it
  const duplicateCurrentCard = () => {
    currentCard = {...currentCard};
    dispatch({
      type: 'add',
      card: currentCard
    });
    setCurrentIndex(cards.length);
  }

  //renders a specific card
  const goToCard = (cardIndex) => {
    setCurrentIndex(cardIndex);
    currentCard = cards[cardIndex];
  }

  return (
    <div>
      <CardEditor
        cards={cards}
        currentCard={currentCard}
        viewerMagnifyValue={props.viewerMagnifyValue}
        cardFunctions={{
          updateCurrentCard:updateCurrentCard,
          removeCurrentCard:removeCurrentCard,
          duplicateCurrentCard:duplicateCurrentCard,
        }}
      />
      <Sidebar
        designing={props.designing}     //what type of deck am i currently editing
        setDesigning={props.setDesigning}  //function to go back and select a new deck
        cards={cards}                   //the cards i am editing
        currentIndex={currentIndex}     //the current index of the current card i am editing
        cardFunctions={{
          downloadAllCards:downloadAllCards,
          resetAllCards:resetAllCards,
          addNewCard:addNewCard,
          goToCard:goToCard,
        }}                              //various functions to edit cards / decks
      />
    </div>
  );
}

export default DeckEditor;
