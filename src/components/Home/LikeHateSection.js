import React, { useState, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';

import { GsapFadeScrub, GsapWiggle } from "../utils/useGsap.js";

import '../../css/pages/home/likehateSection.css';

//the six characters in the image and their positioning details
const sixCharacters = [
  {
    name: "kottr",
    like: [
      {
        wrapper: {
          left: "17%",
          top: "14%",
          transform: "rotate(-23deg)",
        },
        tail: {
          transform: "scaleY(0.5)",
          width: "229px"
        },
        head: {
          transform: "translateX(-15%)",
        },
        bubble:{
          transform: "translateY(-10%) rotate(23deg)",
        }
      },
      {
        wrapper: {
          left: "21%",
          top: "45%",
          transform: "rotate(-5deg)",
        },
        tail: {
          transform: "scaleY(0.3)",
          width: "440px"
        },
        bubble:{
          transform: "translateY(-10%) rotate(5deg)",
        }
      },
    ],
    hate: [
      {
        wrapper: {
          left: "15%",
          top: "71%",
          transform: "rotate(-42deg)",
        },
        tail: {
          transform: "scaleY(-0.75)",
          width: "175px"
        },
        head:{
          transform: "scaleY(-0.75)",
        },
        bubble:{
          transform: "translateY(20%) rotate(42deg)",
        }
      },
    ],
  },
  {
    name: "urg",
    like: [
      {
        wrapper: {
          left: "44%",
          top: "45%",
          transform: "rotate(6deg)",
        },
        tail: {
          transform: "scaleY(0.35)",
          width: "340px"
        },
        head: {
          transform: "translateX(-7px)",
        },
        bubble:{
          transform: "translateY(-10%) rotate(-6deg)",
        }
      },
      {
        wrapper: {
          left: "28%",
          top: "72%",
          transform: "rotate(113deg)",
        },
        tail: {
          width: "115px"
        },
        bubble:{
          transform: "translateY(-10%) rotate(-113deg)",
        }
      },
    ],
    hate: [],
  },
  {
    name: "beatrice",
    like: [
      {
        wrapper: {
          left: "50%",
          top: "11%",
          transform: "rotate(12deg)",
        },
        bubble: {
          transform: "rotate(-12deg)",
        },
      },
      {
        wrapper: {
          left: "29%",
          top: "19%",
          transform: "rotate(138deg)",
        },
        bubble: {
          transform: "translateY(24%) rotate(-138deg)",
        },
        tail: {
          transform: "scaleY(-1)",
        },
        head: {
          transform: "scaleY(-1)",
        },
      },
    ],
    hate: [
      {
        wrapper: {
          left: "48%",
          top: "50%",
          transform: "rotate(27deg)",
        },
        tail: {
          transform: "scaleY(-0.35)",
          width: "355px"
        },
        head:{
          transform: "translateX(-21%) scaleY(-0.75)",
        },
        bubble:{
          transform: "translateY(30%) rotate(-27deg)",
        }
      }
    ],
  },
  {
    name: "ahxi",
    like: [
      {
        wrapper: {
          left: "67%",
          top: "29%",
          transform: "rotate(31deg)",
        },
        tail: {
          transform: "scaleY(0.75)",
          width: "175px"
        },
        head:{
          transform: "scaleY(1) translateX(-12%)",
        },
        bubble:{
          transform: "translateY(-8%) rotate(-31deg)",
        }
      }
    ],
    hate: [
      {
        wrapper: {
          left: "51%",
          top: "10%",
          transform: "rotate(-172deg)",
        },
        tail: {
          transform: "scaleY(-1)",
          width: "115px"
        },
        head:{
          transform: "scaleY(-1)",
        },
        bubble:{
          transform: "translateY(20%) rotate(172deg)",
        }
      },
      {
        wrapper: {
          left: "41%",
          top: "47%",
          transform: "rotate(-200deg)",
        },
        tail: {
          transform: "scaleY(-0.6)",
          width: "178px"
        },
        head:{
          transform: "scaleY(-1)",
        },
        bubble:{
          transform: "translateY(20%) rotate(200deg)",
        }
      },
      {
        wrapper: {
          left: "15%",
          top: "62%",
          transform: "rotate(-202deg)",
        },
        tail: {
          transform: "scaleY(0.2)",
          width: "500px"
        },
        head:{
          transform: "scaleY(1) translateX(-27%)",
        },
        bubble:{
          transform: "translateY(-5%) rotate(202deg)",
        }
      }
    ],
  },
  {
    name: "tsukasa",
    like: [
      {
        wrapper: {
          left: "73%",
          top: "67%",
          transform: "rotate(20deg)",
        },
        tail: {
          transform: "scaleY(-0.75)",
          width: "125px",
        },
        head:{
          transform: "scaleY(-1) translateX(-2px)",
        },
        bubble:{
          transform: "translate(-12%, 17%) rotate(-20deg)",
        }
      },
      {
        wrapper: {
          left: "48%",
          top: "46%",
          transform: "rotate(-148deg)",
        },
        tail: {
          transform: "scaleY(0.45)",
          width: "229px"
        },
        head:{
          transform: "scaleY(1) translateX(-3px)",
        },
        bubble:{
          transform: "translateY(-4%) rotate(148deg)",
        }
      },
      {
        wrapper: {
          left: "62%",
          top: "28%",
          transform: "rotate(-163deg)",
        },
        tail: {
          transform: "scaleY(-1.1)",
          width: "90px",
        },
        head:{
          transform: "scaleY(-1) translateX(-2px)",
        },
        bubble:{
          transform: "translate(-12%, 17%) rotate(163deg)",
        }
      },
    ],
    hate: [],
  },
  {
    name: "lydia",
    like: [],
    hate: [
      {
        wrapper: {
          left: "14%",
          top: "76%",
          transform: "rotate(-179deg)",
        },
        tail: {
          transform: "scaleY(0.15)",
          width: "675px"
        },
        head:{
          transform: "scaleY(1) translateX(-9px)",
        },
        bubble:{
          transform: "translateY(-3%) rotate(179deg)",
        }
      },
      {
        wrapper: {
          left: "37%",
          top: "68%",
          transform: "rotate(-168deg)",
        },
        tail: {
          transform: "scaleY(0.25)",
          width: "450px"
        },
        head:{
          transform: "scaleY(1) translateX(-9px)",
        },
        bubble:{
          transform: "translateY(-3%) rotate(168deg)",
        }
      },
      {
        wrapper: {
          left: "46%",
          top: "55%",
          transform: "rotate(-149deg)",
        },
        tail: {
          transform: "scaleY(0.3)",
          width: "375px"
        },
        head:{
          transform: "scaleY(1) translateX(-9px)",
        },
        bubble:{
          transform: "translateY(-3%) rotate(149deg)",
        }
      },
      {
        wrapper: {
          left: "68%",
          top: "32%",
          transform: "rotate(-149deg)",
        },
        tail: {
          transform: "scaleY(-0.5)",
          width: "200px"
        },
        head:{
          transform: "scaleY(-1) translateX(-4px)",
        },
        bubble:{
          transform: "translateY(20%) rotate(149deg)",
        }
      },
      {
        wrapper: {
          left: "72%",
          top: "64%",
          transform: "rotate(-141deg)",
        },
        tail: {
          transform: "scaleY(0.75)",
          width: "125px"
        },
        head:{
          transform: "scaleY(1) translateX(-3px)",
        },
        bubble:{
          transform: "translateY(-3%) rotate(141deg)",
        }
      },
    ],
  },
]

//example pairs to cycle through
const setPairs = [
  [0, 2],   //kottr & beatrice
  [1, 3],   //urg & ahxi
  [4, 5],   //tsukasa & lydia
]

const LikeHateSection = (props) => {
  const [indexAndLikeMode, setIndexAndLikeMode] = useState([0, true]);
  const currentPairIndex = indexAndLikeMode[0];
  const likeMode = indexAndLikeMode[1];
  const randomPeople = [
    sixCharacters[setPairs[currentPairIndex][0]],
    sixCharacters[setPairs[currentPairIndex][1]],
  ]

  //timeline stuff
  const arrowsContainerRef = useRef(null);
  const likeHateTextRef = useRef(null);
  const thumbsRef = useRef(null);
  useLayoutEffect(()=>{
    const delay = 5;
    const duration = 0.5;
    let tl = gsap.timeline({
      repeat: -1,
      // change from like -> hate every so often
      onRepeat: ()=>{
        setIndexAndLikeMode(c => {
          if (c[0] + 1 >= setPairs.length) return [0, !c[1]];
          else return [c[0]+1, !c[1]];
        });
      },
    }).fromTo([arrowsContainerRef.current, likeHateTextRef.current, thumbsRef.current], {
      opacity:0,
    },{
      opacity:1,
      duration:duration,
    }).fromTo([arrowsContainerRef.current, likeHateTextRef.current, thumbsRef.current], {
      opacity:1,
    },{
      opacity:0,
      duration:duration,
    }, `+=${delay}`);
    return () => {
      if (tl) tl.kill();
    }
  }, [setIndexAndLikeMode]);

  //create all arrows for two random depending on like / hate mode
  const likeOrHate = (likeMode) ? "like" : "hate";
  let likeHateArrowsArray = [];
  randomPeople.forEach((curr, index, array) => {
    likeHateArrowsArray = likeHateArrowsArray.concat(curr[likeOrHate]);
  });
  const likeHateArrows = likeHateArrowsArray.map((curr, index, array) => {
    return (
      <LikeHateArrow
        key={`arrow${index}`}
        likeMode={likeMode}
        coords={curr}
      />
    );
  });

  //text to display depending on like/hate
  const { t } = useTranslation();
  const likeModeText = (likeMode) ? t('main page.likehate.like') : t('main page.likehate.hate');
  const likeHateSVG = (likeMode) ? "thumbup" : "thumbdown";
  const likeModeClass = (likeMode) ? "likeMode" : "hateMode";
  return (
    <div id={props.id} className={props.className}>
      <div className="likehateLeftContainer likehateContainers">
        <GsapFadeScrub fadeIn className="imageAndArrowContainer">
          <img className="tableSplash" src="/images/splash.jpg" alt="dinner table" />
          <div ref={arrowsContainerRef} className="arrowsContainer">
            { likeHateArrows }
          </div>
        </GsapFadeScrub>
      </div>
      <div className="likehateRightContainer likehateContainers">
        <GsapFadeScrub fadeIn scrubStartCenter>
          <div className="likehateTextContainer">
            <h1>
              {`${t('main page.likehate.description1')} `}
              <span className={likeModeClass} ref={likeHateTextRef}>{ likeModeText }</span>
              {` ${t('main page.likehate.description2')}`}
            </h1>
            <div ref={thumbsRef}>
              <GsapWiggle className={`likeHateSVG ${likeHateSVG}`}>
                <img src={`/images/icons/${likeHateSVG}.svg`} alt="like or hate icon"/>
              </GsapWiggle>
            </div>
          </div>
        </GsapFadeScrub>
      </div>
    </div>
  )
};

//create a single arrow for a person
const LikeHateArrow = ({randomPerson, likeMode, coords}) => {

  //custom styles depending on coords
  let wrapperStyle = coords.wrapper || {};
  let headStyle = coords.head || {};
  let tailStyle = coords.tail || {};

  return (
    <div className="arrowWrapper" style={ wrapperStyle }>
      <GsapWiggle degree={2} className="arrowWrapperSVG">
        <img className="arrowTailSVG" src="/images/icons/arrowtail.svg" alt="part of the arrow" style={tailStyle} />
        <img className="arrowHeadSVG" src="/images/icons/arrowhead.svg" alt="part of the arrow" style={headStyle} />
      </GsapWiggle>
    </div>
  )
}

export default LikeHateSection;
