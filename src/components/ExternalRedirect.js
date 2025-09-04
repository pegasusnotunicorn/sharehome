import { useEffect } from "react";

const ExternalRedirect = ({ url }) => {
  useEffect(() => {
    // Get current URL parameters
    const currentUrl = new URL(window.location.href);
    const currentParams = currentUrl.searchParams;

    // Create the target URL with UTM parameters
    const targetUrl = new URL(url);

    // Preserve UTM parameters and other tracking parameters
    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "gclid",
      "fbclid",
    ];

    // First, try to get UTM params from current URL
    let hasUTMParams = false;
    trackingParams.forEach((param) => {
      if (currentParams.has(param)) {
        targetUrl.searchParams.set(param, currentParams.get(param));
        hasUTMParams = true;
      }
    });

    // If no UTM params in URL, check sessionStorage
    if (!hasUTMParams) {
      const storedUTM = sessionStorage.getItem("utm_params");
      if (storedUTM) {
        try {
          const utmData = JSON.parse(storedUTM);
          Object.entries(utmData).forEach(([key, value]) => {
            targetUrl.searchParams.set(key, value);
          });
        } catch (error) {
          console.error("Error parsing stored UTM data:", error);
        }
      }
    }

    window.location.replace(targetUrl.toString());
  }, [url]);

  return null; // No UI needed
};

export default ExternalRedirect;
