import { getStore } from "@netlify/blobs";

const IS_DEV = Deno.env.get("NETLIFY_DEV") === "true";

const TRACKING_KEYS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "gclid", "fbclid", "client_reference_id",
];

const GA_MEASUREMENT_ID = IS_DEV
  ? Deno.env.get("GA4_MEASUREMENT_ID_DEV")
  : Deno.env.get("GA4_MEASUREMENT_ID");
const GA_API_SECRET = IS_DEV
  ? Deno.env.get("GA4_API_SECRET_DEV")
  : Deno.env.get("GA4_API_SECRET");
const PAYMENT_LINK_URL = IS_DEV
  ? Deno.env.get("REACT_APP_STRIPE_TEST_URL")
  : Deno.env.get("REACT_APP_STRIPE_PROD_URL");
const CHECKOUT_ROLLOUT = Deno.env.get("VITE_CHECKOUT_ROLLOUT") ?? "";

function getAssignedFlow(existingFlow) {
  if (CHECKOUT_ROLLOUT === "100") return { flow: "custom_checkout", isNew: false };
  if (!CHECKOUT_ROLLOUT || CHECKOUT_ROLLOUT === "off") return { flow: "payment_link", isNew: false };
  if (existingFlow === "custom_checkout" || existingFlow === "payment_link") {
    return { flow: existingFlow, isNew: false };
  }
  const pct = parseInt(CHECKOUT_ROLLOUT, 10);
  const flow = !isNaN(pct) && Math.random() * 100 < pct ? "custom_checkout" : "payment_link";
  return { flow, isNew: true };
}

function getClientId(gaCookie) {
  if (gaCookie) {
    const parts = gaCookie.split(".");
    if (parts.length >= 4) return `${parts[2]}.${parts[3]}`;
  }
  return `${Math.floor(Math.random() * 2147483647)}.${Math.floor(Date.now() / 1000)}`;
}

function buildPaymentLinkUrl(request, utmData) {
  const requestUrl = new URL(request.url);
  const target = new URL(PAYMENT_LINK_URL);

  const hasTrackingInUrl = TRACKING_KEYS.some((k) => requestUrl.searchParams.has(k));

  if (hasTrackingInUrl) {
    requestUrl.searchParams.forEach((v, k) => target.searchParams.set(k, v));
  } else if (utmData) {
    const skip = new Set(["none", "unknown", "direct"]);
    TRACKING_KEYS.forEach((k) => {
      if (utmData[k] && !skip.has(utmData[k])) target.searchParams.set(k, utmData[k]);
    });
  }

  return target.toString();
}

// Server-side payment-link attribution capture. The webhook is the only
// pipeline stage guaranteed to run for a PL purchase (the buyer may never
// return to /thankyou), but it can only read session metadata — which nothing
// populates server-side for payment links. So: persist this click's
// attribution to Blobs keyed by a minted client_reference_id; Stripe carries
// the id onto the checkout session, and stripe-webhooks.js copies the blob
// into session metadata when the purchase completes. Fail-open: on any Blobs
// error the redirect proceeds without the id (browser-side capture still runs).
async function attachPaymentLinkAttribution(target, request, utmData) {
  if (target.searchParams.has("client_reference_id")) return;

  const attribution = {};
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
    const v = target.searchParams.get(k); // URL-vs-cookie already resolved by buildPaymentLinkUrl
    if (v) attribution[k] = v;
  }
  const referrer =
    (utmData?.referrer && utmData.referrer !== "none" ? utmData.referrer : null) ||
    request.headers.get("referer") ||
    null;
  if (referrer) attribution.referrer = referrer.slice(0, 500);
  if (!Object.keys(attribution).length) return;

  try {
    const attrId = `attr_${crypto.randomUUID()}`;
    await getStore("pl-attribution").set(attrId, JSON.stringify(attribution));
    target.searchParams.set("client_reference_id", attrId);
  } catch (err) {
    console.warn("⚠️ PL attribution blob write failed (continuing):", err.message);
  }
}

async function sendGA4Event(clientId, flow, gaSessionId, gaSessionNumber) {
  if (!GA_MEASUREMENT_ID || !GA_API_SECRET) {
    if (IS_DEV) console.log("⚠️ GA4 not configured, skipping checkout_flow_assigned");
    return;
  }

  const params = { checkout_flow: flow, engagement_time_msec: 1 };
  if (gaSessionId) params.session_id = gaSessionId;
  if (gaSessionNumber) params.ga_session_number = gaSessionNumber;

  try {
    const res = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          events: [{ name: "checkout_flow_assigned", params }],
        }),
      }
    );
    console.log(`✅ GA4 checkout_flow_assigned (${flow}) → ${res.status}`);
  } catch (err) {
    console.error("❌ GA4 event failed:", err);
  }
}

export default async function buyHandler(request, context) {
  if (request.method !== "GET") return;

  if (!PAYMENT_LINK_URL) {
    console.error("❌ PAYMENT_LINK_URL not configured — falling through to SPA");
    return;
  }

  const existingFlow = await context.cookies.get("checkout_flow");
  const { flow, isNew } = getAssignedFlow(existingFlow);

  console.log(`🛒 /buy → ${flow} (${isNew ? "new assignment" : "returning"}, rollout="${CHECKOUT_ROLLOUT}")`);

  // GA4 session identifiers — same extraction as track-conversions.js
  const gaCookie = await context.cookies.get("_ga");
  const clientId = getClientId(gaCookie);
  const gaPropertyKey = GA_MEASUREMENT_ID ? `_ga_${GA_MEASUREMENT_ID.replace(/^G-/, "")}` : null;
  const gaSessionCookie = gaPropertyKey ? await context.cookies.get(gaPropertyKey) : null;
  let gaSessionId = null;
  let gaSessionNumber = null;
  if (gaSessionCookie) {
    const parts = gaSessionCookie.split(".");
    const rawSeg = parts[2] ?? "";
    gaSessionId = rawSeg.replace(/^s/, "").split("!")[0] || null;
    gaSessionNumber = parts[3] ? parseInt(parts[3], 10) : null;
  }

  // UTM data from cookie (set by track-utm.js on earlier page loads)
  let utmData = null;
  const encodedUtmData = await context.cookies.get("utm_data");
  if (encodedUtmData) {
    try { utmData = JSON.parse(atob(encodedUtmData)); } catch { /* ignore corrupt cookie */ }
  }

  // Fire GA4 event in background — doesn't block the redirect
  context.waitUntil(sendGA4Event(clientId, flow, gaSessionId, gaSessionNumber));

  let redirectUrl;
  if (flow === "custom_checkout") {
    // Forward tracking params (only — no junk) on the /checkout redirect:
    // track-utm is excluded on /buy (this function owns the path), so a tagged
    // link pointing directly at /buy?utm_source=... would otherwise lose its
    // UTMs on the custom-checkout arm. track-utm picks them up on /checkout
    // and writes the utm_data cookie.
    const requestUrl = new URL(request.url);
    const checkoutUrl = new URL("/checkout", request.url);
    for (const k of TRACKING_KEYS) {
      const v = requestUrl.searchParams.get(k);
      if (v) checkoutUrl.searchParams.set(k, v);
    }
    redirectUrl = checkoutUrl.toString();
  } else {
    const target = new URL(buildPaymentLinkUrl(request, utmData));
    await attachPaymentLinkAttribution(target, request, utmData);
    redirectUrl = target.toString();
  }

  const headers = new Headers({
    Location: redirectUrl,
    "Cache-Control": "no-store, no-cache",
  });

  if (isNew) {
    headers.append(
      "Set-Cookie",
      `checkout_flow=${flow}; Path=/; Max-Age=${30 * 24 * 60 * 60}; SameSite=Lax; Secure`
    );
  }

  return new Response(null, { status: 302, headers });
}
