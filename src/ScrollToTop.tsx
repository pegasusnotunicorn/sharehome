import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router";

function ScrollToTop({ children }: { children?: ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
      return;
    }

    const elementId = decodeURIComponent(location.hash.slice(1));
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

  return <>{children}</>;
}

export default ScrollToTop;
