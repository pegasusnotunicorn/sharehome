import React, { useState } from 'react';
import { ArrowLeft } from 'react-feather';

import { getImageObject, pdfDimensions } from '../utils/cardConstants.js';

import CardViewer from './CardViewer.js';
import CardButtons from './CardButtons.js';

import '../../../css/Designer/cardEditor.css';

//get the X and Y coordinates of mouse inside the bounding rect divided by magnifyValue
function getMouseXY(e, viewerMagnifyValue){
  let rect = e.currentTarget.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) / viewerMagnifyValue, //x position within the element.
    y: (e.clientY - rect.top) / viewerMagnifyValue,  //y position within the element.
  }
}

//wrapper for card editor section
//needs to get via props, the currentCard and setter for changing currentCard properties
const CardEditor = (props) => {
  const currentDeck = props.currentDeck;
  const currentCard = currentDeck.cards[currentDeck.currentCardIndex];

  //functions that update the deck
  const setCurrentDeckIndex = props.deckFunctions.setCurrentDeckIndex;

  //functions that update the current card
  const updateCurrentCard = props.cardFunctions.updateCurrentCard;
  const removeCurrentCard = props.cardFunctions.removeCurrentCard;
  const duplicateCurrentCard = props.cardFunctions.duplicateCurrentCard;

  //returns a new card details object with newValue for newProp
  const updateAndReturnCurrentCard = (newProp, newValue) => {
    return {
      ...currentCard,
      [newProp]: newValue
    }
  }

  //event handlers for inputs
  const handleInputChange = async (e) => {
    switch (e.target.name) {
      case 'image':
        if (e.target.files[0]){
          const tempImageURL = URL.createObjectURL(e.target.files[0]);
          const tempImageName = e.target.files[0].name;
          const file = e.target.files[0];

          //get new details (width / height) of uploaded image and generate a new image object
          let img = new Image();
          img.onload = function () {
            let tempCard = updateAndReturnCurrentCard("image", getImageObject(
              tempImageURL,
              tempImageName,
              img.width,
              img.height,
            ));

            tempCard.image.file = file;
            updateCurrentCard(tempCard);
          };

          img.src = tempImageURL;
        }
        break;
      default:
        updateCurrentCard(updateAndReturnCurrentCard(e.target.name, e.target.value));
        break;
    }
  }

  //handling image movement
  const [startingCoords, setStartingCoords] = useState(false);

  //set starting coordinates on mouse down
  const handleMouseDown = (e) => {
    let mouseXY = getMouseXY(e, props.viewerMagnifyValue);
    setStartingCoords({
      x: mouseXY.x,
      y: mouseXY.y
    });
  }
  const handleMouseUp = (e) => {
    setStartingCoords(false);
  }
  const handleMouseMove = (e) => {
    //if mouse down
    if (startingCoords){
      let mouseXY = getMouseXY(e, props.viewerMagnifyValue);
      let deltaX = startingCoords.x - mouseXY.x;
      let deltaY = startingCoords.y - mouseXY.y;

      setStartingCoords({
        x: mouseXY.x,
        y: mouseXY.y,
      });

      //dont let the image move outside of the bounds of the viewer
      let newX = currentCard.image.x - deltaX;
      let newY = currentCard.image.y - deltaY;
      let rightBound = -(currentCard.image.width - pdfDimensions.width);
      let botBound = -(currentCard.image.height - pdfDimensions.height);

      newX = (newX > 0) ? 0 : newX;     //prevent dragging to the right past left bound
      newX = (newX < rightBound) ? rightBound : newX; //prevent dragging to the left past right bound
      newY = (newY > 0) ? 0 : newY;     //prevent dragging to the bottom past top bound
      newY = (newY < botBound) ? botBound : newY; //prevent dragging to the top past bottom bound

      //click to drag/move image
      let tempCard = updateAndReturnCurrentCard("image", {
        ...currentCard.image,
        x: Math.round(newX),
        y: Math.round(newY),
      });
      updateCurrentCard(tempCard);
    }
  }

  return (
    <>
      <div className="subcontentWrapper border-bottom">
        <h2 className="subtitle">
          <ArrowLeft className="subtitleBackPageArrow" onClick={()=>{setCurrentDeckIndex(false)}} />
          <span>Now Editing - {currentDeck.name}</span>
        </h2>
        <h3 className="subsubtitle">
          {capitalize(props.currentDeck.type)} Cards
        </h3>
        <p>
          Click on any text inside the card below to edit it. You can also reposition the background image by clicking and dragging.
        </p>
      </div>
      <CardButtons
        currentDeck={currentDeck}
        handleInputChange={handleInputChange}
        removeCurrentCard={removeCurrentCard}
        duplicateCurrentCard={duplicateCurrentCard}
      />
      <CardViewer
        type={currentDeck.type}
        deckName={currentDeck.name}
        currentCard={currentCard}
        currentCardIndex={currentDeck.currentCardIndex}
        textNoPointerEvent={(startingCoords) ? "nopointerevent" : ""}   //so we can move image while over text, but let text be clickable
        handleMouseDown={handleMouseDown}
        handleMouseUp={handleMouseUp}
        handleMouseMove={handleMouseMove}
        handleInputChange={handleInputChange}
        viewerMagnifyValue={props.viewerMagnifyValue}
      />
    </>
  );
}

//capitalize first letter of a string
function capitalize(string){
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default CardEditor;
