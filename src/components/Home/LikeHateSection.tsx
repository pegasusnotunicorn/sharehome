import { useState, useLayoutEffect, useRef, useEffect } from "react";
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
  const [currentChar, setCurrentChar] = useState(0);
  const [traits, setTraits] = useState(randomTraits);

  // a new character and traits every 5 seconds, only while the picture's on screen and isn't being
  // looked at closely (a mouse over it, or tabbed into); for a visitor who'd rather things didn't
  // move, the tiles swap without turning over (traitTiles3d.ts)
  const sectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let onScreen = false, held = false, timer = 0;
    const next = () => {
      setCurrentChar((c) => (c + 1) % characterCoords.length);
      setTraits(randomTraits());
    };
    const sync = () => {
      clearInterval(timer);
      timer = onScreen && !held ? window.setInterval(next, 5000) : 0;
    };
    const io = new IntersectionObserver((e) => {
      onScreen = e.some((x) => x.isIntersecting);
      sync();
    });
    io.observe(el);
    // (a finger on a phone isn't looking closely, and may never send the leave that lets go)
    const hold = (h: boolean) => (e: Event) => {
      if (e instanceof PointerEvent && e.pointerType !== "mouse") return;
      held = h;
      sync();
    };
    const on = hold(true), off = hold(false);
    el.addEventListener("pointerenter", on);
    el.addEventListener("pointerleave", off);
    el.addEventListener("focusin", on);
    el.addEventListener("focusout", off);
    return () => {
      clearInterval(timer);
      io.disconnect();
      el.removeEventListener("pointerenter", on);
      el.removeEventListener("pointerleave", off);
      el.removeEventListener("focusin", on);
      el.removeEventListener("focusout", off);
    };
  }, [characterCoords.length]);

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
    <div id={props.id} className={props.className} ref={sectionRef}>
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
              alt=""
            />
            <img
              loading="lazy"
              className={styles.arrowHeadSVG}
              src="/images/icons/arrowhead.svg"
              alt=""
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
              alt=""
              width="25"
            />
            <img
              loading="lazy"
              className={styles.arrowHeadSVG}
              src="/images/icons/arrowhead.svg"
              alt=""
              width="25"
            />
          </GsapWiggle>
        </div>
      )}
    </div>
  );
};

export default LikeHateSection;
