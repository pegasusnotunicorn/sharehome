// Preview the Discord embeds without buying a label.
// Run: node scripts/preview-discord.mjs [stripe_session_id]
//
// Pulls a REAL Stripe checkout session (test mode) AND a REAL Shippo parcel
// template, so the preview reflects exactly what the live webhook will render.
// Only the label fields (carrier, tracking, label URL) are mocked, since
// previewing shouldn't actually buy a label.

import "dotenv/config";
process.env.NETLIFY_DEV = "true";

import stripeModule from "stripe";

const { parcelForGameCount } = await import(
  "../netlify/functions/lib/shippo.js"
);

const ALERT_WEBHOOK_URL = process.env.ALERT_WEBHOOK_URL;
if (!ALERT_WEBHOOK_URL) {
  console.error("ALERT_WEBHOOK_URL is not set in .env");
  process.exit(1);
}

const stripe = stripeModule(process.env.STRIPE_SECRET_KEY_DEV);
const DEFAULT_SESSION_ID =
  "cs_test_a1MWaYPuoY5QfzcDl5Zu3tu5OWdloaoCMOyJdOn0bNS0EWZSb2cvfzhIIC";
const sessionId = process.argv[2] || DEFAULT_SESSION_ID;

const session = await stripe.checkout.sessions.retrieve(sessionId, {
  expand: ["line_items.data.price.product"],
});

async function post(payload) {
  const res = await fetch(ALERT_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    console.error("Discord rejected payload:", res.status, await res.text());
  } else {
    console.log("✅ posted", res.status);
  }
}

// ---- Helpers (kept in sync with stripe-webhooks.js) ----
function formatMoney(cents, currency = "usd") {
  if (cents == null) return "—";
  return `$${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
}
function formatLineItems(s) {
  const items = s.line_items?.data || [];
  if (!items.length) return "—";
  const currency = s.currency || "usd";
  return items
    .map((item) => {
      const name =
        item.description ||
        item.price?.product?.name ||
        item.price?.nickname ||
        item.price?.id ||
        "item";
      const qty = item.quantity || 1;
      return `• ${qty}× **${name}** — ${formatMoney(item.amount_total, currency)}`;
    })
    .join("\n");
}
function formatOrderSummary(s) {
  const currency = s.currency || "usd";
  const sub = s.amount_subtotal;
  const total = s.amount_total;
  const tax = s.total_details?.amount_tax || 0;
  const shipping = s.total_details?.amount_shipping || 0;
  const discount = s.total_details?.amount_discount || 0;
  const taxInclusive = sub != null && total != null && sub === total && tax > 0;
  const lines = [formatLineItems(s)];
  if (sub != null && sub !== total) lines.push(`Subtotal: ${formatMoney(sub, currency)}`);
  if (discount > 0) lines.push(`Discount: −${formatMoney(discount, currency)}`);
  if (shipping > 0) lines.push(`Shipping: ${formatMoney(shipping, currency)}`);
  if (tax > 0) lines.push(`Tax: ${formatMoney(tax, currency)}${taxInclusive ? " (incl.)" : ""}`);
  lines.push(`**Total: ${formatMoney(total, currency)}**`);
  return lines.join("\n");
}
function stripeSessionUrl(id) {
  const isTest = id.startsWith("cs_test_");
  return `https://dashboard.stripe.com${isTest ? "/test" : ""}/checkout/sessions/${id}`;
}
function quickLinks({ sessionId, trackingUrl, labelUrl }) {
  const links = [];
  if (sessionId) links.push(`[Stripe session](${stripeSessionUrl(sessionId)})`);
  if (trackingUrl) links.push(`[Track package](${trackingUrl})`);
  if (labelUrl) links.push(`[Label PDF](${labelUrl})`);
  links.push("[Shippo dashboard](https://apps.goshippo.com/orders)");
  return links.join(" • ");
}

// ---- Real session + real parcel, mocked label ----
const shipping = session.shipping_details || session.shipping;
const to = {
  name: shipping.name,
  street1: shipping.address.line1,
  ...(shipping.address.line2 && { street2: shipping.address.line2 }),
  city: shipping.address.city,
  state: shipping.address.state,
  zip: shipping.address.postal_code,
  country: shipping.address.country,
  ...(session.customer_details?.phone && { phone: session.customer_details.phone }),
  email: session.customer_details?.email,
};

const gameCount = (session.line_items?.data || []).reduce(
  (sum, i) => sum + (i.quantity || 0),
  0
);
const { parcel } = await parcelForGameCount(gameCount);

// Label info is mocked — previewing shouldn't buy a label.
const label = {
  rate: { provider: "USPS", service: "Ground Advantage", amount: "6.48", currency: "USD" },
  trackingNumber: "9334620845500000183588",
  trackingUrl:
    "https://tools.usps.com/go/TrackConfirmAction?tLabels=9334620845500000183588",
  labelUrl: "https://shippo-delivery.s3.amazonaws.com/test-label.pdf",
};

const customerLines = [
  `**${to.name || "—"}**`,
  session.customer_details?.email || null,
  to.phone || null,
].filter(Boolean);

const shipToLines = [
  to.street1,
  to.street2,
  [to.city, to.state, to.zip].filter(Boolean).join(", "),
  to.country,
].filter(Boolean);

await post({
  embeds: [
    {
      title: "📦 Shipping label purchased",
      url: label.labelUrl,
      color: 0x57f287,
      fields: [
        { name: "Customer", value: customerLines.join("\n"), inline: true },
        { name: "Ship to", value: shipToLines.join("\n"), inline: true },
        {
          name: "Package",
          value: `${parcel.length} × ${parcel.width} × ${parcel.height} ${parcel.distance_unit}\n${parcel.weight} ${parcel.mass_unit} (${gameCount}× game)`,
          inline: true,
        },
        { name: "Order", value: formatOrderSummary(session), inline: false },
        {
          name: "Carrier",
          value: `${label.rate.provider} ${label.rate.service}`,
          inline: true,
        },
        {
          name: "Label cost",
          value: `$${label.rate.amount} ${label.rate.currency}`,
          inline: true,
        },
        {
          name: "Tracking",
          value: `[${label.trackingNumber}](${label.trackingUrl})`,
          inline: true,
        },
        {
          name: "Quick links",
          value: quickLinks({
            sessionId: session.id,
            trackingUrl: label.trackingUrl,
            labelUrl: label.labelUrl,
          }),
          inline: false,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: { text: "sharehome • Shippo" },
    },
  ],
});

// ---- Mock error embed (same shape as the live alert) ----
await post({
  embeds: [
    {
      title: "🚨 Shippo label issue",
      description: "Refusing to buy label: rate 18.40 USD exceeds cap of 15 USD",
      color: 0xed4245,
      fields: [
        {
          name: "Stripe session",
          value: `[\`${session.id}\`](${stripeSessionUrl(session.id)})`,
          inline: false,
        },
        {
          name: "Quick links",
          value: quickLinks({ sessionId: session.id }),
          inline: false,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: { text: "sharehome • Shippo" },
    },
  ],
});
