import * as cardConstants from '../../components/Designer/utils/cardConstants.js';
import { cardBackConstants } from '../../components/Card/CardBack.js';

//return dynamic styles for the card given a magnifyValue;
export function dynamicStylesCard(magnifyValue, type, currentCard){
  const padding = cardConstants.pdfDimensions.padding * magnifyValue;

  let styles = {
    style: {
      height: cardConstants.pdfDimensions.height * magnifyValue,
      width: cardConstants.pdfDimensions.width * magnifyValue
    },
    //divide by 2 here because we multiplied by 2 in constants for "real padding"
    bleedStyle: {
      borderRadius:padding / 2,
      height:"calc(100% - " + padding + "px)",
      width:"calc(100% - " + padding + "px)",
    },
    textWrapperStyle: {
      width:"calc(100% - " + padding * 2 + "px)",
    },
    numberFont: {
      fontSize: cardConstants.pdfDimensions.mainFont * magnifyValue * 3,
    },
  }

  //styling for person cards
  if (type === "member" || type === "commentator"){
    styles.textWrapperStyle = {
      ...styles.textStle,
      left: padding,
      bottom: padding,
    };
    styles.mainFont = {
      fontSize: cardConstants.pdfDimensions.mainFont * magnifyValue,
    };
    styles.subFont = {
      fontSize: cardConstants.pdfDimensions.subFont * magnifyValue,
    };

    //only if there is a card
    if (currentCard){
      styles.image = {
        objectPosition: Math.round(currentCard.image.x*magnifyValue) + "px " + Math.round(currentCard.image.y*magnifyValue) + "px",
      }
    }
  }

  //styling for eventgoal cards
  else if (type === "event" || type === "goal") {
    styles.textWrapperStyle = {
      ...styles.textStle,
      height:"calc(100% - " + padding * 2 + "px)",
      width:"calc(100% - " + padding * 2 + "px)",
      borderWidth:padding,
      borderColor:cardBackConstants[type].background,
      borderStyle:"solid",
    };
    styles.mainFont = {
      color:"black",
      background:"white",
      padding:padding * 0.5,
      fontSize: cardConstants.pdfDimensions.subFont * magnifyValue,
      height:"calc(100% - " + padding * 2.5 + "px)",
      width:"calc(100% - " + padding + "px)",
    };
    styles.subFont = {
      color:"black",
      background:"white",
      position:"absolute",
      bottom:0,
      borderTop:"1px solid black",
      padding:padding * 0.5,
      width:"calc(100% - " + padding + "px)",
      fontSize: (cardConstants.pdfDimensions.subFont * magnifyValue) / 2,
    }
  }

  return styles;
}

export default dynamicStylesCard;
