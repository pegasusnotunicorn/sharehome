import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

//custom files
import useWindowDimensions from '../utils/useWindowDimensions.js';
import ShootingStar from '../Navbar/ShootingStar.js';
import { getSpecificPerson, getLatestPerson } from '../Characters/Characters.js';
import '../../css/utils/spotlight.css';
import { GsapFadeScrub } from "./useGsap.js";
import DefaultButton from '../utils/DefaultButton.js';

export const CharacterSpotlight = (props) => {
  const { i18n } = useTranslation('home');
  const { t } = useTranslation();

  //get a specific or the latest character if not defined
  const character = (props.name) ? getSpecificPerson(props.name) : getLatestPerson();
  const invertClass = (props.invert) ? "invert" : "";

  //language specific
  const name = (i18n.language === "en-US") ? character.name : character.japaneseName;
  const title = (i18n.language === "en-US") ? (character.title) ? character.title : `The ${character.race}` : `${character.japaneseRace}`;
  // const race = (i18n.language === "en-US") ? character.race : character.japaneseRace;
  const job = (i18n.language === "en-US") ? character.job : character.japaneseJob;
  const jobTitle = (i18n.language === "en-US") ? ((character.employer) ? `${character.job} at ${character.employer}.` : character.job) : character.japaneseJob;
  const age = (i18n.language === "en-US") ? `${character.age} years old` : `${character.age}歳`;

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

  //hide details button on mobile
  const [showDetails, setShowDetails] = useState(true);
  const { width } = useWindowDimensions();
  useEffect(()=>{
    if (width < 900) {
      setShowDetails(false);
    }
  }, [width, setShowDetails]);
  const detailsClass = (showDetails) ? "is-active" : "";
  const showDetailsButtonText = (showDetails) ? "Hide details" : "Show more details";
  const backgroundPosition = (character.image.objectPosition) ? `${character.image.objectPosition} center` : "center center";

  return (
    <div className={`characterSpotlightWrapper ${invertClass}`} >
      <GsapFadeScrub fadeIn className="fadeInTextWrapper">
        { props.sectionTitle &&
          <SectionTitle title={props.sectionTitle} />
        }
        <div className="spotlightBottomWrapper">
          <div className="spotlightLeftWrapper">
            <NavLink to={`/characters/${character.urlName}`}>
              <div className="imageCircleMask noselect">
                <img src={character.image.url} style={{objectPosition:backgroundPosition}} alt={character.name} />
              </div>
            </NavLink>
            <div className="leftDetailsWrapper">
              <h1>{name}</h1>
              <h3>— {title} —</h3>
              <div className="leftAgeJobWrapper">
                <p>{age}</p>
                <p className="divider"></p>
                <p>{job}</p>
              </div>
            </div>
          </div>
          <div className="spotlightRightWrapper">
            <div className="spotlightRightTopWrapper">
              <div className="spotlightDetailsSection spotlightHobbiesSection">
                <p className="spotlightBold">{`${t('characters page.job')}`}:</p>
                <p>{ jobTitle }</p>
              </div>
              <div className="spotlightDetailsSection spotlightHobbiesSection">
                <p className="spotlightBold">{`${t('characters page.hobbies')}`}:</p>
                <ul>
                  { listOfHobbies }
                </ul>
              </div>
              <div className={`spotlightDetailsSection ${detailsClass}`}>
                { listOfDescriptions }
              </div>
              <div className={`showDetailsButton is-hidden-desktop`}>
                <p onClick={()=>{setShowDetails(!showDetails)}}>{ showDetailsButtonText }</p>
              </div>
            </div>
            { props.allCharsButton &&
              <AllCharactersButton />
            }
          </div>
        </div>
      </GsapFadeScrub>
    </div>
  );
}

const SectionTitle = ({title}) => {
  return (
    <div className="spotlightTopWrapper">
      <div className="starWrapperLeft">
        <ShootingStar isActive={true} orientation="left" whiteMode />
      </div>
      <h1>{ title }</h1>
      <div className="starWrapperRight">
        <ShootingStar isActive={true} orientation="right" whiteMode mirror />
      </div>
    </div>
  )
}

const AllCharactersButton = () => {
  const { t } = useTranslation();

  return (
    <div className="allCharsButtonWrapper">
      <DefaultButton icon="people_white" bordered navlink="/characters" text={t('main page.character.clicktoseemore')}/>
    </div>
  )
}
