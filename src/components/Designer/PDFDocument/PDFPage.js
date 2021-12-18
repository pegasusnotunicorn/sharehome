import React from 'react';
import { Page, View, Text, Canvas, Image } from '@react-pdf/renderer';

//styles for the PDF document/file
import * as cardConstants from '../utils/cardConstants.js';
import { cardBackConstants } from '../../../components/Card/CardBack.js';
import { dynamicStylesPDFPerson, dynamicStylesPDFEventGoal } from '../../../css/pages/designer/dynamicStylesPDF.js';

//function to paint the shadow background canvas gradient
function paintShadowBackground(painter, availableWidth, availableHeight){
  let grad = painter.linearGradient(0, 0, 0, availableHeight);
  grad.stop(0, "black", 0);
  grad.stop(1, "black", .75);

  painter.rect(0, 0, availableWidth, availableHeight);
  painter.fill(grad);
}

//create a PDF page (card) and use currentCard to change the inside text
const PDFPage = (props) => {
  let type = props.type;

  if (type === "member" || type === "commentator"){
    return <PDFPersonPage {...props} />
  }
  else {
    return <PDFEventGoalPage {...props} />
  }
}

//PDF page of a person card (member / commentator)
const PDFPersonPage = (props) => {
  const currentCard = props.currentCard;
  return (
    <Page
      style={dynamicStylesPDFPerson.page}
      size={cardConstants.pdfDimensions}
    >
      <View style={dynamicStylesPDFPerson.view}>

        <Image
          src={currentCard.image.url}
          allowDangerousPaths={true}
          style={{
            ...dynamicStylesPDFPerson.image,
            objectPositionX: currentCard.image.x,
            objectPositionY: currentCard.image.y,
          }}
        />

        <Canvas
          style={dynamicStylesPDFPerson.canvas}
          paint={paintShadowBackground}
        ></Canvas>

        <Text style={dynamicStylesPDFPerson.mainFont}>
          {currentCard.name} ({currentCard.age})
        </Text>

        <Text style={dynamicStylesPDFPerson.subFont}>
          {currentCard.job}
          &nbsp;&nbsp;
          <Text style={dynamicStylesPDFPerson.japaneseName}>
            {currentCard.japaneseName}
          </Text>
        </Text>

      </View>
    </Page>
  );
}

//PDF page of a event / goal card
const PDFEventGoalPage = (props) => {
  const currentCard = props.currentCard;
  const currentCardIndex = props.currentCardIndex;
  const deckName = props.deckName;
  const cardType = props.type;

  return (
    <Page
      style={dynamicStylesPDFEventGoal.page}
      size={cardConstants.pdfDimensions}
    >
      <View style={dynamicStylesPDFEventGoal.view}>

        <Canvas style={{
            ...dynamicStylesPDFEventGoal.canvas,
            backgroundColor:cardBackConstants[cardType].background,
          }}>
        </Canvas>

        <Text style={dynamicStylesPDFEventGoal.mainFont}>
          {currentCard.description}
        </Text>

        <View style={dynamicStylesPDFEventGoal.footerView}>
          <Text style={dynamicStylesPDFEventGoal.subFont}>{deckName}</Text>
          <Text style={dynamicStylesPDFEventGoal.subFont}>#{currentCardIndex}</Text>
        </View>

      </View>
    </Page>
  );
}

export default PDFPage;
