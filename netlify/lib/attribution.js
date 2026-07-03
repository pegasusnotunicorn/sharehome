// Shared attribution helpers, imported by BOTH runtimes:
//   - Deno edge functions (netlify/edge-functions/*) via relative import
//   - Node functions (netlify/functions/*) bundled by esbuild
// Web-standard APIs only (URL, RegExp) — no runtime-specific imports here.

// "direct"/"none"/"unknown" are sentinel placeholders written by track-utm.js
// when a field was absent — never meaningful attribution.
export const isBlankAttribution = (v) =>
  !v || v === "none" || v === "unknown" || v === "direct";

export const SOURCE_EMOJI = {
  instagram: "📸", ig: "📸",
  youtube: "🎬", yt: "🎬",
  email: "📧", newsletter: "📧",
  google: "🔍", bing: "🔍", duckduckgo: "🦆",
  facebook: "👥", fb: "👥",
  twitter: "🐦", x: "🐦",
  tiktok: "🎵", tt: "🎵",
  unicornwithwings: "🦄",
};

// Last-resort attribution: classify the HTTP referrer the way GA4 does
// client-side. Covers organic traffic that carries no UTM params — during the
// June 2026 viral-TikTok wave, 15 of 34 sales arrived via google/organic.
// Order matters: specific hosts (mail.google.com) before broad domain rules.
export const REFERRER_SOURCES = [
  [/^mail\.google\.com$/, "email", "email"],
  [/(^|\.)instagram\.com$/, "ig", "social"],
  [/(^|\.)tiktok\.com$/, "tt", "social"],
  [/(^|\.)youtube\.com$|(^|\.)youtu\.be$/, "yt", "social"],
  [/(^|\.)twitter\.com$|(^|\.)t\.co$|(^|\.)x\.com$/, "twitter", "social"],
  [/(^|\.)facebook\.com$|(^|\.)fb\.com$/, "fb", "social"],
  // Anchored to the registrable domain (optional www.) so Google-hosted
  // services (docs.google.com, sites.google.com, google.blogspot.com) don't
  // classify as search. TLD limited to 2-3 chars plus optional 2-char country
  // suffix: google.com, google.de, google.co.uk, google.com.au all match.
  [/^(www\.)?google\.[a-z]{2,3}(\.[a-z]{2})?$/, "google", "organic"],
  [/(^|\.)bing\.com$/, "bing", "organic"],
  [/(^|\.)duckduckgo\.com$/, "duckduckgo", "organic"],
  [/(^|\.)unicornwithwings\.com$/, "unicornwithwings", "referral"],
];

export function inferSourceFromReferrer(referrer) {
  if (!referrer || referrer === "none") return null;
  try {
    const host = new URL(referrer).hostname;
    for (const [re, source, medium] of REFERRER_SOURCES) {
      if (re.test(host)) return { source, medium };
    }
    return null;
  } catch {
    return null;
  }
}

// Single definition of the Discord source line so the 💳 Sale alert and the
// 📦 Label alert can never render the same purchase differently.
export function formatSourceLine(source, medium, campaign, inferred) {
  const emoji = SOURCE_EMOJI[(source || "").toLowerCase()] || "🔗";
  const parts = [source, medium, campaign].filter(Boolean);
  return parts.length
    ? `${emoji} ${parts.join(" / ")}${inferred ? " (ref)" : ""}`
    : "—";
}
