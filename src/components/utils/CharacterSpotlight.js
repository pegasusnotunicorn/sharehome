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

  let job = (i18n.language === "en-US") ? character.job : character.japaneseJob;
  const jobTitle = (i18n.language === "en-US") ? ((character.employer) ? `${character.job} at ${character.employer}.` : `${character.job} (Self employed).`) : (character.japaneseEmployer) ? `${character.japaneseJob}（${character.japaneseEmployer}）` : character.japaneseJob;

  //second job
  let jobTitle2;
  if (character.job2) {
    job = (i18n.language === "en-US") ? `${character.job} / ${character.job2}` : `${character.japanseJob} / ${character.japanseJob2}`;
    jobTitle2 = (i18n.language === "en-US") ? ((character.employer2) ? `${character.job2} at ${character.employer2}.` : `${character.job2}.`) : (character.japaneseEmployer2) ? `${character.japaneseJob2}（${character.japaneseEmployer2}）` : character.japaneseJob2;
  }

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

  //list of extra emojis
  let listOfEmojis;
  if (character.moreemoji){
    listOfEmojis = character.moreemoji.map((elem, index)=>{
      return (
        <DefaultButton key={`emoji${index}`} emoji={elem} inverted shadowless text={t('characters page.emoji')}/>
      )
    });
  }

  //hide details button on mobile
  const [showDetails, setShowDetails] = useState(true);
  const { width } = useWindowDimensions();
  useEffect(()=>{
    if (width < 900) {
      setShowDetails(false);
    }
  }, [width, setShowDetails]);
  const detailsClass = (showDetails) ? "is-active" : "";
  let showDetailsButtonText = (showDetails) ? "Hide details" : "Show more details";
  if (i18n.language !== "en-US"){
    showDetailsButtonText = (showDetails) ? "詳細メニューを閉じる" : "詳細メニューを開く";
  }
  const backgroundPosition = (character.image.objectPosition) ? `${character.image.objectPosition} center` : "center center";
  const LinkTo = (props) => {
    if (props.sectionTitle) return (<NavLink to={`/characters/${character.urlName}`}>{props.children}</NavLink>);
    else return (<a target="_blank" rel="noreferrer" href={character.image.url}>{props.children}</a>);
  }
  return (
    <div className={`characterSpotlightWrapper ${invertClass}`} >
      <GsapFadeScrub fadeIn className="fadeInTextWrapper">
        { props.sectionTitle &&
          <SectionTitle title={props.sectionTitle} />
        }
        <div className="spotlightBottomWrapper">
          <div className="spotlightLeftWrapper">
            { props.index && props.total &&
              <IndexTotal index={props.index} total={props.total} />
            }
            <LinkTo {...props}>
              <div className="imageCircleMask noselect">
                <img className="characterImage" src={character.image.url} style={{objectPosition:backgroundPosition}} alt={character.name} />
                <div className="magnifierWrapper">
                  <img className="imageCircleIcons" src="/images/icons/magnifier.svg" alt="Look closer" />
                </div>
              </div>
            </LinkTo>
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
                { character.job2 &&
                  <p>{jobTitle2}</p>
                }
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
              <div className="discordEmojiWrapper">
                <DefaultButton emoji={character.emoji} inverted shadowless text={t('characters page.emoji')}/>
                { character.emoji2 &&
                  <DefaultButton emoji={character.emoji2} inverted shadowless text={t('characters page.emoji')}/>
                }
                { character.moreemoji &&
                  listOfEmojis
                }
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

//#what out of total (for character page)
const IndexTotal = ({index, total}) => {
  return (
    <div className="indexTotalWrapper">
      <span className="indexWrapper">{index}</span> / {total}
    </div>
  )
}

//title for homepage
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
      <DefaultButton icon="people_white" borderedWhite shadowless navlink="/characters" text={t('main page.character.clicktoseemore')}/>
    </div>
  )
}
