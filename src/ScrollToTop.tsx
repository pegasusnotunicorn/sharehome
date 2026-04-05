import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router";

function ScrollToTop({ children }: { children?: ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  }, [location.pathname]);

  return <>{children}</>;
}

export default ScrollToTop;
