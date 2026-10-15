import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {
  getAllCharacters,
  getCharacterShareMeta,
  getSpecificPersonByURL,
} from "../Characters/Characters";
import { CharacterSpotlight } from "../utils/CharacterSpotlight";
import { GsapFadeScrub } from "../utils/useGsap";
import { EmojiSection } from "../utils/EmojiSection";
import CustomHelmet from "../utils/CustomHelmet";
import DefaultButton from "../utils/DefaultButton";
import Modal from "../utils/Modal";
import charStyles from "../../css/pages/characterPage.module.css";
import "../../css/utils/spotlight.css";
import type { CharacterWithNav } from "../../types/character";

// a character's printed card front, by their place in the cast
const cardFront = (i: number) => `/images/pieces/characters/${String(i + 1).padStart(2, "0")}.webp`;

interface IndividualCharacterProps {
  character: CharacterWithNav;
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
  { id: 7, name: "Aquila Leonis", race: "Griffin", job: "Investigative Journalist", sketches: ["/images/members/expansion-aquila-1.webp"] },
  { id: 6, name: "Vex \"PAN-IQ!\" Hoofprint", race: "Satyr", job: "Rock Star" },
  { id: 8, name: "Vespera Skryre", race: "Harpy", job: "Paparazzo" },
  { id: 9, name: "Xylia Aenigmata", race: "Sphinx", job: "Curator" },
  { id: 10, name: "Phido", race: "Cerberus", job: "Body Guard" },
];

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
    //custom meta tags for this page
    let title = "All playable characters";
    let splashImage =
      "https://lovecareermagic.com/images/photoshoot/game/pictures8.webp";
    let description = "All playable characters from the game.";

    if (chosenCharacter) {
      const shareMeta = getCharacterShareMeta(chosenCharacter);
      title = shareMeta.title;
      splashImage = `https://lovecareermagic.com${shareMeta.image.url}`;
      description = shareMeta.description;
    }

    return (
      <div className="content flushBottom">
        <CustomHelmet
          title={title}
          splashImage={splashImage}
          description={description}
        />

        {chosenCharacter ? (
          <>
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
              <IndividualCharacter character={chosenCharacter} />
            </GsapFadeScrub>
          </>
        ) : (
          <>
            <CastIntro />
            <CastWall />
          </>
        )}
        {!chosenCharacter && <ExpansionCharactersSection />}
        <EmojiSection />
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
        mockup
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

// The cast page's opening
const CastIntro = () => {
  return (
    <header className={`${charStyles.castIntro} ${charStyles.castHero}`}>
      <p className={charStyles.castEyebrow}>Season one · 25 contestants</p>
      <h1 className={charStyles.castTitle}>Meet the cast</h1>
      <p className={charStyles.castLede}>Say hello to the cast of the reality show ✨</p>
      <div className={charStyles.castActions}>
        <a
          target="_blank"
          rel="noreferrer"
          href="https://www.instagram.com/carofranklyn/?hl=en"
          className={charStyles.illustrationLink}
        >
          Illustrations by Carolyn Frank
        </a>
      </div>
    </header>
  );
};

// The original cast as a wall of cards: each one's a link to its character's page, showing the printed
// card, which turns 3D (castWall3d.ts) once it's loaded. The flat card stays where 3D can't be drawn.
const CastWall = () => {
  const characters = useMemo(() => getAllCharacters(), []);
  const tiles = useRef<(HTMLAnchorElement | null)[]>([]);
  const [ready, setReady] = useState<boolean[]>([]);

  useEffect(() => {
    let gone = false;
    let api: { destroy: () => void } | null = null;
    const els = tiles.current.slice(0, characters.length);
    if (els.some((el) => !el)) return;
    import("../utils/castWall3d")
      .then(({ mountCastWall }) =>
        mountCastWall(
          els.map((link, i) => ({
            link: link!,
            stage: link!.querySelector<HTMLElement>(`.${charStyles.castStage}`)!,
            src: cardFront(i),
            onReady: () => !gone && setReady((r) => Object.assign([...r], { [i]: true })),
          })),
          () => {}
        )
      )
      .then((a) => {
        if (gone) a?.destroy();
        else api = a;
      })
      .catch(() => {});
    return () => {
      gone = true;
      api?.destroy();
    };
  }, [characters]);

  return (
    <section id="original-cast" className={charStyles.castSection} aria-label="The original cast">
      <ul className={charStyles.castWall}>
        {characters.map((c, i) => (
          <li key={c.urlName} className={charStyles.castItem}>
            <Link
              ref={(el) => {
                tiles.current[i] = el;
              }}
              to={`/characters/${c.urlName}`}
              className={charStyles.castTile}
              aria-label={`${c.name}, the ${c.race}`}
            >
              <span className={`${charStyles.castStage} ${ready[i] ? charStyles.castLive : ""}`}>
                <img
                  className={charStyles.castFlat}
                  src={cardFront(i)}
                  alt=""
                  loading={i < 10 ? "eager" : "lazy"}
                  decoding="async"
                  width={768}
                  height={444}
                />
              </span>
              <span className={`${charStyles.castCaption} noselect`}>
                <span className={charStyles.castName}>{c.name}</span>
                <span className={charStyles.castJob}>{[c.job, c.job2].filter(Boolean).join(" / ")}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
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

  return (
    <section id="second-season-cast" className={charStyles.seasonTwo} aria-labelledby="season-two-title">
      <header className={charStyles.castIntro}>
        <p className={charStyles.castEyebrow}>Coming in season two</p>
        <h2 id="season-two-title" className={charStyles.seasonTwoTitle}>
          The new arrivals
        </h2>
        <p className={charStyles.castLede}>
          {expansionPlaceholders.length} new contestants are on their way in the expansion. Here's a peek at the
          sketches so far.
        </p>
      </header>
      <ul className={`${charStyles.castWall} ${charStyles.seasonTwoWall}`}>
        {expansionPlaceholders.map((character) => {
          const sketches = character.sketches ?? [];
          const latest = sketches[sketches.length - 1];
          const inner = (
            <>
              <span className={`${charStyles.castStage} ${charStyles.sketchStage}`}>
                <img
                  className={charStyles.castFlat}
                  src={latest || expansionPlaceholderImage}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                {!latest && (
                  <span className={charStyles.sketchMystery} aria-hidden="true">
                    ?
                  </span>
                )}
                {sketches.length > 1 && (
                  <span className={charStyles.sketchCountBadge} title={`${sketches.length} sketches`}>
                    <img src="/images/icons/stack.svg" alt="" />
                    <span>{sketches.length}</span>
                  </span>
                )}
              </span>
              <span className={`${charStyles.castCaption} noselect`}>
                <span className={charStyles.castName}>{character.name}</span>
                <span className={charStyles.castJob}>
                  {character.race} · {character.job}
                </span>
              </span>
            </>
          );
          return (
            <li key={character.id} className={charStyles.castItem}>
              {latest ? (
                <button
                  type="button"
                  className={`${charStyles.castTile} ${charStyles.sketchTile}`}
                  onClick={() => openViewer(character)}
                  aria-label={`See ${sketches.length > 1 ? `${sketches.length} sketches` : "the sketch"} of ${character.name}, the ${character.race}`}
                >
                  {inner}
                </button>
              ) : (
                <div className={`${charStyles.castTile} ${charStyles.sketchPending}`}>{inner}</div>
              )}
            </li>
          );
        })}
      </ul>

      {activeCharacter && activeSketches.length > 0 && (
        <Modal
          onClose={closeViewer}
          panelClassName={charStyles.sketchViewerCard}
          ariaLabel={`${activeCharacter.name} sketches`}
        >
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
        </Modal>
      )}
    </section>
  );
};

export default CharactersPage;
