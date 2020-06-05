import React from 'react';
import AutosizeInput from 'react-input-autosize';

import dynamicStylesCard from '../../../css/Designer/dynamicStylesCard.js';

import '../../../css/Designer/cardViewer.css';

const CardViewer = (props) => {
  let type = props.type;

  if (type === "member" || type === "commentator"){
    return <PersonCardViewer {...props} />
  }
  else {
    return <EventGoalCardViewer {...props} />
  }
}

//card viewer for member / commentator cards
const PersonCardViewer = (props) => {
  let currentCard = props.currentCard;
  let cardViewerDynamicStyles = dynamicStylesCard(props.viewerMagnifyValue, props.type, currentCard);

  return (
    <div
      className="cardViewer noselect contentWrapper"
      style={cardViewerDynamicStyles.style}
      onMouseOut={props.handleMouseUp}
      >
      <div className="cardViewerBleed nopointerevent" style={cardViewerDynamicStyles.bleedStyle}></div>
      <div className={"cardViewerText " + props.textNoPointerEvent} style={cardViewerDynamicStyles.textWrapperStyle}>
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

//card viewer for event / goal cards
const EventGoalCardViewer = (props) => {
  let currentCard = props.currentCard;
  let currentCardIndex = props.currentCardIndex;
  let deckName = props.deckName;
  let cardViewerDynamicStyles = dynamicStylesCard(props.viewerMagnifyValue, props.type, currentCard);

  let maxRows = 7;

  //prevent textarea from going too far (past 9 lines)
  const handleTextAreaInput = (e) => {
    let numberOfLines = calculateHeight(e.target);

    if (numberOfLines > maxRows) {
      return false;
    }
    else {
      props.handleInputChange(e);
    }
  }

  return (
    <div
      className="cardViewer noselect contentWrapper"
      style={cardViewerDynamicStyles.style}
    >
      <div className="cardViewerBleed nopointerevent" style={cardViewerDynamicStyles.bleedStyle}></div>
      <div className="cardViewerText" style={cardViewerDynamicStyles.textWrapperStyle}>
        <textarea
          name="description"
          className="cardViewerInput textarea"
          style={cardViewerDynamicStyles.mainFont}
          rows={maxRows}
          onChange={handleTextAreaInput}
          value={currentCard.description}
        />
        <div className="cardViewerDeckName" style={cardViewerDynamicStyles.subFont}>
          <span>{deckName}</span>
          <span>#{currentCardIndex + 1}</span>
        </div>
      </div>
    </div>
  )
}

//function to help calculate the total amount of lines in the textarea
function calculateContentHeight(ta, scanAmount) {
  let origHeight = ta.style.height,
      height = ta.offsetHeight,
      scrollHeight = ta.scrollHeight,
      overflow = ta.style.overflow;
  /// only bother if the ta is bigger than content
  if ( height >= scrollHeight ) {
    /// check that our browser supports changing dimension
    /// calculations mid-way through a function call...
    ta.style.height = (height + scanAmount) + 'px';
    /// because the scrollbar can cause calculation problems
    ta.style.overflow = 'hidden';
    /// by checking that scrollHeight has updated
    if ( scrollHeight < ta.scrollHeight ) {
      /// now try and scan the ta's height downwards
      /// until scrollHeight becomes larger than height
      while (ta.offsetHeight >= ta.scrollHeight) {
        ta.style.height = (height -= scanAmount)+'px';
      }
      /// be more specific to get the exact height
      while (ta.offsetHeight < ta.scrollHeight) {
        ta.style.height = (height++)+'px';
      }
      /// reset the ta back to it's original height
      ta.style.height = origHeight;
      /// put the overflow back
      ta.style.overflow = overflow;
      return height;
    }
  } else {
    return scrollHeight;
  }
}

//get the height of the textarea content then divide by each lineheight (font size) to get number of lines
function calculateHeight(ta) {
  let style = (window.getComputedStyle) ?
      window.getComputedStyle(ta) : ta.currentStyle,

  // This will get the line-height only if it is set in the css,
  // otherwise it's "normal"
      taLineHeight = parseInt(style.fontSize, 10),
  // Get the scroll height of the textarea
      taHeight = calculateContentHeight(ta, taLineHeight),
  // calculate the number of lines
      numberOfLines = Math.round(taHeight / taLineHeight);

  return numberOfLines;
};

export default CardViewer;
