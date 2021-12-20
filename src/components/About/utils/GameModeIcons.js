import React from 'react';
import { Users, Clock} from 'react-feather';

//the player count and the total play time icons
const GameModeIcons = (props) => {

  let extraClasses = (props.className) ? props.className : "";
  let classes = `timePlayerInfoWrapper ${extraClasses}`;

  return (
    <div className={classes}>
      <div>
        <Users />{props.playerCount}
      </div>
      <div>
        <Clock />{props.playTime}
      </div>
    </div>
  );
}

export default GameModeIcons;
