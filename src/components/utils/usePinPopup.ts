import { useState, useEffect } from "react";
import { useLocation } from "react-router";

const BLOCKED_PATHS = ["/cart", "/checkout"];
const isModalOpen = () => document.querySelector(".modal-overlay") !== null;

interface PinPopupOptions {
  timeDelay?: number;
}

interface PinPopupResult {
  showPopup: boolean;
  closePopup: () => void;
  dismissPopup: () => void;
}

export const usePinPopup = ({ timeDelay = 5000 }: PinPopupOptions): PinPopupResult => {
  const [showPopup, setShowPopup] = useState(false);
  const [hasShownInitial, setHasShownInitial] = useState(false);
  const location = useLocation();

  // Show popup after delay on first load
  useEffect(() => {
    if (BLOCKED_PATHS.includes(location.pathname)) return;
    if (sessionStorage.getItem("pinPopupDismissed")) return;
    if (hasShownInitial) return;

    const timer = setTimeout(() => {
      if (isModalOpen()) return;
      setShowPopup(true);
      setHasShownInitial(true);
    }, timeDelay);
    return () => clearTimeout(timer);
  }, [timeDelay, hasShownInitial, location.pathname]);

  // Re-show popup on navigation (if not dismissed for the session)
  useEffect(() => {
    if (BLOCKED_PATHS.includes(location.pathname)) {
      setShowPopup(false);
      return;
    }
    if (!hasShownInitial) return;
    if (sessionStorage.getItem("pinPopupDismissed")) return;
    if (isModalOpen()) return;
    setShowPopup(true);
  }, [location.pathname, hasShownInitial]);

  // Hide popup immediately if a modal opens while it's visible
  useEffect(() => {
    if (!showPopup) return;
    const observer = new MutationObserver(() => {
      if (isModalOpen()) setShowPopup(false);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [showPopup]);

  // Temporary close — popup reappears on next navigation
  const closePopup = () => {
    setShowPopup(false);
  };

  // Permanent session dismiss — popup never shows again this session
  const dismissPopup = () => {
    setShowPopup(false);
    sessionStorage.setItem("pinPopupDismissed", "true");
  };

  return {
    showPopup,
    closePopup,
    dismissPopup,
  };
};
