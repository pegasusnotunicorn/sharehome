import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

//custom files
import { Title } from '../utils/Title.js';
import GameModeDetails from './utils/GameModeDetails.js';
import GameModeIcons from './utils/GameModeIcons.js';
import Roleplay from './components/Roleplay.js';
import Charades from './components/Charades.js';
import Guesswho from './components/Guesswho.js';
import Taboo from './components/Taboo.js';

import '../../css/about.css';

const AboutPage = (props) => {
  const { t } = useTranslation();
  let location = useLocation();

  //styling for any cards on about page
  let cardStyle = {
    width:"70px",
    height:"50px",
    fontSize:"2px",
  }

  let gameModeDetails = [
    {
      name:t('about page.roleplay.name'),
      link:"roleplay",
      jsx:()=>{ return (<Roleplay cardStyle={cardStyle} />)},
      description:t('about page.roleplay.description'),
      playerCount:t('about page.roleplay.player count'),
      playTime:t('about page.roleplay.play time')
    },
    {
      name:t('about page.guess who.name'),
      link:"guesswho",
      jsx:()=>{ return (<Guesswho cardStyle={cardStyle} />)},
      description:t('about page.guess who.description'),
      playerCount:t('about page.guess who.player count'),
      playTime:t('about page.guess who.play time')
    },
    {
      name:t('about page.taboo.name'),
      link:"taboo",
      jsx:()=>{ return (<Taboo cardStyle={cardStyle} />)},
      description:t('about page.taboo.description'),
      playerCount:t('about page.taboo.player count'),
      playTime:t('about page.taboo.play time')
    },
    {
      name:t('about page.charades.name'),
      link:"charades",
      jsx:()=>{ return (<Charades cardStyle={cardStyle} />)},
      description:t('about page.charades.description'),
      playerCount:t('about page.charades.player count'),
      playTime:t('about page.charades.play time')
    },
  ];

  let Content = () => {

    //showing a specific game mode
    if ([
      "/about/roleplay",
      "/about/guesswho",
      "/about/taboo",
      "/about/charades",
    ].indexOf(location.pathname) !== -1){

      let gameMode;
      switch (location.pathname){
        case "/about/guesswho":
          gameMode = 1;
          break;
        case "/about/taboo":
          gameMode = 2;
          break;
        case "/about/charades":
          gameMode = 3;
          break;
        default:    //roleplay
          gameMode = 0;
          break;
      }

      return (
        <div>
          <GameModeDetails
            name={gameModeDetails[gameMode].name}
            description={gameModeDetails[gameMode].description}
            playerCount={gameModeDetails[gameMode].playerCount}
            playTime={gameModeDetails[gameMode].playTime}
          />
          {gameModeDetails[gameMode].jsx()}
        </div>
      )
    }
    //showing all the game modes
    else {
      let gameModes = gameModeDetails.map((current, index)=>{
        return (
          <div key={"howToPlay" + index} className="howToPlayWrapper">
            <h2 className="subtitle"><NavLink to={"/about/" + current.link}>{current.name}</NavLink></h2>
            <GameModeIcons
              playerCount={current.playerCount}
              playTime={current.playTime}
            />
            <p>
              {current.description}
            </p>
          </div>
        )
      });

      return (
        <div>
          <div className="subcontentWrapper border-bottom">
            <h2 className="subtitle">{t('about page.main page.how to play')}</h2>
            <p>{t('about page.main page.description')}</p>
          </div>
          {gameModes}
          <div className="howToPlayWrapper">
            <h2 className="subtitle">{t('about page.main page.and many more')}</h2>
            <p>
              {t('about page.main page.how will you play')}
            </p>
          </div>
        </div>
      )
    }
  }

  useEffect(() => {
    document.title = "SHAREHOME - How To Play";
  });

  return (
    <div className="content max-width">
      <Title />
      <Content />
    </div>
  );
}

export default AboutPage;
