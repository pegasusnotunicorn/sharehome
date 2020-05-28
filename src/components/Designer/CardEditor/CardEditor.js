import React, { useState } from 'react';

//custom files
import { getImageObject, PDFDimensions } from '../utils/CardConstants.js';
import CardViewer from './CardViewer.js';
import CardButtons from './CardButtons.js';
import { DebugPDFViewer } from '../utils/DebugTools.js';
import '../../../css/Designer/cardEditor.css';

//get the X and Y coordinates of mouse inside the bounding rect divided by magnifyValue
function getMouseXY(e, viewerMagnifyValue){
  let rect = e.currentTarget.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) / viewerMagnifyValue, //x position within the element.
    y: (e.clientY - rect.top) / viewerMagnifyValue,  //y position within the element.
  }
}

//wrapper for card editor section (including input + PDF)
//needs to get via props, the currentCard and setter for changing currentCard properties
function CardEditor(props){
  const currentCard = props.currentCard;

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
  const handleInputChange = (e) => {
    switch (e.target.name) {
      case 'image':
        if (e.target.files[0]){
          const tempImageURL = URL.createObjectURL(e.target.files[0]);
          const tempImageName = e.target.files[0].name;

          //get new details (width / height) of uploaded image and generate a new image object
          let img = new Image();
          img.onload = function () {
            let tempCard = updateAndReturnCurrentCard("image", getImageObject(
              tempImageURL,
              tempImageName,
              img.width,
              img.height,
            ));
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
      let rightBound = -(currentCard.image.width - PDFDimensions.width);
      let botBound = -(currentCard.image.height - PDFDimensions.height);

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
    <div>
      <CardViewer
        currentCard={currentCard}
        textNoPointerEvent={(startingCoords) ? "nopointerevent" : ""}   //so we can move image while over text, but let text be clickable
        handleMouseDown={handleMouseDown}
        handleMouseUp={handleMouseUp}
        handleMouseMove={handleMouseMove}
        handleInputChange={handleInputChange}
        viewerMagnifyValue={props.viewerMagnifyValue}
      />
      <CardButtons
        handleInputChange={handleInputChange}
        removeCurrentCard={removeCurrentCard}
        duplicateCurrentCard={duplicateCurrentCard}
      />
      <DebugPDFViewer
        viewerMagnifyValue={props.viewerMagnifyValue}
        startingCoords={startingCoords}
        cards={props.cards}
      />
    </div>
  );
}

export default CardEditor;
