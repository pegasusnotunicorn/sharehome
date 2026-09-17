// Shipping regions shared by checkout (which countries the address form
// offers), the webhook (which orders go to the Europe first wave instead of
// Shippo) and conversion tracking (region on the purchase event), so they
// can't drift apart.

// Every European destination Stripe accepts in allowed_countries, EU or not.
// Russia and Belarus are left out.
export const EUROPE_COUNTRIES = [
  "AD", "AL", "AT", "AX", "BA", "BE", "BG", "CH", "CY", "CZ", "DE", "DK",
  "EE", "ES", "FI", "FO", "FR", "GB", "GG", "GI", "GR", "HR", "HU", "IE",
  "IM", "IS", "IT", "JE", "LI", "LT", "LU", "LV", "MC", "MD", "ME", "MK",
  "MT", "NL", "NO", "PL", "PT", "RO", "RS", "SE", "SI", "SJ", "SK", "SM",
  "UA", "VA", "XK",
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
