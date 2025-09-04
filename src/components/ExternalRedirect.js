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

    trackingParams.forEach((param) => {
      if (currentParams.has(param)) {
        targetUrl.searchParams.set(param, currentParams.get(param));
      }
    });

    window.location.replace(targetUrl.toString());
  }, [url]);

  return null; // No UI needed
};

export default ExternalRedirect;
