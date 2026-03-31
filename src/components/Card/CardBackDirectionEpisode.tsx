import styles from "../../css/utils/cards.module.css";

interface CardBackDirectionEpisodeProps {
  type?: string;
  randomNumber?: string | number;
}

export const CardBackDirectionEpisode = (props: CardBackDirectionEpisodeProps) => {
  const type = props.type as "direction" | "episode";

  return (
    <div className={`noselect ${styles.cardBack}`}>
      <img
        loading="lazy"
        src={`/images/illustrations/${type}card${props.randomNumber}.webp`}
        alt={`${type} card`}
      />
    </div>
  );
};

export default CardBackDirectionEpisode;
