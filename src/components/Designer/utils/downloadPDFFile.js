import React from 'react';
import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import JsZip from 'jszip';

import PDFDocument from '../PDFDocument/PDFDocument.js';

//function to download blob data to a file
async function downloadPDFFile(documentData, fileName){
  const blob = await pdf(documentData).toBlob();
  saveAs(blob, fileName);
};

//download a single deck
export const downloadDeck = (currentDeck) => {
  downloadPDFFile(<PDFDocument
    cards={currentDeck.cards}
    deckName={currentDeck.name}
    type={currentDeck.type}
  />, currentDeck.name);
}

//download multiple decks
export const downloadDecks = async (arrayOfIndex, decks) => {
  let zip = new JsZip();

  //create zip file for selected decks
  for (let i = 0; i < arrayOfIndex.length; i++){
    let currentDeck = decks[arrayOfIndex[i]];
    let blob = await pdf(<PDFDocument
      cards={currentDeck.cards}
      deckName={currentDeck.name}
      type={currentDeck.type}
    />).toBlob();
    zip.file(i + "-" + currentDeck.name + ".pdf", blob);
  }

  //download the zip file
  zip.generateAsync({type:"blob"}).then(function(content) {
    saveAs(content, "SHAREHOME_Decks.zip");
  });
}
