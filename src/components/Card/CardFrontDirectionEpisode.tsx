import { useState } from "react";
import { getRandomDirectionEpisode } from "./ExampleDirectionEpisode";
import styles from "../../css/utils/cards.module.css";

interface DirectionEpisodeCardProps {
  type: string;
  randomNumber?: string | number;
}

export const DirectionEpisodeCard = (props: DirectionEpisodeCardProps) => {
  const type = props.type as "direction" | "episode";
  const [cardDetails] = useState(getRandomDirectionEpisode(type));

  return (
    <div className={styles.directionEpisodeCardWrapper}>
      <div className={`${styles.directionEpisodeTextWrapper} ${styles[type]}`}>
        {cardDetails.description}
      </div>
      <img
        loading="lazy"
        className={styles[type]}
        src={`/images/illustrations/${type}cardfront${props.randomNumber}.webp`}
        alt={`${type} card`}
      />
    </div>
  );
};

export default DirectionEpisodeCard;
