import stripeModule from "stripe";
import { lineItemsFor } from "../lib/checkout-items.js";
import { isCheckoutSessionId } from "../lib/session-id.js";

const IS_DEV = process.env.NETLIFY_DEV === "true";

const STRIPE_SECRET_KEY = IS_DEV
  ? process.env.STRIPE_SECRET_KEY_DEV
  : process.env.STRIPE_SECRET_KEY;

// Changing line items on an existing session came in with this API version;
// only this call asks for it, so everything else stays on the pinned one.
const LINE_ITEM_UPDATE_API_VERSION = "2025-12-15.clover";

const json = (body, status) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// A cart change on /checkout: the open session's line items are swapped in
// place, so the promo code, address and card the buyer has entered all stay.
// The page calls this inside Stripe.js's runServerUpdate, which then reloads
// the session. Any failure here, and the page falls back to a new session.
export default async function updateCheckoutSession(req) {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  if (!STRIPE_SECRET_KEY) {
    console.error("update-checkout-session: STRIPE_SECRET_KEY is not set");
    return json({ error: "Server configuration error" }, 500);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const { sessionId, items } = body;
  if (!isCheckoutSessionId(sessionId)) {
    return json({ error: "Invalid session ID" }, 400);
  }

  const cart = lineItemsFor(items);
  if (!cart.lineItems) return json({ error: cart.error }, cart.status);

  const stripe = stripeModule(STRIPE_SECRET_KEY, { apiVersion: "2025-03-31.basil" });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["line_items"] });
    // (a paid or expired session's cart is settled)
    if (session.status !== "open") return json({ error: "Session isn't open" }, 409);

    // The whole list goes back: a line already on the session keeps its id
    // (so it's changed, not re-added); a new one goes by price; one left out
    // is removed.
    const existing = session.line_items?.data ?? [];
    const lineItems = cart.lineItems.map(({ price, quantity }) => {
      const line = existing.find((li) => li.price?.id === price);
      return line ? { id: line.id, quantity } : { price, quantity };
    });

    await stripe.checkout.sessions.update(
      sessionId,
      { line_items: lineItems },
      { apiVersion: LINE_ITEM_UPDATE_API_VERSION }
    );
    return json({ ok: true }, 200);
  } catch (err) {
    console.error("update-checkout-session: Stripe update failed:", err.message);
    return json({ error: "Couldn't update the order" }, 502);
  }
}
