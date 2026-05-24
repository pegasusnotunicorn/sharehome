import { useEffect, useRef, useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
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

interface CharacterGridCardProps {
  name: string;
  details: string[];
  imageSrc: string;
  imageAlt: string;
  imageObjectPosition?: string;
  overlayText?: string;
  sketchCount?: number;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
}

const expansionPlaceholderImage = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 1200" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2f314f"/>
        <stop offset="100%" stop-color="#4b2a33"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="45%" r="60%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.08)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
      </radialGradient>
    </defs>
    <rect width="2000" height="1200" fill="url(#bg)"/>
    <rect width="2000" height="1200" fill="url(#glow)"/>
  </svg>
`)}`;

interface ExpansionCharacter {
  id: number;
  name: string;
  race: string;
  job: string;
  sketches?: string[];
}

const expansionPlaceholders: ExpansionCharacter[] = [
  { id: 1, name: "Petra Anguis", race: "Gorgon", job: "Sculptor", sketches: ["/images/members/expansion-petra-1.webp"] },
  { id: 2, name: "Trinity Melange", race: "Chimera", job: "Bartender", sketches: ["/images/members/expansion-trinity-1.webp", "/images/members/expansion-trinity-2.webp"] },
  { id: 3, name: "Asty Monolithos", race: "Minotaur", job: "Architect", sketches: ["/images/members/expansion-asty-1.webp"] },
  { id: 4, name: "Sierra Colt", race: "Centaur", job: "Personal Trainer", sketches: ["/images/members/expansion-sierra-1.webp"] },
  { id: 5, name: "Bellerophon \"Belly\" Skybound", race: "Pegasus", job: "Entertainer / Performer", sketches: ["/images/members/expansion-belly-1.webp"] },
  { id: 6, name: "Vex \"PAN-IQ!\" Hoofprint", race: "Satyr", job: "Rock Star" },
  { id: 7, name: "Aquila Leonis", race: "Griffin", job: "Investigative Journalist" },
  { id: 8, name: "Vespera Skryre", race: "Harpy", job: "Paparazzo" },
  { id: 9, name: "Xylia Aenigmata", race: "Sphinx", job: "Curator" },
  { id: 10, name: "Phido", race: "Cerberus", job: "Body Guard" },
];

const CharacterGridCard = ({
  name,
  details,
  imageSrc,
  imageAlt,
  imageObjectPosition,
  overlayText,
  sketchCount,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className,
}: CharacterGridCardProps) => {
  return (
    <div
      className={`${charStyles.characterWrapper} ${className || ""}`.trim()}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className={charStyles.characterInnerWrapper}
        onClick={onClick}
      >
        <img
          loading="lazy"
          className="boxes"
          src={imageSrc}
          style={{ objectPosition: imageObjectPosition || "center" }}
          alt={imageAlt}
        />
        {overlayText && (
          <div className={charStyles.cardOverlayText}>{overlayText}</div>
        )}
        {sketchCount && sketchCount > 1 && (
          <div
            className={charStyles.sketchCountBadge}
            aria-label={`${sketchCount} sketches available`}
            title={`${sketchCount} sketches`}
          >
            <img src="/images/icons/stack.svg" alt="" />
            <span>{sketchCount}</span>
          </div>
        )}
        <div className={`${charStyles.caption} noselect`}>
          <p className={charStyles.name}>{name}</p>
          <p className={`${charStyles.details} is-hidden-mobile`}>
            {details.map((detail) => (
              <span key={`${name}-${detail}`}>{detail}</span>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
};

//render all characters or a specific one depending on URL
const CharactersPage = () => {
  const navigate = useNavigate();

  let { name } = useParams();

  useEffect(() => {
    document.title = "Characters";
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
        {!chosenCharacter && <ExpansionCharactersSection />}
        <EmojiSection />
        <CarouselSection
          className={charStyles.carousel}
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
  const charactersContainerRef = useRef<HTMLDivElement | null>(null);

  const redirectToSpecificCharacter = (character: { urlName: string; ignoreInRandom: boolean }) => {
    if (chosenCharacter !== character && !character.ignoreInRandom) {
      navigate(`/characters/${character.urlName}`);
    }
  };

  const clearSpotlight = useCallback(() => {
    const active = charactersContainerRef.current?.querySelector(
      `.${charStyles.characterWrapper}.${charStyles.spotlit}`
    );
    if (active) active.classList.remove(charStyles.spotlit);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (pausedRef.current) return;
      clearSpotlight();
      const all = charactersContainerRef.current?.querySelectorAll(
        `.${charStyles.characterWrapper}:not(.${charStyles.notDone})`
      );
      if (!all) return;
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
  const existingCharacters = allCharacters.map((elem, index) => {
    const name = elem.name;
    const race = elem.race;
    let job = elem.job;
    if (elem.job2) {
      job = `${elem.job} / ${elem.job2}`;
    }

    let ignoreInRandom = elem.ignoreInRandom ? charStyles.notDone : "";
    return (
      <CharacterGridCard
        key={index}
        className={ignoreInRandom}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={() => {
          redirectToSpecificCharacter(elem);
        }}
        name={name}
        details={[String(elem.age), race, job]}
        imageSrc={elem.image.url.replace("big", "small")}
        imageObjectPosition={elem.image.objectPosition}
        imageAlt={elem.name}
      />
    );
  });

  return (
    <section id="original-cast" className={charStyles.allcharactersWrapper}>
      <div className={charStyles.sectionIntro}>
        <p className={charStyles.sectionEyebrow}>THE ORIGINAL CAST</p>
      </div>
      <div ref={charactersContainerRef} className={charStyles.charactersContainer}>
        {existingCharacters}
      </div>
    </section>
  );
};

const ExpansionCharactersSection = () => {
  const [activeCharacterId, setActiveCharacterId] = useState<number | null>(null);

  const activeCharacter = activeCharacterId
    ? expansionPlaceholders.find((c) => c.id === activeCharacterId) ?? null
    : null;
  const activeSketches = activeCharacter?.sketches ?? [];

  const closeViewer = useCallback(() => setActiveCharacterId(null), []);

  useEffect(() => {
    if (!activeCharacter) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeViewer();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeCharacter, closeViewer]);

  const openViewer = (character: ExpansionCharacter) => {
    if (!character.sketches || character.sketches.length === 0) return;
    setActiveCharacterId(character.id);
  };

  const upcomingCharacters = expansionPlaceholders.map((character) => {
    const sketches = character.sketches ?? [];
    const hasSketches = sketches.length > 0;
    const latestSketch = hasSketches ? sketches[sketches.length - 1] : undefined;
    const cardClass = hasSketches ? "" : charStyles.staticCard;
    return (
      <CharacterGridCard
        key={character.id}
        className={cardClass}
        name={character.name}
        details={[character.race, character.job]}
        imageSrc={latestSketch || expansionPlaceholderImage}
        imageAlt={hasSketches ? `${character.name} sketch` : `${character.name} placeholder art`}
        overlayText={hasSketches ? undefined : "?"}
        onClick={hasSketches ? () => openViewer(character) : undefined}
        sketchCount={sketches.length}
      />
    );
  });

  return (
    <section id="second-season-cast" className={charStyles.allcharactersWrapper}>
      <div className={charStyles.sectionIntro}>
        <p className={charStyles.sectionEyebrow}>THE SECOND SEASON CAST</p>
      </div>
      <div className={`${charStyles.charactersContainer} ${charStyles.compactCharactersContainer}`}>
        {upcomingCharacters}
      </div>

      {activeCharacter && activeSketches.length > 0 && (
        <div
          className={charStyles.sketchViewer}
          onClick={closeViewer}
          role="presentation"
        >
          <div
            className={charStyles.sketchViewerCard}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`${activeCharacter.name} sketches`}
          >
            <button
              type="button"
              className={charStyles.sketchViewerClose}
              onClick={closeViewer}
              aria-label="Close sketch viewer"
            >
              <img src="/images/icons/cross.svg" alt="" />
            </button>
            <Swiper
              modules={[Navigation, Pagination, A11y, Keyboard]}
              navigation={activeSketches.length > 1}
              pagination={activeSketches.length > 1 ? { clickable: true } : false}
              keyboard={{ enabled: true }}
              spaceBetween={0}
              slidesPerView={1}
              className={charStyles.sketchViewerSwiper}
            >
              {activeSketches.map((src, i) => (
                <SwiperSlide key={src}>
                  <div className={charStyles.sketchViewerSlide}>
                    <img
                      src={src}
                      alt={`${activeCharacter.name} sketch ${i + 1} of ${activeSketches.length}`}
                      className={charStyles.sketchViewerImage}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <div className={charStyles.sketchViewerMeta}>
              <p className={charStyles.sketchViewerName}>{activeCharacter.name}</p>
              <p className={charStyles.sketchViewerCount}>
                {activeCharacter.race} — {activeCharacter.job}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CharactersPage;
