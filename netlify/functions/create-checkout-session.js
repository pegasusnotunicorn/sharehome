const IS_DEV = process.env.NETLIFY_DEV === "true";

const STRIPE_PAYMENT_LINK = IS_DEV
  ? process.env.REACT_APP_STRIPE_TEST_URL
  : process.env.REACT_APP_STRIPE_PROD_URL;

export default async function createCheckoutSession(req) {
  const url = new URL(req.url);
  const destination = new URL(STRIPE_PAYMENT_LINK);

  for (const [key, value] of url.searchParams.entries()) {
    destination.searchParams.set(key, value);
  }

  return new Response(null, {
    status: 302,
    headers: { Location: destination.toString() },
  });
}
