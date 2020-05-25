import * as CardConstants from '../../components/Designer/utils/CardConstants.js';

//return dynamic styles for the card given a magnifyValue;
export function DynamicStylesCard(magnifyValue, currentCard){
  const padding = CardConstants.PDFDimensions.padding * magnifyValue;

  let styles = {
    style: {
      height: CardConstants.PDFDimensions.height * magnifyValue,
      width: CardConstants.PDFDimensions.width * magnifyValue
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
      fontSize: CardConstants.PDFDimensions.mainFont * magnifyValue,
    },
    subFont: {
      fontSize: CardConstants.PDFDimensions.subFont * magnifyValue,
    },
    numberFont: {
      fontSize: CardConstants.PDFDimensions.mainFont * magnifyValue * 3,
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

export default DynamicStylesCard;
