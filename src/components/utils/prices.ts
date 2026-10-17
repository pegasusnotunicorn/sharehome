// What things cost, in dollars: shown before Stripe's own figures load (checkout switches to the
// session's amounts once it has them), and wherever a page mentions a price. Stripe's prices are the
// ones charged, so keep these in step with them.
export const PRICES = {
  game: 34.99,
  pin: 10.0,
};

export const formatUsd = (dollars: number) => `$${dollars.toFixed(2)}`;
