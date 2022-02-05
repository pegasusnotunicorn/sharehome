import React from 'react';
import { Parallax } from "react-scroll-parallax";

import Card from '../Card/Card.js';
import { getAllFinishedPeople } from '../Characters/Characters.js';
import useWindowDimensions from './useWindowDimensions.js';
import '../../css/utils/cardparallax.css';

//random degree between -max and max
const randomDeg = (max) => {
  return `${Math.ceil(Math.random() * max) * (Math.round(Math.random()) ? 1 : -1)}deg`;
}

//a single row of cards
const ParallaxRow = (props) => {
  let randomCharacters = props.randomCharacters;

  //max card width / size
  //to determine how big the cards will be based on window width
  const { width, height } = useWindowDimensions();
  let cardDividerByScreenWidth = (width >= 1400) ? 4.2 : (width >= 900) ? 3.2 : 1.7;
  let cardWidth = Math.min(Math.floor(width / cardDividerByScreenWidth), 600);
  let cardHeight = cardWidth / 1.7;
  let fontSize = (width >= 1400) ? 10 : (width >= 900) ? 8 : 6;

  //create cards for each character
  let randomCards = randomCharacters.map((curr, index, array) => {

    //move horizontally (direction depends on invert)
    let translateSpeed = 50;
    let translateXNum = (props.invert) ? [0, translateSpeed] : [translateSpeed, 0];
    let invertNum = (props.first) ? -1 : 1;

    //properties for the parallax
    let parallaxProps = {
      translateX:translateXNum,
      startScroll: 0,
      endScroll: height*.75,
    }

    //the one missing card
    let middleCard = Math.floor(props.cardsPerRow / 2);
    let missingCardIndex = width >= 1400 ? (middleCard - invertNum) : middleCard
    if (props.missing && missingCardIndex === index){
      parallaxProps = {
        ...parallaxProps,
        speed: 1000,
        translateY:[-400, 0],
        translateX:[-150 * invertNum, 0],
        rotateX:[randomDeg(75), 0, "easeInOut"],
        rotateY:[randomDeg(75), 0, "easeInOut"],
        rotateZ:[90, 0, "easeInOut"],
      }
    }

    //properties for the card
    let cardProps = {
      personName: curr.name,
      showFront: true,
      type: "member",
      disableFlip: false,
      disableText: true,
      cardBackName: true,
      mainStyle:{
        //stuff needed for card size
        width:`${cardWidth}px`,
        height:`${cardHeight}px`,
        fontSize:`${fontSize}px`,
        //other shit
        cursor:"cursor",
      },
    }

    return (
      <div key={`parallax${index}`} className="parallaxWrapper">
        <Parallax {...parallaxProps}>
          <Card {...cardProps}/>
        </Parallax>
      </div>
    );
  });

  return (
    <div className={`parallaxRow`}>
      { randomCards }
    </div>
  );
}

//the entire section of three rows moving with scroll
const ParallaxSection = (props) => {
  const { width } = useWindowDimensions();
  const characters = getAllFinishedPeople(true);
  const numRows = 3;
  const cardsPerRow = (width >= 1400) ? 5 : (width >= 900) ? 4 : 3;
  const totalCards = numRows * cardsPerRow;
  let randomCharacters = characters.slice(0, totalCards);

  //not enough characters
  if (characters.length < totalCards){
    let missingAmount = totalCards - characters.length;
    let fillerCharacters = characters.slice(0, missingAmount);
    randomCharacters = randomCharacters.concat(fillerCharacters);
  }

  //split array into numRows rows
  let splitRowCharacters = [];
  for (let x = 0 ; x < numRows ; x++){
    splitRowCharacters.push(randomCharacters.slice(x*cardsPerRow,(x*cardsPerRow) + cardsPerRow));
  }

  //build the rows
  let parallaxRows = splitRowCharacters.map((curr, index, array)=>{
    let invert = (index % 2 !== 0) ? true : false;
    let missing = (index === 0) ? true : false;
    let first = index === 0;
    return (
      <ParallaxRow
        key={`parallaxRow${index}`}
        invert={invert}
        missing={missing}
        first={first}
        cardsPerRow={cardsPerRow}
        randomCharacters={curr}
      />
    )
  });

  return (
    <div className="parallaxSectionXOverflow">
      <div className="parallaxSection">
        { parallaxRows }
      </div>
    </div>
  )
}

export default ParallaxSection;
