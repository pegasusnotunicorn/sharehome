// A Stripe Checkout Session id, as it may go into a Stripe API path: "cs_test_…" or "cs_live_…".
export const isCheckoutSessionId = (id) => typeof id === "string" && /^cs_(test|live)_[A-Za-z0-9]+$/.test(id);
