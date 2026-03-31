import React, { useState, useRef, useLayoutEffect } from "react";
import gsap from "gsap";

interface DeckRowProps {
  className?: string;
  children: React.ReactElement;
}

//a single row with stuff in it
export const DeckRow = (props: DeckRowProps) => {
  //create timeline for the row
  let rowRef = useRef<HTMLDivElement>(null);
  let [rowTl, setRowTl] = useState<gsap.core.Timeline | null>(null);
  useLayoutEffect(() => {
    setRowTl(
      gsap.timeline({
        scrollTrigger: {
          trigger: rowRef.current,
          // markers: true,
          scrub: 0.5,
          start: "top bottom",
          end: "bottom bottom",
        },
      })
    );
  }, [setRowTl]);

  return (
    <div ref={rowRef} className={props.className}>
      {React.cloneElement(props.children as React.ReactElement<any>, { tl: rowTl, ...props })}
    </div>
  );
};

export default DeckRow;
