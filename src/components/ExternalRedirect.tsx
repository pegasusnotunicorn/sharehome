import { useEffect } from "react";

interface ExternalRedirectProps {
  url: string;
}

const ExternalRedirect = ({ url }: ExternalRedirectProps) => {
  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const currentParams = currentUrl.searchParams;

    const targetUrl = new URL(url);

    currentParams.forEach((value, key) => {
      targetUrl.searchParams.set(key, value);
    });

    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "gclid",
      "fbclid",
    ];
    const hasUTMParams = trackingParams.some((param) => currentParams.has(param));

    if (!hasUTMParams) {
      const storedUTM = sessionStorage.getItem("utm_params");
      if (storedUTM) {
        try {
          const utmData = JSON.parse(storedUTM);
          Object.entries(utmData).forEach(([key, value]) => {
            targetUrl.searchParams.set(key, value as string);
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
