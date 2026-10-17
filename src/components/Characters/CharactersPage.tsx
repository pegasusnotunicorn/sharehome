import { Suspense, lazy, useEffect, useRef, useCallback, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import {
  getAllCharacters,
  getCharacterShareMeta,
  getSpecificPersonByURL,
} from "../Characters/Characters";
import CharacterProfile from "./CharacterProfile";
import { EmojiSection } from "../utils/EmojiSection";
import { HeadTags } from "../utils/useHeadTags";
import { CHARACTER_NOT_FOUND_META } from "../../pageMeta";
import { sized, srcSet } from "../utils/imageCopies";
import charStyles from "../../css/pages/characterPage.module.css";
import type { CharacterWithNav } from "../../types/character";
import { ILLUSTRATOR_URL } from "../../utils/links";

// (the carousel library comes down only when someone opens a character's sketches)
const ImageCarouselModal = lazy(() => import("../utils/ImageCarouselModal"));

// a character's printed card front, by their place in the cast
const cardFront = (i: number) => `/images/pieces/characters/${String(i + 1).padStart(2, "0")}.webp`;
// how wide a card on the walls is shown (two, three or five across)
const WALL_SIZES = "(max-width: 640px) 46vw, (max-width: 1100px) 30vw, 240px";

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
  { id: 5, name: "Bellerophon “Belly” Skybound", race: "Pegasus", job: "Entertainer / Performer", sketches: ["/images/members/expansion-belly-1.webp"] },
  { id: 7, name: "Aquila Leonis", race: "Griffin", job: "Investigative Journalist", sketches: ["/images/members/expansion-aquila-1.webp"] },
  { id: 6, name: "Vex “PAN-IQ!” Hoofprint", race: "Satyr", job: "Rock Star" },
  { id: 8, name: "Vespera Skryre", race: "Harpy", job: "Paparazzo" },
  { id: 9, name: "Xylia Aenigmata", race: "Sphinx", job: "Curator" },
  { id: 10, name: "Phido", race: "Cerberus", job: "Body Guard" },
];

// a character's page (found whatever the case of its address), or the whole cast: also for an
// address that isn't a character's, saying so
const CharactersPage = () => {
  const { name } = useParams();
  const chosenCharacter = name ? getSpecificPersonByURL(name) : false;

  // (the character's own address, in the case it's written)
  if (chosenCharacter && name !== chosenCharacter.urlName)
    return <Navigate to={`/characters/${chosenCharacter.urlName}`} replace />;

  return (
    <div className="content flushBottom">
      {chosenCharacter ? (
        <>
          {/* (a character's own title and share tags; the cast's are the site's, from src/pageMeta.ts) */}
          <HeadTags meta={getCharacterShareMeta(chosenCharacter)} path={`/characters/${chosenCharacter.urlName}`} />
          {/* (not in a fade-in: that starts over on every page, and from one character to the
              next the page stays, the cards swinging round) */}
          <IndividualCharacter character={chosenCharacter} />
        </>
      ) : (
        <>
          {name && <HeadTags meta={CHARACTER_NOT_FOUND_META} />}
          <CastIntro missing={!!name} />
          <CastWall />
          <ExpansionCharactersSection />
        </>
      )}
      <EmojiSection />
    </div>
  );
};

const IndividualCharacter = ({ character }: IndividualCharacterProps) => (
  <div className={charStyles.characterProfileContainer}>
    <CharacterProfile character={character} />
  </div>
);

// The cast page's opening (missing: the address was a character's that isn't one)
const CastIntro = ({ missing }: { missing: boolean }) => {
  return (
    <header className={`${charStyles.castIntro} ${charStyles.castHero}`}>
      <p className={charStyles.castEyebrow}>Season one · 25 contestants</p>
      <h1 className={charStyles.castTitle}>Meet the cast</h1>
      <p className={charStyles.castLede} role={missing ? "status" : undefined}>
        {missing ? "Character not found! Here’s the whole cast instead ✨" : "Say hello to the cast of the reality show ✨"}
      </p>
      <div className={charStyles.castActions}>
        <a
          target="_blank"
          rel="noreferrer"
          href={ILLUSTRATOR_URL}
          className={`${charStyles.illustrationLink} tap-area`}
        >
          Illustrations by Carolyn Frank
        </a>
      </div>
    </header>
  );
};

// The original cast as a wall of cards (no captions: the cards carry their names): each one's a link to
// its character's page, showing the printed card, which turns 3D (castWall3d.ts) once it's loaded. The flat card stays where 3D can't be drawn.
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
            // (as big as the 3D card's drawn: at most twice its size on the page)
            src: sized(cardFront(i), link!.clientWidth * Math.min(window.devicePixelRatio || 1, 2)),
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
      <ul className={`${charStyles.castWall} ${charStyles.castWallBare}`}>
        {characters.map((c, i) => (
          <li key={c.urlName} className={charStyles.castItem}>
            <Link
              ref={(el) => {
                tiles.current[i] = el;
              }}
              to={`/characters/${c.urlName}`}
              className={charStyles.castTile}
              // (as their card reads: "Köttr, The Grumpy Dragon", "Urg the Hacker, the Orc")
              aria-label={c.title ? `${c.name.split(",")[0]}, ${c.title}` : `${c.name}, the ${c.race}`}
            >
              <span className={`${charStyles.castStage} ${ready[i] ? charStyles.castLive : ""}`}>
                <img
                  className={charStyles.castFlat}
                  src={cardFront(i)}
                  srcSet={srcSet(cardFront(i))}
                  sizes={WALL_SIZES}
                  alt=""
                  loading={i < 10 ? "eager" : "lazy"}
                  decoding="async"
                  width={768}
                  height={444}
                />
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
          {expansionPlaceholders.length} new contestants are on their way in the expansion. Here’s a peek at the
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
                  srcSet={latest && srcSet(latest)}
                  sizes={WALL_SIZES}
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
        <Suspense fallback={null}>
          <ImageCarouselModal
            images={activeSketches.map((src, i) => ({ src, alt: `${activeCharacter.name} sketch ${i + 1} of ${activeSketches.length}` }))}
            ariaLabel={`${activeCharacter.name} sketches`}
            onClose={closeViewer}
            panelClassName={charStyles.sketchViewerCard}
            aspectRatio="16 / 10"
          >
            <p className={charStyles.sketchViewerName}>{activeCharacter.name}</p>
            <p className={charStyles.sketchViewerJob}>
              {activeCharacter.race} — {activeCharacter.job}
            </p>
          </ImageCarouselModal>
        </Suspense>
      )}
    </section>
  );
};

export default CharactersPage;
