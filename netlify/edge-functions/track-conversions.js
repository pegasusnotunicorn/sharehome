import crypto from "node:crypto";
import { getStore } from "@netlify/blobs";

const IS_DEV = Deno.env.get("NETLIFY_DEV") === "true";
const STRIPE_SECRET_KEY = IS_DEV
  ? Deno.env.get("STRIPE_SECRET_KEY_DEV")
  : Deno.env.get("STRIPE_SECRET_KEY");

// GOOGLE ANALYTICS
const GA_MEASUREMENT_ID = IS_DEV
  ? Deno.env.get("GA4_MEASUREMENT_ID_DEV")
  : Deno.env.get("GA4_MEASUREMENT_ID");
const GA_API_SECRET = IS_DEV
  ? Deno.env.get("GA4_API_SECRET_DEV")
  : Deno.env.get("GA4_API_SECRET");

// FACEBOOK
const FACEBOOK_PIXEL_ID = Deno.env.get("FACEBOOK_PIXEL_ID");
const FACEBOOK_ACCESS_TOKEN = Deno.env.get("FACEBOOK_ACCESS_TOKEN");
const FACEBOOK_API_VERSION = Deno.env.get("FACEBOOK_API_VERSION");

// DISCORD
const ALERT_WEBHOOK_URL = Deno.env.get("ALERT_WEBHOOK_URL");
const STRIPE_ACCOUNT_ID = Deno.env.get("STRIPE_ACCOUNT_ID");
const GA4_PROPERTY_ID = "274391575";
const SOURCE_EMOJI = {
  instagram: "📸", ig: "📸",
  youtube: "🎬", yt: "🎬",
  email: "📧", newsletter: "📧",
  google: "🔍",
  facebook: "👥", fb: "👥",
  twitter: "🐦", x: "🐦",
  tiktok: "🎵", tt: "🎵",
  unicornwithwings: "🦄",
};

const isBlankUtm = (v) => !v || v === "none" || v === "unknown";

// Last-resort attribution: classify the stored HTTP referrer the way GA4 does
// client-side. Covers organic traffic that carries no UTM params — 3 of the 8
// paid sessions 6/26–7/2 were google/organic and showed "—" without this.
const REFERRER_SOURCES = [
  [/(^|\.)instagram\.com$/, "ig", "social"],
  [/(^|\.)tiktok\.com$/, "tt", "social"],
  [/(^|\.)youtube\.com$|(^|\.)youtu\.be$/, "yt", "social"],
  [/(^|\.)twitter\.com$|(^|\.)t\.co$|(^|\.)x\.com$/, "twitter", "social"],
  [/(^|\.)facebook\.com$|(^|\.)fb\.com$/, "fb", "social"],
  [/(^|\.)google\.[a-z.]+$/, "google", "organic"],
  [/(^|\.)bing\.com$/, "bing", "organic"],
  [/(^|\.)duckduckgo\.com$/, "duckduckgo", "organic"],
  [/(^|\.)unicornwithwings\.com$/, "unicornwithwings", "referral"],
];

function inferSourceFromReferrer(referrer) {
  if (!referrer || referrer === "none") return null;
  try {
    const host = new URL(referrer).hostname;
    for (const [re, source, medium] of REFERRER_SOURCES) {
      if (re.test(host)) return { source, medium };
    }
    return null;
  } catch { return null; }
}

// Single place attribution is resolved for Discord, GA4, Facebook, and the
// payment-link metadata write. Priority: /thankyou URL params (Stripe payment-
// link passthrough) → utm_data cookie (set at first site arrival) → Stripe
// session metadata (written at custom-checkout creation; survives cookie loss)
// → referrer classification. `inferred` marks referrer-derived sources so
// alerts can distinguish explicit tags from educated guesses.
function resolveAttribution(qp, utmData, stripeData) {
  const meta = stripeData?.metadata || {};
  const notBlank = (v) => (isBlankUtm(v) || v === "direct" ? null : v);
  const pick = (key) => qp.get(key) || notBlank(utmData?.[key]) || notBlank(meta[key]) || null;

  const referrer =
    (utmData?.referrer && utmData.referrer !== "none" ? utmData.referrer : null) ||
    meta.referrer ||
    null;

  let source = pick("utm_source");
  let medium = pick("utm_medium");
  let inferred = false;
  if (!source) {
    const ref = inferSourceFromReferrer(referrer);
    if (ref) {
      source = ref.source;
      medium = medium ?? ref.medium;
      inferred = true;
    }
  }

  return {
    source,
    medium,
    campaign: pick("utm_campaign"),
    term: pick("utm_term"),
    content: pick("utm_content"),
    referrer,
    inferred,
  };
}

const CONVERSION_BLOB_BLOAT_THRESHOLD = 5000;
const CONVERSION_BLOB_BLOAT_DEDUPE_KEY = "_size_alert_sent";
const CONVERSION_BLOB_BLOAT_DEDUPE_MS = 7 * 24 * 60 * 60 * 1000;

async function maybeAlertConversionBlobBloat(store) {
  if (Math.random() > 0.02) return;
  try {
    const flag = await store.get(CONVERSION_BLOB_BLOAT_DEDUPE_KEY);
    if (flag && Date.now() - Number(flag) < CONVERSION_BLOB_BLOAT_DEDUPE_MS) return;
    const { blobs = [] } = await store.list();
    if (blobs.length <= CONVERSION_BLOB_BLOAT_THRESHOLD) return;
    await store.set(CONVERSION_BLOB_BLOAT_DEDUPE_KEY, String(Date.now()));
    if (ALERT_WEBHOOK_URL) {
      await fetch(ALERT_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title: "🚨 Blob store growing large",
            description: `\`conversion-fired-sessions\` has ${blobs.length} entries (threshold ${CONVERSION_BLOB_BLOAT_THRESHOLD}). Consider pruning entries older than ~60 days. Suppressed for 7 days.`,
            color: 0xed4245,
            timestamp: new Date().toISOString(),
          }],
        }),
      });
    }
  } catch (err) {
    console.warn("⚠️ Blob bloat check failed:", err.message);
  }
}

// Atomic server-side dedup: onlyIfNew is a CAS write — succeeds exactly once
// even if concurrent requests race through the cookie check simultaneously.
// Fail-open: if Blobs is unreachable, we fall through to the cookie guard.
async function claimConversionSession(sessionId) {
  try {
    const store = getStore("conversion-fired-sessions");
    const { modified } = await store.set(sessionId, new Date().toISOString(), { onlyIfNew: true });
    if (modified) await maybeAlertConversionBlobBloat(store);
    return modified; // true = we own it; false = another request already claimed it
  } catch (err) {
    console.warn("⚠️ Blob claim unavailable, relying on cookie-only dedup:", err.message);
    return true; // fail-open
  }
}

const hashString = (value) =>
  value
    ? crypto
        .createHash("sha256")
        .update(value.trim().toLowerCase())
        .digest("hex")
    : undefined;

export default async function trackConversions(request, context) {
  try {
    console.log("🔄 Processing conversion for:", request.url);

    // Retrieve UTM Data and client_id from Netlify Edge Session
    const encodedUtmData = await context.cookies.get("utm_data");
    const fallbackClientId = await context.cookies.get("client_id");

    // Pull the real GA4 client_id + session_id from the gtag-set cookies so
    // the server-side be_purchase event stitches onto the user's existing
    // session instead of spawning a new orphan one.
    const gaCookie = await context.cookies.get("_ga");
    const gaClientId = gaCookie ? gaCookie.split(".").slice(-2).join(".") : null;
    const gaPropertyKey = GA_MEASUREMENT_ID
      ? `_ga_${GA_MEASUREMENT_ID.replace(/^G-/, "")}`
      : null;
    const gaSessionCookie = gaPropertyKey
      ? await context.cookies.get(gaPropertyKey)
      : null;
    // _ga_<id> cookie formats:
    //   GS1: "GS1.1.<session_id>.<session_num>..."
    //   GS2: "GS2.1.s<session_id>!<n>.<session_num>..."  (newer format)
    let gaSessionId = null;
    let gaSessionNumber = null;
    if (gaSessionCookie) {
      const parts = gaSessionCookie.split(".");
      const rawSeg = parts[2] ?? "";
      gaSessionId = rawSeg.replace(/^s/, "").split("!")[0] || null;
      gaSessionNumber = parts[3] ? parseInt(parts[3], 10) : null;
    }

    const clientId = gaClientId ?? fallbackClientId;

    let utmData = null;

    if (!encodedUtmData) {
      console.log(
        "⚠️ No UTM data found, sending blank conversions to GA4 and Facebook."
      );
      utmData = {
        utm_source: "direct",
        utm_medium: "none",
        utm_campaign: "none",
        utm_term: "none",
        utm_content: "none",
      };
    } else {
      try {
        utmData = JSON.parse(atob(encodedUtmData));
        console.log("✅ UTM Data Found:", JSON.stringify(utmData, null, 2));
      } catch (error) {
        console.error("❌ Error parsing UTM data:", error);
        utmData = {
          utm_source: "direct",
          utm_medium: "none",
          utm_campaign: "none",
          utm_term: "none",
          utm_content: "none",
        };
      }
    }

    // Extract Stripe Session ID
    const url = new URL(request.url);
    const checkoutSessionId = url.searchParams.get("checkout_session_id") ?? url.searchParams.get("session_id");

    if (!checkoutSessionId) {
      console.log("⚠️ No Stripe session ID found, skipping tracking.");
      return context.rewrite(new URL("/index.html", request.url));
    }

    // Idempotency: /thankyou can be hit multiple times via refresh,
    // back/forward, or React strict mode. Without this guard, GA4 and
    // Facebook receive duplicate be_purchase events that inflate revenue
    // counts (one $34.99 sale appeared as 4 events totaling $139.96).
    const alreadyFired = await context.cookies.get("purchase_fired");
    if (alreadyFired === checkoutSessionId) {
      console.log(
        "⏭️ Conversions already fired for session",
        checkoutSessionId,
        "— skipping."
      );
      return context.rewrite(new URL("/index.html", request.url));
    }

    // Fetch Stripe Checkout Details
    const stripeData = await getStripeCheckoutDetails(checkoutSessionId);
    if (!stripeData.id) {
      console.error("❌ Failed to retrieve Stripe data.");
      return context.rewrite(new URL("/index.html", request.url));
    }

    if (stripeData.payment_status !== "paid" && stripeData.payment_status !== "no_payment_required") {
      console.log(`⚠️ Session ${checkoutSessionId} not paid (status: ${stripeData.payment_status}), skipping tracking.`);
      return context.rewrite(new URL("/index.html", request.url));
    }

    // Server-side atomic claim — catches concurrent requests that all arrive
    // before the purchase_fired cookie is set in any response.
    const claimed = await claimConversionSession(checkoutSessionId);
    if (!claimed) {
      console.log(`⏭️ Conversion already claimed for session ${checkoutSessionId} — skipping (concurrent duplicate).`);
      return context.rewrite(new URL("/index.html", request.url));
    }

    if (IS_DEV) console.log("✅ Stripe Data Retrieved:", stripeData);

    const attribution = resolveAttribution(url.searchParams, utmData, stripeData);
    console.log("🧭 Resolved attribution:", JSON.stringify(attribution));

    // For payment links, Stripe doesn't auto-populate session.metadata from URL
    // params. Persist explicit UTMs + raw referrer now so the shipping-label
    // Discord notification (fired from the Stripe webhook ~2-4 s later, after
    // Shippo API calls) can read attribution from fresh session metadata.
    // Inferred sources are NOT written as utm_source — metadata stays fact-only;
    // consumers re-infer from the stored referrer.
    if (stripeData.payment_link && !stripeData.metadata?.utm_source) {
      const utmFields = {};
      if (attribution.source && !attribution.inferred) {
        utmFields["metadata[utm_source]"] = attribution.source;
        if (attribution.medium) utmFields["metadata[utm_medium]"] = attribution.medium;
        if (attribution.campaign) utmFields["metadata[utm_campaign]"] = attribution.campaign;
        if (attribution.content) utmFields["metadata[utm_content]"] = attribution.content;
      }
      if (attribution.referrer && !stripeData.metadata?.referrer) {
        utmFields["metadata[referrer]"] = attribution.referrer.slice(0, 500);
      }
      if (Object.keys(utmFields).length) {
        try {
          await fetch(`https://api.stripe.com/v1/checkout/sessions/${checkoutSessionId}`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(utmFields).toString(),
          });
          console.log("✅ Payment link attribution written to Stripe session metadata");
        } catch (err) {
          console.error("⚠️ Failed to write UTMs to Stripe metadata:", err.message);
        }
      }
    }

    const checkoutFlow = await context.cookies.get("checkout_flow");

    // Send UTM + Revenue Data to GA4, Facebook, and Discord
    await postSaleToDiscord(request, stripeData, clientId, attribution, checkoutSessionId);
    await sendToGA4(
      clientId,
      gaSessionId,
      gaSessionNumber,
      attribution,
      stripeData,
      checkoutSessionId,
      request,
      checkoutFlow
    );
    await sendToFacebook(clientId, attribution, utmData, stripeData, request, context);

    context.cookies.set({
      name: "purchase_fired",
      value: checkoutSessionId,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "Lax",
      secure: true,
      httpOnly: true,
    });

    return context.rewrite(new URL("/index.html", request.url));
  } catch (error) {
    console.error("❌ Error in track-conversions:", error);
    return context.rewrite(new URL("/index.html", request.url));
  }
}

function parseUserAgent(ua) {
  if (!ua) return null;
  const isTablet = /iPad|tablet/i.test(ua) && !/Mobile/i.test(ua);
  const isMobile = !isTablet && /iPhone|iPad|iPod|Android|Mobile|IEMobile/i.test(ua);
  const deviceEmoji = isMobile ? "📱" : isTablet ? "📟" : "🖥️";
  const deviceLabel = isMobile ? "Mobile" : isTablet ? "Tablet" : "Desktop";
  let browser = "Unknown";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(ua)) browser = "Opera";
  else if (/CriOS\//i.test(ua)) browser = "Chrome (iOS)";
  else if (/FxiOS\//i.test(ua)) browser = "Firefox (iOS)";
  else if (/SamsungBrowser/i.test(ua)) browser = "Samsung";
  else if (/Chrome\/[0-9]/.test(ua) && !/Chromium/i.test(ua)) browser = "Chrome";
  else if (/Firefox\/[0-9]/.test(ua)) browser = "Firefox";
  else if (/Safari\/[0-9]/.test(ua)) browser = "Safari";
  let os = "Unknown";
  if (/iPhone/i.test(ua)) os = "iOS";
  else if (/iPad/i.test(ua)) os = "iPadOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Windows NT/i.test(ua)) os = "Windows";
  else if (/Mac OS X/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";
  return `${deviceEmoji} ${deviceLabel} · ${os} · ${browser}`;
}

function stripeSessionUrl(sessionId) {
  if (!STRIPE_ACCOUNT_ID) return "https://dashboard.stripe.com";
  const isTest = sessionId.startsWith("cs_test_");
  return `https://dashboard.stripe.com/${STRIPE_ACCOUNT_ID}${isTest ? "/test" : ""}/workbench/inspector/${sessionId}`;
}

async function postSaleToDiscord(request, stripeData, clientId, attribution, checkoutSessionId) {
  if (!ALERT_WEBHOOK_URL) return;

  const isPaymentLink = !!stripeData.payment_link;

  const emoji = SOURCE_EMOJI[(attribution.source || "").toLowerCase()] || "🔗";
  const parts = [attribution.source, attribution.medium, attribution.campaign].filter(Boolean);
  const source = parts.length
    ? `${emoji} ${parts.join(" / ")}${attribution.inferred ? " (ref)" : ""}`
    : "—";

  const flow = isPaymentLink ? "Payment Link" : "Custom Checkout";
  const device = parseUserAgent(request.headers.get("user-agent"));
  const customerName = stripeData.customer_details?.name || "—";
  const customerEmail = stripeData.customer_details?.email || "—";
  const currency = (stripeData.currency || "usd").toUpperCase();
  const revenue = ((stripeData.amount_total ?? 0) / 100).toFixed(2);

  const lineItems = stripeData.line_items?.data ?? [];
  const orderLines = lineItems.map((li) => {
    const name = li.description || "item";
    const qty = li.quantity || 1;
    const price = ((li.amount_total ?? 0) / 100).toFixed(2);
    return `• ${qty}× **${name}** — $${price} ${currency}`;
  });
  orderLines.push(`**Total: $${revenue} ${currency}**`);

  const ga4Url = `https://analytics.google.com/analytics/web/#/p${GA4_PROPERTY_ID}/reports/user-explorer`;
  const ga4Value = clientId ? `[\`${clientId}\`](${ga4Url})` : "—";
  const sessionLink = stripeSessionUrl(checkoutSessionId);

  try {
    await fetch(ALERT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [{
          title: `💳 Sale — $${revenue} ${currency}`,
          url: sessionLink,
          color: 0x5865f2,
          fields: [
            { name: "Customer", value: `**${customerName}**\n${customerEmail}`, inline: true },
            { name: "Order", value: orderLines.join("\n"), inline: false },
            { name: "Source", value: source, inline: true },
            { name: "Flow", value: flow, inline: true },
            { name: "Device", value: device ?? "—", inline: true },
            { name: "GA4 Client", value: ga4Value, inline: false },
            { name: "Quick links", value: `[Stripe session](${sessionLink})`, inline: false },
          ],
          timestamp: new Date().toISOString(),
        }],
      }),
    });
  } catch (err) {
    console.error("⚠️ Failed to post sale to Discord:", err.message);
  }
}

// Fetch Stripe Checkout Session
async function getStripeCheckoutDetails(sessionId) {
  try {
    if (IS_DEV) console.log("🔍 Fetching Stripe session:", sessionId);

    const response = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}?expand[]=line_items`,
      {
        headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
      }
    );

    const stripeData = await response.json();
    return stripeData;
  } catch (error) {
    console.error("❌ Error fetching Stripe data:", error);
    return {};
  }
}

// Send Data to GA4
async function sendToGA4(
  clientId,
  sessionId,
  sessionNumber,
  attribution,
  stripeData,
  transactionId,
  request,
  checkoutFlow
) {
  const url = new URL(request.url);
  const queryParams = url.searchParams;
  const utm_source = attribution.source ?? "direct";
  const utm_campaign = attribution.campaign ?? "none";
  const utm_medium = attribution.medium ?? "none";
  const utm_term = attribution.term ?? "none";
  const utm_content = attribution.content ?? "none";
  const checkout_flow = checkoutFlow ?? queryParams.get("checkout_flow") ?? "unknown";

  const revenue = stripeData.amount_total / 100;

  const items = (stripeData.line_items?.data ?? []).map((li) => ({
    item_id: li.price?.id ?? li.price?.product ?? "lcm_game",
    item_name: li.description ?? "Love Career Magic",
    quantity: li.quantity ?? 1,
    price:
      ((li.price?.unit_amount ?? li.amount_total / (li.quantity || 1)) || 0) /
      100,
  }));

  const params = {
    currency: "USD",
    value: revenue,
    transaction_id: transactionId,
    items,
    source: utm_source,
    campaign: utm_campaign,
    medium: utm_medium,
    term: utm_term,
    content: utm_content,
    checkout_flow,
    engagement_time_msec: 1,
  };
  if (sessionId) params.session_id = sessionId;
  if (sessionNumber) params.ga_session_number = sessionNumber;

  const ga4Data = {
    client_id: clientId ?? crypto.randomUUID(),
    events: [
      {
        name: "purchase",
        params,
      },
    ],
  };

  console.log("📡 Sending GA4 event", JSON.stringify(ga4Data, null, 2));

  try {
    const res = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ga4Data),
      }
    );

    if (res.ok && res.status === 204) {
      console.log("✅ GA4 Event Sent Successfully");
    } else {
      console.error("❌ GA4 Event Failed:", res.status, res.statusText);
      const errorText = await res.text();
      console.error("📄 GA4 Response Body:", errorText);
    }
  } catch (error) {
    console.error("❌ Error Sending to GA4:", error);
  }
}

async function sendToFacebook(clientId, attribution, utmData, stripeData, request, context) {
  console.log(`📡 Sending FB event`);

  const fbClientId = await context.cookies.get("_fbp");
  const fbClickId = await context.cookies.get("_fbc");

  const customerEmail = stripeData.customer_details?.email;
  const [customerFirstName, customerLastName] =
    stripeData.customer_details?.name?.split(" ") || [];
  const customerPhone = stripeData.customer_details?.phone;
  const customerId = stripeData.customer;
  const revenue = stripeData.amount_total / 100;

  const url = new URL(request.url);
  const queryParams = url.searchParams;
  const utm_source = attribution.source ?? "direct";
  const utm_campaign = attribution.campaign ?? "none";
  const client_reference_id =
    queryParams.get("client_reference_id") ?? utmData.client_reference_id;

  const fbData = {
    event_name: "Purchase",
    event_time: Math.floor(Date.now() / 1000),
    action_source: "website",
    event_source_url: request.url,
    event_id: fbClientId || crypto.randomUUID(), // Helps with deduplication

    user_data: {
      client_ip_address: request.headers.get("x-forwarded-for") || "0.0.0.0",
      client_user_agent: request.headers.get("user-agent"),
      em: hashString(customerEmail), // Hashed email
      fn: hashString(customerFirstName), // Hashed first name
      ln: hashString(customerLastName), // Hashed last name
      ph: hashString(customerPhone), // Hashed phone number
      external_id: hashString(customerId), // Optional if you have a user ID
      fbc: client_reference_id ?? fbClickId, // Facebook Click ID (if available)
      fbp: fbClientId, // Facebook Pixel ID (if available)
    },

    custom_data: {
      value: revenue,
      currency: "USD",
      attribution_value: utm_source, // UTM source as attribution value
      attribution_model: "last_click", // Example attribution model
      campaign_id: utm_campaign,
      visit_time: Math.floor(Date.now() / 1000),
    },
  };

  console.log(
    "📡 Sending FB Conversion Event:",
    JSON.stringify(fbData, null, 2)
  );

  try {
    const res = await fetch(
      `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${FACEBOOK_PIXEL_ID}/events?access_token=${FACEBOOK_ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [fbData] }),
      }
    );

    if (res.ok) {
      console.log("✅ Facebook Conversion Event Sent Successfully");
    } else {
      console.error("❌ Facebook Event Failed:", res.status, res.statusText);
      const errorText = await res.text();
      console.error("📄 FB Response Body:", errorText);
    }
  } catch (error) {
    console.error("❌ Error Sending to Facebook:", error);
  }
}

// Netlify Edge Function Config
export const config = {
  path: "/thankyou",
};
