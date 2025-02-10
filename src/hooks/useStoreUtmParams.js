import { useEffect } from "react";

const useStoreUtmParams = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
    ];

    let storedParams = {};
    let hasParams = false;

    // Loop through the UTM params and store any that exist in the URL
    utmParams.forEach((param) => {
      const value = urlParams.get(param);
      if (value) {
        localStorage.setItem(param, value);
        storedParams[param] = value;
        hasParams = true;
      }
    });

    if (hasParams) {
      console.log("Stored UTM params:", storedParams);
    }
  }, []);
};

export default useStoreUtmParams;
