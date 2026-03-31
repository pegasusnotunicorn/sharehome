import { useEffect, useState } from "react";

const useDeviceType = (): { isIOS: boolean; isAndroid: boolean } => {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as Window & { opera?: string }).opera || "";

    // Check for iOS devices
    if (/iPad|iPhone|iPod/.test(userAgent)) {
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
