import React from 'react';
import GameModeIcons from "./GameModeIcons.js";
import { NavLink } from 'react-router-dom';
import { ArrowLeft} from 'react-feather';

//the subtitle with the description and the title in how-to-play page
const GameModeDetails = (props) => {

  return (
    <div className="subcontentWrapper border-bottom">
      <h2 className="subtitle">
        <NavLink className="backToAbout" to="/about"><ArrowLeft /></NavLink>
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
  );
}

export default GameModeDetails;
