import { useRef, useLayoutEffect, useMemo, type ReactNode } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger.js";
import gsap from "gsap";
import { randomDeg } from "../utils/useMath";
import { useLocation } from "react-router";

interface GsapFadeScrubProps {
  id?: string;
  className?: string;
  children?: ReactNode;
  fadeIn?: boolean;
  fadeOut?: boolean;
  markers?: boolean;
  scrub?: boolean;
  duration?: number;
  customFrom?: gsap.TweenVars;
  customTo?: gsap.TweenVars;
  startScreenTop?: boolean;
  scrubStartBot?: boolean;
  scrubStartCenter?: boolean;
}

//fadein or out scrubbing with viewport
export const GsapFadeScrub = (props: GsapFadeScrubProps) => {
  const location = useLocation();
  gsap.registerPlugin(ScrollTrigger);
  const target = useRef<HTMLDivElement>(null);

  //for when the element is in view from load
  const startScreenTop = props.startScreenTop;
  const scrubStartBot = props.scrubStartBot || false;
  const scrubStartCenter = props.scrubStartCenter || false;

  //fade in as you scroll or fade out
  const fadeIn = props.fadeIn || !props.fadeOut;
  const markers = props.markers || false;
  const scrub = props.scrub || false;
  const duration = props.duration || 1;

  //no idea what this does but it gets rid of warning
  const customFrom = useMemo(() => {
    return props.customFrom || {};
  }, [props.customFrom]);
  const customTo = useMemo(() => {
    return props.customTo || {};
  }, [props.customTo]);

  // wait until DOM has been rendered
  useLayoutEffect(() => {
    //start values
    let startValue = `top 75%`;
    if (startScreenTop) {
      startValue = `top ${target.current!.getBoundingClientRect().top}`;
    } else if (scrubStartBot) {
      startValue = "top bottom";
    } else if (scrubStartCenter) {
      startValue = "center bottom";
    }

    let endValue = scrub ? "bottom center" : "top center";
    endValue = startScreenTop ? "bottom top" : endValue;

    const tl = gsap.fromTo(
      target.current,
      {
        ...customFrom,
        opacity: fadeIn ? 0 : 1,
      },
      {
        ...customTo,
        opacity: fadeIn ? 1 : 0,
        scrollTrigger: {
          trigger: target.current,
          markers: markers,
          start: startValue,
          end: endValue,
          scrub: scrub,
          toggleActions: "play none none reverse",
        } as ScrollTrigger.Vars,
        duration: duration,
      }
    );

    return () => {
      if (tl) tl.kill();
    };
  }, [
    customFrom,
    customTo,
    fadeIn,
    scrubStartBot,
    startScreenTop,
    scrubStartCenter,
    markers,
    scrub,
    duration,
  ]);

  return (
    <div
      key={location.pathname}
      ref={target}
      id={props.id}
      className={props.className}
    >
      {props.children}
    </div>
  );
};

interface GsapWiggleProps {
  id?: string;
  degree?: number;
  className?: string;
  children?: ReactNode;
}

//wiggle a element
export const GsapWiggle = (props: GsapWiggleProps) => {
  const location = useLocation();
  gsap.registerPlugin(ScrollTrigger);
  const target = useRef<HTMLDivElement>(null);
  const degree = props.degree || 10;

  useLayoutEffect(() => {
    let tl: gsap.core.Timeline | undefined;
    if (target.current) {
      tl = gsap.timeline({
        repeat: -1,
        yoyo: true,
      });
      tl.to(target.current, {
        rotationZ: randomDeg(degree),
        duration: Math.random() + 1,
      })
        .to(target.current, {
          rotationZ: randomDeg(degree),
          duration: 0.1,
        })
        .to(target.current, {
          rotationZ: randomDeg(degree),
          duration: 0.1,
        });
    }
    return () => {
      if (tl) tl.killTweensOf();
    };
  }, [target, degree]);

  return (
    <div
      key={location.pathname}
      ref={target}
      id={props.id}
      className={props.className}
    >
      {props.children}
    </div>
  );
};
