import PropTypes from "prop-types";

//the player count and the total play time icons
const GameModeIcons = (props) => {
  let extraClasses = props.className ? props.className : "";
  let classes = `timePlayerInfoWrapper ${extraClasses}`;

  return (
    <div className={classes}>
      <div>
        <img src="/images/icons/playercount.svg" alt="Player Count" />
        {props.playerCount}
      </div>
      <div>
        <img src="/images/icons/sandclock.svg" alt="Time" />
        {props.playTime}
      </div>
    </div>
  );
};

GameModeIcons.propTypes = {
  playerCount: PropTypes.string.isRequired,
  playTime: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default GameModeIcons;
