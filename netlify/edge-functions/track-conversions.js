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

    // For payment links, UTMs travel in the redirect URL but Stripe doesn't
    // auto-populate session.metadata from URL params. Write them now so the
    // shipping-label Discord notification (fired from the Stripe webhook ~2-4 s
    // later, after Shippo API calls) can read them from fresh session metadata.
    if (stripeData.payment_link && !stripeData.metadata?.utm_source) {
      const pQp = new URL(request.url).searchParams;
      const utmSource = pQp.get("utm_source");
      if (utmSource) {
        const utmFields = { "metadata[utm_source]": utmSource };
        const utmMedium = pQp.get("utm_medium");
        const utmCampaign = pQp.get("utm_campaign");
        const utmContent = pQp.get("utm_content");
        if (utmMedium) utmFields["metadata[utm_medium]"] = utmMedium;
        if (utmCampaign) utmFields["metadata[utm_campaign]"] = utmCampaign;
        if (utmContent) utmFields["metadata[utm_content]"] = utmContent;
        try {
          await fetch(`https://api.stripe.com/v1/checkout/sessions/${checkoutSessionId}`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(utmFields).toString(),
          });
          console.log("✅ Payment link UTMs written to Stripe session metadata");
        } catch (err) {
          console.error("⚠️ Failed to write UTMs to Stripe metadata:", err.message);
        }
      }
    }

    const checkoutFlow = await context.cookies.get("checkout_flow");

    // Send UTM + Revenue Data to GA4, Facebook, and Discord
    await postSaleToDiscord(request, stripeData, clientId, utmData, checkoutSessionId);
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

async function postSaleToDiscord(request, stripeData, clientId, utmData, checkoutSessionId) {
  if (!ALERT_WEBHOOK_URL) return;

  const url = new URL(request.url);
  const qp = url.searchParams;
  const isPaymentLink = !!stripeData.payment_link;

  // URL params take priority (explicit tracking on the payment link click).
  // Fall back to the utm_data cookie, which was set when the user first
  // arrived on the site (e.g. from TikTok bio → lovecareermagic.com → buy).
  const cookieSrc = utmData?.utm_source !== "direct" ? utmData?.utm_source : null;
  const cookieMedium = utmData?.utm_medium !== "none" ? utmData?.utm_medium : null;
  const cookieCampaign = utmData?.utm_campaign !== "none" ? utmData?.utm_campaign : null;
  const rawSrc = qp.get("utm_source") || cookieSrc;
  const rawMedium = qp.get("utm_medium") || cookieMedium;
  const rawCampaign = qp.get("utm_campaign") || cookieCampaign;

  const emoji = SOURCE_EMOJI[(rawSrc || "").toLowerCase()] || "🔗";
  const parts = [rawSrc, rawMedium, rawCampaign].filter(Boolean);
  const source = parts.length ? `${emoji} ${parts.join(" / ")}` : "—";

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

// Netlify Edge Function Config
export const config = {
  path: "/thankyou",
};
