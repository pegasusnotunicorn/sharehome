import React, { useState, useRef, useLayoutEffect } from 'react';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from 'gsap';

import { randomNum } from '../utils/useMath.js';
import useWindowDimensions from '../utils/useWindowDimensions.js';

import '../../css/utils/shootingStar.css';

//function to get a random X Y
const getRandomXY = () => {
  return [
    randomNum(15,85),
    (Math.random() > 0.5) ? randomNum(100,110) : randomNum(-10,0),
  ]
}

//burst out a shootng star
export const ShootingStar = (props) => {
  gsap.registerPlugin(ScrollTrigger);
  const className = props.className || "";

  //rotate / mirror the whole thing
  let orientation;
  switch (props.orientation){
    case ("left"):
      orientation = "goingLeft";
      break;
    case ("up"):
      orientation = "goingUp";
      break;
    case ("right"):
      orientation = "goingRight";
      break;
    default:
    case ("down"):
      orientation = "goingDown";
      break;
  }
  const mirrorClass = (props.mirror) ? "mirror" : "";

  //references for the DOMs
  const randomXRef = useRef(null);
  const starContainerRef = useRef(null);
  const pathRef = useRef(null);

  //references for variables for animation
  const tl = useRef();
  const repeatXY = useRef(getRandomXY());
  const animationDuration = 2;
  const delay = useRef(props.delay || 0);
  const [isAnimationActive, setIsAnimationActive] = useState(false);

  //create tweens
  const createTweens = () => {
    tl.current
      .fromTo(starContainerRef.current, {
        scale:0.25,
        opacity:1,
        rotate:0,
      }, {
        scale:1,
        opacity:0,
        rotate:"-125deg",
        duration:animationDuration,
      }, 0)
      .fromTo(pathRef.current, {
        opacity:1,
        rotate:"15deg",
        x: 0,
        y: 0,
        scale:0.75,
      }, {
        opacity:0,
        rotate:"20deg",
        scale:1.05,
        x: "+=15",
        y: "-=15",
        duration:animationDuration / 3,
      }, 0)
      .pause(0);
  }
  const createRandomXYTweens = useRef(() => {
    tl.current
      .fromTo(randomXRef.current, {
        left:`${repeatXY.current[0]}%`,
        top:`${repeatXY.current[1]}%`,
      }, {
        left:`${repeatXY.current[0]}%`,
        top:`${repeatXY.current[1]}%`,
        duration:animationDuration,
      }, 0);
  });
  const repeatTl = () => {
    repeatXY.current = getRandomXY();     //new XY position
    tl.current.killTweensOf(randomXRef.current);    //set new XY position
    tl.current.repeatDelay = Math.random() * 2;   //set new repeat delay
    createRandomXYTweens.current();   //recreate the XY animation only
  }

  //create timeline and animations
  useLayoutEffect(() => {
    tl.current = gsap.timeline({
      delay: delay.current + 0.25,
      repeat:-1,
      repeatDelay:Math.random() * 2,
      onRepeat:repeatTl,
      onStart: () => setIsAnimationActive(true)
    });

    //create the shooting star animations
    createTweens();
    return () => {
      if (tl && tl.current) {
        tl.current.kill();
        tl.current = null;
      }
    }
  }, [setIsAnimationActive]);

  //recreate tweens on screen resize
  //pause when not active
  const { width } = useWindowDimensions();
  const isActive = props.isActive;
  useLayoutEffect(() => {
    if (tl.current){
      if (isActive){
        repeatTl();
        tl.current.play(0);
      }
      else {
        tl.current.pause(0);
      }
    }
  }, [isActive, width]);

  let isActiveClass = (isAnimationActive && isActive) ? "is-active" : "";
  let whiteStar = (props.whiteMode) ? "whiteStar.svg" : "star.svg";
  let whitePath = (props.whiteMode) ? "whitePath.svg" : "path.svg";
  return (
    <div ref={randomXRef} className={`shootingStar ${orientation} ${className} ${isActiveClass}`}>
      <div className={`shootingStar ${mirrorClass} ${isActiveClass}`}>
        <div ref={starContainerRef} className="shootingStarWrapper">
          <img className="shootingStarSVG" src={`/images/icons/${whiteStar}`} alt="shooting star" />
        </div>
        <img ref={pathRef} className="starPathSVG" src={`/images/icons/${whitePath}`} alt="shooting star path" />
      </div>
    </div>
  )
}

export default ShootingStar;
