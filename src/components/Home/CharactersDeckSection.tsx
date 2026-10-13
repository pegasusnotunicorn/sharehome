import { useRef, useLayoutEffect, useState } from "react";
import { NavLink } from "react-router";
import { ScrollTrigger } from "gsap/ScrollTrigger.js";
import gsap from "gsap";
import Card from "../Card/Card";
import DeckRow from "./utils/DeckRow";
import getHomePageCardProps from "./utils/getHomePageCardProps";
import useWindowDimensions from "../utils/useWindowDimensions";
import { getAllFinishedPeople } from "../Characters/Characters";
import { randomDeg, randomNumFromNeg, randomNum } from "../utils/useMath";
import Deck3D from "./utils/Deck3D";
import { CHARACTER_CARD_MM, characterCardFaces } from "../Characters/characterCardFaces";
import { characterArtSmall } from "../utils/characterArt";
import type { DeckCard, DeckPose } from "../utils/deckCards3d";
import styles from "../../css/pages/home/charactersDeckSection.module.css";

interface CharactersDeckRowProps {
  cards: any[];
  rowIndex: number;
  numSections: number;
  rowTl?: gsap.core.Timeline | null;
}

interface DecksProps {
  cards: any[];
  rowIndex: number;
  tl?: gsap.core.Timeline | null;
}

// where the three cards land: down the deck's side of the step on wide screens; on phones, two above
// the words and one below
const characterLayout = (w: number, h: number): DeckPose[] => {
  const stacked = w > innerWidth * 0.9; // phones and small tablets: the deck spans the step, words in the middle
  const cw = stacked ? Math.min(w * 0.6, h * 0.32, 360) : Math.min(w * 0.46, h * 0.5, 440);
  if (stacked)
    return [
      { x: -w * 0.17, y: -h * 0.36, w: cw, tilt: 7 },
      { x: w * 0.2, y: -h * 0.22, w: cw, tilt: -6 },
      { x: w * 0.04, y: h * 0.35, w: cw, tilt: 3 },
    ];
  return [
    { x: -w * 0.13, y: -h * 0.28, w: cw, tilt: 8 },
    { x: w * 0.14, y: 0, w: cw, tilt: -6 },
    { x: -w * 0.1, y: h * 0.28, w: cw, tilt: 3 },
  ];
};

//three of the cast, dealt in 3D
const CharactersDeckSection = () => {
  const [cards] = useState<DeckCard[]>(() =>
    getAllFinishedPeople(true)
      .slice(0, 3)
      .map((c) => ({
        faces: characterCardFaces(c, characterArtSmall(c.image.url)),
        label: `Meet ${c.name}`,
        href: `/characters/${c.urlName}`,
      }))
  );
  return (
    <Deck3D
      className={styles.characterDecksContainer}
      cards={cards}
      mm={CHARACTER_CARD_MM}
      edge="gold"
      from="left"
      layout={characterLayout}
      fallback={<FlatCharactersDeck />}
    />
  );
};

//the flat cards, if 3D can't be shown
const FlatCharactersDeck = () => {
  gsap.registerPlugin(ScrollTrigger);

  //all people (randomized)
  let allCharacters = getAllFinishedPeople(true);
  let numSections = 3;
  // let charactersPerRow = Math.floor(allCharacters.length / numSections);
  let charactersPerRow = 1;
  let splitIntoSections = [];
  for (var x = 0; x < numSections; x++) {
    splitIntoSections.push(
      allCharacters.slice(
        x * charactersPerRow,
        x * charactersPerRow + charactersPerRow
      )
    );
  }

  return (
    <div className={styles.characterDecksContainer}>
      {splitIntoSections.map((curr, index) => {
        return (
          <CharactersDeckRow
            key={`characterDeckAnimation${index}`}
            cards={curr}
            rowIndex={index}
            numSections={numSections}
          />
        );
      })}
    </div>
  );
};

//a single row of cards
const CharactersDeckRow = (props: CharactersDeckRowProps) => (
  <DeckRow className={styles.charactersDeckRow}>
    <Decks cards={props.cards} rowIndex={props.rowIndex} tl={props.rowTl} />
  </DeckRow>
);

//a row of animations
const Decks = (props: DecksProps) => {
  //references for variables
  const tl = props.tl;
  const cardsRef = useRef(props.cards);
  const rowIndexRef = useRef(props.rowIndex);
  const cardRefs = useRef<(HTMLDivElement | null)[]>(new Array(props.cards.length));

  //create tweens and add to the timeline on resize as well
  const { width } = useWindowDimensions();
  useLayoutEffect(() => {
    //current values for references
    let cards = cardsRef.current;
    let rowIndex = rowIndexRef.current;

    //figure out the final X & Y depending on screenwidth
    let distanceRanges = [6, 14];
    let isEvenMult = rowIndex % 2 === 0 ? -1 : 1;
    let isEvenMultTemp = isEvenMult;
    let finalY: number | string =
      rowIndex === 0 ? randomNumFromNeg(10) - 35 : rowIndex === 2 ? randomNumFromNeg(10) + 35 : randomNumFromNeg(10);

    //small desktop specific
    if (width > 1200 && width <= 1600) {
      distanceRanges = [4, 12];
    }

    //tablet specific
    else if (width > 900 && width <= 1200) {
      distanceRanges = [2, 10];
    }

    //mobile specific
    else if (width <= 900) {
      distanceRanges =
        isEvenMult === -1
          ? rowIndex === 0
            ? [-20, -10]
            : [-30, -20]
          : [-30, -20]; //first row, second row, third row (negative)
      isEvenMultTemp *= -1;
      if (rowIndex === 1) finalY += randomNum(130, 140);
      if (rowIndex === 0) finalY -= 10;
    }

    //final X and Y coordinates
    let finalX = `${
      isEvenMultTemp * randomNum(distanceRanges[0], distanceRanges[1])
    }vw`;
    finalY = `${finalY}%`;

    if (tl) {
      cards.forEach((curr, index) => {
        tl.killTweensOf(cardRefs.current[index]);
        tl.fromTo(
          cardRefs.current[index],
          {
            x: "-200%",
            y: 0,
            rotationY: randomDeg(200),
            rotationX: randomDeg(200),
            rotationZ: randomDeg(100),
          },
          {
            x: finalX,
            y: finalY,
            rotationY: randomDeg(10),
            rotationX: randomDeg(10),
            rotationZ:
              rowIndex === 0 ? "10deg" : rowIndex === 1 ? "-10deg" : "2deg",
          }
        );
      });
    }
    return () => {
      if (tl) tl.killTweensOf();
    };
  }, [tl, width]);

  //return the cards
  return props.cards.map((curr, index) => {
    //update name to new person
    const cardProps = getHomePageCardProps(curr.type, width);
    cardProps.personName = curr.name;
    cardProps.mainStyle.cursor = "pointer";

    return (
      <div
        key={`cardWrapper${index}`}
        ref={(el) => { cardRefs.current[index] = el; }}
        className={styles.characterCardWrapper}
      >
        <NavLink to={`/characters/${curr.urlName}`}>
          <Card {...cardProps} />
        </NavLink>
      </div>
    );
  });
};

export default CharactersDeckSection;
