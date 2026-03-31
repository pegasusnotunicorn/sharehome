import { useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger.js";
import gsap from "gsap";
import Card from "../Card/Card";
import getHomePageCardProps from "./utils/getHomePageCardProps";
import { getAllFinishedPeople } from "../Characters/Characters";
import useWindowDimensions from "../utils/useWindowDimensions";
import { randomDeg } from "../utils/useMath";
import styles from "../../css/pages/home/cardparallax.module.css";
import { useLocation } from "react-router";

interface ParallaxCardsProps {
  sectionRef: React.RefObject<HTMLDivElement | null>;
  evenRow: boolean;
  isRowWithMissingCard: boolean;
  cardsPerRow: number;
  randomCharacters: any[];
}

//the entire section of three rows moving with scroll
const ParallaxSection = () => {
  const location = useLocation();
  gsap.registerPlugin(ScrollTrigger);

  // Set global defaults for ScrollTrigger
  ScrollTrigger.defaults({
    // @ts-ignore smoothTouch is a valid ScrollTrigger config option
    smoothTouch: true,
  });

  ScrollTrigger.scrollerProxy(window, {
    scrollTop(value?: number) {
      return arguments.length
        ? window.scrollTo({ top: value, behavior: "smooth" })
        : window.pageYOffset;
    },
  });

  useEffect(() => {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden"; // Prevent scrolling
    document.body.style.paddingRight = `${scrollbarWidth}px`; // Keep space for scrollbar

    setTimeout(() => {
      document.body.style.overflow = ""; // Restore scrolling
      document.body.style.paddingRight = ""; // Remove scrollbar space simulation
    }, 500);
  }, []);

  const sectionRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!sectionRef.current) return;
    const sectionRefElement = sectionRef.current;

    ScrollTrigger.create({
      trigger: sectionRefElement,
      pin: true,
      scrub: 3,
      start: "center center",
      end: "bottom bottom",
      anticipatePin: 1,
      animation: gsap.fromTo(
        sectionRefElement,
        { opacity: 1, ease: "power1.out" },
        { opacity: 0.3, ease: "power1.out" }
      ),
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  //calculate how many rows / characters per row
  const numRows = 3;
  const characters = useMemo(() => getAllFinishedPeople(true), []);

  const { width } = useWindowDimensions();
  const cardsPerRow = width >= 1400 ? 5 : width >= 900 ? 5 : 3;
  const totalCards = numRows * cardsPerRow;
  let randomCharacters = characters.slice(0, totalCards);

  //not enough characters, fill in the blanks
  if (characters.length < totalCards) {
    const missingAmount = totalCards - characters.length;
    const fillerCharacters = characters.slice(0, missingAmount);
    randomCharacters = randomCharacters.concat(fillerCharacters);
  }

  //split array into numRows rows
  const splitRowCharacters: any[][] = [];
  for (let x = 0; x < numRows; x++) {
    splitRowCharacters.push(
      randomCharacters.slice(x * cardsPerRow, x * cardsPerRow + cardsPerRow)
    );
  }

  //build the rows
  const parallaxRows = splitRowCharacters.map((curr, index) => {
    const evenRow = index % 2 !== 0;
    const isRowWithMissingCard = index === 0;
    return (
      <div key={`parallaxRow${index}`} className={styles.parallaxRow}>
        <ParallaxCards
          sectionRef={sectionRef}
          evenRow={evenRow}
          isRowWithMissingCard={isRowWithMissingCard}
          cardsPerRow={cardsPerRow}
          randomCharacters={curr}
        />
      </div>
    );
  });

  return (
    <div key={location.pathname} ref={sectionRef} className={styles.parallaxSection}>
      {parallaxRows}
    </div>
  );
};

//all cards in a row
const ParallaxCards = ({
  sectionRef,
  evenRow,
  isRowWithMissingCard,
  cardsPerRow,
  randomCharacters,
}: ParallaxCardsProps) => {
  const cardRefs = useMemo(
    () => new Array<HTMLDivElement | null>(randomCharacters.length),
    [randomCharacters.length]
  );

  //figure out the index of the one missing card
  const middleCard = Math.floor(cardsPerRow / 2);
  const [missingCardIndex, setMissingCardIndex] = useState(middleCard);

  //update middle card with width
  const { width } = useWindowDimensions();
  useEffect(() => {
    setMissingCardIndex(Math.floor(cardsPerRow / 2));
  }, [width, cardsPerRow]);

  const translateEnd = "25%"; //move horizontally (direction depends on evenRow)

  useEffect(() => {
    if (!sectionRef.current || randomCharacters.length === 0) return;

    const randomX = randomDeg(200);
    const randomY = randomDeg(200);
    const missingCardFirstState = {
      x: 0,
      y: "-300%",
      opacity: 0,
      scale: 0,
      rotationX: randomX,
      rotationY: randomY,
      rotationZ: 90,
      ease: "power1.out",
    };

    // set the first state of the missing card
    requestAnimationFrame(() => {
      if (!isRowWithMissingCard) return;
      gsap.set(cardRefs[missingCardIndex], missingCardFirstState);
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 2,
        fastScrollEnd: true, //prevents the animation from jumping to the end when scrolling quickly
      },
    });

    randomCharacters.forEach((curr: any, index: number) => {
      const card = cardRefs[index];
      if (!card) return;

      const firstAnimationFrom =
        isRowWithMissingCard && index === missingCardIndex
          ? missingCardFirstState
          : {
              x: 0,
              ease: "power1.out",
            };

      const firstAnimationTo =
        isRowWithMissingCard && index === missingCardIndex
          ? {
              x: evenRow ? translateEnd : `-${translateEnd}`,
              y: 0,
              opacity: 1,
              scale: 1,
              rotationX: 0,
              rotationY: 0,
              rotationZ: 0,
              ease: "power1.out",
            }
          : {
              x: evenRow ? translateEnd : `-${translateEnd}`,
              ease: "power1.out",
            };

      //left of middle card go left, others go right
      let offscreenEnd = evenRow
        ? index < middleCard
          ? -50
          : 150 //even row
        : index <= middleCard
        ? -125
        : 25; //odd row, left : right

      const secondAnimationFrom = {
        x: evenRow ? translateEnd : `-${translateEnd}`,
        ease: "power1.out",
      };
      const secondAnimationTo = {
        x: `${offscreenEnd}%`,
        ease: "power1.out",
      };

      tl.fromTo(card, firstAnimationFrom, firstAnimationTo, "0").fromTo(
        card,
        secondAnimationFrom,
        secondAnimationTo,
        "50%"
      ); // Ensures second animation starts at timeline midpoint
    });

    //cleanup
    return () => {
      tl.kill();
    };
  }, [
    cardRefs,
    sectionRef,
    middleCard,
    randomCharacters,
    isRowWithMissingCard,
    missingCardIndex,
    evenRow,
    translateEnd,
  ]);

  //create cards for each character
  return randomCharacters.map((curr: any, index: number) => {
    const cardProps = getHomePageCardProps(curr.type, width);
    cardProps.personName = curr.name;
    cardProps.disableFlip = true;
    cardProps.hideBack = true;

    return (
      <div
        key={`parallaxWrapperKey${index}`}
        ref={(el) => { cardRefs[index] = el; }}
        className={`${styles.parallaxWrapper} ${
          isRowWithMissingCard && index === missingCardIndex
            ? styles.missingCard
            : ""
        }`}
      >
        <Card {...cardProps} />
      </div>
    );
  });
};

export default ParallaxSection;
