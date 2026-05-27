import stripeModule from "stripe";

const IS_DEV = process.env.NETLIFY_DEV === "true";

const STRIPE_SECRET_KEY = IS_DEV
  ? process.env.STRIPE_SECRET_KEY_DEV
  : process.env.STRIPE_SECRET_KEY;

export default async function updateSessionMetadata(req) {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  if (!STRIPE_SECRET_KEY) {
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const stripe = stripeModule(STRIPE_SECRET_KEY, { apiVersion: "2025-03-31.basil" });

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { sessionId, phone } = body;

  if (!sessionId || typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
    console.error("Invalid sessionId:", sessionId);
    return new Response(JSON.stringify({ error: "Something went wrong." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await stripe.checkout.sessions.update(sessionId, {
      metadata: { ...(phone && { phone }) },
    });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Failed to update session metadata:", err.message);
    return new Response(JSON.stringify({ error: "Something went wrong." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
