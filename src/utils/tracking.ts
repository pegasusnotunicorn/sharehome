import { session } from "./safeStorage.ts"; // (with its .ts: the /buy edge function runs this as it is)

// The tags a link can carry to say where a visit came from (an ad, a campaign, a post). A visit keeps
// them (here, and in the track-utm edge function's cookie) for the checkout and the redirects to pass
// on, but never writes them onto the site's own addresses: a link copied from one, or a game invite,
// would carry this visit's campaign to someone else. (netlify/edge-functions/buy.js reads this too.)
export const TRACKING_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "client_reference_id",
] as const;

type Tags = Record<string, string>;

const STORAGE_KEY = "utm_params";

// the tracking tags in an address's query (none: null)
export const trackingTagsIn = (params: URLSearchParams): Tags | null => {
  const tags: Tags = {};
  for (const key of TRACKING_KEYS) {
    const value = params.get(key);
    if (value) tags[key] = value;
  }
  // (a Facebook click's ID is the checkout's reference for it too)
  if (tags.fbclid && !tags.client_reference_id) tags.client_reference_id = tags.fbclid;
  return Object.keys(tags).length ? tags : null;
};

// the tags this visit came in with, kept for the rest of it
export const keepTrackingTags = (tags: Tags) => session.set(STORAGE_KEY, JSON.stringify(tags));

export const storedTrackingTags = (): Tags => {
  try {
    return JSON.parse(session.get(STORAGE_KEY) || "{}") || {};
  } catch {
    return {}; // (not something this wrote)
  }
};
