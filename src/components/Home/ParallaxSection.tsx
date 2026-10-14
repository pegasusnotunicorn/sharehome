import { useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger.js";
import gsap from "gsap";
import Card from "../Card/Card";
import getHomePageCardProps from "./utils/getHomePageCardProps";
import { getAllFinishedPeople } from "../Characters/Characters";
import useWindowDimensions from "../utils/useWindowDimensions";
import styles from "../../css/pages/home/cardparallax.module.css";
import { useLocation, useNavigate } from "react-router";
import { characterArtFace } from "../Characters/characterCardFaces";
import { getAllCharacters } from "../Characters/Characters";
import { characterArtSmall } from "../utils/characterArt";
import type { WallApi } from "../utils/parallaxWall3d";
import landingPageStyles from "../../css/landingPage.module.css";

interface ParallaxCardsProps {
  sectionRef: React.RefObject<HTMLDivElement | null>;
  evenRow: boolean;
  cardsPerRow: number;
  randomCharacters: any[];
}

interface ParallaxSectionProps {
  // hold the cards (and their art) back until this is true, so the hero above loads first; scrolling
  // brings them in anyway
  hold?: boolean;
}

// how far the words the wall parts to show ("A party game where…") reach from the screen's middle
const wordsHalfWidth = (el: HTMLElement | null) => {
  if (!el) return 0;
  // the text itself (the boxes it's in span the page)
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), range = document.createRange();
  let half = 0;
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    if (!n.textContent?.trim()) continue;
    range.selectNodeContents(n);
    for (const r of range.getClientRects()) half = Math.max(half, innerWidth / 2 - r.left, r.right - innerWidth / 2);
  }
  return half;
};

// the longest the cards wait for the hero
const HOLD_MAX_MS = 15000;

//the entire section of three rows moving with scroll
const ParallaxSection = ({ hold = false }: ParallaxSectionProps) => {
  const location = useLocation();
  gsap.registerPlugin(ScrollTrigger);

  // Set global defaults for ScrollTrigger
  ScrollTrigger.defaults({
    // @ts-ignore smoothTouch is a valid ScrollTrigger config option
    smoothTouch: true,
  });

  ScrollTrigger.scrollerProxy(window, {
    scrollTop(value?: number) {
      return arguments.length
        ? window.scrollTo({ top: value, behavior: "smooth" })
        : window.pageYOffset;
    },
  });

  useEffect(() => {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden"; // Prevent scrolling
    document.body.style.paddingRight = `${scrollbarWidth}px`; // Keep space for scrollbar

    setTimeout(() => {
      document.body.style.overflow = ""; // Restore scrolling
      document.body.style.paddingRight = ""; // Remove scrollbar space simulation
    }, 500);
  }, []);

  const sectionRef = useRef<HTMLDivElement>(null);
  // the cards as a 3D wall (parallaxWall3d.ts), following the scroll; the flat cards below if it can't
  const navigate = useNavigate();
  const stageRef = useRef<HTMLDivElement>(null);
  const wall = useRef<WallApi | null>(null);
  const scrolled = useRef(0);
  const [flat, setFlat] = useState(false);


  const [held, setHeld] = useState(hold);
  useEffect(() => {
    if (!hold) setHeld(false);
  }, [hold]);
  useEffect(() => {
    if (!held) return;
    const go = () => setHeld(false);
    const t = setTimeout(go, HOLD_MAX_MS);
    window.addEventListener("scroll", go, { once: true, passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", go);
    };
  }, [held]);

  // the flat cards: pinned to the screen while they part, fading. (The 3D wall stays on screen by
  // itself, sticky, and does its own fading.)
  useLayoutEffect(() => {
    if (!sectionRef.current || !flat) return;
    const sectionRefElement = sectionRef.current;

    ScrollTrigger.create({
      trigger: sectionRefElement,
      pin: true,
      scrub: 3,
      start: "center center",
      end: "bottom bottom",
      anticipatePin: 1,
      animation: gsap.fromTo(
        sectionRefElement,
        { opacity: 1, ease: "power1.out" },
        { opacity: 0.3, ease: "power1.out" }
      ),
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [flat]);

  //calculate how many rows / characters per row
  const numRows = 3;
  const characters = useMemo(() => getAllFinishedPeople(true), []);

  const { width } = useWindowDimensions();
  const cardsPerRow = width >= 1400 ? 5 : width >= 900 ? 5 : 3;
  const totalCards = numRows * cardsPerRow;
  let randomCharacters = characters.slice(0, totalCards);

  //not enough characters, fill in the blanks
  if (characters.length < totalCards) {
    const missingAmount = totalCards - characters.length;
    const fillerCharacters = characters.slice(0, missingAmount);
    randomCharacters = randomCharacters.concat(fillerCharacters);
  }

  //split array into numRows rows
  const splitRowCharacters: any[][] = [];
  for (let x = 0; x < numRows; x++) {
    splitRowCharacters.push(
      randomCharacters.slice(x * cardsPerRow, x * cardsPerRow + cardsPerRow)
    );
  }

  //build the rows
  const parallaxRows = splitRowCharacters.map((curr, index) => {
    const evenRow = index % 2 !== 0;
    return (
      <div key={`parallaxRow${index}`} className={styles.parallaxRow}>
        <ParallaxCards
          sectionRef={sectionRef}
          evenRow={evenRow}
          cardsPerRow={cardsPerRow}
          randomCharacters={curr}
        />
      </div>
    );
  });

  const wallCards = useMemo(() => {
    const all = getAllCharacters();
    return randomCharacters.map((c) => ({
      front: () => characterArtFace(c, characterArtSmall(c.image.url), cardsPerRow > 3 ? 640 : 512),
      atlasIndex: all.findIndex((a) => a.urlName === c.urlName),
      urlName: c.urlName,
    }));
    // a new set only when the wall changes shape
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardsPerRow, characters]);

  useEffect(() => {
    const stage = stageRef.current;
    if (held || flat || !stage) return;
    let gone = false;
    const fail = () => !gone && setFlat(true);
    import("../utils/parallaxWall3d")
      .then(({ mountWall }) =>
        mountWall(stage, {
          cards: wallCards,
          cols: cardsPerRow,
          cardWidth: (w) => Number.parseInt(getHomePageCardProps("member", w).mainStyle.width),
          wordsHalfWidth: () => wordsHalfWidth(document.getElementById(landingPageStyles.descriptionContainer)),
          onPick: (c) => navigate(`/characters/${c.urlName}`),
          onFail: fail,
        })
      )
      .then((a) => {
        if (gone) return a?.destroy();
        wall.current = a;
        a?.progress(scrolled.current);
      })
      .catch(fail);
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        scrolled.current = self.progress;
        wall.current?.progress(self.progress);
      },
    });
    scrolled.current = st.progress;
    return () => {
      gone = true;
      st.kill();
      wall.current?.destroy();
      wall.current = null;
    };
  }, [held, flat, wallCards, cardsPerRow, navigate]);

  return (
    <div
      key={location.pathname}
      ref={sectionRef}
      className={`${styles.parallaxSection} ${flat ? "" : styles.wallSection}`}
    >
      {!held && (flat ? parallaxRows : <div ref={stageRef} className={styles.wallStage} />)}
    </div>
  );
};

//all cards in a row
const ParallaxCards = ({
  sectionRef,
  evenRow,
  cardsPerRow,
  randomCharacters,
}: ParallaxCardsProps) => {
  const cardRefs = useMemo(
    () => new Array<HTMLDivElement | null>(randomCharacters.length),
    [randomCharacters.length]
  );

  const middleCard = Math.floor(cardsPerRow / 2);
  const { width } = useWindowDimensions();

  const translateEnd = "25%"; //move horizontally (direction depends on evenRow)

  useEffect(() => {
    if (!sectionRef.current || randomCharacters.length === 0) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 2,
        fastScrollEnd: true, //prevents the animation from jumping to the end when scrolling quickly
      },
    });

    randomCharacters.forEach((curr: any, index: number) => {
      const card = cardRefs[index];
      if (!card) return;

      const firstAnimationFrom = {
        x: 0,
        ease: "power1.out",
      };

      const firstAnimationTo = {
        x: evenRow ? translateEnd : `-${translateEnd}`,
        ease: "power1.out",
      };

      //left of middle card go left, others go right
      let offscreenEnd = evenRow
        ? index < middleCard
          ? -50
          : 150 //even row
        : index <= middleCard
        ? -125
        : 25; //odd row, left : right

      const secondAnimationFrom = {
        x: evenRow ? translateEnd : `-${translateEnd}`,
        ease: "power1.out",
      };
      const secondAnimationTo = {
        x: `${offscreenEnd}%`,
        ease: "power1.out",
      };

      tl.fromTo(card, firstAnimationFrom, firstAnimationTo, "0").fromTo(
        card,
        secondAnimationFrom,
        secondAnimationTo,
        "50%"
      ); // Ensures second animation starts at timeline midpoint
    });

    //cleanup
    return () => {
      tl.kill();
    };
  }, [
    cardRefs,
    sectionRef,
    middleCard,
    randomCharacters,
    evenRow,
    translateEnd,
  ]);

  //create cards for each character
  return randomCharacters.map((curr: any, index: number) => {
    const cardProps = getHomePageCardProps(curr.type, width);
    cardProps.personName = curr.name;
    cardProps.disableFlip = true;
    cardProps.hideBack = true;

    return (
      <div
        key={`parallaxWrapperKey${index}`}
        ref={(el) => { cardRefs[index] = el; }}
        className={styles.parallaxWrapper}
      >
        <Card {...cardProps} />
      </div>
    );
  });
};

export default ParallaxSection;
