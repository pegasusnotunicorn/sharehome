import { useEffect } from "react";

const ExternalRedirect = ({ url }) => {
  useEffect(() => {
    window.location.replace(url);
  }, [url]);

  return null; // No UI needed
};

export default ExternalRedirect;
