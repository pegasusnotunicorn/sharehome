import * as cardConstants from '../../components/Designer/utils/cardConstants.js';

//return dynamic styles for the card given a magnifyValue;
export function dynamicStylesCard(magnifyValue, currentCard){
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
    textStyle: {
      left: padding,
      bottom: padding,
      width:"calc(100% - " + padding * 2 + "px)",
    },
    mainFont: {
      fontSize: cardConstants.pdfDimensions.mainFont * magnifyValue,
    },
    subFont: {
      fontSize: cardConstants.pdfDimensions.subFont * magnifyValue,
    },
    numberFont: {
      fontSize: cardConstants.pdfDimensions.mainFont * magnifyValue * 3,
    }
  }

  //only if there is a current card
  if (currentCard){
    styles.image = {
      objectPosition: Math.round(currentCard.image.x*magnifyValue) + "px " + Math.round(currentCard.image.y*magnifyValue) + "px",
    }
  }

  return styles;
}

export default dynamicStylesCard;
