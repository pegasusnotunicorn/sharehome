import React from 'react';
import { Users, Clock} from 'react-feather';

//the player count and the total play time icons
const GameModeIcons = (props) => {

  let extraClasses = (props.className) ? props.className : "";
  let classes = `timePlayerInfoWrapper ${extraClasses}`;

  return (
    <div className={classes}>
      <div>
        <img src="/images/icons/playercount.svg" alt="Player Count" />{props.playerCount}
      </div>
      <div>
        <img src="/images/icons/sandclock.svg" alt="Time" />{props.playTime}
      </div>
    </div>
  );
}

export default GameModeIcons;
