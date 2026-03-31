const IS_DEV = process.env.NETLIFY_DEV === "true";

const STRIPE_BACKUP_PAYMENT_LINK = IS_DEV
  ? process.env.REACT_APP_STRIPE_TEST_URL
  : process.env.REACT_APP_STRIPE_PROD_URL;

export default async function createCheckoutSession() {
  return new Response(null, {
    status: 302,
    headers: { Location: STRIPE_BACKUP_PAYMENT_LINK },
  });
}
