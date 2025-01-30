import PropTypes from "prop-types";

export const CardBackEventGoal = (props) => {
  let type = props.type;
  if (
    props.type === "goal" ||
    props.type === "location" ||
    props.type === "episode"
  )
    type = "location";
  if (props.type === "event") type = "direction";

  return (
    <div className="noselect cardBack">
      <img
        src={`/images/illustrations/${type}card${props.randomNumber}.webp`}
        alt={`${type} card`}
      />
    </div>
  );
};

CardBackEventGoal.propTypes = {
  type: PropTypes.string,
  randomNumber: PropTypes.number,
};

export default CardBackEventGoal;
