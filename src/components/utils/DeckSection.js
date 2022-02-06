import React, { useState, useEffect } from 'react'
import { useSprings, animated, interpolate } from 'react-spring'
import { useGesture } from 'react-use-gesture'

import { getAllFinishedPeople } from '../Characters/Characters.js';
import useWindowScroll from './useWindowScroll.js';
import useWindowDimensions from './useWindowDimensions.js';

import '../../css/utils/deckAnimation.css';

const randomNum = (max, includeNeg) => {
  return Math.ceil(Math.random() * max) * (includeNeg ? (Math.round(Math.random()) ? 1 : -1) : 1);
}

const Animation = (props) => {
  const cards = props.cards;
  const paused = props.paused;
  const evenRowMult = (props.rowIndex % 2 !== 0) ? -1 : 1;

  //check for mobile and determine additional noise for coords
  const { width } = useWindowDimensions();
  let xCoordNoise = (width >= 1400) ? 200 : (width >= 900) ? 50 : 5;

  // These two are just helpers, they curate spring data, values that are later being interpolated into css
  const to = i => ({
    x: 0 + (randomNum(xCoordNoise, false) * evenRowMult),
    y: i + randomNum(50, evenRowMult),
    zIndex: Math.random()*25,
    scale: 1,
    rot: randomNum(5, true),
    delay: i * 100 + (100 * (props.rowIndex + 1) * props.numSections)
  });
  const from = i => ({
    x: (evenRowMult) ? -3000 : -1000,
    y: -1000,
    zIndex: i,
    scale: 1.5,
    rot: 0,
    delay: i * 100 + (100 * (props.rowIndex + 1) * props.numSections)
  });

  // This is being used down there in the view, it interpolates rotation and scale into a css transform
  const trans = (r, s) => `perspective(1500px) rotateX(10deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`

  const [gone] = useState(() => new Set()) // The set flags all the cards that are flicked out
  const [properties, api] = useSprings(cards.length, i => ({from: from(i)})) // Create a bunch of springs using the helpers above

  //literally magic below this
  //going down
  if (paused){
    api.set(to);
    api.start(from);
  }
  //going up
  else {
    api.set(from);
    api.start(to);
  }

  // Create a gesture, we're interested in down-state, delta (current-pos - click-pos), direction and velocity
  const bind = useGesture(({ args: [index], down, delta: [xDelta], distance, direction: [xDir], velocity }) => {
    const trigger = velocity > 0.2 // If you flick hard enough it should trigger the card to fly out
    const dir = xDir < 0 ? -1 : 1 // Direction should either point left or right
    if (!down && trigger) gone.add(index) // If button/finger's up and trigger velocity is reached, we flag the card ready to fly out
    api(i => {
      if (index !== i) return // We're only interested in changing spring-data for the current spring
      const isGone = gone.has(index)
      const x = isGone ? (200 + window.innerWidth) * dir : down ? xDelta : 0 // When a card is gone it flys out left or right, otherwise goes back to zero
      const rot = xDelta / 100 + (isGone ? dir * 10 * velocity : 0) // How much the card tilts, flicking it harder makes it rotate faster
      const scale = down ? 1.1 : 1 // Active cards lift up a bit
      return { x, rot, scale, delay: undefined, config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 } }
    })
    if (!down && gone.size === cards.length) setTimeout(() => gone.clear() || api(i => to(i)), 600)
  });

  // Now we're just mapping the animated values to our view, that's it. Btw, this component only renders once. :-)
  return properties.map(({ x, y, rot, scale }, i) => (
    <animated.div key={i} style={{ transform: interpolate([x, y], (x, y) => `translate3d(${x}px,${y}px,0)`) }}>
      {/* This is the card itself, we're binding our gesture to it (and inject its index so we know which is which) */}
      <animated.div {...bind(i)} style={{ transform: interpolate([rot, scale], trans), backgroundImage: `url(${cards[i].image.url})` }} />
    </animated.div>
  ));
}

//get all deck rows
const DeckRows = (props) => {
  //all people (randomized)
  let allCharacters = getAllFinishedPeople(true);
  let numSections = props.numSections || 3;
  let splitIntoSections = [];
  for ( var x = 0 ; x < numSections ; x++ ){
    splitIntoSections.push(allCharacters.slice(x * numSections, (x * numSections) + numSections));
  }

  //map each section and return them
  return splitIntoSections.map((curr, index, array)=>{
    return (
      <div key={`deckAnimation${index}`} className="deckContainer">
        <Animation
          cards={curr}
          paused={props.paused}
          rowIndex={index}
          numSections={numSections}
        />
      </div>
    )
  });
}

//keep track of the scroll so we know when to trigger the deck animation
const DeckTrigger = (props) => {
  const { height } = useWindowDimensions();
  const scrollPosition = useWindowScroll();
  const setPaused = props.setPaused;

  useEffect(() => {
    setPaused(scrollPosition < height * 2.5);
  }, [scrollPosition, height, setPaused]);

  return null;
}

//the deck section covering half the screen
const DeckSection = (props) => {

  const [paused, setPaused] = useState(true);
  const deckRowProps = {
    ...props,
    paused: paused
  }

  return (
    <div className="decksContainer">
      <DeckTrigger setPaused={setPaused} />
      <DeckRows { ...deckRowProps }/>
    </div>
  )
}

export default DeckSection
