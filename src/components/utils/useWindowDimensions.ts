import { useState, useEffect } from "react";

interface WindowDimensions {
  width: number;
  height: number;
  isDesktop: boolean;
  isMobile: boolean;
}

function getWindowDimensions(): { width: number; height: number } {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

export default function useWindowDimensions(): WindowDimensions {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    // only when the width changes: on phones the height changes as the address bar slides in and
    // out while scrolling, and re-rendering then stutters the scroll (`height` is as of the last
    // width change)
    function handleResize() {
      setWindowDimensions((d) => (d.width === window.innerWidth ? d : getWindowDimensions()));
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { width, height } = windowDimensions;
  const isDesktop = width > 900;

  return {
    width,
    height,
    isDesktop,
    isMobile: !isDesktop,
  };
}
