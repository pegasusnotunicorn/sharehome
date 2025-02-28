const IS_DEV = Deno.env.get("NETLIFY_DEV") === "true";
const STRIPE_SECRET_KEY = IS_DEV
  ? Deno.env.get("STRIPE_SECRET_KEY_DEV")
  : Deno.env.get("STRIPE_SECRET_KEY");
const GA_MEASUREMENT_ID = IS_DEV
  ? Deno.env.get("GA4_MEASUREMENT_ID_DEV")
  : Deno.env.get("GA4_MEASUREMENT_ID");
const GA_API_SECRET = IS_DEV
  ? Deno.env.get("GA4_API_SECRET_DEV")
  : Deno.env.get("GA4_API_SECRET");

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

    // Send UTM + Revenue Data to GA4
    await sendToGA4(clientId, utmData, stripeData.amount_total / 100);

    return context.rewrite(new URL("/index.html", request.url));
  } catch (error) {
    console.error("❌ Error in track-conversions:", error);
    return context.rewrite(new URL("/index.html", request.url));
  }
}

// ✅ Fetch Stripe Checkout Session
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

// ✅ Send Data to GA4
async function sendToGA4(clientId, utmData, revenue) {
  const ga4Data = {
    client_id: clientId ?? crypto.randomUUID(),
    events: [
      {
        name: "be_purchase",
        params: {
          currency: "USD",
          value: revenue,
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

// ✅ Netlify Edge Function Config
export const config = {
  path: "/thankyou",
};
