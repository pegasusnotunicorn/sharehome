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
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
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
