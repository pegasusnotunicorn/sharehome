import { useRef, useLayoutEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger.js";
import gsap from "gsap";
import Card from "../Card/Card";
import DeckRow from "./utils/DeckRow";
import getHomePageCardProps from "./utils/getHomePageCardProps";
import useWindowDimensions from "../utils/useWindowDimensions";
import { getRandomDirectionsEpisodes } from "../Card/ExampleDirectionEpisode";
import { randomDeg, randomNum } from "../utils/useMath";
import styles from "../../css/pages/home/directionEpisodeDeckSection.module.css";

interface DeckSectionProps {
  directionOrEpisode: string;
}

interface DirectionEpisodeDeckRowProps {
  card: any;
  rowIndex: number;
  rowTl?: gsap.core.Timeline | null;
  directionOrEpisode: string;
}

interface AnimatedCardProps {
  card: any;
  rowIndex: number;
  tl?: gsap.core.Timeline | null;
  directionOrEpisode: string;
}

export const EpisodeDeckSection = () => {
  return <DeckSection directionOrEpisode="episode" />;
};
export const DirectionDeckSection = () => {
  return <DeckSection directionOrEpisode="direction" />;
};

//the deck section covering half the screen
const DeckSection = ({ directionOrEpisode }: DeckSectionProps) => {
  gsap.registerPlugin(ScrollTrigger);
  const splitIntoSections = getRandomDirectionsEpisodes(directionOrEpisode as "direction" | "episode", 3);
  return (
    <div className={styles.directionEpisodeDecksContainer}>
      {splitIntoSections.map((curr: any, index: number) => {
        return (
          <DirectionEpisodeDeckRow
            key={`directionEpisodeDecksRow${index}`}
            card={curr}
            rowIndex={index}
            directionOrEpisode={directionOrEpisode}
          />
        );
      })}
    </div>
  );
};

//a single row of cards
const DirectionEpisodeDeckRow = ({ card, rowIndex, rowTl, directionOrEpisode }: DirectionEpisodeDeckRowProps) => {
  return (
    <DeckRow className={styles.directionEpisodeDeckRow}>
      <AnimatedCard
        card={card}
        rowIndex={rowIndex}
        tl={rowTl}
        directionOrEpisode={directionOrEpisode}
      />
    </DeckRow>
  );
};

//a row of animations
const AnimatedCard = (props: AnimatedCardProps) => {
  const rowIndex = props.rowIndex;
  const directionOrEpisode = props.directionOrEpisode;
  const { width } = useWindowDimensions();

  //add to the timeline
  const tl = props.tl;
  const cardRef = useRef<HTMLDivElement>(null);

  //directions episodes
  let finalX: number, finalY: number, finalRot: string;
  if (directionOrEpisode === "direction") {
    finalX = rowIndex % 2 === 0 ? -randomNum(15, 20) : 0;
    finalY = rowIndex === 2 ? 3 : 0;
    finalRot = rowIndex % 2 === 0 ? "-5deg" : "5deg";

    //fine tune adjustments for mobile
    if (width <= 900) {
      finalX = rowIndex === 1 ? 17.5 : finalX;
      finalY = rowIndex === 0 ? -5 : finalY;
      finalY = rowIndex === 1 ? -33 : finalY;
      finalY = rowIndex === 2 ? 5 : finalY;
      finalX = rowIndex === 2 ? -5 : finalX;
    }
  } else {
    finalX = rowIndex % 2 === 0 ? randomNum(35, 40) : 20;
    finalY = 0;
    finalRot = rowIndex % 2 === 0 ? "5deg" : "-5deg";

    //fine tune adjustments for mobile / tablet
    if (width > 1200 && width <= 1600) {
      finalX = rowIndex % 2 === 0 ? randomNum(30, 35) : 15;
    } else if (width > 900 && width <= 1200) {
      finalX = rowIndex % 2 === 0 ? randomNum(30, 35) : 5;
    } else if (width <= 900) {
      finalX = rowIndex === 0 ? -15 : finalX;
      finalX = rowIndex === 1 ? 12 : finalX;
      finalY = rowIndex === 1 ? -25 : finalY;
      finalX = rowIndex === 2 ? -15 : finalX;
    }
  }

  useLayoutEffect(() => {
    if (tl) {
      tl.killTweensOf(cardRef.current);
      tl.fromTo(
        cardRef.current,
        {
          x: directionOrEpisode === "direction" ? "200%" : "-200%",
          y: `${finalY}vh`,
          rotationY: randomDeg(200),
          rotationX: randomDeg(200),
          rotationZ: randomDeg(100),
        },
        {
          x: `${finalX}vw`,
          y: `${finalY}vh`,
          rotationY: randomDeg(10),
          rotationX: randomDeg(10),
          rotationZ: finalRot,
        }
      );
    }
    return () => {
      if (tl) tl.killTweensOf();
    };
  }, [tl, cardRef, finalX, finalY, finalRot, directionOrEpisode]);

  //card details
  const cardProps = getHomePageCardProps(props.card.type, width);

  //flip the second card
  cardProps.type = props.card.type.toLowerCase();
  if (rowIndex === 1) cardProps.showFront = false;
  if (rowIndex === 1) cardProps.disableFlip = false;
  if (rowIndex === 1) cardProps.hideBack = false;

  return (
    <div ref={cardRef} className={styles.DECardWrapper}>
      <Card {...cardProps} />
    </div>
  );
};
