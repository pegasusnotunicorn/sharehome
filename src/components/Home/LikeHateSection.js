import React, { useState, useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";

import { GsapFadeScrub, GsapWiggle } from "../utils/useGsap.js";
import { getRandomTrait } from "../Card/ExampleTraits.js";

import "../../css/pages/home/likehateSection.css";

const LikeHateSection = (props) => {
  const characterCoords = [
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

  const arrowsContainerRef = useRef(null);
  let [currentChar, setCurrentChar] = useState(0);
  let [goodTrait, setGoodTrait] = useState(getRandomTrait("good"));
  let [badTrait, setBadTrait] = useState(getRandomTrait("bad"));
  let [chaoticTrait, setChaoticTrait] = useState(getRandomTrait("chaotic"));

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
          setGoodTrait(getRandomTrait("good"));
          setBadTrait(getRandomTrait("bad"));
          setChaoticTrait(getRandomTrait("chaotic"));
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

  //text to display depending on like/hate
  const { t } = useTranslation();
  return (
    <div id={props.id} className={props.className}>
      <div className="likehateLeftContainer likehateContainers">
        <GsapFadeScrub fadeIn className="imageAndArrowContainer">
          <img
            className={`tableSplash ${characterCoords[currentChar].name}`}
            src="/images/illustrations/splash.webp"
            alt="dinner table"
          />
          <div ref={arrowsContainerRef} className="arrowsContainer">
            <CharacterArc
              goodTrait={goodTrait}
              badTrait={badTrait}
              chaoticTrait={chaoticTrait}
              coords={characterCoords[currentChar].coords}
              showLeft={characterCoords[currentChar].showLeft}
            />
          </div>
        </GsapFadeScrub>
      </div>
      <div className="likehateRightContainer likehateContainers">
        <GsapFadeScrub fadeIn scrubStartCenter>
          <div className="likehateTextContainer">
            <h1>{`${t("main page.likehate.description1")} `}</h1>
            <p>{`${t("main page.likehate.description2")} `}</p>
          </div>
        </GsapFadeScrub>
      </div>
    </div>
  );
};

const CharacterArc = ({
  goodTrait,
  badTrait,
  chaoticTrait,
  coords,
  showLeft,
}) => {
  let randomTraits = [
    {
      text: goodTrait,
      type: "good",
    },
    {
      text: badTrait,
      type: "bad",
    },
    {
      text: chaoticTrait,
      type: "chaotic",
    },
  ].sort((a, b) => 0.5 - Math.random());

  return (
    <div className="characterArcContainer" style={coords.wrapper}>
      {showLeft && (
        <div className="arrowWrapper flipped">
          <GsapWiggle degree={2} className="arrowWrapperSVG">
            <img
              className="arrowTailSVG"
              src="/images/icons/arrowtail.svg"
              alt="part of the arrow"
            />
            <img
              className="arrowHeadSVG"
              src="/images/icons/arrowhead.svg"
              alt="part of the arrow"
            />
          </GsapWiggle>
        </div>
      )}
      <div className="characterArcWrapper">
        <div className={`characterArc ${randomTraits[0].type}Arc`}>
          <div className="characterArcText">{randomTraits[0].text}</div>
        </div>
        <div className={`characterArc ${randomTraits[1].type}Arc`}>
          <div className="characterArcText">{randomTraits[1].text}</div>
        </div>
        <div className={`characterArc ${randomTraits[2].type}Arc`}>
          <div className="characterArcText">{randomTraits[2].text}</div>
        </div>
      </div>
      {!showLeft && (
        <div className="arrowWrapper">
          <GsapWiggle degree={2} className="arrowWrapperSVG">
            <img
              className="arrowTailSVG"
              src="/images/icons/arrowtail.svg"
              alt="part of the arrow"
            />
            <img
              className="arrowHeadSVG"
              src="/images/icons/arrowhead.svg"
              alt="part of the arrow"
            />
          </GsapWiggle>
        </div>
      )}
    </div>
  );
};

export default LikeHateSection;
