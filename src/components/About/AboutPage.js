import React, { useEffect } from 'react';
// import { NavLink, useLocation, Redirect } from 'react-router-dom';
import { useLocation, Redirect } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

//custom files
import GameModeDetails from './utils/GameModeDetails.js';
// import GameModeIcons from './utils/GameModeIcons.js';
import Roleplay from './components/Roleplay.js';
import Charades from './components/Charades.js';
import Guesswho from './components/Guesswho.js';
import Taboo from './components/Taboo.js';

import '../../css/pages/aboutPage.css';

const AboutPage = (props) => {
  const { t } = useTranslation();
  let location = useLocation();

  //styling for any cards on about page
  let cardStyle = {
    width:"70px",
    height:"50px",
    fontSize:"1.5px",
  }

  let gameModeDetails = [
    {
      name:t('about page.main page.how to play'),
      // name:t('about page.roleplay.name'),
      link:"roleplay",
      jsx:()=>{ return (<Roleplay cardStyle={cardStyle} />)},
      description:t('about page.roleplay.description'),
      playerCount:t('main page.hero.player count'),
      playTime:t('main page.hero.play time'),
      background:"greenBackground",
    },
    {
      name:t('about page.guess who.name'),
      link:"guesswho",
      jsx:()=>{ return (<Guesswho cardStyle={cardStyle} />)},
      description:t('about page.guess who.description'),
      playerCount:t('about page.guess who.player count'),
      playTime:t('about page.guess who.play time'),
      background:"blueBackground",
    },
    {
      name:t('about page.taboo.name'),
      link:"taboo",
      jsx:()=>{ return (<Taboo cardStyle={cardStyle} />)},
      description:t('about page.taboo.description'),
      playerCount:t('about page.taboo.player count'),
      playTime:t('about page.taboo.play time'),
      background:"redBackground",
    },
    {
      name:t('about page.charades.name'),
      link:"charades",
      jsx:()=>{ return (<Charades cardStyle={cardStyle} />)},
      description:t('about page.charades.description'),
      playerCount:t('about page.charades.player count'),
      playTime:t('about page.charades.play time'),
      background:"yellowBackground",
    },
  ];

  //show a specific game mode
  let specificGameModeRequested = [
    "/about/roleplay",
    "/about/guesswho",
    "/about/taboo",
    "/about/charades",
  ].indexOf(location.pathname) !== -1

  //get specific game mode
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

  useEffect(() => {
    document.title = "Love, Career & Magic — How To Play";
  });

  return (
    <div className="content max-width">
      { specificGameModeRequested &&
        <>
          <GameModeDetails
            name={gameModeDetails[gameMode].name}
            description={gameModeDetails[gameMode].description}
            playerCount={gameModeDetails[gameMode].playerCount}
            playTime={gameModeDetails[gameMode].playTime}
          />
          {gameModeDetails[gameMode].jsx()}
        </>
      }
      { !specificGameModeRequested &&
        <Redirect to="/about/roleplay" />
        // <ShowAllGameModes gameModeDetails={gameModeDetails}/>
      }
    </div>
  );
}

// const ShowAllGameModes = ({gameModeDetails}) => {
//   const { t } = useTranslation();
//
//   return (
//     <div>
//       <div className="subcontentWrapper margin-top min-width">
//         <div className="characterContent">
//           <h2 className="subtitle">{t('about page.main page.how to play')}</h2>
//           <p>{t('about page.main page.description')}</p>
//         </div>
//       </div>
//
//       <div className="howToPlayContainer">
//         {
//           gameModeDetails.map((current, index)=>{
//             return (
//               <NavLink draggable={false} to={`/about/${current.link}`} className={`howToPlayWrapper noselect`} key={`howToPlay${index}`}>
//                 <h2 className="subsubtitle">{current.name}</h2>
//                 <GameModeIcons
//                   playerCount={current.playerCount}
//                   playTime={current.playTime}
//                 />
//                 <p>
//                   {current.description}
//                 </p>
//               </NavLink>
//             )
//           })
//         }
//       </div>
//       <div className="subcontentWrapper">
//         <h2 className="subsubtitle">{t('about page.main page.and many more')}</h2>
//         <p>
//           {t('about page.main page.how will you play')}
//         </p>
//       </div>
//     </div>
//   )
// }

export default AboutPage;
