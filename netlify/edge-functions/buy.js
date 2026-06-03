const IS_DEV = Deno.env.get("NETLIFY_DEV") === "true";

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

  const trackingKeys = [
    "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
    "gclid", "fbclid", "client_reference_id",
  ];
  const hasTrackingInUrl = trackingKeys.some((k) => requestUrl.searchParams.has(k));

  if (hasTrackingInUrl) {
    requestUrl.searchParams.forEach((v, k) => target.searchParams.set(k, v));
  } else if (utmData) {
    const skip = new Set(["none", "unknown", "direct"]);
    trackingKeys.forEach((k) => {
      if (utmData[k] && !skip.has(utmData[k])) target.searchParams.set(k, utmData[k]);
    });
  }

  return target.toString();
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

  const redirectUrl =
    flow === "custom_checkout"
      ? new URL("/checkout", request.url).toString()
      : buildPaymentLinkUrl(request, utmData);

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
