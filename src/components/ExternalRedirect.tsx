import { useEffect } from "react";
import { TRACKING_KEYS, storedTrackingTags } from "../utils/tracking";

interface ExternalRedirectProps {
  url: string;
}

// Off to another address, with this one's query, and the visit's tracking tags if it has none of its own
const ExternalRedirect = ({ url }: ExternalRedirectProps) => {
  useEffect(() => {
    const currentParams = new URL(window.location.href).searchParams;
    const targetUrl = new URL(url, window.location.origin);
    currentParams.forEach((value, key) => targetUrl.searchParams.set(key, value));
    if (!TRACKING_KEYS.some((key) => currentParams.has(key))) {
      Object.entries(storedTrackingTags()).forEach(([key, value]) => targetUrl.searchParams.set(key, value));
    }
    window.location.replace(targetUrl.toString());
  }, [url]);

  return null;
};

export default ExternalRedirect;
