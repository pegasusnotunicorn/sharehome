import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router";

// A new page starts at its top, or at the part its link names (#…). Back and Forward leave it to the
// browser, which puts them back where they were.
function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const firstPage = useRef(true);

  useEffect(() => {
    const first = firstPage.current;
    firstPage.current = false;
    // (a page just loaded, or reloaded, with no part named: the browser's own place too)
    if (navigationType === "POP" && (!first || !location.hash)) return;

    if (!location.hash) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
      return;
    }

    let elementId: string;
    try {
      elementId = decodeURIComponent(location.hash.slice(1));
    } catch {
      elementId = location.hash.slice(1); // (a broken link's #…: as it is)
    }
    let attempts = 0;
    let timeoutId: number | undefined;

    const scrollToHashTarget = () => {
      const target = document.getElementById(elementId);

      if (target) {
        target.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }

      attempts += 1;
      if (attempts < 20) {
        timeoutId = window.setTimeout(scrollToHashTarget, 100);
      }
    };

    timeoutId = window.setTimeout(scrollToHashTarget, 0);

    return () => {
      if (typeof timeoutId !== "undefined") {
        window.clearTimeout(timeoutId);
      }
    };
  }, [location.pathname, location.hash]);

  return null;
}

export default ScrollToTop;
