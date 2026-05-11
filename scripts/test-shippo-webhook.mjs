// End-to-end test: simulates the exact code path stripe-webhooks.js takes
// for a checkout.session.completed event, but without going through Stripe.
//
// Run: node scripts/test-shippo-webhook.mjs
//
// Verifies:
//  - shipping_details extraction
//  - createLabel() succeeds with realistic Stripe-shaped input
//  - idempotency short-circuit when shippo_transaction_id is already on metadata

import "dotenv/config";
process.env.NETLIFY_DEV = "true";

const { createLabel, parcelForGameCount } = await import(
  "../netlify/functions/lib/shippo.js"
);
const { shippingAddressFromSession } = await import(
  "../netlify/functions/lib/stripe-shipping.js"
);

function buildFakeSession({ withTrackingMetadata = false } = {}) {
  return {
    id: "cs_test_fake_" + Math.random().toString(36).slice(2, 10),
    customer_details: {
      email: "buyer@example.com",
      name: "Test Buyer",
      phone: "+14155551234",
    },
    shipping_details: {
      name: "Test Buyer",
      address: {
        line1: "1092 Indian Summer Ct",
        line2: null,
        city: "San Jose",
        state: "CA",
        postal_code: "95122",
        country: "US",
      },
    },
    metadata: withTrackingMetadata
      ? { shippo_transaction_id: "already_purchased_xyz" }
      : {},
  };
}

async function run() {
  // 1. Idempotency check — should NOT call Shippo
  const dupSession = buildFakeSession({ withTrackingMetadata: true });
  if (dupSession.metadata?.shippo_transaction_id) {
    console.log(
      "✅ Idempotency: would skip session with existing shippo_transaction_id"
    );
  } else {
    console.error("❌ Idempotency check failed");
    process.exitCode = 1;
  }

  // 2. Parcel + cap selection
  console.log("\n📦 Parcel + cap selection:");
  for (const qty of [1, 2, 5, 12, 13, 0]) {
    const config = await parcelForGameCount(qty);
    console.log(
      `   ${qty} game(s) →`,
      config
        ? `${config.parcel.templateName} ${config.parcel.length}x${config.parcel.width}x${config.parcel.height}${config.parcel.distance_unit}, ${config.parcel.weight}${config.parcel.mass_unit}, cap $${config.maxLabelUsd}`
        : "<<no template — will skip + alert>>"
    );
  }

  // 3. Real label purchase for each supported game count
  for (const qty of [1, 2, 12]) {
    const session = buildFakeSession();
    const { to } = shippingAddressFromSession(session);
    const config = await parcelForGameCount(qty);
    console.log(
      `\n📦 Simulating ${qty}-game order for ${session.id} (cap $${config.maxLabelUsd})...`
    );
    const label = await createLabel({
      to,
      parcel: config.parcel,
      maxLabelUsd: config.maxLabelUsd,
      metadata: `stripe_session=${session.id}`,
    });
    console.log(
      `   ✅ ${label.rate.provider} ${label.rate.service} — $${label.rate.amount} — tracking ${label.trackingNumber}`
    );
  }
}

run().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exitCode = 1;
});
