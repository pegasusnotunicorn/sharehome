import React from 'react';
import { Document, Font } from '@react-pdf/renderer';

//styles for the PDF document/file
import PDFPage from './PDFPage.js';
import DynamicStylesPDF from '../../../css/Designer/DynamicStylesPDF.js';

//import fonts as variables because strings don't seem to work
import InterstateExtraLightCondensed from "../../../fonts/Interstate-ExtraLight-Cond.ttf";
import GenShinGothic from "../../../fonts/GenShinGothic-Monospace-ExtraLight.ttf";

//create a PDF document and use currentCard to change the inside text
function PDFDocument(props){
  const cards = props.cards;

  //create each page using cards array
  const listOfCards = cards.map((step, move) => {
    return (
      <PDFPage
        key={"PDFPage" + move}
        currentCard={step}
      />
    )
  });

  //register fonts here so each time document is made, fonts will be good
  Font.register({
    family: 'Interstate Extra Light Condensed',
    fontStyle: 'normal',
    fontWeight: 'normal',
    src: InterstateExtraLightCondensed
  });
  Font.register({
    family: 'Genshin Gothic Monospace ExtraLight',
    fontStyle: 'normal',
    fontWeight: 'normal',
    src: GenShinGothic
  });

  return (
    <Document class="PDFDocument" style={DynamicStylesPDF.document}>
      {listOfCards}
    </Document>
  );
}

export default PDFDocument;
