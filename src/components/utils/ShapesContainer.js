import React, { useEffect, useRef } from 'react';
import { Parallax, ParallaxLayer } from '@react-spring/parallax'
import { useLocation } from 'react-router-dom';

import '../../css/utils/shapes.css';

//random number between two integers
const randomIntFromInterval = (min, max) => { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
}

//random between 0 and 100, weighted for closer to 0 or 100
const randomWeightedLeftAndRight = () => {
  let tempRand = Math.random();
  if (tempRand > 0.51) {
    return randomIntFromInterval(20,40);
  }
  else if (tempRand < 0.49) {
    return randomIntFromInterval(60,80);
  }
  else {
    return randomIntFromInterval(45,55);
  }
}

//generate the containers for the random shapes so we can do parallax
const RandomShapesContainers = (totalShapes, dontScroll) => {
  const parallaxRef = useRef();

  //shapes per container / # of containers
  let totalContainers = (dontScroll) ? 1 : 2;
  let totalShapesPerContainer = Math.floor(totalShapes / totalContainers);

  //read for window scroll and change parallax scroll
  useEffect(() => {
    if (!dontScroll){
      //on scroll function for parallax
      const onScroll = () => {
        let windowScroll = window.scrollY / (document.body.scrollHeight - window.innerHeight);
        let parallaxEquivalent = Math.round(windowScroll * totalContainers * 1000) / 1000;
        if (parallaxRef.current) {
          parallaxRef.current.scrollTo(parallaxEquivalent);
        }
      }

      //window event listener
      window.addEventListener('scroll', onScroll);
      return () => {
        window.removeEventListener('scroll', onScroll);
      }
    }
  }, [totalContainers, dontScroll]);

  //properties of parallax
  let parallaxProps = {
    pages:totalContainers,
    style:{
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      zIndex: '-999',
      overflow: 'hidden',
    },
    ref: parallaxRef,
    className: "parallaxContainer",
    innerStyle: {
      overflowX: "hidden"
    }
  }

  //dont hide overflow if we're not scrolling
  if (dontScroll){
    parallaxProps.style.overflow = "initial";
    parallaxProps.innerStyle = {
      overflow: "initial",
    }
  }

  return (
    <Parallax {...parallaxProps}>
      { ParallaxLayers(totalContainers, totalShapesPerContainer) }
    </Parallax>
  )
}

//generate array of random shape containers and encase in parallax layers
const ParallaxLayers = (totalContainers, totalShapesPerContainer) => {
  return [...Array(totalContainers)].map((curr, index, array)=>{

    let shapes = RandomShapes(totalShapesPerContainer);

    let props = {
      id:"parallaxLayer" + index,
      key:"parallaxLayer" + index,
      offset:index,
      speed:Math.random()/100,
      style:{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow:'hidden',
      }
    }

    return (
      <ParallaxLayer {...props}>
        {shapes}
      </ParallaxLayer>
    );
  });
}

//generate the array of random shapes
const RandomShapes = (totalShapes) => {
  return [...Array(totalShapes)].map((curr, index, array)=>{

    //variables
    let minSizeShape = 25;
    let maxSizeShape = 150;
    let minDuration = 30;
    let maxDuration = 120;

    let randomShapeNum = Math.random();
    let randomShape = (randomShapeNum <= 0.75) ? ((randomShapeNum <= 0.5) ? ((randomShapeNum <= 0.25) ? "heart" : "circle") : "triangle") : "square";

    let randomColorNum = Math.random();
    let randomColor = (randomColorNum <= 0.75) ? ((randomColorNum <= 0.5) ? ((randomColorNum <= 0.25) ? "red" : "green") : "blue") : "yellow";

    let randomSize = {};
    let randomGoalTransform;
    switch (randomShape){
      case "heart":
        randomColor = "is-" + randomColor;
        let randomHeartSize = Math.random() + 0.5;
        randomSize.transform = `scale(${randomHeartSize}) rotate(${randomIntFromInterval(0,360)}deg)`;
        randomGoalTransform = `scale(${randomHeartSize}) rotate(${randomIntFromInterval(0,360)}deg)`;
        break;
      case "triangle":
        randomColor = "is-" + randomColor;
        let randomTriangleSize = randomIntFromInterval(minSizeShape,maxSizeShape);
        randomSize.borderTopWidth = randomTriangleSize;
        randomSize.borderRightWidth = randomTriangleSize;
        randomSize.borderBottomWidth = randomTriangleSize;
        randomSize.transform = `rotate(${randomIntFromInterval(0,360)}deg)`;
        randomGoalTransform = `rotate(${randomIntFromInterval(0,360)}deg)`;
        break;
      case "circle":
        randomColor += "Background";
        let randomCircleSize = randomIntFromInterval(minSizeShape,maxSizeShape);
        randomSize.width = `${randomCircleSize}px`;
        randomSize.height = `${randomCircleSize}px`;
        randomSize.transform = `rotate(${randomIntFromInterval(0,360)}deg)`;
        randomGoalTransform = `rotate(${randomIntFromInterval(0,360)}deg)`;
        break;
      case "square":
        randomColor += "Background";
        let randomWidth = randomIntFromInterval(minSizeShape,maxSizeShape)
        randomSize.width = `${randomWidth}px`
        randomSize.height = `${randomWidth}px`
        randomSize.transform = `rotate(${randomIntFromInterval(0,360)}deg)`;
        randomGoalTransform = `rotate(${randomIntFromInterval(0,360)}deg)`;
        break;
      default:
        break;
    }

    //properties of the shape
    let randomLeft = `${randomWeightedLeftAndRight()}`;
    let randomTop = `${randomIntFromInterval(20,80)}`;
    let props = {
      id:"shape" + index,
      key:"shape" + index,
      className: `shape floating rotating ${randomColor} ${randomShape}`,

      //random size / rotation
      style:{
        ...randomSize,
        animationDuration:`${randomIntFromInterval(minDuration,maxDuration)}s`,
        // animationDelay:`${randomIntFromInterval(0,10)}s`,
        animationProperty:'left, top',
        animationName: `randomKeyframe${index}`,
        left:`${randomLeft}%`,
        top:`${randomTop}%`,
      }
    }

    let randomKeyframe = (<style>{`
        @keyframes randomKeyframe${index} {
           0% { left: ${randomLeft}%; top: ${randomTop}%; transform: ${randomSize.transform}}
           100% { left: ${randomIntFromInterval(20,80)}%; top: ${randomIntFromInterval(20,80)}%; transform : ${randomGoalTransform};}
        }
    `}</style>);

    return (
      <div {...props}>{randomKeyframe}</div>
    )
  });
}

//generate a container that is 100% width 100% height with random shapes floating around in the background
export const ShapesContainer = (props) => {
  let location = useLocation();   //to change the shapes container every time location is changed
  let shapesCount = (location.pathname !== "/") ? 25 : props.count;  //less shapes on non-main page
  let containers = RandomShapesContainers(shapesCount, props.dontScroll);

  return containers
}
