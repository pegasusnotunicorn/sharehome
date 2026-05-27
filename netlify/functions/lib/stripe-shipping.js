// Pure helpers for extracting Shippo-shaped data from a Stripe Checkout
// Session. Imported by both the live webhook and the local test script so
// they can't drift apart.

// Returns { shipping, to } when the session carries a usable shipping
// address, or null otherwise.
//
// `shipping` is the raw Stripe block — callers use `shipping.address.country`
// for region checks. `to` is the Shippo recipient shape. Stripe renamed
// `shipping` → `shipping_details` in newer API versions; both are accepted.
export function shippingAddressFromSession(session) {
  // Field moved across Stripe API versions:
  // 2020: session.shipping → 2022: session.shipping_details → 2025: session.collected_information.shipping_details
  const shipping =
    session.shipping_details ||
    session.collected_information?.shipping_details ||
    session.shipping;
  if (!shipping?.address?.line1) return null;
  return {
    shipping,
    to: {
      name: shipping.name,
      street1: shipping.address.line1,
      ...(shipping.address.line2 && { street2: shipping.address.line2 }),
      city: shipping.address.city,
      state: shipping.address.state,
      zip: shipping.address.postal_code,
      country: shipping.address.country,
      ...(session.customer_details?.phone && {
        phone: session.customer_details.phone,
      }),
      email: session.customer_details?.email,
    },
  };
}
