import React from 'react';
import { CornerDownLeft, CornerDownRight, CornerUpLeft, CornerUpRight, CornerLeftDown, CornerLeftUp, CornerRightDown, CornerRightUp } from 'react-feather';
import { Spring, animated } from 'react-spring'

import '../../css/utils/arrowText.css';
import VisibilityTrigger from "./VisibilityTrigger.js";

//custom arrow text thing that points to something
const ArrowText = (props) => {
  let arrow;
  switch (props.arrow){
    case ("DownLeft"):
      arrow = <CornerDownLeft />;
      break;
    case ("DownRight"):
      arrow = <CornerDownRight />;
      break;
    case ("UpLeft"):
      arrow = <CornerUpLeft />;
      break;
    case ("UpRight"):
      arrow = <CornerUpRight />;
      break;
    case ("LeftDown"):
      arrow = <CornerLeftDown />;
      break;
    case ("LeftUp"):
      arrow = <CornerLeftUp />;
      break;
    case ("RightDown"):
      arrow = <CornerRightDown />;
      break;
    case ("RightUp"):
      arrow = <CornerRightUp />;
      break;
    default:
      break;
  }

  //pulsate /rotate after showing
  const springStyles = {
    opacity: 1,
    transform:`scale(1.1) rotate(${10 * (Math.random() - 0.5)}deg)`,
  }

  return (
      <VisibilityTrigger delay={props.delay} forcedClassName={`arrowTextContainer corner${props.arrow}`}>
        <Spring to={springStyles} delay={props.delay} >
          {styles => (
            <animated.div style={styles} className={`arrowTextWrapper corner${props.arrow}`} ref={props.containerRef}>
              { arrow }
              <p>{ props.text }</p>
            </animated.div>
          )}
        </Spring>
      </VisibilityTrigger>
  );
}

export default ArrowText;
