import React, { useRef, useLayoutEffect, useMemo } from 'react';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from 'gsap';

import { randomDeg } from '../utils/useMath.js';

//just a simple fade in with a delay, not tied to scroll
export const GsapFadeDelay = (props) => {
  gsap.registerPlugin(ScrollTrigger);
  const target = useRef(null);

  //delay to fade in
  let delay = parseInt(props.delay) || 0;
  let duration = parseInt(props.duration) || 1;
  useLayoutEffect(() => {
    let tl;
    if (delay >= 0){
      setTimeout(()=>{
        tl = gsap.fromTo(target.current, {
          opacity: 0,
        }, {
          opacity: 1,
          duration: duration,
        });
      }, delay);
    }
    return () => {
      if (tl) tl.kill();
    }
  }, [delay, duration]);

  return (
    <div ref={target} id={props.id} className={ props.className } style={{opacity: (delay >= 0) ? 0 : 1}}>
      { props.children }
    </div>
  );
}

//fadein or out scrubbing with viewport
export const GsapFadeScrub = (props) => {
  gsap.registerPlugin(ScrollTrigger);
  const target = useRef(null);

  //for when the element is in view from load
  let startScreenTop = (props.startScreenTop && window.location.pathname === "/" );
  let scrubStartBot = props.scrubStartBot || false;
  let scrubStartCenter = props.scrubStartCenter || false;

  //fade in as you scroll or fade out
  let fadeIn = props.fadeIn || !props.fadeOut;
  let markers = props.markers || false;
  let scrub = props.scrub || false;
  let duration = props.duration || 1;

  //no idea what this does but it gets rid of warning
  let customFrom = useMemo(()=> { return props.customFrom || {} }, [props.customFrom]);
  let customTo = useMemo(()=> { return props.customTo || {} }, [props.customTo]);

  // wait until DOM has been rendered
  useLayoutEffect(() => {

    //start values
    let startValue = `top 75%`;
    if (startScreenTop){
      startValue = `top ${target.current.getBoundingClientRect().top}`;
    }
    else if (scrubStartBot){
      startValue = "top bottom";
    }
    else if (scrubStartCenter){
      startValue = "center bottom";
    }

    let endValue = (scrub) ? "bottom center" : "top center";
    endValue = (startScreenTop) ? "bottom top" : endValue;

    let tl = gsap.fromTo(target.current, {
      ...customFrom,
      opacity: fadeIn ? 0 : 1,
    }, {
      ...customTo,
      opacity: fadeIn ? 1 : 0,
      scrollTrigger: {
        trigger: target.current,
        markers:markers,
        start: startValue,
        end: endValue,
        scrub: scrub,
        duration: duration,
        toggleActions: 'play none none reverse',
      }
    });

    return () => {
      if (tl) tl.kill();
    }
  }, [customFrom, customTo, fadeIn, scrubStartBot, startScreenTop, scrubStartCenter, markers, scrub, duration]);

  return (
    <div ref={target} id={props.id} className={ props.className }>
      { props.children }
    </div>
  );
}

//wiggle a element
export const GsapWiggle = (props) => {
  gsap.registerPlugin(ScrollTrigger);
  const target = useRef(null);
  const degree = props.degree || 10;

  useLayoutEffect(() => {
    let tl;
    if (target.current){
      tl = gsap.timeline({
        repeat: -1,
        yoyo: true,
      });
      tl.to(target.current, {
        rotationZ:randomDeg(degree),
        duration:Math.random() + 1,
      }).to(target.current, {
        rotationZ:randomDeg(degree),
        duration:0.1,
      }).to(target.current, {
        rotationZ:randomDeg(degree),
        duration:0.1,
      });
    }
    return () => {
      if (tl) tl.killTweensOf();
    }
  }, [target, degree]);

  return (
    <div ref={target} id={props.id} className={ props.className }>
      { props.children }
    </div>
  );
}
