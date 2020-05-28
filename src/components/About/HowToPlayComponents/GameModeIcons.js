import React from 'react';
import { Users, Clock} from 'react-feather';

//the player count and the total play time icons
const GameModeIcons = (props) => {

  return (
    <div className="timePlayerInfoWrapper">
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
