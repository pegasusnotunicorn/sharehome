import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { trackEvent } from "./trackEvent";
import { local, session } from "../../utils/safeStorage";

// The expansion popup (CharacterPinPopup.tsx): once a visitor has shown some interest (a second
// page, or ENGAGED_MS on the site), shown once, then not again on this device for SNOOZE_DAYS
// (FOLLOWED_DAYS after they follow). Never over the cart, checkout, thank-you page or raffle, an online
// game (/play and its rooms), or another modal.
const BLOCKED_PATHS = ["/cart", "/checkout", "/thankyou", "/raffle"];
const blocked = (pathname: string) => BLOCKED_PATHS.includes(pathname) || pathname === "/play" || pathname.startsWith("/play/");
const ENGAGED_MS = 45000;
const SNOOZE_DAYS = 14;
const FOLLOWED_DAYS = 180;
const KEY = "expansionPopupUntil";
const DAY = 24 * 60 * 60 * 1000;

// the popup's own title (so its own overlay isn't taken for another modal's)
export const POPUP_TITLE_ID = "expansion-popup-title";
const isModalOpen = () =>
  [...document.querySelectorAll(".modal-overlay")].some((o) => !o.querySelector(`[aria-labelledby="${POPUP_TITLE_ID}"]`));
const snoozeFor = (days: number) => local.set(KEY, String(Date.now() + days * DAY));
// snoozed on this device, or dismissed in this tab (the site's tests set that too)
const snoozed = () => Number(local.get(KEY) || 0) > Date.now() || !!session.get("pinPopupDismissed");

// pages seen and time on the site, this visit
const visit = { pages: new Set<string>(), start: Date.now() };

interface PinPopupOptions {
  engagedMs?: number;
  hold?: boolean; // not now (the trailer's playing): it waits
}

interface PinPopupResult {
  showPopup: boolean;
  shown: () => void;
  closePopup: (how: string) => void;
  followed: () => void;
}

export const usePinPopup = ({ engagedMs = ENGAGED_MS, hold = false }: PinPopupOptions = {}): PinPopupResult => {
  const [showPopup, setShowPopup] = useState(false);
  const [due, setDue] = useState(false); // they've shown interest; it shows at the next chance
  const { pathname } = useLocation();

  // interest: a second page, or long enough on the site
  useEffect(() => {
    visit.pages.add(pathname);
    if (visit.pages.size >= 2) setDue(true);
  }, [pathname]);
  useEffect(() => {
    const t = setTimeout(() => setDue(true), Math.max(0, visit.start + engagedMs - Date.now()));
    return () => clearTimeout(t);
  }, [engagedMs]);

  useEffect(() => {
    if (!due || hold || showPopup || blocked(pathname) || snoozed() || isModalOpen()) return;
    setShowPopup(true);
  }, [due, hold, pathname, showPopup]);

  // gone if a modal opens over it, or they move to a page it's kept off
  useEffect(() => {
    if (!showPopup) return;
    if (blocked(pathname)) setShowPopup(false);
    const observer = new MutationObserver(() => {
      if (isModalOpen()) setShowPopup(false);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [showPopup, pathname]);

  return {
    showPopup,
    // (on the screen at last: shown once, however it's closed)
    shown: () => {
      snoozeFor(SNOOZE_DAYS);
      trackEvent("expansion_popup_shown", { page: pathname });
    },
    closePopup: (how) => {
      setShowPopup(false);
      trackEvent("expansion_popup_dismiss", { how });
    },
    followed: () => {
      setShowPopup(false);
      snoozeFor(FOLLOWED_DAYS);
      trackEvent("expansion_popup_follow");
    },
  };
};
