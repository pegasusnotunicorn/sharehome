import { useState, useEffect } from "react";
import { useLocation } from "react-router";

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
    if (sessionStorage.getItem("pinPopupDismissed")) return;
    if (hasShownInitial) return;

    const timer = setTimeout(() => {
      setShowPopup(true);
      setHasShownInitial(true);
    }, timeDelay);
    return () => clearTimeout(timer);
  }, [timeDelay, hasShownInitial]);

  // Re-show popup on navigation (if not dismissed for the session)
  useEffect(() => {
    if (!hasShownInitial) return;
    if (sessionStorage.getItem("pinPopupDismissed")) return;
    setShowPopup(true);
  }, [location.pathname, hasShownInitial]);

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
