// Short, shareable links for placements we don't control the URL format of
// (a sponsor's video description, a pinned comment). Each path 302s to the
// landing page with its UTMs attached; track-utm picks them up there and the
// usual chain carries them into checkout metadata, GA4 and the Discord alert.
//
// The browser keeps the original Referer across the redirect, so the
// referrer fallback still sees youtube.com even if the UTMs were stripped.
//
// Add a path here AND to the [[edge_functions]] block for this function in
// netlify.toml (and to track-utm's excludedPath).
const CAMPAIGN_LINKS = {
  "/smosh": {
    utm_source: "youtube",
    utm_medium: "video",
    utm_campaign: "smosh",
    utm_content: "description",
  },
  "/smosh/pinned": {
    utm_source: "youtube",
    utm_medium: "video",
    utm_campaign: "smosh",
    utm_content: "pinned_comment",
  },
};

export default async function campaignLinks(request) {
  const requestUrl = new URL(request.url);
  const path = requestUrl.pathname.replace(/\/+$/, "").toLowerCase() || "/";
  // A mistyped sub-path (/smosh/pined) still lands with the parent's UTMs
  // rather than on the 404 page.
  const utms = CAMPAIGN_LINKS[path] ?? CAMPAIGN_LINKS["/" + path.split("/")[1]];
  if (!utms) return;

  const target = new URL("/", request.url);
  for (const [key, value] of Object.entries(utms)) {
    target.searchParams.set(key, value);
  }

  console.log(`🔗 ${path} → ${target.pathname}${target.search}`);

  return new Response(null, {
    status: 302,
    headers: {
      Location: target.toString(),
      "Cache-Control": "no-store, no-cache",
    },
  });
}
