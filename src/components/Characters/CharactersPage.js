import { useEffect } from "react";
import { Redirect, useParams, useHistory } from "react-router-dom";
import {
  getAllCharacters,
  getSpecificPersonByURL,
  getRandomPerson,
} from "../Characters/Characters.js";
import { CharacterSpotlight } from "../utils/CharacterSpotlight.js";
import { GsapFadeScrub } from "../utils/useGsap.js";
import { EmojiSection } from "../utils/EmojiSection.js";
import CustomHelmet from "../utils/CustomHelmet.js";
import CarouselSection from "../utils/CarouselSection.js";
import DefaultButton from "../utils/DefaultButton.js";
import "../../css/pages/characterPage.css";
import PropTypes from "prop-types";

//get a random elem from array
const randomFromArray = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

//render all characters or a specific one depending on URL
const CharactersPage = () => {
  let { name } = useParams();

  useEffect(() => {
    document.title = "Love, Career & Magic — All Playable Characters!";
  });

  //if there is a specifc character name, render that character page
  let chosenCharacter = getSpecificPersonByURL(name);

  let randomCharacter1Emoji = randomFromArray(getRandomPerson().emoji);
  let randomCharacter2Emoji = randomFromArray(getRandomPerson().emoji);

  //redirect to just /characters if typo a non-existant character
  if (
    window.location.pathname !== "/characters" &&
    (typeof name === "undefined" ||
      !chosenCharacter ||
      chosenCharacter.ignoreInRandom)
  ) {
    return <Redirect to="/characters" />;
  } else {
    let characterContent =
      chosenCharacter && !chosenCharacter.ignoreInRandom ? (
        <IndividualCharacter character={chosenCharacter} />
      ) : (
        <AllCharacters />
      );

    //custom meta tags for this page
    let title = "All playable characters";
    let splashImage =
      "https://lovecareermagic.com/images/photoshoot/game/pictures8.webp";
    let description = "All playable characters from the game.";

    if (chosenCharacter) {
      title = `Love, Career & Magic — ${chosenCharacter.name}`;
      splashImage = `https://lovecareermagic.com${chosenCharacter.image.url}`;

      description = "Introducing ";
      description += chosenCharacter.title
        ? chosenCharacter.title
        : `${chosenCharacter.name}, the ${chosenCharacter.race}`;
      description += `. A ${chosenCharacter.age} year old ${chosenCharacter.job}`;
      description += chosenCharacter.employer
        ? ` at ${chosenCharacter.employer}`
        : ``;
      description += ` and member of SHAREHOME—A reality TV show about 6 mythical strangers living together in the same house.`;
    }

    return (
      <div className="content">
        <CustomHelmet
          title={title}
          splashImage={splashImage}
          description={description}
        />

        <div className="subcontentWrapper margin-top min-width">
          <div className="characterContent">
            <h2 className="subtitle">Characters</h2>
            <p>
              The various mythical beings that have appeared on the reality TV
              show, SHAREHOME. Click on any of them to learn more about who they
              are!{" "}
              <a
                aria-label="Illustrations by Carolyn Frank"
                target="_blank"
                rel="noreferrer"
                href="https://www.instagram.com/carofranklyn/?hl=en"
              >
                Illustrations by Carolyn Frank.
              </a>
              <br />
            </p>
            <div className="freeEmojiButtonWrapper">
              <img
                loading="lazy"
                src={`/images/emojis/${randomCharacter1Emoji}.webp`}
                alt="Random emoji"
                title={randomCharacter1Emoji}
              />
              <a href="#emojis">Free character emojis</a>
              <img
                loading="lazy"
                src={`/images/emojis/${randomCharacter2Emoji}.webp`}
                alt="Random emoji"
                title={randomCharacter2Emoji}
              />
            </div>
          </div>
        </div>
        <GsapFadeScrub fadeIn className="fadeInTextWrapper">
          {characterContent}
        </GsapFadeScrub>
        <EmojiSection />
        <CarouselSection
          random
          totalPictures={15}
          directory="/images/photoshoot/characters"
          filename="character"
        />
      </div>
    );
  }
};

CharactersPage.propTypes = {
  name: PropTypes.string,
};

const IndividualCharacter = ({ character }) => {
  const prevButton = character.prevCharURL ? (
    <DefaultButton
      inverted
      borderedBlack
      shadowless
      icon="prev"
      navlink={`/characters/${character.prevCharURL}`}
      text="Prev"
    />
  ) : (
    <div style={{ width: "100px" }}></div>
  );

  const nextButton = character.nextCharURL ? (
    <DefaultButton
      inverted
      reversed
      shadowless
      borderedBlack
      icon="next"
      navlink={`/characters/${character.nextCharURL}`}
      text="Next"
    />
  ) : (
    <div style={{ width: "100px" }}></div>
  );

  return (
    <div className="characterSpotlightContainer">
      <CharacterSpotlight
        name={character.name}
        index={character.index}
        total={character.total}
      />
      <div className="characterButtonsWrapper">
        {prevButton}
        <DefaultButton
          inverted
          borderedBlack
          shadowless
          icon="list"
          navlink="/characters"
          text="Return to list"
        />
        {nextButton}
      </div>
    </div>
  );
};

IndividualCharacter.propTypes = {
  character: PropTypes.object,
};

//get all characters and their details
const AllCharacters = () => {
  let history = useHistory();
  let { name } = useParams();
  let chosenCharacter = getSpecificPersonByURL(name);

  const redirectToSpecificCharacter = (character) => {
    if (chosenCharacter !== character && !character.ignoreInRandom) {
      history.push(`/characters/${character.urlName}`);
    }
  };

  const allCharacters = getAllCharacters();
  const expansionCharacters = allCharacters.map((elem, index) => {
    const name = elem.name;
    const race = elem.race;
    let job = elem.job;
    if (elem.job2) {
      job = `${elem.job} / ${elem.job2}`;
    }

    let ignoreInRandom = elem.ignoreInRandom ? "notDone" : "";
    return (
      <div className={`characterWrapper ${ignoreInRandom}`} key={index}>
        <div
          className="characterInnerWrapper"
          onClick={() => {
            redirectToSpecificCharacter(elem);
          }}
        >
          <img
            loading="lazy"
            className="boxes"
            src={elem.image.url.replace("big", "small")}
            style={{ objectPosition: elem.image.objectPosition || "center" }}
            alt={elem.name}
          />
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
    );
  });

  return (
    <>
      <div className="allcharactersWrapper">
        <div className="charactersContainer">{expansionCharacters}</div>
      </div>
    </>
  );
};

export default CharactersPage;
