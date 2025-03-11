import { useState, useEffect } from "react";

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

export default function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth !== windowDimensions.width) {
        setWindowDimensions(getWindowDimensions());
      }
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [windowDimensions]);

  const { width, height } = windowDimensions;
  const isDesktop = width > 900 && width > height;

  return {
    width,
    height,
    isDesktop,
    isMobile: !isDesktop,
  };
}
