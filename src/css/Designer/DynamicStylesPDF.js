import { StyleSheet } from '@react-pdf/renderer';
import * as CardConstants from '../../components/Designer/utils/CardConstants.js';

const DynamicStylesPDF = StyleSheet.create({
  page: {
    width: CardConstants.PDFDimensions.width,
    height: CardConstants.PDFDimensions.height,
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
    width: CardConstants.PDFDimensions.width,
    height: CardConstants.PDFDimensions.height/2,
    position:"absolute",
    display: "block",
    bottom:0
  },
  textMain: {
    fontSize: CardConstants.PDFDimensions.mainFont,
    padding: CardConstants.PDFDimensions.padding,
    paddingBottom: CardConstants.PDFDimensions.padding/2,
    position: "absolute",
    left: 0,
    bottom: 25,
    maxLines: 1,
    textTransform: "uppercase",
  },
  textSub: {
    fontSize: CardConstants.PDFDimensions.subFont,
    padding: CardConstants.PDFDimensions.padding,
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

export default DynamicStylesPDF;
