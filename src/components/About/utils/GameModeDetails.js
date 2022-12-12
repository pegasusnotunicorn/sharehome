import React from 'react';
// import { useTranslation } from 'react-i18next';

import GameModeIcons from "./GameModeIcons.js";
// import DefaultButton from '../../utils/DefaultButton.js';

//the subtitle with the description and the title in how-to-play page
const GameModeDetails = (props) => {
  // const { t } = useTranslation();
  //
  // const rulebookStyle= {
  //   padding:"0",
  //   background:"transparent",
  //   color:"#323232",
  //   margin:"auto",
  //   textDecoration:"underline",
  // }

  // rulebook PDF link
  // <DefaultButton style={rulebookStyle} shadowless icon="rulebook" href="/rulebook.pdf" text={t('main page.mechanics.rulebook')}/>

  return (
    <div className="subcontentWrapper margin-top">
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
