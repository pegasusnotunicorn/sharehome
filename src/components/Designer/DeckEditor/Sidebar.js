import React, { useEffect } from 'react';
import { Download, PlusSquare, Trash2 } from 'react-feather';

import NavbarTemplate from '../../Navbar/NavbarTemplate.js';
import CardPreview from './CardPreview.js';
import ConfirmModalButton from '../../utils/ConfirmModalButton.js';

import '../../../css/Designer/sidebar.css';

// <ConfirmModalButton
//   className="noselect button navbarButton sidebarButton"
//   onClick={uploadCurrentDeck}
//   icon={<UploadCloud />}
//   text="Share Deck Online"
//   modalText="Are you sure you want to upload this deck and share it online? <br /> <br /> By uploading this deck, you are agreeing that you have the legal rights to all the images and texts contained in this deck."
// />

//sidebar for editing the deck
const Sidebar = (props) => {
  const currentDeck = props.currentDeck;
  const cards = currentDeck.cards;
  const currentCardIndex = currentDeck.currentCardIndex;

  //functiosn that update the deck
  const updateCurrentDeck = props.deckFunctions.updateCurrentDeck;
  // const uploadCurrentDeck = props.deckFunctions.uploadCurrentDeck;

  //functions that update cards inside the deck
  const downloadDeck = props.cardFunctions.downloadDeck;
  const resetAllCards = props.cardFunctions.resetAllCards;
  const addNewCard = props.cardFunctions.addNewCard;
  const goToCard = props.cardFunctions.goToCard;

  //focus the current card in the preview pane
  useEffect(()=>{
    scrollTo(currentCardIndex);
  }, [currentCardIndex]);

  //renders a list of buttons to keep track of all cards in the deck (click to go to it)
  const listOfCards = cards.map((step, move) => {

    let cardPreviewProps = {
      key: "cardPreview" + move,
      id: "cardPreview" + move,
      type: currentDeck.type,
      deckName: currentDeck.name,
      currentCard: step,
      currentCardIndex: move,
      handleClick: goToCard,
      //current card is this button!
      ifCurrentCard: (move === currentCardIndex) ? " currentCard" : "",
      number: (move === currentCardIndex) ? "EDITING" : move + 1,
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
    <>
      <h3 className="sidebarTitle">Deck Editing Tools</h3>
      <div className="sidebarButtonWrapper sidebarContent">
        <div className="sidebarInputWrapper">
          <p>Edit deck name</p>
          <input
            name="name"
            className="input"
            type="text"
            onChange={(e)=>{
              updateCurrentDeck({
                ...currentDeck,
                name:e.target.value
              });
            }}
            value={currentDeck.name}
            placeholder="Enter deck name here."
          />
        </div>
        <div className="sidebarInputWrapper">
          <p>Edit deck description</p>
          <input
            name="name"
            className="input"
            type="text"
            onChange={(e)=>{
              updateCurrentDeck({
                ...currentDeck,
                description:e.target.value
              });
            }}
            value={currentDeck.description}
            placeholder="Enter deck description here."
          />
        </div>
        <ConfirmModalButton
          className="noselect button navbarButton sidebarButton"
          onClick={downloadDeck}
          icon={<Download />}
          text="Download All Cards (PDF)"
          modalText="Are you sure you want to download all the cards?"
        />
        <ConfirmModalButton
          className="noselect button navbarButton sidebarButton"
          onClick={resetAllCards}
          icon={<Trash2 />}
          text="Reset All Cards"
          modalText="Are you sure you want to reset this deck? All cards will be deleted and the deck will be set to default values."
        />
        <button className="noselect button navbarButton sidebarButton" onClick={addNewCard}><PlusSquare />Add New Card</button>
      </div>
      <div className="cardPreviewWrapper sidebarContent">
        {listOfCards}
      </div>
    </>
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


//scroll to a cardPreview
function scrollTo(index){
  let currentDOMPreview = document.getElementById("cardPreview"+index);
  if (!!currentDOMPreview){
    document.getElementById("cardPreview"+index).scrollIntoView({behavior:"smooth"});
  }
}
