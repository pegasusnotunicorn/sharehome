// Standalone test for the Shippo helper.
// Run: node scripts/test-shippo.mjs
//
// Uses your SHIPPO_API_KEY_DEV (test token) — does NOT charge.
// Prints a working label URL and tracking number on success.

import "dotenv/config";

// Force the helper to use the dev key path even when run outside `netlify dev`.
process.env.NETLIFY_DEV = "true";

const { createLabel, parcelForGameCount } = await import(
  "../netlify/functions/lib/shippo.js"
);

// Shippo's recommended test recipient. Any US address works in test mode.
const TEST_TO_ADDRESS = {
  name: "Mr. Hippo",
  street1: "1092 Indian Summer Ct",
  city: "San Jose",
  state: "CA",
  zip: "95122",
  country: "US",
  phone: "+14155551234",
  email: "mrhippo@example.com",
};

try {
  console.log("📦 Creating shipment + buying test label...\n");
  const { parcel, maxLabelUsd } = await parcelForGameCount(1);
  const result = await createLabel({
    to: TEST_TO_ADDRESS,
    parcel,
    maxLabelUsd,
    metadata: "test-shippo.mjs sanity check",
  });

  console.log("✅ Label purchased");
  console.log("   Carrier / service :", result.rate.provider, "—", result.rate.service);
  console.log("   Cost              :", result.rate.amount, result.rate.currency);
  console.log("   Tracking number   :", result.trackingNumber);
  console.log("   Tracking URL      :", result.trackingUrl);
  console.log("   Label PDF         :", result.labelUrl);
  console.log("   Transaction ID    :", result.transactionId);
} catch (err) {
  console.error("❌ Failed:", err.message);
  process.exitCode = 1;
}
