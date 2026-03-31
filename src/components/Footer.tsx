import { useMemo } from "react";
import Card from "./Card/Card";
import useWindowDimensions from "./utils/useWindowDimensions";
import styles from "../css/footer.module.css";

function randomIntFromInterval(min: number, max: number): number {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

//create an array of random cards given approximate ratio of direction/episode to person cards
const RandomCardsForFooter = (totalPeopleCards: number, totalDirectionEpisodeCards: number, screenWidth: number) => {
  return [...Array(totalPeopleCards + totalDirectionEpisodeCards)].map(
    (curr, index, array) => {
      let cardWidth = screenWidth <= 900 ? 180 : 300;
      let cardHeight = cardWidth / 1.4;

      let broadType = "directionEpisode";
      let specificType =
        broadType === "person"
          ? Math.random() > 0.5
            ? "member"
            : "commentator"
          : Math.random() > 0.5
          ? "episode"
          : "direction";

      //random stuff to simulate throwing cards from below the screen
      let randomTransition = Math.round(Math.random() * 75) / 100;
      let randomDegree = randomIntFromInterval(-180, 180);
      let randomZ = Math.round(Math.random() * array.length);
      let randomLeft = Math.round((index - 1) * (100 / array.length));

      let props = {
        id: broadType + index,
        key: broadType + index,
        type: specificType,
        flipPercentage: 0.5, //chance of showing front of the card
        mainStyle: {
          //stuff needed for card size
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
          fontSize: screenWidth <= 900 ? "5px" : "7.5px",
          //stuff needed to simulate the random throwing
          position: "absolute" as const,
          transform: "rotate(0deg)",
          zIndex: randomZ,
          left: randomLeft + "vw",
          bottom: "-100%",
          transition:
            "bottom " +
            randomTransition +
            "s, transform " +
            randomTransition +
            "s " +
            randomTransition / 2 +
            "s",
          //other shit
          cursor: "pointer",
        },
        //used for animation later in useEffect
        randomBottom: 0 + "vh",
        randomDegree: "rotate(" + randomDegree + "deg)",
      };
      const { key, ...rest } = props;

      return <Card key={"card" + index} {...rest} />;
    }
  );
};

const Footer = () => {
  const { width } = useWindowDimensions();

  //used to make ratio of cards
  const isMobile = width <= 900;
  const totalPeopleCards = Math.ceil(width / 150) + (isMobile ? 3 : 0);
  const totalDirectionEpisodeCards = Math.ceil(width / 400);
  const totalCards = totalPeopleCards + totalDirectionEpisodeCards;

  const footerCards = useMemo(
    () => RandomCardsForFooter(totalPeopleCards, totalDirectionEpisodeCards, width),
    [totalCards, width <= 900]
  );

  return <div className={styles.footer}>{footerCards}</div>;
};

export default Footer;
