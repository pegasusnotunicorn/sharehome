import React, { useState, useEffect } from 'react';
import { Download, PlusSquare, Trash2 } from 'react-feather';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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

  const [visibility, setVisibility] = useState("visible");

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
      number: (move === currentCardIndex) ? t("designer page.editor.sidebar.editing") : move + 1,
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
      <h3 className="sidebarTitle">{t("designer page.editor.sidebar.tools")}</h3>
      <div className="sidebarButtonWrapper sidebarContent">
        <div className="sidebarInputWrapper">
          <p>{t("designer page.editor.sidebar.deck name")}</p>
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
            placeholder={t("designer page.editor.sidebar.deck name placeholder")}
          />
        </div>
        <div className="sidebarInputWrapper">
          <p>{t("designer page.editor.sidebar.deck description")}</p>
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
            placeholder={t("designer page.editor.sidebar.deck description placeholder")}
          />
        </div>
        <ConfirmModalButton
          className="noselect button navbarButton sidebarButton"
          onClick={downloadDeck}
          icon={<Download />}
          text={t("designer page.editor.sidebar.download")}
          modalText={t("designer page.editor.sidebar.download prompt")}
        />
        <ConfirmModalButton
          className="noselect button navbarButton sidebarButton"
          onClick={resetAllCards}
          icon={<Trash2 />}
          text={t("designer page.editor.sidebar.reset")}
          modalText={t("designer page.editor.sidebar.reset prompt")}
        />
        <button className="noselect button navbarButton sidebarButton" onClick={addNewCard}><PlusSquare />{t("designer page.editor.sidebar.add")}</button>
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
      visibility={visibility}
      setVisibility={setVisibility}
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
