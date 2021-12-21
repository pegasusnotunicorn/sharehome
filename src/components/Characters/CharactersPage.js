import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Title } from '../utils/Title.js';
import { getAllPeople } from '../Card/ExamplePeople.js';

import '../../css/pages/characters.css';

//a single character with caption
const CharacterWithCaption = (props) => {
  return (
    <div className="characterWrapper" >
      <a target="_blank" rel="noopener noreferrer" href={props.image_link}>
        <img className="boxes" src={props.image_link} alt={props.image_alt}></img>
        <p className="caption noselect">{props.image_alt}</p>
      </a>
    </div>
  )
}

const CharactersPage = (props) => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "Love, Career & Magic - Characters";
  });

  //get all characters and their details
  const allCharacters = getAllPeople();
  const expansionCharacters = allCharacters.map((elem, index)=>{
    return (
      <CharacterWithCaption
        key={index}
        image_link={elem.image.url}
        image_alt={elem.name}
      />
    )
  });

  return (
    <div className="content">
      <Title />
      <div className="subcontentWrapper">
        <div className="characterContent">
          <div className="characterSubcontent">
            <h2 className="subtitle">{t('characters page.title')}</h2>
            <p>{t('characters page.description')}<br></br>
            <span style={{color:"red"}}>{t('characters page.warning red')}</span> {t('characters page.warning')}</p>
            { expansionCharacters }
          </div>
          <div className="characterSubcontent">
            <h3 className="moretocome">{t('characters page.moretocome')}</h3>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CharactersPage;
