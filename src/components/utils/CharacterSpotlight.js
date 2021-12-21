import React from 'react';
import { useTranslation } from 'react-i18next';
import useWindowDimensions from '../utils/useWindowDimensions.js';

//custom files
import Card from '../Card/Card.js';
import { getSpecificPerson, getLatestPerson } from '../Card/ExamplePeople.js';
import '../../css/utils/spotlight.css';

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
      cursor:"pointer",
    },
    className: "floating",
  }

  return (<Card {...props}/>);
}

export const CharacterSpotlight = (props) => {
  const { i18n } = useTranslation('home');
  const { t } = useTranslation();
  const { height, width } = useWindowDimensions();

  //get a specific or the latest character if not defined
  const character = (props.name) ? getSpecificPerson(props.name) : getLatestPerson();
  const characterCard = getCharacterCard(character, height, width);

  //language specific
  const name = (i18n.language === "en-US") ? character.name : character.japaneseName;
  const job = (i18n.language === "en-US") ? character.job : character.japaneseJob;
  const race = (i18n.language === "en-US") ? character.race : character.japaneseRace;
  const hobbies = (i18n.language === "en-US") ? character.hobbies : character.japaneseHobbies;
  const description = (i18n.language === "en-US") ? character.description : character.japaneseDescription;

  return (
    <div className="characterSpotlightWrapper" >
      <div className="spotlightCardWrapper">
        {characterCard}
      </div>
      <div className="spotlightDetailsWrapper">
        <h1>{name}</h1>
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
          <p>
            <span className="spotlightBold">{t('characters page.job')}<span className="is-hidden-mobile">:</span></span>
            <span>{job}</span>
          </p>
          <div className="divider"></div>
        </div>
        <div className="spotlightDetailsSection">
          <p>
            <span className="spotlightBold">{`${t('characters page.hobbies')}`}<span className="is-hidden-mobile">:</span></span>
            <span>{hobbies}</span>
          </p>
        </div>
        <div className="spotlightDetailsSection">
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}
