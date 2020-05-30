import React from 'react';
import AutosizeInput from 'react-input-autosize';

import dynamicStylesCard from '../../../css/Designer/dynamicStylesCard.js';

import '../../../css/Designer/cardViewer.css';

const CardViewer = (props) => {
  let currentCard = props.currentCard;
  let cardViewerDynamicStyles = dynamicStylesCard(props.viewerMagnifyValue, currentCard);

  return (
    <div
      className="cardViewer noselect contentWrapper"
      style={cardViewerDynamicStyles.style}
      onMouseOut={props.handleMouseUp}
    >
      <div className="cardViewerBleed nopointerevent" style={cardViewerDynamicStyles.bleedStyle}></div>
      <div className={"cardViewerText " + props.textNoPointerEvent} style={cardViewerDynamicStyles.textStyle}>
        <div style={cardViewerDynamicStyles.mainFont}>
          <AutosizeInput
            name="name"
            className="cardViewerInput name"
            inputStyle={cardViewerDynamicStyles.mainFont}
            type="text"
            onChange={props.handleInputChange}
            value={currentCard.name}
            placeholder={currentCard.name}
          />
          (<AutosizeInput
              name="age"
              className="cardViewerInput"
              inputStyle={cardViewerDynamicStyles.mainFont}
              type="number"
              extraWidth={0}
              onChange={props.handleInputChange}
              value={currentCard.age}
              placeholder={currentCard.age.toString()}
          />)
        </div>
        <div style={cardViewerDynamicStyles.subFont}>
          <AutosizeInput
            name="job"
            className="cardViewerInput"
            inputStyle={cardViewerDynamicStyles.subFont}
            type="text"
            onChange={props.handleInputChange}
            value={currentCard.job}
            placeholder={currentCard.job}
          />
          &nbsp;
          <AutosizeInput
            name="japaneseName"
            className="cardViewerInput japaneseName"
            inputStyle={cardViewerDynamicStyles.subFont}
            type="text"
            onChange={props.handleInputChange}
            value={currentCard.japaneseName}
            placeholder={currentCard.japaneseName}
          />
        </div>
      </div>
      <div className="cardViewerShadow nopointerevent"></div>
      <img
        draggable={false}
        className="cardViewerImage"
        alt={"Image credit - " + currentCard.image.credit}
        src={currentCard.image.url}
        style={cardViewerDynamicStyles.image}
        onMouseDown={props.handleMouseDown}
        onMouseUp={props.handleMouseUp}
        onMouseMove={props.handleMouseMove}
      />
    </div>
  )
}

export default CardViewer;
