import { useEffect } from "react";
import { useLocation } from "react-router";

const useUTMPreservation = () => {
  const location = useLocation();

  useEffect(() => {
    // Get current URL parameters
    const currentUrl = new URL(window.location.href);
    const currentParams = currentUrl.searchParams;

    // Check if we have UTM parameters
    const hasUTMParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "gclid",
      "fbclid",
    ].some((param) => currentParams.has(param));

    // If we have UTM parameters and they're not in the current pathname
    if (hasUTMParams && !currentUrl.pathname.includes("?")) {
      // Store UTM parameters in sessionStorage for persistence
      const utmData = {};
      [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
        "gclid",
        "fbclid",
      ].forEach((param) => {
        if (currentParams.has(param)) {
          utmData[param] = currentParams.get(param);
        }
      });

      // Store in sessionStorage
      sessionStorage.setItem("utm_params", JSON.stringify(utmData));
    }

    // If we don't have UTM params in URL but have them in sessionStorage
    if (!hasUTMParams) {
      const storedUTM = sessionStorage.getItem("utm_params");
      if (storedUTM) {
        try {
          const utmData = JSON.parse(storedUTM);
          const newUrl = new URL(window.location.href);

          // Add stored UTM parameters to current URL
          Object.entries(utmData).forEach(([key, value]) => {
            newUrl.searchParams.set(key, value);
          });

          // Update the URL without triggering a page reload
          window.history.replaceState({}, "", newUrl.toString());
        } catch (error) {
          console.error("Error parsing stored UTM data:", error);
        }
      }
    }
  }, [location.pathname]);
};

export default useUTMPreservation;
