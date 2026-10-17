import React, { useState, useRef, useLayoutEffect } from "react";
import gsap from "gsap";

interface DeckRowProps {
  className?: string;
  children: React.ReactElement;
}

//a single row with stuff in it
export const DeckRow = (props: DeckRowProps) => {
  //create timeline for the row
  const rowRef = useRef<HTMLDivElement>(null);
  const [rowTl, setRowTl] = useState<gsap.core.Timeline | null>(null);
  useLayoutEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: rowRef.current,
        // markers: true,
        scrub: 0.5,
        start: "top bottom",
        end: "bottom bottom",
      },
    });
    setRowTl(tl);
    // (gone with the row: its scroll trigger too)
    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, [setRowTl]);

  return (
    <div ref={rowRef} className={props.className}>
      {React.cloneElement(props.children as React.ReactElement<Record<string, unknown>>, { tl: rowTl, ...props })}
    </div>
  );
};

export default DeckRow;
