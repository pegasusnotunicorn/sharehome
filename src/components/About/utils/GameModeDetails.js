import React from "react";
import GameModeIcons from "./GameModeIcons.js";
import DefaultButton from "../../utils/DefaultButton.js";

//the subtitle with the description and the title in how-to-play page
const GameModeDetails = (props) => {
  const rulebookStyle = {
    padding: "0",
    background: "transparent",
    color: "#323232",
    margin: "auto",
    textDecoration: "underline",
  };

  // rulebook PDF link

  return (
    <div className="subcontentWrapper margin-top">
      <div className="characterContent">
        <h2 className="subtitle">{props.name}</h2>
        <p>{props.description}</p>
        <DefaultButton
          style={rulebookStyle}
          shadowless
          icon="rulebook"
          href="/rulebook.pdf"
          text="Read the full rulebook PDF"
        />
        <GameModeIcons
          playerCount={props.playerCount}
          playTime={props.playTime}
        />
      </div>
    </div>
  );
};

export default GameModeDetails;
