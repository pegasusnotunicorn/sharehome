import React from 'react';
import GameModeIcons from "./GameModeIcons.js";

//the subtitle with the description and the title in how-to-play page
const GameModeDetails = (props) => {

  return (
    <div className="subcontentWrapper">
      <div className="characterContent">
        <h2 className="subtitle">
          {props.name}
        </h2>
        <p>
          {props.description}
        </p>
        <GameModeIcons
          playerCount={props.playerCount}
          playTime={props.playTime}
        />
      </div>
    </div>
  );
}

export default GameModeDetails;
