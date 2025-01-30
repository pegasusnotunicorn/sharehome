import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import useWindowDimensions from "../utils/useWindowDimensions.js";
import ShootingStar from "../Navbar/ShootingStar.js";
import {
  getSpecificPerson,
  getRandomPerson,
} from "../Characters/Characters.js";
import "../../css/utils/spotlight.css";
import { GsapFadeScrub } from "./useGsap.js";
import DefaultButton from "../utils/DefaultButton.js";
import PropTypes from "prop-types";

export const CharacterSpotlight = (props) => {
  //get a specific or the latest character if not defined
  const character = props.name
    ? getSpecificPerson(props.name)
    : getRandomPerson();
  const invertClass = props.invert ? "invert" : "";

  //language specific
  const name = character.name;
  const title = character.title ? character.title : `The ${character.race}`;
  let job = character.job;
  const jobTitle = character.employer
    ? `${character.job} at ${character.employer}.`
    : `${character.job} (Self employed).`;

  //second job
  let jobTitle2;
  if (character.job2) {
    job = `${character.job} / ${character.job2}`;
    jobTitle2 = character.employer2
      ? `${character.job2} at ${character.employer2}.`
      : `${character.job2}.`;
  }

  const age = `${character.age} years old`;

  //list of descriptions
  const description = character.description;
  const listOfDescriptions = description.map((elem, index) => {
    return (
      <p key={`description${index}`} className="descriptionsList">
        {elem}
      </p>
    );
  });

  //bullet list of hobbies
  const hobbies = character.hobbies;
  const listOfHobbies = hobbies.map((elem, index) => {
    return (
      <li key={`hobbies${index}`} className="hobbiesList">
        {elem}
      </li>
    );
  });

  //list of extra emojis
  let listOfEmojis;
  listOfEmojis = character.emoji.map((elem, index) => {
    return (
      <DefaultButton
        key={`emoji${index}`}
        emoji={elem}
        inverted
        shadowless
        text="Download emoji"
      />
    );
  });

  //hide details button on mobile
  const [showDetails, setShowDetails] = useState(true);
  const { width } = useWindowDimensions();
  useEffect(() => {
    if (width < 900) {
      setShowDetails(false);
    }
  }, [width, setShowDetails]);
  const detailsClass = showDetails ? "is-active" : "";
  let showDetailsButtonText = showDetails
    ? "Hide details"
    : "Show more details";

  const backgroundPosition = character.image.objectPosition
    ? `${character.image.objectPosition} center`
    : "center center";
  const LinkTo = (props) => {
    if (props.sectionTitle)
      return (
        <NavLink to={`/characters/${character.urlName}`}>
          {props.children}
        </NavLink>
      );
    else
      return (
        <a target="_blank" rel="noreferrer" href={character.image.url}>
          {props.children}
        </a>
      );
  };
  return (
    <div className={`characterSpotlightWrapper ${invertClass}`}>
      <GsapFadeScrub fadeIn className="fadeInTextWrapper">
        {props.sectionTitle && <SectionTitle title={props.sectionTitle} />}
        <div className="spotlightBottomWrapper">
          <div className="spotlightLeftWrapper">
            {props.index && props.total && (
              <IndexTotal index={props.index} total={props.total} />
            )}
            <LinkTo {...props}>
              <div className="imageCircleMask noselect">
                <img
                  loading="lazy"
                  className="characterImage"
                  src={character.image.url.replace("big", "small")}
                  style={{ objectPosition: backgroundPosition }}
                  alt={character.name}
                />
                <div className="magnifierWrapper">
                  <img
                    loading="lazy"
                    className="imageCircleIcons"
                    src="/images/icons/magnifier.svg"
                    alt="Look closer"
                  />
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
                <p className="spotlightBold">Profession</p>
                <p>{jobTitle}</p>
                {character.job2 && <p>{jobTitle2}</p>}
              </div>
              <div className="spotlightDetailsSection spotlightHobbiesSection">
                <p className="spotlightBold">Hobbies</p>
                <ul>{listOfHobbies}</ul>
              </div>
              <div className={`spotlightDetailsSection ${detailsClass}`}>
                {listOfDescriptions}
                <div className="discordEmojiWrapper">{listOfEmojis}</div>
              </div>
              <div className={`showDetailsButton is-hidden-desktop`}>
                <p
                  onClick={() => {
                    setShowDetails(!showDetails);
                  }}
                >
                  {showDetailsButtonText}
                </p>
              </div>
            </div>
            {props.allCharsButton && <AllCharactersButton />}
          </div>
        </div>
      </GsapFadeScrub>
    </div>
  );
};

CharacterSpotlight.propTypes = {
  name: PropTypes.string,
  invert: PropTypes.bool,
  sectionTitle: PropTypes.string,
  index: PropTypes.number,
  total: PropTypes.number,
  allCharsButton: PropTypes.bool,
  children: PropTypes.node,
};

//#what out of total (for character page)
const IndexTotal = ({ index, total }) => {
  return (
    <div className="indexTotalWrapper">
      <span className="indexWrapper">{index}</span> / {total}
    </div>
  );
};

IndexTotal.propTypes = {
  index: PropTypes.number,
  total: PropTypes.number,
};

//title for homepage
const SectionTitle = ({ title }) => {
  return (
    <div className="spotlightTopWrapper">
      <div className="starWrapperLeft">
        <ShootingStar isActive={true} orientation="left" whiteMode />
      </div>
      <h1>{title}</h1>
      <div className="starWrapperRight">
        <ShootingStar isActive={true} orientation="right" whiteMode mirror />
      </div>
    </div>
  );
};

SectionTitle.propTypes = {
  title: PropTypes.string,
};

const AllCharactersButton = () => (
  <div className="allCharsButtonWrapper">
    <DefaultButton
      icon="people_white"
      borderedWhite
      shadowless
      navlink="/characters"
      text="View all characters"
    />
  </div>
);
