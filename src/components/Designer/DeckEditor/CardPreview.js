import React from 'react';
import '../../../css/Designer/cardPreview.css';
import DynamicStylesCard from '../../../css/Designer/DynamicStylesCard.js';
import * as CardConstants from '../utils/CardConstants.js';

function cardPreview(props){
  let currentCard = props.currentCard;
  let cardPreviewDynamicStyles = DynamicStylesCard(CardConstants.previewMagnifyValue, currentCard);

  function handleClick(){
    props.handleClick(props.currentIndex);
  }

  return (
    <div
      id={props.id}
      onClick={handleClick}
      className={"cardPreviewBorder noselect" + props.ifCurrentCard}>
      <div className="cardPreview" style={cardPreviewDynamicStyles.style}>
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
    </div>
  )
}

export default cardPreview;
