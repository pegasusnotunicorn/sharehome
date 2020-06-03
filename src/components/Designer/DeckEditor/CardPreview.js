import React from 'react';
import { Plus } from 'react-feather';

import * as cardConstants from '../utils/cardConstants.js';
import dynamicStylesCard from '../../../css/Designer/dynamicStylesCard.js';

import '../../../css/Designer/cardPreview.css';

//the preview card in the sidebar (member / commentator / event / goal / plus (to add new card))
const CardPreview = (props) => {

  //plus button to add a new card
  if (props.addCard){
    return <PlusToAddCardPreview {...props} />
  }
  else {

    //person card
    if (["member", "commentator"].indexOf(props.type) !== -1){
      return <PersonCardPreview {...props} />
    }
    //event or goal card
    else {
      return <EventGoalCardPreview {...props} />
    }

  }
}

//plus button to add new card in sidebar
const PlusToAddCardPreview = (props) => {
  let cardPreviewDynamicStyles = dynamicStylesCard(cardConstants.previewMagnifyValue);

  return (
    <div
      onClick={props.onClick}
      className={"cardPreview is-plus noselect"}
      style={cardPreviewDynamicStyles.style}
    >
        <div className="cardPreviewNumber is-plus"><Plus className="is-48"/></div>
    </div>
  )
}

//person card preview for sidebar
const PersonCardPreview = (props) => {
  let currentCard = props.currentCard;
  let cardPreviewDynamicStyles = dynamicStylesCard(cardConstants.previewMagnifyValue, props.type, currentCard);

  return (
    <div
      id={props.id}
      onClick={()=>{
        props.handleClick(props.currentCardIndex);
      }}
      className={"cardPreview noselect" + props.ifCurrentCard} style={cardPreviewDynamicStyles.style}>
        <div className="cardPreviewBorder"></div>
        <div className="cardPreviewNumber" style={cardPreviewDynamicStyles.numberFont}>{props.number}</div>
        <div className="cardPreviewTextWrapper person" style={cardPreviewDynamicStyles.textWrapperStyle}>
          <div className="cardPreviewMainText" style={cardPreviewDynamicStyles.mainFont}>
            {currentCard.name}({currentCard.age})
          </div>
          <div className="cardPreviewSubText" style={cardPreviewDynamicStyles.subFont}>
            {currentCard.job}&nbsp;<span className="japaneseName">{currentCard.japaneseName}</span>
          </div>
        </div>
        <div className="cardPreviewShadow"></div>
        <img
          draggable={false}
          className="cardPreviewImage nopointerevent"
          alt="Background for Card"
          src={currentCard.image.url}
          style={cardPreviewDynamicStyles.image}
        />
    </div>
  )
}

//event / goal card preview for sidebar
const EventGoalCardPreview = (props) => {
  let currentCard = props.currentCard;
  let cardPreviewDynamicStyles = dynamicStylesCard(cardConstants.previewMagnifyValue, props.type, currentCard);

  return (
    <div
      id={props.id}
      onClick={()=>{
        props.handleClick(props.currentCardIndex);
      }}
      className={"cardPreview noselect" + props.ifCurrentCard} style={cardPreviewDynamicStyles.style}>
        <div className="cardPreviewBorder"></div>
        <div className="cardPreviewNumber" style={cardPreviewDynamicStyles.numberFont}>{props.number}</div>
        <div className="cardPreviewTextWrapper eventgoal" style={cardPreviewDynamicStyles.textWrapperStyle}>
          <textarea
            disabled
            className="cardPreviewTextarea"
            style={cardPreviewDynamicStyles.mainFont}
            rows="9"
            value={currentCard.description}
          />
        </div>
    </div>
  )
}

export default CardPreview;
