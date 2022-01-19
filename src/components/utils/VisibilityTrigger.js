import React, { useState, useRef, useEffect } from 'react';
import { Spring, animated } from 'react-spring'
import VisibilitySensor from "react-visibility-sensor";

const SpringTrigger = (props) => {
  const isVisible = props.isVisible;
  let springStyles = {
    opacity: isVisible ? 1 : 0,
  }

  //specific style changes
  if (props.translateY) springStyles.translateY = isVisible ? `${0}px` : `${50}px`;
  if (props.forcedStyle) springStyles = { ...springStyles, ...props.forcedStyle };

  //specific props
  const springProps = {}
  if (props.delay) springProps.delay = props.delay;
  if (props.forcedClassName) springProps.className = props.forcedClassName;

  return (
    <Spring to={springStyles} {...springProps} >
      {styles => (
        <animated.div className={props.className} style={styles} {...springProps} ref={props.containerRef}>
          { props.children }
        </animated.div>
      )}
    </Spring>
  )
}

//trigger for visbility
const VisibilityTrigger = (props) => {
  const [active, setActive] = useState(true);
  const [height, setHeight] = useState(0);
  const containerRef = useRef(null);

  //on change
  const change = (isVisible) => {
    if (props.once && isVisible){
      setActive(false);
    }
  }

  //for dynamic height detection
  useEffect(() => {
    if (containerRef.current){
      setHeight(containerRef.current.offsetHeight);
    }
  }, [containerRef]);


  return (
    <VisibilitySensor
      active={active}
      onChange={change}
      delayedCall={true}
      scrollCheck={true}
      resizeCheck={true}
      partialVisibility={"bottom"}
      offset={{bottom:-height * 0.1}}
    >
      {({isVisible}) =>
        <SpringTrigger
          {...props}
          containerRef={containerRef}
          isVisible={isVisible}
        >
        </SpringTrigger>
      }
    </VisibilitySensor>
  )
}

export default VisibilityTrigger;
