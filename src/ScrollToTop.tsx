import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router";

function ScrollToTop({ children }: { children?: ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    window.onbeforeunload = function () {
      window.scrollTo(0, 0);
    };

    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
  }, [location.pathname]);

  return <>{children}</>;
}

export default ScrollToTop;
