import React, { useEffect } from 'react';
// import { useTranslation } from 'react-i18next';

//custom files
// import GameModeDetails from './utils/GameModeDetails.js';
// import Roleplay from './components/Roleplay.js';

import '../../css/pages/aboutPage.css';

const AboutPage = (props) => {
  // const { t } = useTranslation();

  //styling for any cards on about page
  // let cardStyle = {
  //   width:"70px",
  //   height:"50px",
  //   fontSize:"1.5px",
  // }

  useEffect(() => {
    document.title = "Love, Career & Magic — How To Play";
  });

  // <GameModeDetails
  //   name={t('about page.main page.how to play')}
  //   description={t('about page.roleplay.description')}
  //   playerCount={t('main page.hero.player count')}
  //   playTime={t('main page.hero.play time')}
  //   />
  // <Roleplay cardStyle={cardStyle} />

  return (
    <div className="content max-width">
      <h1>Coming soon!</h1>
    </div>
  );
}

export default AboutPage;
