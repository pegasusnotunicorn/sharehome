import React from 'react';

import '../../css/utils/shapes.css';

//random number between two integers
const randomIntFromInterval = (min, max) => { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
}

//generate the array of random shapes
const RandomShapesBackground = (totalShapes) => {
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
    let randomLeft = `${randomIntFromInterval(0,100)}`;
    let randomTop = `${randomIntFromInterval(0,100)}`;
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
           100% { left: ${randomIntFromInterval(0,100)}%; top: ${randomIntFromInterval(0,100)}%; transform : ${randomGoalTransform};}
        }
    `}</style>);

    return (
      <div {...props}>{randomKeyframe}</div>
    )
  });
}

//generate a container that is 100% width 100% height with random shapes floating around in the background
export const ShapesContainer = (props) => {
  let RandomShapes = RandomShapesBackground(props.count);

  return (
    <div className="shapesContainer">
      {RandomShapes}
    </div>
  )
}
