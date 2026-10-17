import stripeModule from "stripe";
import { isCheckoutSessionId } from "../lib/session-id.js";

const IS_DEV = process.env.NETLIFY_DEV === "true";

const STRIPE_SECRET_KEY = IS_DEV
  ? process.env.STRIPE_SECRET_KEY_DEV
  : process.env.STRIPE_SECRET_KEY;

// Digits with the usual separators and an optional leading +; 6–15 digits
// covers every European number with or without its country code.
const PHONE_RE = /^\+?[\d\s().-]+$/;
const digitCount = (s) => s.replace(/\D/g, "").length;

// Europe orders ship through a logistics partner whose carriers need a phone
// number for delivery. The page saves it here just before payment, onto the
// session's metadata, and the webhook reads it back (stripe-shipping.js).
export default async function saveCheckoutPhone(req) {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  if (!STRIPE_SECRET_KEY) {
    console.error("save-checkout-phone: STRIPE_SECRET_KEY is not set");
    return new Response("Server configuration error", { status: 500 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { sessionId } = body;
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";

  if (!isCheckoutSessionId(sessionId)) {
    return new Response("Invalid session ID", { status: 400 });
  }

  const digits = digitCount(phone);
  if (!PHONE_RE.test(phone) || digits < 6 || digits > 15) {
    return new Response("Invalid phone number", { status: 400 });
  }

  const stripe = stripeModule(STRIPE_SECRET_KEY, { apiVersion: "2025-03-31.basil" });

  try {
    // (only an open session's: a paid or expired one's order is settled. Stripe merges metadata
    // keys, so just this one is sent.)
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.status !== "open") {
      return new Response("Session isn't open", { status: 409 });
    }
    await stripe.checkout.sessions.update(sessionId, {
      metadata: { phone: phone.slice(0, 40) },
    });
  } catch (err) {
    console.error("save-checkout-phone: Stripe update failed:", err.message);
    return new Response("Couldn't save phone number", { status: 502 });
  }

  return new Response("OK", { status: 200 });
}
