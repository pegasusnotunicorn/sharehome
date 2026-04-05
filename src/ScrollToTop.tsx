import { useEffect, type ReactNode } from "react";
import { useLocation, useNavigationType } from "react-router";

const SCROLL_STORAGE_KEY = "route-scroll-positions";
export const PENDING_SCROLL_RESTORE_KEY = "pending-scroll-restore";

const getRouteKey = ({
  pathname,
  search,
  hash,
}: {
  pathname: string;
  search: string;
  hash: string;
}) => `${pathname}${search}${hash}`;

const getScrollTop = () =>
  window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

const readStoredPositions = () => {
  try {
    const positions = window.sessionStorage.getItem(SCROLL_STORAGE_KEY);
    return positions ? (JSON.parse(positions) as Record<string, number>) : {};
  } catch {
    return {};
  }
};

const writeStoredPosition = (routeKey: string, scrollTop: number) => {
  const positions = readStoredPositions();
  positions[routeKey] = scrollTop;
  window.sessionStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify(positions));
};

const readStoredPosition = (routeKey: string) => readStoredPositions()[routeKey];

const restoreScrollWhenReady = (scrollTop: number) => {
  const maxAttempts = 30;
  let attempts = 0;

  const attemptRestore = () => {
    attempts += 1;

    window.scrollTo({ top: scrollTop, left: 0, behavior: "auto" });

    const reachedTarget = Math.abs(getScrollTop() - scrollTop) < 2;
    const pageCanFitTarget =
      document.documentElement.scrollHeight - window.innerHeight >= scrollTop;

    if (reachedTarget || (pageCanFitTarget && attempts >= 2) || attempts >= maxAttempts) {
      return;
    }

    window.setTimeout(attemptRestore, 100);
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(attemptRestore);
  });
};

function ScrollToTop({ children }: { children?: ReactNode }) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const routeKey = getRouteKey(location);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    const savedScrollTop = readStoredPosition(routeKey);

    if (navigationType === "POP" && typeof savedScrollTop === "number") {
      window.sessionStorage.setItem(
        PENDING_SCROLL_RESTORE_KEY,
        JSON.stringify({ routeKey, scrollTop: savedScrollTop })
      );
      restoreScrollWhenReady(savedScrollTop);
    } else if (navigationType !== "POP") {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    }

    return () => {
      writeStoredPosition(routeKey, getScrollTop());
    };
  }, [navigationType, routeKey]);

  return <>{children}</>;
}

export default ScrollToTop;
