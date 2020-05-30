import { StyleSheet } from '@react-pdf/renderer';
import * as cardConstants from '../../components/Designer/utils/cardConstants.js';

const dynamicStylesPDF = StyleSheet.create({
  page: {
    width: cardConstants.pdfDimensions.width,
    height: cardConstants.pdfDimensions.height,
    display: "block",
    position: "relative",
    color: "white",
    fontFamily: 'Interstate Extra Light Condensed',
  },
  view: {
    display: "inline-block",
    position:"relative",
    height: "100%",
    width: "100%",
    whiteSpace: "nowrap",
  },
  image: {
    objectFit: "cover",
    height: "100%",
  },
  canvas: {
    width: cardConstants.pdfDimensions.width,
    height: cardConstants.pdfDimensions.height/2,
    position:"absolute",
    display: "block",
    bottom:0
  },
  textMain: {
    fontSize: cardConstants.pdfDimensions.mainFont,
    padding: cardConstants.pdfDimensions.padding,
    paddingBottom: cardConstants.pdfDimensions.padding/2,
    position: "absolute",
    left: 0,
    bottom: 25,
    maxLines: 1,
    textTransform: "uppercase",
  },
  textSub: {
    fontSize: cardConstants.pdfDimensions.subFont,
    padding: cardConstants.pdfDimensions.padding,
    position: "absolute",
    left: 0,
    bottom: 0,
    maxLines: 1,
    paddingTop: 0,
    letterSpacing: 2,
  },
  japaneseName: {
    fontFamily: 'Genshin Gothic Monospace ExtraLight',
    color: "white",
    fontSize: 12
  },
});

export default dynamicStylesPDF;
