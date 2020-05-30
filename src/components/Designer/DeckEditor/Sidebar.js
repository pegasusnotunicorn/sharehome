import React, { useEffect } from 'react';
import { Download, PlusSquare, Trash2, ArrowLeft } from 'react-feather';

import { DebugButtons } from '../utils/DebugTools.js';
import CardPreview from './CardPreview.js';
import ConfirmModalButton from '../utils/ConfirmModalButton.js';
import NavbarTemplate from '../../Navbar/NavbarTemplate.js';

import '../../../css/Designer/sidebar.css';

//scroll to a cardPreview
function scrollTo(index){
  let currentDOMPreview = document.getElementById("cardPreview"+index);
  if (!!currentDOMPreview){
    document.getElementById("cardPreview"+index).scrollIntoView({behavior:"smooth"});
  }
}

//sidebar for editing the deck
function Sidebar(props){
  const cards = props.cards;
  const currentIndex = props.currentIndex;
  const currentCard = cards[currentIndex];

  const downloadAllCards = props.cardFunctions.downloadAllCards;
  const resetAllCards = props.cardFunctions.resetAllCards;
  const addNewCard = props.cardFunctions.addNewCard;
  const goToCard = props.cardFunctions.goToCard;

  //focus the current card in the preview pane
  useEffect(()=>{
    scrollTo(currentIndex);
  }, [currentIndex]);

  //renders a list of buttons to keep track of all cards in the deck (click to go to it)
  const listOfCards = cards.map((step, move) => {

    let cardPreviewProps = {
      key: "cardPreview" + move,
      id : "cardPreview" + move,
      currentCard: step,
      currentIndex: move,
      handleClick: goToCard,
      //current card is this button!
      ifCurrentCard : (move === currentIndex) ? " currentCard" : "",
      number : (move === currentIndex) ? "EDITING" : move + 1,
    }

    return (<CardPreview {...cardPreviewProps}/>);
  });

  //the plus card at the end to add a new card
  listOfCards.push((
    <CardPreview
      key="cardPreviewPlus"
      addCard={true}
      onClick={addNewCard}
    />
  ));

  //innards for the navbar template
  const innards = (
    <div>
      <h2 className="designerTitle" onClick={()=>{props.setDesigning(false)}}><ArrowLeft /><span>Back to decks</span></h2>
      <p className="currentlyEditing">Currently editing {props.designing} cards</p>
      <div className="sidebarButtonWrapper sidebarContent">
        <ConfirmModalButton
          className="noselect button navbarButton sidebarButton"
          onClick={downloadAllCards}
          icon={<Download />}
          text="Download All Cards (PDF)"
          modalText="Are you sure you want to download all the cards?"
        />
        <ConfirmModalButton
          className="noselect button navbarButton sidebarButton"
          onClick={resetAllCards}
          icon={<Trash2 />}
          text="Delete All Cards"
          modalText="Are you sure you want to delete all the cards?"
        />
        <button className="noselect button navbarButton sidebarButton" onClick={addNewCard}><PlusSquare />Add New Card</button>
        <DebugButtons
          currentCard={currentCard}
          currentIndex={currentIndex}
          cards={cards}
        />
      </div>
      <div className="cardPreviewWrapper sidebarContent">
        {listOfCards}
      </div>
    </div>
  );

  //use the navbar template but put sidebar innards inside
  return (
    <NavbarTemplate
      innards={innards}
      position="right"
      id="sidebar"
      startingPosition="visible"
    />
  )
}

export default Sidebar;
