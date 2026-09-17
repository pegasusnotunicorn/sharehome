import stripeModule from "stripe";
import { shippingRegionFor } from "../lib/regions.js";

const IS_DEV = process.env.NETLIFY_DEV === "true";

const STRIPE_SECRET_KEY = IS_DEV
  ? process.env.STRIPE_SECRET_KEY_DEV
  : process.env.STRIPE_SECRET_KEY;

// Tells /thankyou which shipping copy to show. The region comes from the
// Checkout Session's shipping address, so it holds up however the buyer got
// back to /thankyou (bank redirects can land in a different tab). Returns
// only the region — nothing about the buyer.
export default async function orderRegion(req) {
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const sessionId = new URL(req.url).searchParams.get("checkout_session_id");
  if (!sessionId || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    return Response.json({ region: null }, { status: 400 });
  }

  try {
    const stripe = stripeModule(STRIPE_SECRET_KEY, {
      apiVersion: "2025-03-31.basil",
    });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const country =
      session.collected_information?.shipping_details?.address?.country ??
      session.shipping_details?.address?.country ??
      null;
    return Response.json(
      { region: shippingRegionFor(country) },
      { headers: { "Cache-Control": "private, max-age=3600" } }
    );
  } catch (err) {
    console.error("order-region lookup failed:", err.message);
    return Response.json({ region: null }, { status: 404 });
  }
}
