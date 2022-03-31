import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, useParams, useHistory } from 'react-router-dom';

import { getAllCharacters, getSpecificPersonByURL, getRandomPerson } from '../Characters/Characters.js';
import { CharacterSpotlight } from '../utils/CharacterSpotlight.js';
import { GsapFadeScrub } from "../utils/useGsap.js";
import { EmojiSection } from '../utils/EmojiSection.js';
import DefaultButton from '../utils/DefaultButton.js';

import '../../css/pages/characterPage.css';

//render all characters or a specific one depending on URL
const CharactersPage = (props) => {
  const { t } = useTranslation();
  let { name } = useParams();

  useEffect(() => {
    document.title = "Love, Career & Magic - Characters";
  });

  //if there is a specifc character name, render that character page
  let chosenCharacter = getSpecificPersonByURL(name);

  let randomCharacter1 = getRandomPerson();
  let randomCharacter2 = getRandomPerson();

  //redirect to just /characters if typo a non-existant character
  if (window.location.pathname !== "/characters" && (typeof name === "undefined" || !chosenCharacter || chosenCharacter.ignoreInRandom)) {
    return <Redirect to="/characters" />
  }
  else {
    let characterContent = (chosenCharacter && !chosenCharacter.ignoreInRandom) ?
      (<IndividualCharacter character={chosenCharacter} />) :
      (<AllCharacters />);

    return (
      <div className="content">
        <div className="subcontentWrapper margin-top min-width">
          <div className="characterContent">
            <h2 className="subtitle">{t('characters page.title')}</h2>
            <p>{t('characters page.description')}<br></br></p>
            <div className="freeEmojiButtonWrapper">
              <img src={`/images/emojis/${randomCharacter1.emoji}.png`} alt="Random emoji" title={randomCharacter1.emoji} />
              <a href="#emojis">{t("characters page.emojisection")}</a>
              <img src={`/images/emojis/${randomCharacter2.emoji}.png`} alt="Random emoji" title={randomCharacter2.emoji} />
            </div>
          </div>
        </div>
        <GsapFadeScrub fadeIn className="fadeInTextWrapper">
          { characterContent }
        </GsapFadeScrub>
        <EmojiSection />
        <GsapFadeScrub fadeIn className="fadeInTextWrapper">
          <div className="subcontentWrapper characterContent">
            <h3 className="moretocome">{t('characters page.moretocome')}</h3>
            <p><a href="https://www.instagram.com/carofranklyn/?hl=en">{t('characters page.credit')}</a></p>
          </div>
        </GsapFadeScrub>
      </div>
    )
  }
}

const IndividualCharacter = ({character}) => {
  const { t } = useTranslation();

  const prevButton = (character.prevCharURL) ?
    (<DefaultButton inverted borderedBlack shadowless icon="prev" navlink={`/characters/${character.prevCharURL}`} text={t('characters page.prev')}/>) :
    (<div style={{width:"100px"}}></div>)

  const nextButton = (character.nextCharURL) ?
    (<DefaultButton inverted reversed shadowless borderedBlack icon="next" navlink={`/characters/${character.nextCharURL}`} text={t('characters page.next')}/>) :
    (<div style={{width:"100px"}}></div>)

  return (
    <div className="characterSpotlightContainer">
      <CharacterSpotlight name={character.name} index={character.index} total={character.total} />
      <div className="characterButtonsWrapper">
        { prevButton }
        <DefaultButton inverted borderedBlack shadowless icon="list" navlink="/characters" text={t('characters page.list')}/>
        { nextButton }
      </div>
    </div>
  )
}

//get all characters and their details
const AllCharacters = (props) => {
  let history = useHistory();
  let { name } = useParams();
  let chosenCharacter = getSpecificPersonByURL(name);
  const { i18n } = useTranslation('home');
  const { t } = useTranslation();

  const redirectToSpecificCharacter = (character) => {
    if (chosenCharacter !== character && !character.ignoreInRandom){
      history.push(`/characters/${character.urlName}`);
    }
  }

  const allCharacters = getAllCharacters();
  const expansionCharacters = allCharacters.map((elem, index)=>{
    const name = (i18n.language === "en-US") ? elem.name : elem.japaneseName;
    const race = (i18n.language === "en-US") ? elem.race : elem.japaneseRace;
    const job = (i18n.language === "en-US") ? elem.job : elem.japaneseJob;

    let ignoreInRandom = (elem.ignoreInRandom) ? "notDone" : "";
    return (
      <div className={`characterWrapper ${ignoreInRandom}`} key={index}>
        <div className="characterInnerWrapper" onClick={()=>{redirectToSpecificCharacter(elem)}}>
          <div className="ignoreFilter noselect">
            <p className="notDoneName">{name}</p>
            <p className="comingSoon">{t("characters page.comingsoon")}</p>
          </div>
          <img className="boxes" src={elem.image.url} style={{objectPosition:elem.image.objectPosition || "center"}} alt={elem.name}></img>
          <div className="caption noselect">
            <p className="name">{name}</p>
            <p className="details is-hidden-mobile">
              <span>{elem.age}</span>
              <span>{race}</span>
              <span>{job}</span>
            </p>
          </div>
        </div>
      </div>
    )
  });

  return (
    <>
      <div className="allcharactersWrapper">
        <div className="charactersContainer">
          { expansionCharacters }
        </div>
      </div>
    </>
  )
}

export default CharactersPage;
