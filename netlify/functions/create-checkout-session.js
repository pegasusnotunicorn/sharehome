import stripeModule from "stripe";

const IS_DEV = process.env.NETLIFY_DEV === "true";

const STRIPE_SECRET_KEY = IS_DEV
  ? process.env.STRIPE_SECRET_KEY_DEV
  : process.env.STRIPE_SECRET_KEY;

const PROD_URL = "https://lovecareermagic.com";

const NORTH_AMERICAN_SHIPPING_ID = IS_DEV
  ? process.env.STRIPE_NORTH_AMERICAN_SHIPPING_ID_TEST
  : process.env.STRIPE_NORTH_AMERICAN_SHIPPING_ID_LIVE;

const PRICE_IDS = {
  lcm: IS_DEV
    ? process.env.STRIPE_LCM_PRICE_ID_TEST
    : process.env.STRIPE_LCM_PRICE_ID_LIVE,
  urg_pin: IS_DEV
    ? process.env.STRIPE_URG_PIN_PRICE_ID_TEST
    : process.env.STRIPE_URG_PIN_PRICE_ID_LIVE,
  bizz_pin: IS_DEV
    ? process.env.STRIPE_BIZZ_PIN_PRICE_ID_TEST
    : process.env.STRIPE_BIZZ_PIN_PRICE_ID_LIVE,
};

const LCM_MAX_QTY = 12;
const PIN_MAX_QTY = 99;

export default async function createCheckoutSession(req) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  if (!STRIPE_SECRET_KEY) {
    console.error("STRIPE_SECRET_KEY is not set");
    return new Response(JSON.stringify({ error: "Server configuration error: Stripe key missing" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const stripe = stripeModule(STRIPE_SECRET_KEY, {
    apiVersion: "2025-03-31.basil",
  });

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { items, email, returnUrl, utmSource, utmMedium, utmCampaign, utmContent } = body;

  // Read from request headers — more reliable than trusting client-supplied values.
  const userAgent = req.headers.get("user-agent") || null;
  const cookieHeader = req.headers.get("cookie") || "";
  const gaMatch = cookieHeader.match(/(?:^|;\s*)_ga=([^;]+)/);
  const gaClientId = gaMatch ? gaMatch[1].split(".").slice(-2).join(".") : null;

  const trustedOrigins = [PROD_URL, "http://localhost:3000", "http://localhost:8888"];
  const baseUrl = (returnUrl && trustedOrigins.some((o) => returnUrl.startsWith(o)))
    ? returnUrl
    : `${PROD_URL}/thankyou`;

  if (!items || typeof items !== "object" || Array.isArray(items)) {
    console.error("Invalid items payload:", typeof items);
    return new Response(JSON.stringify({ error: "Something went wrong." }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const lcmQty = Math.floor(Number(items["lcm"] ?? 0));
  if (!isFinite(lcmQty) || lcmQty < 1) {
    console.error("Missing or invalid lcm quantity:", items["lcm"]);
    return new Response(JSON.stringify({ error: "Something went wrong." }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const validSlugs = Object.keys(PRICE_IDS);
  const lineItems = [];

  for (const [slug, rawQty] of Object.entries(items)) {
    if (!validSlugs.includes(slug)) continue;
    const qty = Math.floor(Number(rawQty));
    const maxQty = slug === "lcm" ? LCM_MAX_QTY : PIN_MAX_QTY;
    if (!isFinite(qty) || qty < 1 || qty > maxQty) continue;
    const priceId = PRICE_IDS[slug];
    if (!priceId) {
      console.error(`Missing price ID for: ${slug}`);
      return new Response("Server configuration error", { status: 500 });
    }
    lineItems.push({ price: priceId, quantity: qty });
  }

  if (!lineItems.length) {
    console.error("No valid line items after filtering:", items);
    return new Response(JSON.stringify({ error: "Something went wrong." }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: "custom",
      return_url: baseUrl,
      expires_at: Math.floor(Date.now() / 1000) + 2 * 60 * 60, // 2 hours
      mode: "payment",
      line_items: lineItems,
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
      metadata: {
        ...(utmSource && { utm_source: String(utmSource).slice(0, 500) }),
        ...(utmMedium && { utm_medium: String(utmMedium).slice(0, 500) }),
        ...(utmCampaign && { utm_campaign: String(utmCampaign).slice(0, 500) }),
        ...(utmContent && { utm_content: String(utmContent).slice(0, 500) }),
        ...(userAgent && { user_agent: String(userAgent).slice(0, 500) }),
        ...(gaClientId && { ga_client_id: String(gaClientId).slice(0, 100) }),
      },
      shipping_address_collection: { allowed_countries: ["US"] },
      shipping_options: [{ shipping_rate: NORTH_AMERICAN_SHIPPING_ID }],
      ...(email && { customer_email: email }),
    });

    return new Response(JSON.stringify({ clientSecret: session.client_secret, sessionId: session.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Stripe session creation failed:", err.message);
    return new Response(JSON.stringify({ error: "Something went wrong. Please try again." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
