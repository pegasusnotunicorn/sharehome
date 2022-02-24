import React, { useRef, useLayoutEffect } from 'react'
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from 'gsap';

import Card from '../Card/Card.js';
import DeckRow from './utils/DeckRow.js';
import getHomePageCardProps from "./utils/getHomePageCardProps.js";
import useWindowDimensions from '../utils/useWindowDimensions.js';
import { getRandomEventsGoals } from '../Card/ExampleEventGoal.js';
import { randomDeg, randomNum} from '../utils/useMath.js';

import '../../css/pages/home/eventsGoalsDeckSection.css';

export const GoalsDeckSection = (props) => {
  return (<DeckSection eventOrGoal="goal" />);
}
export const EventsDeckSection = (props) => {
  return (<DeckSection eventOrGoal="event" />);
}

//the deck section covering half the screen
const DeckSection = ({eventOrGoal}) =>{
  gsap.registerPlugin(ScrollTrigger);
  let splitIntoSections = getRandomEventsGoals(eventOrGoal, 3);
  return (
    <div className="eventGoalDecksContainer">
      { splitIntoSections.map((curr, index, array)=>{
        return (
          <EventGoalDeckRow
            key={`eventGoalDecksRow${index}`}
            card={curr}
            rowIndex={index}
            eventOrGoal={eventOrGoal}
          />
        )
      })}
    </div>
  )
}

//a single row of cards
const EventGoalDeckRow = ({card, rowIndex, rowTl, eventOrGoal}) => {
  return (
    <DeckRow className="eventGoalDeckRow">
      <AnimatedCard
        card={card}
        rowIndex={rowIndex}
        tl={rowTl}
        eventOrGoal={eventOrGoal}
      />
    </DeckRow>
  )
}

//a row of animations
const AnimatedCard = (props) => {
  const rowIndex = props.rowIndex;
  const eventOrGoal = props.eventOrGoal;
  const { width } = useWindowDimensions();

  //add to the timeline
  const tl = props.tl;
  const cardRef = useRef(null);

  //events locations
  let finalX, finalY, finalRot;
  if (eventOrGoal === "event"){
    finalX = (rowIndex % 2 === 0) ? -randomNum(15,20) : 0;
    finalY = 0;
    finalRot = (rowIndex % 2 === 0) ? "-5deg" : "5deg";

    //fine tune adjustments
    if (width <= 900) {
      finalX = (rowIndex === 1) ? 17.5 : finalX;
      finalY = (rowIndex === 0) ? -5 : finalY;
      finalY = (rowIndex === 1) ? -33 : finalY;
      finalY = (rowIndex === 2) ? 5 : finalY;
      finalX = (rowIndex === 2) ? -5 : finalX;
    }
  }
  else {
    finalX = (rowIndex % 2 === 0) ? randomNum(35,40) : 20;
    finalY = 0;
    finalRot = (rowIndex % 2 === 0) ? "5deg" : "-5deg";

    //fine tune adjustments
    if (width > 1200 && width <= 1600){
      finalX = (rowIndex % 2 === 0) ? randomNum(30,35) : 15;
    }
    else if (width > 900 && width <= 1200){
      finalX = (rowIndex % 2 === 0) ? randomNum(30,35) : 5;
    }
    else if (width <= 900) {
      finalX = (rowIndex === 0) ? -15 : finalX;
      finalX = (rowIndex === 1) ? 12 : finalX;
      finalY = (rowIndex === 1) ? -25 : finalY;
      finalX = (rowIndex === 2) ? -15 : finalX;
    }
  }

  useLayoutEffect(() => {
    if (tl){
      tl.killTweensOf(cardRef.current);
      tl.fromTo(cardRef.current, {
        x:(eventOrGoal === "event") ? "200%" : "-200%",
        y:`${finalY}vh`,
        rotationY:randomDeg(200),
        rotationX:randomDeg(200),
        rotationZ:randomDeg(100),
      }, {
        x:`${finalX}vw`,
        y:`${finalY}vh`,
        rotationY:randomDeg(10),
        rotationX:randomDeg(10),
        rotationZ:finalRot,
      });
    }
    return () => {
      if (tl) tl.killTweensOf();
    }
  }, [tl, cardRef, finalX, finalY, finalRot, eventOrGoal]);

  //card details
  const cardProps = getHomePageCardProps(props.card.type, width);

  //flip the second card
  cardProps.type = props.card.type.toLowerCase();
  if (rowIndex === 1) cardProps.showFront = false;
  if (rowIndex === 1) cardProps.disableFlip = false;
  if (rowIndex === 1) cardProps.hideBack = false;

  return (
    <div ref={cardRef} className="EGCardWrapper">
      <Card {...cardProps}/>
    </div>
  );
}
