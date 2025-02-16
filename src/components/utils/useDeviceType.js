import { useEffect, useState } from "react";

const useDeviceType = () => {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Check for iOS devices
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      setIsIOS(true);
    }

    // Check for Android devices
    if (/android/i.test(userAgent)) {
      setIsAndroid(true);
    }
  }, []);

  return { isIOS, isAndroid };
};

export default useDeviceType;
