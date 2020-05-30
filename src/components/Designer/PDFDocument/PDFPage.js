import React from 'react';
import { Page, View, Text, Canvas, Image } from '@react-pdf/renderer';

//styles for the PDF document/file
import * as cardConstants from '../utils/cardConstants.js';
import dynamicStylesPDF from '../../../css/Designer/dynamicStylesPDF.js';

//function to paint the shadow background canvas gradient
function paintShadowBackground(painter, availableWidth, availableHeight){
  let grad = painter.linearGradient(0, 0, 0, availableHeight);
  grad.stop(0, "white", 0);
  grad.stop(1, "black", .75);

  painter.rect(0, 0, availableWidth, availableHeight);
  painter.fill(grad);
}

//create a PDF page (card) and use currentCard to change the inside text
const PDFFile = (props) => {
  const currentCard = props.currentCard;
  return (
    <Page
      style={dynamicStylesPDF.page}
      size={cardConstants.pdfDimensions}
    >
      <View style={dynamicStylesPDF.view}>

        <Image
          src={currentCard.image.url}
          allowDangerousPaths={true}
          style={{
            ...dynamicStylesPDF.image,
            objectPositionX: currentCard.image.x,
            objectPositionY: currentCard.image.y,
          }}
        />

        <Canvas
          style={dynamicStylesPDF.canvas}
          paint={paintShadowBackground}
        ></Canvas>

        <Text style={dynamicStylesPDF.textMain}>
          {currentCard.name} ({currentCard.age})
        </Text>

        <Text style={dynamicStylesPDF.textSub}>
          {currentCard.job}
          &nbsp;&nbsp;
          <Text style={dynamicStylesPDF.japaneseName}>
            {currentCard.japaneseName}
          </Text>
        </Text>

      </View>
    </Page>
  );
}

export default PDFFile;
