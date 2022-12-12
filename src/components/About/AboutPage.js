import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

//custom files
import GameModeDetails from './utils/GameModeDetails.js';
import Roleplay from './components/Roleplay.js';
import useWindowDimensions from '../utils/useWindowDimensions.js';

import '../../css/pages/aboutPage.css';

const AboutPage = (props) => {
  const { t } = useTranslation();
  let { width } = useWindowDimensions();

  // styling for character cards on about page
  let cardStyle = {
    width:"175px",
    height:"100px",
    fontSize:"1.5px",
  }

  useEffect(() => {
    document.title = "Love, Career & Magic — How To Play";
  });

  return (
    <div className="content max-width">
      <GameModeDetails
        name={t('about page.main page.how to play')}
        description={t('about page.roleplay.description')}
        playerCount={t('main page.hero.player count')}
        playTime={t('main page.hero.play time')}
        />
      <Roleplay cardStyle={cardStyle} />
    </div>
  );
}

export default AboutPage;
