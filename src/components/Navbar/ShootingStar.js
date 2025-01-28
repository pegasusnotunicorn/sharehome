import React, { useState, useRef, useLayoutEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";

import { randomNum } from "../utils/useMath.js";
import useWindowDimensions from "../utils/useWindowDimensions.js";

import "../../css/utils/shootingStar.css";

//function to get a random X Y
const getRandomXY = () => {
  return [
    randomNum(15, 85),
    Math.random() > 0.5 ? randomNum(100, 110) : randomNum(-10, 0),
  ];
};

//burst out a shootng star
export const ShootingStar = (props) => {
  gsap.registerPlugin(ScrollTrigger);
  const className = props.className || "";

  //rotate / mirror the whole thing
  let orientation;
  switch (props.orientation) {
    case "left":
      orientation = "goingLeft";
      break;
    case "up":
      orientation = "goingUp";
      break;
    case "right":
      orientation = "goingRight";
      break;
    default:
    case "down":
      orientation = "goingDown";
      break;
  }
  const mirrorClass = props.mirror ? "mirror" : "";

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
      .fromTo(
        starContainerRef.current,
        {
          scale: 0.25,
          opacity: 1,
          rotate: 0,
        },
        {
          scale: 1,
          rotate: "-125deg",
          duration: animationDuration,
          ease: "none", // No easing for scale and rotate
        },
        0
      )
      .to(
        starContainerRef.current,
        {
          opacity: 0,
          duration: animationDuration,
          ease: "expo.inOut", // Easing for opacity
        },
        0
      )
      .fromTo(
        pathRef.current,
        {
          opacity: 1,
          rotate: "15deg",
          x: 0,
          y: 0,
          scale: 0.75,
        },
        {
          rotate: "20deg",
          scale: 1.05,
          x: "+=30",
          y: "-=30",
          duration: animationDuration / 3,
          ease: "none", // No easing for rotate, scale, x, and y
        },
        0
      )
      .to(
        pathRef.current,
        {
          opacity: 0,
          duration: animationDuration / 3,
          ease: "expo.inOut", // Easing for opacity
        },
        0
      )
      .pause(0);
  };
  const createRandomXYTweens = useRef(() => {
    tl.current.fromTo(
      randomXRef.current,
      {
        left: `${repeatXY.current[0]}%`,
        top: `${repeatXY.current[1]}%`,
      },
      {
        left: `${repeatXY.current[0]}%`,
        top: `${repeatXY.current[1]}%`,
        duration: animationDuration,
      },
      0
    );
  });
  const repeatTl = () => {
    repeatXY.current = getRandomXY(); //new XY position
    tl.current.killTweensOf(randomXRef.current); //set new XY position
    tl.current.repeatDelay = Math.random() * 2; //set new repeat delay
    createRandomXYTweens.current(); //recreate the XY animation only
  };

  //create timeline and animations
  useLayoutEffect(() => {
    tl.current = gsap.timeline({
      delay: delay.current + 0.25,
      repeat: -1,
      repeatDelay: Math.random() * 2,
      onRepeat: repeatTl,
      onStart: () => setIsAnimationActive(true),
    });

    //create the shooting star animations
    createTweens();
    return () => {
      if (tl && tl.current) {
        tl.current.kill();
        tl.current = null;
      }
    };
  }, [setIsAnimationActive]);

  //recreate tweens on screen resize
  //pause when not active
  const { width } = useWindowDimensions();
  const isActive = props.isActive;
  useLayoutEffect(() => {
    if (tl.current) {
      if (isActive) {
        repeatTl();
        tl.current.play(0);
      } else {
        tl.current.pause(0);
      }
    }
  }, [isActive, width]);

  let isActiveClass = isAnimationActive && isActive ? "is-active" : "";

  // random color for the shooting star
  const randomColor = () => {
    const colors = ["#5F5AA2", "#7DAF9C", "#DD7373", "#F1DB4B"];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  const starColor = randomColor();

  return (
    <div
      ref={randomXRef}
      className={`shootingStar ${orientation} ${className} ${isActiveClass}`}
    >
      <div className={`shootingStar ${mirrorClass} ${isActiveClass}`}>
        <div ref={starContainerRef} className="shootingStarWrapper">
          <svg
            width="133"
            height="125"
            viewBox="0 0 133 125"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M60.1018 4.1707L43.021 38.3031L5.21949 43.5825C0.600182 44.2355 -1.30175 49.9108 2.03567 53.2001L29.2195 79.9942L22.5577 117.575C21.7391 122.198 26.5977 125.731 30.7195 123.575L64.6018 106.002C100.164 124.679 98.4128 124.612 100.947 124.612C102.109 124.612 103.264 124.252 104.242 123.553C104.272 123.531 104.291 123.499 104.321 123.477C104.912 123.514 105.325 123.781 106.509 122.673C109.265 120.095 112.523 113.302 112.004 109.565L108.395 83.5907C114.597 77.144 121.101 70.5843 127.761 65.0177C130.015 63.1339 131.957 59.1208 131.5 56.2186C132.802 50.5598 132.838 50.1589 132.5 47.9999C132.353 47.0656 132.5 47.9999 131 46.4999C128.5 44.2516 126.546 44.5287 124.683 44.2516L95.7333 39.8761C80.0752 10.4175 81.6639 9.46762 78.5568 7.23871C74.8223 4.56141 69.5924 2.09898 64.7687 0.870605C64.8132 0.943216 64.8505 1.01675 64.8946 1.08936C62.8596 1.18448 61.0182 2.33844 60.1018 4.1707ZM90.293 74.3178C88.9548 75.6045 88.3371 77.4722 88.6386 79.3104L93.5062 108.597C66.9929 94.7268 65.9214 92.6091 62.0357 94.6045L35.6754 108.281L40.8592 79.0383C41.1827 77.2075 40.5871 75.3325 39.2636 74.031L18.1165 53.1854L47.521 49.0825C49.3665 48.8251 50.9621 47.6781 51.793 46.0163L65.0798 19.4575L78.0724 46.156C78.8886 47.8251 80.4695 48.9942 82.3077 49.2663L111.683 53.7075L90.293 74.3178Z"
              fill={starColor}
            />
          </svg>
        </div>
        <svg
          ref={pathRef}
          className="starPathSVG"
          width="101"
          height="108"
          viewBox="0 0 101 108"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M23.3023 52.086L28.703 20.5124C29.2104 17.5292 27.2059 14.6992 24.2187 14.1887C21.2571 13.6824 18.4018 15.6862 17.891 18.6699L12.4973 50.2427C11.9864 53.2263 13.9909 56.0563 16.9746 56.5672C19.9555 57.0756 22.7917 55.0799 23.3023 52.086Z"
            fill={starColor}
          />
          <path
            d="M71.2269 35.8919C73.1844 33.5821 72.8967 30.1229 70.5837 28.1693C68.2727 26.201 64.8147 26.4994 62.8571 28.8092L38.8437 57.1695C35.6474 60.9472 38.7404 66.7245 43.657 66.1573C47.5065 65.7131 46.3835 64.4079 71.2269 35.8919V35.8919Z"
            fill={starColor}
          />
          <path
            d="M87.1121 92.1412C89.7892 91.8323 91.8976 89.5841 91.9593 86.8176C92.0234 83.792 89.6245 81.2806 86.5985 81.2129L49.0962 80.3875C46.0367 80.3094 43.5592 82.7223 43.4916 85.7483C43.4274 88.7738 45.8263 91.2852 48.8523 91.3529L86.3546 92.1783C86.614 92.1843 86.8639 92.1698 87.1121 92.1412Z"
            fill={starColor}
          />
        </svg>
      </div>
    </div>
  );
};

export default ShootingStar;
