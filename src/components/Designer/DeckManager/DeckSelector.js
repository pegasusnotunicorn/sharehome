import React from 'react';
import { NavLink } from 'react-router-dom';
import { Trash2, Copy } from 'react-feather';

import Card from '../../Card/Card.js';
import ConfirmModalButton from '../utils/ConfirmModalButton.js';

//logic for handling deck selection
const DeckSelector = (props) => {

  const listOfDecks = props.decks.map((elem, index)=>{
    return (
      <div key={"existingDeck" + index} onClick={(e)=>{
        props.setCurrentDeckIndex(index);
      }} className="deckSelecter left-aligned">
        <h3>{elem.name}</h3>
        <Card
          type={elem.type}
          showFront={false}
          disableFlip={true}
          mainStyle={{
            width:"200px",
            height:"140px",
            fontSize:"5px",
          }}
        />
        <p>
          Created on
          <br />
          {new Date(elem.createdOn).toLocaleString()}
        </p>
        <div className="deckSelectorButtonWrapper">
          <ConfirmModalButton
            className="noselect button transparentBackground deckSelectorButton"
            onClick={()=>{
              props.deleteDeck(index);
            }}
            icon={<Trash2 />}
            text="Delete"
            modalText="Are you sure you want to delete this deck?"
          />
          <ConfirmModalButton
            className="noselect button transparentBackground deckSelectorButton"
            onClick={()=>{
              props.duplicateDeck(index);
            }}
            icon={<Copy />}
            text="Copy"
            modalText="Are you sure you want to copy this deck?"
          />
        </div>
      </div>
    )
  });


  //show deck editor if we're designing something, otherwise show deck selector
  return (
    <>
      <h3>Select an existing deck to edit</h3>
      <p><NavLink to="/designer/create">...or make a new deck!</NavLink></p>
      <div className="deckSelecterWrapper">
        {listOfDecks}
      </div>
    </>
  )
}

export default DeckSelector;
