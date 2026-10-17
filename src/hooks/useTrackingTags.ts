import { useEffect } from "react";
import { useLocation } from "react-router";
import { keepTrackingTags, trackingTagsIn } from "../utils/tracking";

// A link's tracking tags (utm_source and the like) are kept for the visit as it comes in, for the
// checkout to send with the order (src/utils/tracking.ts). The address itself is left as it is.
const useTrackingTags = (): void => {
  const { search } = useLocation();
  useEffect(() => {
    const tags = trackingTagsIn(new URLSearchParams(search));
    if (tags) keepTrackingTags(tags);
  }, [search]);
};

export default useTrackingTags;
