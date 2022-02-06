import React, { useState, useRef, useEffect } from 'react';
import { Spring, animated } from 'react-spring'
import VisibilitySensor from "react-visibility-sensor";
import useWindowScroll from './useWindowScroll.js';

const SpringTrigger = (props) => {
  let isVisible = props.isVisible;

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
  const [active, setActive] = useState(props.active || true);
  const [isVisible, setIsVisible] = useState(false);
  const [delay, setDelay] = useState(props.delay || 0);
  const [height, setHeight] = useState(0);
  const containerRef = useRef(null);
  const scrollPosition = useWindowScroll();

  //on change function so if we only want it to come in and stay visible
  const onChange = (isVisible) => {
    setIsVisible(isVisible);
    if (props.once && isVisible){
      setActive(false);
    }
  }

  //disappear after a scrolling
  if (props.hideAfterScroll){
    if (scrollPosition > 25 && isVisible){
      setIsVisible(false);
      setDelay(0);
    }
    else if (scrollPosition <= 25 && !isVisible){
      setIsVisible(true);
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
      onChange={onChange}
      delayedCall={true}
      scrollCheck={true}
      resizeCheck={true}
      partialVisibility={"bottom"}
      offset={{bottom:-height * 0.1}}
    >
      <SpringTrigger
        {...props}
        delay={delay}
        containerRef={containerRef}
        isVisible={isVisible}
      >
      </SpringTrigger>
    </VisibilitySensor>
  )
}

export default VisibilityTrigger;
