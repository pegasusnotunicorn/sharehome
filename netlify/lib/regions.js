// Shipping regions shared by checkout (which countries the address form
// offers), the webhook (which orders go to the Europe first wave instead of
// Shippo) and conversion tracking (region on the purchase event), so they
// can't drift apart.

// Exactly the destinations the logistics partner quoted from its Hungarian
// warehouse (rate sheet of 23 Sep 2026), minus Cyprus and Malta — those ship
// by air express and cost several times the rest. GB covers both Great
// Britain and Northern Ireland.
export const EUROPE_COUNTRIES = [
  "AT", "BE", "BG", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GB", "GR",
  "HR", "IE", "IT", "LT", "LU", "LV", "NL", "PL", "PT", "RO", "SE", "SI",
  "SK",
];

const EUROPE_SET = new Set(EUROPE_COUNTRIES);

export function isEuropeCountry(country) {
  return EUROPE_SET.has(country);
}

// "us" | "europe" | "other", or null when there's no country to go on.
export function shippingRegionFor(country) {
  if (!country) return null;
  if (country === "US") return "us";
  return isEuropeCountry(country) ? "europe" : "other";
}
