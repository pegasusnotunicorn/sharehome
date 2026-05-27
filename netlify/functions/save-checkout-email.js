import stripeModule from "stripe";

const IS_DEV = process.env.NETLIFY_DEV === "true";

const STRIPE_SECRET_KEY = IS_DEV
  ? process.env.STRIPE_SECRET_KEY_DEV
  : process.env.STRIPE_SECRET_KEY;

const stripe = stripeModule(STRIPE_SECRET_KEY, { apiVersion: "2025-03-31.basil" });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function saveCheckoutEmail(req) {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { sessionId, email } = body;

  if (!sessionId || typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
    return new Response("Invalid session ID", { status: 400 });
  }

  if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
    return new Response("Invalid email", { status: 400 });
  }

  try {
    await stripe.checkout.sessions.update(sessionId, {
      metadata: { contact_email: email.slice(0, 500) },
    });
  } catch (err) {
    // Best-effort — session may already be expired or not found.
    console.warn("save-checkout-email: Stripe update failed:", err.message);
  }

  return new Response("OK", { status: 200 });
}
