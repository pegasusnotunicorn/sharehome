import React from 'react';
import '../../../css/Designer/cardPreview.css';
import DynamicStylesCard from '../../../css/Designer/DynamicStylesCard.js';
import * as CardConstants from '../utils/CardConstants.js';
import { Plus } from 'react-feather';

function cardPreview(props){
  let currentCard = props.currentCard;
  let cardPreviewDynamicStyles = DynamicStylesCard(CardConstants.previewMagnifyValue, currentCard);

  const handleClick = () => {
    props.handleClick(props.currentIndex);
  }

  //plus button to add a new card
  if (props.addCard){
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
  else {
    return (
      <div
        id={props.id}
        onClick={handleClick}
        className={"cardPreview noselect" + props.ifCurrentCard} style={cardPreviewDynamicStyles.style}>
          <div className="cardPreviewBorder"></div>
          <div className="cardPreviewNumber" style={cardPreviewDynamicStyles.numberFont}>{props.number}</div>
          <div className="cardPreviewText" style={cardPreviewDynamicStyles.textStyle}>
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
}

export default cardPreview;
