import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, useParams, useHistory } from 'react-router-dom';

import { Title } from '../utils/Title.js';
import { getAllCharacters, getSpecificPersonByURL } from '../Card/ExamplePeople.js';
import { CharacterSpotlight } from '../utils/CharacterSpotlight.js';

import VisibilityTrigger from "../utils/VisibilityTrigger.js";
import '../../css/pages/characters.css';

//get all characters and their details
const AllCharacters = (props) => {
  let history = useHistory();
  let { name } = useParams();
  let chosenCharacter = getSpecificPersonByURL(name);

  const redirectToSpecificCharacter = (character) => {
    if (chosenCharacter !== character && !character.ignoreInRandom){
      history.push(`/characters/${character.urlName}`);
      window.scrollTo({top:0,behavior:'smooth'});
    }
  }

  const allCharacters = getAllCharacters();
  const expansionCharacters = allCharacters.map((elem, index)=>{
    let ignoreInRandom = (elem.ignoreInRandom) ? "notDone" : "";
    return (
      <VisibilityTrigger className={`characterWrapper ${ignoreInRandom}`} key={index} once translateY >
        <div className="characterInnerWrapper" onClick={()=>{redirectToSpecificCharacter(elem)}}>
          <div className="ignoreFilter noselect">
            <p className="notDoneName">{elem.name}</p>
            <p className="comingSoon">Coming soon</p>
          </div>
          <img className="boxes" src={elem.image.url} alt={elem.name}></img>
          <div className="caption noselect">
            <p className="name">{elem.name}</p>
            <p className="details">
              <span>{elem.age}</span>
              <span>{elem.race}</span>
              <span>{elem.job}</span>
            </p>
          </div>
        </div>
      </VisibilityTrigger>
    )
  });

  return (
    <div className="charactersContainer">
      { expansionCharacters }
    </div>
  )
}

const CharactersPage = (props) => {
  const { t } = useTranslation();
  let { name } = useParams();

  useEffect(() => {
    document.title = "Love, Career & Magic - Characters";
  });

  //if there is a specifc character name, render that character page
  let chosenCharacter = getSpecificPersonByURL(name);

  //redirect to just /characters if typo a non-existant character
  if (window.location.pathname !== "/characters" && (typeof name === "undefined" || !chosenCharacter || chosenCharacter.ignoreInRandom)) {
    return <Redirect to="/characters" />
  }
  else {

    let chosenCharacterContents = (chosenCharacter && !chosenCharacter.ignoreInRandom) ?
      (
        <div className="characterSpotlightWrapper greenBackground">
          <CharacterSpotlight name={chosenCharacter.name} />
        </div>
      ) :
      (
        <div></div>
      )

    return (
      <div className="content">
        <Title />

        { chosenCharacterContents }

        <div className="subcontentWrapper">
          <div className="characterContent">
            <h2 className="subtitle">{t('characters page.title')}</h2>
            <p>{t('characters page.description')}<br></br>
            <span style={{color:"red"}}>{t('characters page.warning red')}</span> {t('characters page.warning')}</p>
          </div>
        </div>

        <AllCharacters />

        <div className="subcontentWrapper">
          <h3 className="moretocome">{t('characters page.moretocome')}</h3>
        </div>
      </div>
    )
  }
}

export default CharactersPage;
