import stripeModule from "stripe";

// #region env variables

const IS_DEV = process.env.NETLIFY_DEV === "true";
const STRIPE_SECRET_KEY = IS_DEV
  ? process.env.STRIPE_SECRET_KEY_DEV
  : process.env.STRIPE_SECRET_KEY;

const STRIPE_BACKUP_PAYMENT_LINK = IS_DEV
  ? process.env.REACT_APP_STRIPE_TEST_URL
  : process.env.REACT_APP_STRIPE_PROD_URL;

const STRIPE_LCM_PRICE_ID = IS_DEV
  ? process.env.STRIPE_LCM_PRICE_ID_TEST
  : process.env.STRIPE_LCM_PRICE_ID_LIVE;

const STRIPE_NORTH_AMERICAN_SHIPPING_ID = IS_DEV
  ? process.env.STRIPE_NORTH_AMERICAN_SHIPPING_ID_TEST
  : process.env.STRIPE_NORTH_AMERICAN_SHIPPING_ID_LIVE;

const STRIPE_INTERNATIONAL_SHIPPING_ID = IS_DEV
  ? process.env.STRIPE_INTERNATIONAL_SHIPPING_ID_TEST
  : process.env.STRIPE_INTERNATIONAL_SHIPPING_ID_LIVE;

const stripe = stripeModule(STRIPE_SECRET_KEY);

// #endregion

export default async function createCheckoutSession() {
  try {
    if (IS_DEV) console.log("Creating Stripe checkout session...");
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price: STRIPE_LCM_PRICE_ID,
          quantity: 1,
          adjustable_quantity: {
            enabled: true,
            minimum: 1,
            maximum: 1700,
          },
        },
      ],
      currency: "usd",
      success_url:
        "https://lovecareermagic.com/thankyou?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://lovecareermagic.com/",
      allow_promotion_codes: true,
      consent_collection: {
        terms_of_service: "required",
        promotions: "auto",
      },
      automatic_tax: {
        enabled: true,
      },
      shipping_address_collection: {
        allowed_countries: [
          "US", // United States
          "CA", // Canada
          "MX", // Mexico
          "AT", // Austria
          "BE", // Belgium
          "DK", // Denmark
          "FI", // Finland
          "FR", // France
          "DE", // Germany
          "GR", // Greece
          "HU", // Hungary
          "IE", // Ireland
          "IT", // Italy
          "LU", // Luxembourg
          "NL", // Netherlands
          "NO", // Norway
          "PT", // Portugal
          "ES", // Spain
          "SE", // Sweden
          "CH", // Switzerland
          "GB", // United Kingdom
        ],
      },
      shipping_options: [
        {
          shipping_rate: STRIPE_NORTH_AMERICAN_SHIPPING_ID,
        },
        {
          shipping_rate: STRIPE_INTERNATIONAL_SHIPPING_ID,
        },
      ],
    });

    if (session.url) {
      return new Response(null, {
        status: 302,
        headers: { Location: session.url },
      });
    } else {
      throw new Error("Session URL is undefined");
    }
  } catch (error) {
    console.error("❌ Stripe Checkout Error:", error);

    return new Response(null, {
      status: 302,
      headers: { Location: STRIPE_BACKUP_PAYMENT_LINK },
    });
  }
}
