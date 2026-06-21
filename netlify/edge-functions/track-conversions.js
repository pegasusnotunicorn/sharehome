import crypto from "node:crypto";

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

const SOURCE_EMOJI = {
  instagram: "📸", ig: "📸",
  youtube: "🎬", yt: "🎬",
  email: "📧", newsletter: "📧",
  google: "🔍",
  facebook: "👥", fb: "👥",
  twitter: "🐦", x: "🐦",
  tiktok: "🎵", tt: "🎵",
};

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

    if (IS_DEV) console.log("✅ Stripe Data Retrieved:", stripeData);

    const checkoutFlow = await context.cookies.get("checkout_flow");

    // Send UTM + Revenue Data to GA4, Facebook, and Discord
    await sendToGA4(
      clientId,
      gaSessionId,
      gaSessionNumber,
      utmData,
      stripeData,
      checkoutSessionId,
      request,
      checkoutFlow
    );
    await sendToFacebook(clientId, utmData, stripeData, request, context);
    await postSaleToDiscord(stripeData, checkoutFlow, utmData, checkoutSessionId, request);

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
  utmData,
  stripeData,
  transactionId,
  request,
  checkoutFlow
) {
  const url = new URL(request.url);
  const queryParams = url.searchParams;
  const utm_source = queryParams.get("utm_source") ?? utmData.utm_source;
  const utm_campaign = queryParams.get("utm_campaign") ?? utmData.utm_campaign;
  const utm_medium = queryParams.get("utm_medium") ?? utmData.utm_medium;
  const utm_term = queryParams.get("utm_term") ?? utmData.utm_term;
  const utm_content = queryParams.get("utm_content") ?? utmData.utm_content;
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

async function sendToFacebook(clientId, utmData, stripeData, request, context) {
  console.log(`📡 Sending FB event`);

  const fbClientId = await context.cookies.get("_fbp");
  const fbClickId = await context.cookies.get("_fbc");

  const customerEmail = stripeData.customer_details?.email;
  const [customerFirstName, customerLastName] =
    stripeData.customer_details?.name?.split(" ") || [];
  const customerPhone = stripeData.customer_details?.phone;
  const customerId = stripeData.customer;
  const revenue = stripeData.amount_total / 100;

  // check the request.url for query params
  const url = new URL(request.url);
  const queryParams = url.searchParams;
  const utm_source = queryParams.get("utm_source") ?? utmData.utm_source;
  const utm_campaign = queryParams.get("utm_campaign") ?? utmData.utm_campaign;
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

async function postSaleToDiscord(stripeData, checkoutFlow, utmData, transactionId, request) {
  if (!ALERT_WEBHOOK_URL) return;

  const url = new URL(request.url);
  const qp = url.searchParams;

  // Priority order:
  // 1. URL params — Stripe passes them through from the payment link URL
  // 2. Stripe session metadata — set by create-checkout-session for custom checkout
  // 3. utm_data cookie — fallback for both (1-day TTL, may be expired)
  const src = (qp.get("utm_source") ?? stripeData.metadata?.utm_source ?? utmData?.utm_source ?? "").toLowerCase();
  const medium = qp.get("utm_medium") ?? stripeData.metadata?.utm_medium ?? utmData?.utm_medium ?? "";
  const campaign = qp.get("utm_campaign") ?? stripeData.metadata?.utm_campaign ?? utmData?.utm_campaign ?? "";
  const content = qp.get("utm_content") ?? stripeData.metadata?.utm_content ?? utmData?.utm_content ?? "";

  const skip = new Set(["none", "unknown", "direct", ""]);
  const emoji = SOURCE_EMOJI[src] || "🔗";
  const parts = [src, medium, campaign, content].filter((p) => !skip.has(p));
  const sourceStr = parts.length ? `${emoji} ${parts.join(" / ")}` : "— (direct / unknown)";

  const isPaymentLink = !!stripeData.payment_link;
  const flow = checkoutFlow ?? (isPaymentLink ? "payment_link" : "custom_checkout");
  const flowLabel = flow === "payment_link" ? "Payment Link" : flow === "custom_checkout" ? "Custom Checkout" : flow;

  const revenue = ((stripeData.amount_total ?? 0) / 100).toFixed(2);
  const currency = (stripeData.currency || "usd").toUpperCase();
  const customerName = stripeData.customer_details?.name || "—";
  const customerEmail = stripeData.customer_details?.email || null;
  const customerValue = customerEmail ? `${customerName}\n${customerEmail}` : customerName;

  const isTest = transactionId?.startsWith("cs_test_");
  const sessionUrl = STRIPE_ACCOUNT_ID
    ? `https://dashboard.stripe.com/${STRIPE_ACCOUNT_ID}${isTest ? "/test" : ""}/workbench/inspector/${transactionId}`
    : "https://dashboard.stripe.com";

  try {
    await fetch(ALERT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [{
          title: `💳 Sale confirmed — $${revenue} ${currency}`,
          color: 0x57f287,
          fields: [
            { name: "Customer", value: customerValue, inline: true },
            { name: "Flow", value: flowLabel, inline: true },
            { name: "Source", value: sourceStr, inline: true },
            { name: "Quick links", value: `[Stripe session](${sessionUrl})`, inline: false },
          ],
          timestamp: new Date().toISOString(),
        }],
      }),
    });
    console.log("✅ Discord sale notification sent");
  } catch (err) {
    console.error("⚠️ Discord sale notification failed:", err.message);
  }
}

// Netlify Edge Function Config
export const config = {
  path: "/thankyou",
};
