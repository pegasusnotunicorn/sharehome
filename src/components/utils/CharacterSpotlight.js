import React from 'react';
import { useTranslation } from 'react-i18next';
import useWindowDimensions from '../utils/useWindowDimensions.js';

//custom files
import Card from '../Card/Card.js';
import { getSpecificPerson, getLatestPerson } from '../Characters/Characters.js';
import '../../css/utils/spotlight.css';
import VisibilityTrigger from "./VisibilityTrigger.js";

//get swiperslides filled with character cards for all characters
const getCharacterCard = (character, windowHeight, windowWidth) => {

  //to determine how big the cards will be based on window width
  let cardDividerByScreenWidth = (windowWidth > 900) ? 2.2 : 1.2;

  //max card width / size
  let cardWidth = Math.min(Math.floor(windowWidth / cardDividerByScreenWidth), 1000);
  let cardHeight = cardWidth / 1.7;

  let props = {
    type: "member",
    personName: character.name,
    showFront: true,
    hideBack: true,
    disableFlip: true,
    disableText: true,
    mainStyle:{
      //stuff needed for card size
      width:`${cardWidth}px`,
      height:`${cardHeight}px`,
      fontSize:"12px",
      //other shit
      cursor:"default",
    },
    className: "floating noselect",
  }

  return (<Card {...props}/>);
}

export const CharacterSpotlight = (props) => {
  const { i18n } = useTranslation('home');
  const { t } = useTranslation();
  const { height, width } = useWindowDimensions();

  //get a specific or the latest character if not defined
  const character = (props.name) ? getSpecificPerson(props.name) : getLatestPerson();
  const floating = props.floating;  //should float or not
  const characterCard = getCharacterCard(character, height, width, floating);

  //language specific
  const nameTitle = (i18n.language === "en-US") ? ((character.title) ? character.title : `${character.name}, The ${character.race}`) : `${character.race}の${character.name}`
  const race = (i18n.language === "en-US") ? character.race : character.japaneseRace;
  const jobTitle = (i18n.language === "en-US") ? ((character.employer) ? `${character.job} at ${character.employer}.` : character.job) : character.japaneseJob;

  //list of descriptions
  const description = (i18n.language === "en-US") ? character.description : character.japaneseDescription;
  const listOfDescriptions = description.map((elem, index)=>{
    return (
      <p key={`description${index}`} className="descriptionsList">{elem}</p>
    )
  });

  //bullet list of hobbies
  const hobbies = (i18n.language === "en-US") ? character.hobbies : character.japaneseHobbies;
  const listOfHobbies = hobbies.map((elem, index)=>{
    return (
      <li key={`hobbies${index}`} className="hobbiesList">{elem}</li>
    )
  });

  return (
    <div className="characterSpotlightWrapper" >
      <div className="spotlightCardWrapper">
        {characterCard}
      </div>
      <div className="spotlightDetailsWrapper">
        <VisibilityTrigger once={props.once} translateY>
          <h1>{nameTitle}</h1>
        </VisibilityTrigger>
        <VisibilityTrigger once={props.once} translateY>
          <div className="spotlightDetailsSection space-between">
            <div className="divider"></div>
            <p>
              <span className="spotlightBold">{t('characters page.race')}<span className="is-hidden-mobile">:</span></span>
              <span>{race}</span>
            </p>
            <div className="divider"></div>
            <p>
              <span className="spotlightBold">{t('characters page.age')}<span className="is-hidden-mobile">:</span></span>
              <span>{character.age}</span>
            </p>
            <div className="divider"></div>
          </div>
        </VisibilityTrigger>
        <VisibilityTrigger once={props.once} translateY>
          <div className="spotlightDetailsSection space-between">
            <div className="divider"></div>
            <p>
              <span className="spotlightBold">{t('characters page.job')}<span className="is-hidden-mobile">:</span></span>
              <span>{ jobTitle }</span>
            </p>
            <div className="divider"></div>
          </div>
        </VisibilityTrigger>
        <VisibilityTrigger once={props.once} translateY>
          <div className="spotlightDetailsSection spotlightHobbiesSection">
            <p className="spotlightBold">{`${t('characters page.hobbies')}`}:</p>
            <ul>
              { listOfHobbies }
            </ul>
          </div>
        </VisibilityTrigger>
        <VisibilityTrigger once={props.once} translateY>
          <div className="spotlightDetailsSection">
            { listOfDescriptions }
          </div>
        </VisibilityTrigger>
      </div>
    </div>
  );
}
