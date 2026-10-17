// The cart a checkout session may hold, checked the same way whether the
// session is being made (create-checkout-session) or changed in place
// (update-checkout-session). Prices come from here, never from the page.

const IS_DEV = process.env.NETLIFY_DEV === "true";

export const PRICE_IDS = {
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

const BAD_REQUEST = { status: 400, error: "Something went wrong." };

// { lineItems: [{ price, quantity }] } in the order the slugs are listed
// above (the page matches the session's lines to its cart by that order),
// or { status, error } when the cart isn't one we'd sell.
export function lineItemsFor(items) {
  if (!items || typeof items !== "object" || Array.isArray(items)) {
    console.error("Invalid items payload:", typeof items);
    return BAD_REQUEST;
  }

  const lcmQty = Math.floor(Number(items["lcm"] ?? 0));
  if (!isFinite(lcmQty) || lcmQty < 1) {
    console.error("Missing or invalid lcm quantity:", items["lcm"]);
    return BAD_REQUEST;
  }

  const lineItems = [];
  for (const slug of Object.keys(PRICE_IDS)) {
    if (!(slug in items)) continue;
    const rawQty = items[slug];
    const qty = Math.floor(Number(rawQty));
    const maxQty = slug === "lcm" ? LCM_MAX_QTY : PIN_MAX_QTY;
    if (!isFinite(qty) || qty < 1) continue;
    // (more than the page allows: refused, rather than quietly dropping the item)
    if (qty > maxQty) {
      console.error(`Quantity over the limit for ${slug}:`, rawQty);
      return BAD_REQUEST;
    }
    const priceId = PRICE_IDS[slug];
    if (!priceId) {
      console.error(`Missing price ID for: ${slug}`);
      return { status: 500, error: "Server configuration error" };
    }
    lineItems.push({ price: priceId, quantity: qty });
  }

  if (!lineItems.length) {
    console.error("No valid line items after filtering:", items);
    return BAD_REQUEST;
  }
  return { lineItems };
}
