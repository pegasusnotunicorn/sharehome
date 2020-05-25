import React from 'react';
import { Download, PlusSquare, RefreshCcw } from 'react-feather';
import { DebugButtons } from '../utils/DebugTools.js';
import '../../../css/Designer/sidebar.css';

//sidebar for editing the deck
function Sidebar(props){
  return (
    <div className="sidebar">
      <div className="sidebarButtonWrapper sidebarContent">
        <button className="noselect button sideBarButton" onClick={props.downloadAllCards}><Download />Download All</button>
        <button className="noselect button sideBarButton" onClick={props.resetAllCards}><RefreshCcw />Reset All</button>
        <button className="noselect button sideBarButton" onClick={props.addNewCard}><PlusSquare />Add New Card</button>
        <DebugButtons
          currentCard={props.currentCard}
          currentIndex={props.currentIndex}
          cards={props.cards}
        />
      </div>
      <div className="cardPreviewWrapper sidebarContent">
        {props.listOfCards}
      </div>
    </div>
  );
}

export default Sidebar;
