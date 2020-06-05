import React from 'react';
import { Document, Font } from '@react-pdf/renderer';

//styles for the PDF document/file
import PDFPage from './PDFPage.js';
import PDFBackPage from './PDFBackPage.js';

//import fonts as variables because strings don't seem to work
import InterstateExtraLightCondensed from "../../../fonts/Interstate-ExtraLight-Cond.ttf";
import GenShinGothic from "../../../fonts/GenShinGothic-Monospace-ExtraLight.ttf";

//create a PDF document and use currentCard to change the inside text
const PDFDocument = (props) => {
  const cards = props.cards;
  const deckName = props.deckName;
  const type = props.type;

  //create each page using cards array
  const listOfCards = cards.map((elem, index) => {
    return (
      <PDFPage
        key={"PDFPage" + index}
        type={type}
        currentCard={elem}
        currentCardIndex={index}
        deckName={deckName}
      />
    )
  });

  listOfCards.push(<PDFBackPage key={"PDFBackPage"} type={type} />);

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

  //words less than 30 will not be broken, anything above will be broken (without hyphen)
  Font.registerHyphenationCallback((word: string) => {
    if (word.length <= 30) {
      return [word];
    }

    return Array.from(word)
      .map((char) => [char, ''])
      .reduce((arr, current) => {
        arr.push(...current);
        return arr;
      }, []);
  });

  return (
    <Document class="PDFDocument">
      {listOfCards}
    </Document>
  );
}

export default PDFDocument;
