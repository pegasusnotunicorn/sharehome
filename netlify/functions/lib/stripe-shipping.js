// Pure helpers for extracting Shippo-shaped data from a Stripe Checkout
// Session. Imported by both the live webhook and the local test script so
// they can't drift apart.

// Returns { shipping, to } when the session carries a usable shipping
// address, or null otherwise.
//
// `shipping` is the raw Stripe block — callers use `shipping.address.country`
// for region checks. `to` is the Shippo recipient shape.
export function shippingAddressFromSession(session) {
  // The address sits in a different field depending on the API version a
  // session was made under: collected_information.shipping_details (the
  // pinned 2025 version), shipping_details or shipping (older sessions and
  // test fixtures). All three are read.
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
      // Europe orders carry the phone the checkout page saved to metadata
      ...((session.customer_details?.phone || session.metadata?.phone) && {
        phone: session.customer_details?.phone || session.metadata.phone,
      }),
      email: session.customer_details?.email,
    },
  };
}
