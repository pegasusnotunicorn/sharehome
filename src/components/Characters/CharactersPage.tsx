import { useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import {
  getAllCharacters,
  getSpecificPersonByURL,
} from "../Characters/Characters";
import { CharacterSpotlight } from "../utils/CharacterSpotlight";
import { GsapFadeScrub } from "../utils/useGsap";
import { EmojiSection } from "../utils/EmojiSection";
import CustomHelmet from "../utils/CustomHelmet";
import CarouselSection from "../utils/CarouselSection";
import DefaultButton from "../utils/DefaultButton";
import charStyles from "../../css/pages/characterPage.module.css";
import "../../css/utils/spotlight.css";
import type { CharacterWithNav } from "../../types/character";

interface IndividualCharacterProps {
  character: CharacterWithNav;
}

//render all characters or a specific one depending on URL
const CharactersPage = () => {
  const navigate = useNavigate();

  let { name } = useParams();

  useEffect(() => {
    document.title = "Love, Career & Magic — All Playable Characters!";
  }, []);

  //if there is a specifc character name, render that character page
  let chosenCharacter = name ? getSpecificPersonByURL(name) : false;

  //redirect to just /characters if typo a non-existant character
  if (
    window.location.pathname !== "/characters" &&
    (typeof name === "undefined" ||
      !chosenCharacter ||
      chosenCharacter.ignoreInRandom)
  ) {
    navigate("/characters");
    return null;
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
          <div className={`characterContent ${charStyles.pageIntro}`}>
            <h2 className={`subtitle ${charStyles.pageIntroTitle}`}>
              Characters
            </h2>
            <p className={charStyles.pageIntroLead}>
              Say hello to the cast of the reality show ✨
            </p>
            <a
              aria-label="Illustrations by Carolyn Frank"
              target="_blank"
              rel="noreferrer"
              href="https://www.instagram.com/carofranklyn/?hl=en"
              className={charStyles.illustrationLink}
            >
              <img
                loading="lazy"
                src="/images/icons/star.svg"
                alt=""
              />
              Illustrations by Carolyn Frank
            </a>
          </div>
        </div>
        <GsapFadeScrub fadeIn className="fadeInTextWrapper">
          {characterContent}
        </GsapFadeScrub>
        <EmojiSection />
        <CarouselSection
          random
          loop
          totalPictures={15}
          directory="/images/photoshoot/characters"
          filename="character"
        />
      </div>
    );
  }
};

const IndividualCharacter = ({ character }: IndividualCharacterProps) => {
  const prevButton = character.prevCharURL ? (
    <DefaultButton
      className={charStyles.characterNavButton}
      variant="secondary"
      border="dark"
      icon="prev"
      navlink={`/characters/${character.prevCharURL}`}
      text="Prev"
    />
  ) : (
    <div style={{ width: "100px" }}></div>
  );

  const nextButton = character.nextCharURL ? (
    <DefaultButton
      className={charStyles.characterNavButton}
      variant="secondary"
      border="dark"
      iconPosition="right"
      icon="next"
      navlink={`/characters/${character.nextCharURL}`}
      text="Next"
    />
  ) : (
    <div style={{ width: "100px" }}></div>
  );

  return (
    <div className={charStyles.characterSpotlightContainer}>
      <CharacterSpotlight
        name={character.name}
        index={character.index}
        total={character.total}
      />
      <div className={charStyles.characterButtonsWrapper}>
        {prevButton}
        <DefaultButton
          className={charStyles.characterNavButton}
          variant="secondary"
          border="dark"
          icon="list"
          navlink="/characters"
          text="Return to list"
        />
        {nextButton}
      </div>
    </div>
  );
};

//get all characters and their details
const AllCharacters = () => {
  const navigate = useNavigate();
  let { name } = useParams();
  let chosenCharacter = name ? getSpecificPersonByURL(name) : false;
  const pausedRef = useRef(false);

  const redirectToSpecificCharacter = (character: { urlName: string; ignoreInRandom: boolean }) => {
    if (chosenCharacter !== character && !character.ignoreInRandom) {
      navigate(`/characters/${character.urlName}`);
    }
  };

  const clearSpotlight = useCallback(() => {
    const active = document.querySelector(`.${charStyles.characterWrapper}.${charStyles.spotlit}`);
    if (active) active.classList.remove(charStyles.spotlit);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (pausedRef.current) return;
      clearSpotlight();
      const all = document.querySelectorAll(`.${charStyles.characterWrapper}:not(.${charStyles.notDone})`);
      if (all.length === 0) return;
      const randomIndex = Math.floor(Math.random() * all.length);
      all[randomIndex].classList.add(charStyles.spotlit);
    }, 2500);
    return () => clearInterval(interval);
  }, [clearSpotlight]);

  const onMouseEnter = useCallback(() => {
    pausedRef.current = true;
    clearSpotlight();
  }, [clearSpotlight]);

  const onMouseLeave = useCallback(() => {
    pausedRef.current = false;
  }, []);

  const allCharacters = getAllCharacters();
  const expansionCharacters = allCharacters.map((elem, index) => {
    const name = elem.name;
    const race = elem.race;
    let job = elem.job;
    if (elem.job2) {
      job = `${elem.job} / ${elem.job2}`;
    }

    let ignoreInRandom = elem.ignoreInRandom ? charStyles.notDone : "";
    return (
      <div
        className={`${charStyles.characterWrapper} ${ignoreInRandom}`}
        key={index}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div
          className={charStyles.characterInnerWrapper}
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
          <div className={`${charStyles.caption} noselect`}>
            <p className={charStyles.name}>{name}</p>
            <p className={`${charStyles.details} is-hidden-mobile`}>
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
      <div className={charStyles.allcharactersWrapper}>
        <div className={charStyles.charactersContainer}>{expansionCharacters}</div>
      </div>
    </>
  );
};

export default CharactersPage;
