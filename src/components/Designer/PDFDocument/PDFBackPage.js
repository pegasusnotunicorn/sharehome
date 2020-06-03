import React from 'react';
import { Page, View, Text } from '@react-pdf/renderer';

//styles for the PDF document/file
import * as cardConstants from '../utils/cardConstants.js';
import { dynamicStylesPDFBack } from '../../../css/Designer/dynamicStylesPDF.js';
import { cardBackConstants } from '../../Card/CardBack.js';

//create a PDF page of the back given the type
const PDFBackPage = (props) => {
  let backType = props.type;

  return (
    <Page
      style={dynamicStylesPDFBack.page}
      size={cardConstants.pdfDimensions}
    >
      <View style={dynamicStylesPDFBack.view}>

        <Text style={dynamicStylesPDFBack.textMain}>
          {cardBackConstants[backType].mainText}
        </Text>

        <Text style={{
            ...dynamicStylesPDFBack.textJapanese,
            backgroundColor:cardBackConstants[backType].background,
            color:cardBackConstants[backType].color,
            width:cardBackConstants[backType].width,
            left:cardBackConstants[backType].left,
          }}>
          {cardBackConstants[backType].japaneseText}
        </Text>

      </View>
    </Page>
  );
}

export default PDFBackPage;
