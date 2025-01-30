import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
} from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import Card from "../Card/Card.js";
import getHomePageCardProps from "./utils/getHomePageCardProps.js";
import { getAllFinishedPeople } from "../Characters/Characters.js";
import useWindowDimensions from "../utils/useWindowDimensions.js";
import { randomDeg } from "../utils/useMath.js";
import "../../css/pages/home/cardparallax.css";
import PropTypes from "prop-types";

//the entire section of three rows moving with scroll
const ParallaxSection = () => {
  gsap.registerPlugin(ScrollTrigger);

  //create a gsap timeline
  const sectionRef = useRef();
  const [tlFirst, setTlFirst] = useState(null);
  const [tlSecond, setTlSecond] = useState(null);
  const { width } = useWindowDimensions();

  //create first timeline
  useLayoutEffect(() => {
    setTlFirst(
      gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          // markers: true,
          invalidateOnRefresh: true,
          scrub: 0.2,
          start: "top bottom",
          end: "bottom bottom",
        },
      })
    );
  }, [setTlFirst]);

  //create second timeline
  useLayoutEffect(() => {
    setTlSecond(
      gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          // markers: true,
          invalidateOnRefresh: true,
          scrub: 0.2,
          pin: true,
          start: "top top",
          end: "bottom top",
        },
      })
    );
  }, [setTlSecond]);

  //calculate how many rows / characters per row
  const numRows = 3;
  const charactersRef = useRef(getAllFinishedPeople(true));
  const characters = charactersRef.current;
  const cardsPerRow = width >= 1400 ? 5 : width >= 900 ? 5 : 3;
  const totalCards = numRows * cardsPerRow;
  let randomCharacters = characters.slice(0, totalCards);

  //not enough characters, fill in the blanks
  if (characters.length < totalCards) {
    let missingAmount = totalCards - characters.length;
    let fillerCharacters = characters.slice(0, missingAmount);
    randomCharacters = randomCharacters.concat(fillerCharacters);
  }

  //split array into numRows rows
  let splitRowCharacters = [];
  for (let x = 0; x < numRows; x++) {
    splitRowCharacters.push(
      randomCharacters.slice(x * cardsPerRow, x * cardsPerRow + cardsPerRow)
    );
  }

  //build the rows
  let parallaxRows = splitRowCharacters.map((curr, index) => {
    let evenRow = index % 2 !== 0 ? true : false;
    let missing = index === 0 ? true : false;
    let first = index === 0;
    return (
      <ParallaxRow
        key={`parallaxRow${index}`}
        evenRow={evenRow}
        missing={missing}
        first={first}
        cardsPerRow={cardsPerRow}
        randomCharacters={curr}
        tlFirst={tlFirst}
        tlSecond={tlSecond}
      />
    );
  });

  return (
    <div className="parallaxSectionXOverflow">
      <div ref={sectionRef} className="parallaxSection">
        {parallaxRows}
      </div>
    </div>
  );
};

//a single row of cards, pinned to the timeline
const ParallaxRow = (props) => {
  const rowRef = useRef(null);
  let tl = props.tlSecond;
  useLayoutEffect(() => {
    if (tl && rowRef) {
      tl.killTweensOf(rowRef.current);
      tl.to(
        rowRef.current,
        {
          opacity: 0.3,
        },
        "<"
      );
    }
    return () => {
      if (tl) tl.killTweensOf();
    };
  }, [tl]);

  return (
    <div ref={rowRef} className="parallaxRow">
      <ParallaxCards {...props} />
    </div>
  );
};

ParallaxRow.propTypes = {
  evenRow: PropTypes.bool,
  missing: PropTypes.bool,
  first: PropTypes.bool,
  cardsPerRow: PropTypes.number,
  randomCharacters: PropTypes.array,
  tlFirst: PropTypes.object,
  tlSecond: PropTypes.object,
};

//all cards in a row
const ParallaxCards = (props) => {
  const randomCharacters = props.randomCharacters;
  const cardRefs = useRef(new Array(randomCharacters.length));
  const { width } = useWindowDimensions();

  //figure out the index of the one missing card
  let middleCard = Math.floor(props.cardsPerRow / 2);
  let evenRow = props.evenRow;
  let [missingCardIndex, setMissingCardIndex] = useState(
    width >= 1400 ? middleCard + 1 : middleCard
  );
  let missing = props.missing;

  //update middle card with width
  useEffect(() => {
    setMissingCardIndex(width >= 1400 ? middleCard + 1 : middleCard);
  }, [width, middleCard, setMissingCardIndex]);

  let translateEnd = "50%"; //move horizontally (direction depends on evenRow)
  let offscreenXDivider = width >= 1400 ? 3 : 1.5;
  let offscreenX = `${width / offscreenXDivider}px`; //one missing card timeline off screen value

  //function to run second anim
  let tlFirst = props.tlFirst;
  useLayoutEffect(() => {
    if (tlFirst) {
      //create cards for each character
      randomCharacters.forEach((curr, index) => {
        //kill old animations
        tlFirst.killTweensOf(cardRefs.current[index]);

        //one missing card
        if (missing && index === missingCardIndex && width > 900) {
          tlFirst.fromTo(
            cardRefs.current[index],
            {
              y: "-400%",
              x: offscreenX,
              rotationX: randomDeg(200),
              rotationY: randomDeg(200),
              rotationZ: 90,
            },
            {
              overwrite: true,
              x: 0,
              y: 0,
              rotationX: 0,
              rotationY: 0,
              rotationZ: 0,
              duration: 0.5,
            },
            "<"
          );
        }
        //every other card
        else {
          tlFirst.fromTo(
            cardRefs.current[index],
            {
              x: evenRow ? 0 : translateEnd,
              y: 0,
              rotationX: 0,
              rotationY: 0,
              rotationZ: 0,
              duration: 1,
            },
            {
              x: evenRow ? translateEnd : 0,
            },
            "<"
          );
        }
        tlFirst.scrollTrigger.refresh(true);
      });
    }
    return () => {
      if (tlFirst) tlFirst.killTweensOf();
    };
  }, [
    width,
    tlFirst,
    randomCharacters,
    missing,
    missingCardIndex,
    offscreenX,
    evenRow,
    translateEnd,
  ]);

  //create second animation
  let tlSecond = props.tlSecond;

  //a function to create the second elem
  const secondAnim = useCallback(
    (index, cardRef, firstTime) => {
      //kill old animations
      tlSecond.killTweensOf(cardRef);

      //left of middle card go left, others go right
      let offscreenEnd = evenRow
        ? index < middleCard
          ? -50
          : 150 //even row
        : index <= middleCard
        ? -125
        : 25; //odd row, left : right

      //figure out what the starting X should be
      let startingX = evenRow ? translateEnd : 0;

      //if it's the missing card...check if it's active
      if (missing && index === missingCardIndex) {
        startingX = firstTime ? offscreenX : 0;
      }

      tlSecond.fromTo(
        cardRef,
        {
          x: startingX,
        },
        {
          x: `${offscreenEnd}%`,
          onStart: () => {
            //first time loaded so recreate before start
            if (firstTime) {
              secondAnim(index, cardRef, false);
            }
          },
        },
        "<"
      );
    },
    [
      evenRow,
      middleCard,
      missing,
      missingCardIndex,
      offscreenX,
      tlSecond,
      translateEnd,
    ]
  );

  //create the second timeline effects
  useLayoutEffect(() => {
    if (tlSecond && tlSecond.scrollTrigger) {
      randomCharacters.forEach((curr, index) => {
        //if the scrollTrigger is active / completed, then no need to recreate the animation starting points
        if (tlSecond.scrollTrigger.progress > 0) {
          secondAnim(index, cardRefs.current[index], false);
        }
        //recreate animation once you start actually animating
        else {
          secondAnim(index, cardRefs.current[index], true);
        }
      });
    }
    return () => {
      if (tlSecond) tlSecond.killTweensOf();
    };
  }, [tlSecond, secondAnim, randomCharacters, cardRefs]);

  //create cards for each character
  return randomCharacters.map((curr, index) => {
    //update name to new person
    let cardProps = getHomePageCardProps(curr.type, width);
    cardProps.personName = curr.name;
    cardProps.disableFlip = true;
    cardProps.hideBack = true;

    return (
      <div
        key={`parallaxWrapperKey${index}`}
        ref={(el) => (cardRefs.current[index] = el)}
        className="parallaxWrapper"
      >
        <Card {...cardProps} />
      </div>
    );
  });
};

export default ParallaxSection;
