import React from 'react';
import { getSpecificPerson } from '../Characters/Characters.js';
import { useTranslation } from 'react-i18next';

export const CardBack = (props) => {
  const { i18n } = useTranslation('home');
  let character = getSpecificPerson(props.personName);

  const name = (i18n.language === "en-US") ? character.name : character.japaneseName;
  const job = (i18n.language === "en-US") ? character.job : character.japaneseJob;
  const age = (i18n.language === "en-US") ? `${character.age} year old` : `${character.age}歳` ;

  return (
    <div className="noselect cardBack name">
      <div className="cardBackText">
        <h2 className="cardBackName">{ name }</h2>
        <h3 className="cardBackAge">{ age } { job }</h3>
      </div>
    </div>
  )
}

export default CardBack;
