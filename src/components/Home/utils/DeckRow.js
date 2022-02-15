import React, { useState, useRef, useLayoutEffect } from 'react'
import gsap from 'gsap';

//a single row with stuff in it
export const DeckRow = (props) => {

  //create timeline for the row
  let rowRef = useRef(null);
  let [rowTl, setRowTl] = useState(null);
  useLayoutEffect(() => {
    setRowTl(gsap.timeline({
      scrollTrigger:{
        trigger: rowRef.current,
        // markers: true,
        scrub: 0.5,
        start: "top bottom",
        end: "bottom bottom",
      }
    }));
  }, [setRowTl]);

  return (
    <div ref={rowRef} className={props.className}>
      { React.cloneElement(props.children, { tl: rowTl, ...props }) }
    </div>
  )
}

export default DeckRow;
