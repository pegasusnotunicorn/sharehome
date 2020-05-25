import React from 'react';
import { Page, View, Text, Canvas, Image } from '@react-pdf/renderer';

//styles for the PDF document/file
import * as CardConstants from '../utils/CardConstants.js';
import DynamicStylesPDF from '../../../css/Designer/DynamicStylesPDF.js';

//function to paint the shadow background canvas gradient
function paintShadowBackground(painter, availableWidth, availableHeight){
  let grad = painter.linearGradient(0, 0, 0, availableHeight);
  grad.stop(0, "white", 0);
  grad.stop(1, "black", .75);

  painter.rect(0, 0, availableWidth, availableHeight);
  painter.fill(grad);
}

//create a PDF page (card) and use currentCard to change the inside text
function PDFFile(props){
  const currentCard = props.currentCard;
  return (
    <Page
      style={DynamicStylesPDF.page}
      size={CardConstants.PDFDimensions}
    >
      <View style={DynamicStylesPDF.view}>

        <Image
          src={currentCard.image.url}
          allowDangerousPaths={true}
          style={{
            ...DynamicStylesPDF.image,
            objectPositionX: currentCard.image.x,
            objectPositionY: currentCard.image.y,
          }}
        />

        <Canvas
          style={DynamicStylesPDF.canvas}
          paint={paintShadowBackground}
        ></Canvas>

        <Text style={DynamicStylesPDF.textMain}>
          {currentCard.name} ({currentCard.age})
        </Text>

        <Text style={DynamicStylesPDF.textSub}>
          {currentCard.job}
          &nbsp;&nbsp;
          <Text style={DynamicStylesPDF.japaneseName}>
            {currentCard.japaneseName}
          </Text>
        </Text>

      </View>
    </Page>
  );
}

export default PDFFile;
