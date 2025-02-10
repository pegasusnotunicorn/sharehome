import { useEffect } from "react";

const ExternalRedirect = ({ url }) => {
  useEffect(() => {
    // Retrieve stored UTM params from localStorage
    const utmParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
    ];
    const queryParams = utmParams
      .map((param) => {
        const value = localStorage.getItem(param);
        return value ? `${param}=${encodeURIComponent(value)}` : null;
      })
      .filter(Boolean) // Filter out null values
      .join("&");

    // Build the final redirect URL with UTM params appended
    const redirectUrl = queryParams ? `${url}?${queryParams}` : url;

    // Replace history and redirect to the external URL
    window.location.replace(redirectUrl);
  }, [url]);

  return null; // No UI needed
};

export default ExternalRedirect;
