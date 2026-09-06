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

function getClientId(gaCookie) {
  if (gaCookie) {
    const parts = gaCookie.split(".");
    if (parts.length >= 4) return `${parts[2]}.${parts[3]}`;
  }
  return `${Math.floor(Math.random() * 2147483647)}.${Math.floor(Date.now() / 1000)}`;
}

// checkout_flow_assigned predates the payment-link retirement, when /buy split
// traffic between two checkout arms. The name and param are kept so the event
// remains one continuous "clicked a Buy button" series in GA4 reports.
async function sendGA4Event(clientId, gaSessionId, gaSessionNumber) {
  if (!GA_MEASUREMENT_ID || !GA_API_SECRET) {
    if (IS_DEV) console.log("⚠️ GA4 not configured, skipping checkout_flow_assigned");
    return;
  }

  const params = { checkout_flow: "custom_checkout", engagement_time_msec: 1 };
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
    console.log(`✅ GA4 checkout_flow_assigned → ${res.status}`);
  } catch (err) {
    console.error("❌ GA4 event failed:", err);
  }
}

export default async function buyHandler(request, context) {
  if (request.method !== "GET") return;

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

  // Fire GA4 event in background — doesn't block the redirect
  context.waitUntil(sendGA4Event(clientId, gaSessionId, gaSessionNumber));

  // Forward tracking params (only — no junk) on the /checkout redirect:
  // track-utm is excluded on /buy (this function owns the path), so a tagged
  // link pointing directly at /buy?utm_source=... would otherwise lose its
  // UTMs. track-utm picks them up on /checkout and writes the utm_data cookie.
  const requestUrl = new URL(request.url);
  const checkoutUrl = new URL("/checkout", request.url);
  for (const k of TRACKING_KEYS) {
    const v = requestUrl.searchParams.get(k);
    if (v) checkoutUrl.searchParams.set(k, v);
  }

  console.log(`🛒 /buy → ${checkoutUrl.pathname}${checkoutUrl.search}`);

  return new Response(null, {
    status: 302,
    headers: {
      Location: checkoutUrl.toString(),
      "Cache-Control": "no-store, no-cache",
    },
  });
}
