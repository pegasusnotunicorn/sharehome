import React from 'react';
import GameModeIcons from "./GameModeIcons.js";
import { NavLink } from 'react-router-dom';
import { ArrowLeft} from 'react-feather';

//the subtitle with the description and the title in how-to-play page
const GameModeDetails = (props) => {

  return (
    <div className="subcontentWrapper border-bottom">
      <div className="characterContent">
        <h2 className="subtitle">
          <NavLink className="subtitleBackPageArrow" to="/about"><ArrowLeft /></NavLink>
          {props.name}
        </h2>
        <GameModeIcons
          playerCount={props.playerCount}
          playTime={props.playTime}
        />
        <p>
          {props.description}
        </p>
      </div>
    </div>
  );
}

export default GameModeDetails;
