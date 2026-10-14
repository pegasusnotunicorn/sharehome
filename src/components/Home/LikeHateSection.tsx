import { useState, useLayoutEffect, useRef, useEffect } from "react";
import gsap from "gsap";
import { GsapFadeScrub, GsapWiggle } from "../utils/useGsap";
import { getRandomTrait } from "../Card/ExampleTraits";
import type { Trait, TraitTilesApi } from "../utils/traitTiles3d";
import styles from "../../css/pages/home/likehateSection.module.css";

interface LikeHateSectionProps {
  id?: string;
  className?: string;
  title: React.ReactNode;
  description: React.ReactNode;
}

interface CharacterCoord {
  name: string;
  coords: {
    wrapper: {
      left: string;
      top: string;
    };
  };
  showLeft: boolean;
}

interface CharacterArcProps {
  traits: Trait[];
  coords: CharacterCoord["coords"];
  showLeft: boolean;
}

// one good, one bad and one chaotic trait, in a random order
const randomTraits = (): Trait[] =>
  (["good", "bad", "chaotic"] as const)
    .map((type) => ({ text: getRandomTrait(type), type }))
    .sort(() => 0.5 - Math.random());

const LikeHateSection = (props: LikeHateSectionProps) => {
  const { title, description } = props;

  const characterCoords: CharacterCoord[] = [
    {
      name: "lydia",
      coords: {
        wrapper: {
          left: "30%",
          top: "50%",
        },
      },
      showLeft: false,
    },
    {
      name: "tsukasa",
      coords: {
        wrapper: {
          left: "15%",
          top: "30%",
        },
      },
      showLeft: false,
    },
    {
      name: "ahxi",
      coords: {
        wrapper: {
          left: "5%",
          top: "10%",
        },
      },
      showLeft: false,
    },
    {
      name: "beatrice",
      coords: {
        wrapper: {
          left: "25%",
          top: "50%",
        },
      },
      showLeft: true,
    },
    {
      name: "urg",
      coords: {
        wrapper: {
          left: "55%",
          top: "40%",
        },
      },
      showLeft: true,
    },
    {
      name: "kottr",
      coords: {
        wrapper: {
          left: "45%",
          top: "50%",
        },
      },
      showLeft: true,
    },
  ];

  const arrowsContainerRef = useRef<HTMLDivElement>(null);
  let [currentChar, setCurrentChar] = useState(0);
  let [traits, setTraits] = useState(randomTraits);

  //fade in and out character traits
  useLayoutEffect(() => {
    const delay = 1;
    const duration = 2;
    let tl = gsap
      .timeline({
        repeat: -1,
        onRepeat: () => {
          //cycle through the characters
          setCurrentChar((c) => {
            if (c + 1 >= characterCoords.length) return 0;
            else return c + 1;
          });
          setTraits(randomTraits());
        },
      })
      .fromTo(
        [arrowsContainerRef.current],
        {
          opacity: 1,
        },
        {
          opacity: 1,
          duration: duration,
        }
      )
      .fromTo(
        [arrowsContainerRef.current],
        {
          opacity: 1,
        },
        {
          opacity: 1,
          duration: duration,
        },
        `+=${delay}`
      );
    return () => {
      if (tl) tl.kill();
    };
  }, [characterCoords.length, setCurrentChar]);

  // the trait tags as 3D tiles that flip over to each new set (traitTiles3d.ts); the flat tags stay,
  // hidden, to lay them out, and show if the 3D can't
  const picture = () => arrowsContainerRef.current?.parentElement ?? null;
  const tiles = useRef<TraitTilesApi | null>(null);
  const shown = useRef({ traits, currentChar });
  shown.current = { traits, currentChar };
  const tagsIn = (stage: HTMLElement) =>
    Array.from(stage.querySelectorAll<HTMLElement>(`.${styles.characterArc}`));
  useEffect(() => {
    const stage = picture();
    if (!stage) return;
    let gone = false;
    const start = () =>
      import("../utils/traitTiles3d")
        .then(({ mountTraitTiles }) => mountTraitTiles(stage, () => {}))
        .then((a) => {
          if (gone) return a?.destroy();
          tiles.current = a;
          a?.show(shown.current.traits, tagsIn(stage));
        })
        .catch(() => {});
    const io = new IntersectionObserver(
      (e) => {
        if (!e.some((x) => x.isIntersecting)) return;
        io.disconnect();
        start();
      },
      { rootMargin: "100% 0px" }
    );
    io.observe(stage);
    return () => {
      gone = true;
      io.disconnect();
      tiles.current?.destroy();
      tiles.current = null;
    };
  }, []);
  useLayoutEffect(() => {
    const stage = picture();
    if (stage) tiles.current?.show(traits, tagsIn(stage));
  }, [traits, currentChar]);

  //text to display depending on like/hate
  return (
    <div id={props.id} className={props.className}>
      <div className={`${styles.likehateLeftContainer} ${styles.likehateContainers}`}>
        <GsapFadeScrub fadeIn className={styles.imageAndArrowContainer}>
          <img
            loading="lazy"
            className={`${styles.tableSplash} ${styles[characterCoords[currentChar].name]}`}
            src="/images/illustrations/splash.webp"
            alt="dinner table"
          />
          <div ref={arrowsContainerRef} className={styles.arrowsContainer}>
            <CharacterArc
              traits={traits}
              coords={characterCoords[currentChar].coords}
              showLeft={characterCoords[currentChar].showLeft}
            />
          </div>
        </GsapFadeScrub>
      </div>
      <div className={`${styles.likehateRightContainer} ${styles.likehateContainers}`}>
        <GsapFadeScrub fadeIn scrubStartCenter>
          <div className={styles.likehateTextContainer}>
            {title}
            {description}
          </div>
        </GsapFadeScrub>
      </div>
    </div>
  );
};

const CharacterArc = ({ traits: randomTraits, coords, showLeft }: CharacterArcProps) => {
  return (
    <div className={styles.characterArcContainer} style={coords.wrapper}>
      {showLeft && (
        <div className={`${styles.arrowWrapper} ${styles.flipped}`}>
          <GsapWiggle degree={2} className={styles.arrowWrapperSVG}>
            <img
              loading="lazy"
              className={styles.arrowTailSVG}
              src="/images/icons/arrowtail.svg"
              alt="part of the arrow"
            />
            <img
              loading="lazy"
              className={styles.arrowHeadSVG}
              src="/images/icons/arrowhead.svg"
              alt="part of the arrow"
            />
          </GsapWiggle>
        </div>
      )}
      <div className={styles.characterArcWrapper}>
        <div className={`${styles.characterArc} ${styles[`${randomTraits[0].type}Arc`]}`}>
          <div className={styles.characterArcText}>{randomTraits[0].text}</div>
        </div>
        <div className={`${styles.characterArc} ${styles[`${randomTraits[1].type}Arc`]}`}>
          <div className={styles.characterArcText}>{randomTraits[1].text}</div>
        </div>
        <div className={`${styles.characterArc} ${styles[`${randomTraits[2].type}Arc`]}`}>
          <div className={styles.characterArcText}>{randomTraits[2].text}</div>
        </div>
      </div>
      {!showLeft && (
        <div className={styles.arrowWrapper}>
          <GsapWiggle degree={2} className={styles.arrowWrapperSVG}>
            <img
              loading="lazy"
              className={styles.arrowTailSVG}
              src="/images/icons/arrowtail.svg"
              alt="part of the arrow"
              width="25"
            />
            <img
              loading="lazy"
              className={styles.arrowHeadSVG}
              src="/images/icons/arrowhead.svg"
              alt="part of the arrow"
              width="25"
            />
          </GsapWiggle>
        </div>
      )}
    </div>
  );
};

export default LikeHateSection;
