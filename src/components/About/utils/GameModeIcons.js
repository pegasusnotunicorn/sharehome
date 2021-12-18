import React from 'react';
import { Users, Clock} from 'react-feather';

//the player count and the total play time icons
const GameModeIcons = (props) => {

  let classes = "timePlayerInfoWrapper " + props.className;

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
