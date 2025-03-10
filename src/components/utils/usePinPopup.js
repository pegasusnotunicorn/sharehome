import { useState, useEffect } from "react";

export const usePinPopup = ({ timeDelay = 5000 }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const hasClosedPopup = localStorage.getItem("pinPopupClosed");
    if (hasClosedPopup) {
      setShowButton(true);
      return;
    }

    const timer = setTimeout(() => setShowPopup(true), timeDelay);
    return () => clearTimeout(timer);
  }, [timeDelay]);

  const closePopup = () => {
    setShowPopup(false);
    setShowButton(true);
    localStorage.setItem("pinPopupClosed", "true");
  };

  const openPopup = () => {
    setShowPopup(true);
    setShowButton(false);
  };

  return {
    showPopup,
    showButton,
    closePopup,
    openPopup,
  };
};
