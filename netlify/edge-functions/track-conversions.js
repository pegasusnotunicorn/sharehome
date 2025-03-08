import crypto from "crypto";

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
    const clientId = await context.cookies.get("client_id");

    if (!encodedUtmData) {
      console.log("⚠️ No UTM data found, skipping tracking.");
      return context.rewrite(new URL("/index.html", request.url));
    }

    const utmData = JSON.parse(atob(encodedUtmData));

    // Extract Stripe Session ID
    const url = new URL(request.url);
    const checkoutSessionId = url.searchParams.get("checkout_session_id");

    if (!checkoutSessionId) {
      console.log("⚠️ No Stripe session ID found, skipping tracking.");
      return context.rewrite(new URL("/index.html", request.url));
    }

    // Fetch Stripe Checkout Details
    const stripeData = await getStripeCheckoutDetails(checkoutSessionId);
    if (!stripeData.id) {
      console.error("❌ Failed to retrieve Stripe data.");
      return context.rewrite(new URL("/index.html", request.url));
    }

    if (IS_DEV) console.log("✅ Stripe Data Retrieved:", stripeData);

    // Send UTM + Revenue Data to GA4 and Facebook
    await sendToGA4(clientId, utmData, stripeData.amount_total / 100);
    await sendToFacebook(clientId, utmData, stripeData);

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
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
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
async function sendToGA4(clientId, utmData, revenue) {
  const ga4Data = {
    client_id: clientId ?? crypto.randomUUID(),
    events: [
      {
        name: "be_purchase",
        params: {
          currency: "USD",
          value: revenue,
          price: revenue,
          source: utmData.utm_source,
          medium: utmData.utm_medium,
          campaign: utmData.utm_campaign,
          term: utmData.utm_term,
          content: utmData.utm_content,
        },
      },
    ],
  };

  console.log("📡 Sending GA4 Event:", JSON.stringify(ga4Data, null, 2));

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
  const relevantSources = ["facebook", "instagram", "fb", "ig"];

  if (
    !utmData.utm_source ||
    !relevantSources.includes(utmData.utm_source.toLowerCase())
  ) {
    console.log(`🚫 Skipping FB event: utm_source = ${utmData.utm_source}`);
    return;
  }

  const fbClientId = await context.cookies.get("_fbp");
  const fbClickId = await context.cookies.get("_fbc");

  const customerEmail = stripeData.customer_details?.email;
  const [customerFirstName, customerLastName] =
    stripeData.customer_details?.name?.split(" ") || [];
  const customerPhone = stripeData.customer_details?.phone;
  const customerId = stripeData.customer;
  const revenue = stripeData.amount_total / 100;

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
      fbc: fbClickId, // Facebook Click ID (if available)
      fbp: fbClientId, // Facebook Pixel ID (if available)
    },

    custom_data: {
      value: revenue,
      currency: "USD",
      attribution_value: utmData.utm_source, // UTM source as attribution value
      attribution_model: "last_click", // Example attribution model
      campaign_id: utmData.utm_campaign,
      visit_time: Math.floor(Date.now() / 1000),
    },
  };

  console.log(
    "📡 Sending FB Conversion Event:",
    JSON.stringify(fbData, null, 2)
  );

  try {
    const res = await fetch(
      `https://graph.facebook.com/v17.0/${FACEBOOK_PIXEL_ID}/events?access_token=${FACEBOOK_ACCESS_TOKEN}`,
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
