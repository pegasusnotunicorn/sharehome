import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import GameModeDetails from './HowToPlayComponents/GameModeDetails.js';
import GameModeIcons from './HowToPlayComponents/GameModeIcons.js';
import Roleplay from './HowToPlayComponents/Roleplay.js';
import Charades from './HowToPlayComponents/Charades.js';
import Guesswho from './HowToPlayComponents/Guesswho.js';
import Taboo from './HowToPlayComponents/Taboo.js';
import '../../css/about.css';

const About = (props) => {

  let location = useLocation();

  //styling for any cards on about page
  let cardStyle = {
    width:"70px",
    height:"50px",
    fontSize:"2px",
  }

  let gameModeDetails = [
    {
      name:"Roleplay",
      link:"roleplay",
      jsx:()=>{ return (<Roleplay cardStyle={cardStyle} />)},
      description:"Play as strangers living together in the same house whose daily interactions and drama are commentated on by the other players.",
      playerCount:"6+ Players",
      playTime:"25 Minutes",
    },
    {
      name:"Guess Who?",
      link:"guesswho",
      jsx:()=>{ return (<Guesswho cardStyle={cardStyle} />)},
      description:"Every player is given a random Member Card and takes turns to guess who they are. You are only allowed to ask yes / no questions.",
      playerCount:"2+ Players",
      playTime:"10 Minutes",
    },
    {
      name:"Taboo",
      link:"taboo",
      jsx:()=>{ return (<Taboo cardStyle={cardStyle} />)},
      description:"Split into teams and take turns with the deck of Member Cards. Get your teammates to guess each character without using any of the forbidden words.",
      playerCount:"2+ Players",
      playTime:"10 Minutes",
    },
    {
      name:"Charades",
      link:"charades",
      jsx:()=>{ return (<Charades cardStyle={cardStyle} />)},
      description:"Players take turns acting out their favorite scenes with random Member Cards, while the others try to guess who they are.",
      playerCount:"4+ Players",
      playTime:"10 Minutes",
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
      let gameModes = gameModeDetails.map((current)=>{
        return (
          <div className="howToPlayWrapper">
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
            <h2 className="subtitle">How to play?</h2>
            <p>SHAREHOME is a very flexible party game with multiple ways of playing. Feel free to add your own house rules to change it up!</p>
          </div>
          {gameModes}
          <div className="howToPlayWrapper">
            <h2 className="subtitle">...and many more!</h2>
            <p>
              How will you play SHAREHOME? {/*<a href="/rulebook.pdf">Click here to view the full rulebook PDF.</a>*/}
            </p>
          </div>
        </div>
      )
    }
  }

  useEffect(() => {
    props.setShowFooter(true);
    document.title = "SHAREHOME - How to play";
  });

  return (
    <div className="content padding-bottom max-width">
      <NavLink to="/"><div className="title noselect"></div></NavLink>
      <Content />
    </div>
  );
}

export default About;
