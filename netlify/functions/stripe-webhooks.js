import stripeModule from "stripe";
import fetch from "node-fetch";
import { getStore } from "@netlify/blobs";
import { createLabel, createOrder, parcelForGameCount } from "./lib/shippo.js";
import { shippingAddressFromSession } from "./lib/stripe-shipping.js";

const IS_DEV = process.env.NETLIFY_DEV === "true";

const ALERT_WEBHOOK_URL = process.env.ALERT_WEBHOOK_URL;
const VERBOSE_LOGGING = process.env.VERBOSE_LOGGING === "true";
const STRIPE_LCM_PRODUCT_ID = IS_DEV
  ? process.env.STRIPE_LCM_PRODUCT_ID_TEST
  : process.env.STRIPE_LCM_PRODUCT_ID_LIVE;

const STRIPE_SECRET_KEY = IS_DEV
  ? process.env.STRIPE_SECRET_KEY_DEV
  : process.env.STRIPE_SECRET_KEY;

const STRIPE_WEBHOOK_SECRET = IS_DEV
  ? process.env.STRIPE_WEBHOOK_SECRET_DEV
  : process.env.STRIPE_WEBHOOK_SECRET;

// Dev-only failure injection. Set DEBUG_FORCE_ERROR=<stage> in .env and
// restart `netlify dev`, then trigger a checkout.session.completed event.
// Valid stages: "retrieve" | "metadata" | "mailerlite". No-op in production.
function maybeForceFailure(stage) {
  if (!IS_DEV) return;
  if (process.env.DEBUG_FORCE_ERROR === stage) {
    throw new Error(`Simulated ${stage} failure (DEBUG_FORCE_ERROR=${stage})`);
  }
}

// Pin the API version explicitly so an `npm update` of `stripe` can't
// silently shift the version on our outbound calls (retrieve/update). This
// is independent of the Webhook Endpoint API version, which is set in the
// Stripe Dashboard and controls the shape of incoming event payloads.
const stripe = stripeModule(STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
});

const MAILER_LITE_KEY = process.env.MAILER_LITE_KEY;
const MAILERLITE_PURCHASE_GROUP_ID = process.env.MAILERLITE_PURCHASE_GROUP_ID;
const MAILERLITE_ABANDONED_GROUP_ID = process.env.MAILERLITE_ABANDONED_GROUP_ID;

const STRIPE_PAYMENT_LINK_URL = IS_DEV
  ? process.env.REACT_APP_STRIPE_TEST_URL
  : process.env.REACT_APP_STRIPE_PROD_URL;

export default async function stripeWebhooks(request) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const sig = request.headers.get("stripe-signature");

  let event;
  try {
    const rawBody = await request.arrayBuffer();
    const textBody = new TextDecoder().decode(rawBody);
    event = stripe.webhooks.constructEvent(
      textBody,
      sig,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook Error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;

      // Buy shipping label first; never block MailerLite or 200-response on failure.
      await purchaseShippoLabel(session, event.id);

      const customerEmail = session.customer_details?.email;
      const customerName = session.customer_details?.name;
      if (customerEmail) {
        await addEmailToMailerLite(
          customerEmail,
          { name: customerName },
          MAILERLITE_PURCHASE_GROUP_ID,
          { sessionId: session.id, groupKind: "purchase" }
        );
      } else if (IS_DEV) {
        console.log("No customer email on completed session; skipping MailerLite");
      }
      break;
    }
    case "checkout.session.expired": {
      const eventSession = event.data.object;
      const abandonedEmail =
        eventSession.customer_details?.email ?? eventSession.customer_email;

      if (!abandonedEmail) {
        if (IS_DEV) console.log("No email found for abandoned checkout");
        break;
      }

      // Re-fetch with line_items expanded — event payload doesn't include them,
      // and we want cart details for the MailerLite custom fields. Falling back
      // to the event snapshot is fine: cart_items/cart_total just stay empty.
      let session = eventSession;
      try {
        session = await stripe.checkout.sessions.retrieve(eventSession.id, {
          expand: ["line_items.data.price.product"],
        });
      } catch (err) {
        console.warn(
          `⚠️  Couldn't re-fetch expired session ${eventSession.id} for cart details:`,
          err.message
        );
      }

      // Prefilled-email URL is the recovery story for Payment Link sessions —
      // Stripe doesn't generate `after_expiration.recovery.url` for these.
      const recoveryUrl = STRIPE_PAYMENT_LINK_URL
        ? `${STRIPE_PAYMENT_LINK_URL}?prefilled_email=${encodeURIComponent(abandonedEmail)}`
        : null;

      await addEmailToMailerLite(
        abandonedEmail,
        {
          name: session.customer_details?.name,
          cart_total:
            session.amount_total != null
              ? formatMoney(session.amount_total, session.currency)
              : null,
          cart_items: formatCartItemsForField(session),
          recovery_url: recoveryUrl,
        },
        MAILERLITE_ABANDONED_GROUP_ID,
        { sessionId: session.id, groupKind: "abandoned" }
      );
      break;
    }
    default:
      if (IS_DEV) console.log(`Unhandled event type: ${event.type}`);
  }

  return new Response("Webhook received", { status: 200 });
}

// Narrows the concurrent-delivery race window for a session. Two webhook
// deliveries within the createLabel() window would both pass the metadata
// idempotency check and both buy a label; the blob claim catches that.
// Fail-open: if Blobs is unreachable, we degrade to metadata-only idempotency.
async function claimSessionForLabel(sessionId, eventId) {
  try {
    const store = getStore("shippo-claimed-sessions");
    const existing = await store.get(sessionId);
    if (existing) return { claimed: false, by: existing };
    await store.set(
      sessionId,
      JSON.stringify({ eventId, at: new Date().toISOString() })
    );
    await maybeAlertBlobBloat(store);
    return { claimed: true };
  } catch (err) {
    console.warn(
      "⚠️  Blob claim unavailable, falling back to metadata-only idempotency:",
      err.message
    );
    return { claimed: true };
  }
}

// Successful purchases leave permanent claim entries by design (they back the
// metadata idempotency check). The store grows monotonically — at sharehome
// volume it's irrelevant, but if growth ever accelerates we want a heads-up
// rather than discovering a bloated store mid-incident. Sample ~2% of claim
// attempts; list and alert once per week if we cross the threshold.
const BLOB_BLOAT_THRESHOLD = 2000;
const BLOB_BLOAT_DEDUPE_KEY = "_size_alert_sent";
const BLOB_BLOAT_DEDUPE_MS = 7 * 24 * 60 * 60 * 1000;
async function maybeAlertBlobBloat(store) {
  if (Math.random() > 0.02) return;
  try {
    const flag = await store.get(BLOB_BLOAT_DEDUPE_KEY);
    if (flag && Date.now() - Number(flag) < BLOB_BLOAT_DEDUPE_MS) return;
    const { blobs = [] } = await store.list();
    if (blobs.length <= BLOB_BLOAT_THRESHOLD) return;
    await store.set(BLOB_BLOAT_DEDUPE_KEY, String(Date.now()));
    await alert(
      `\`shippo-claimed-sessions\` Blob store has ${blobs.length} entries (threshold ${BLOB_BLOAT_THRESHOLD}). Successful purchases leave permanent claims by design — if growth is faster than expected, consider a periodic cleanup of entries older than ~60 days. Suppressed for 7 days.`,
      { source: "shippo" }
    );
  } catch (err) {
    console.warn("⚠️  Blob bloat check failed:", err.message);
  }
}

// Returns the next per-day order number, e.g. "LCM-20260511-001". Uses
// Netlify Blobs with optimistic concurrency (etag CAS) to survive concurrent
// webhook deliveries. Best-effort: if Blobs is unreachable or we lose all
// CAS attempts, callers should fall back to a unique-by-construction id so
// they don't block label purchase.
const ORDER_COUNTER_STORE = "shippo-order-counters";
const ORDER_COUNTER_MAX_RETRIES = 5;
async function nextDailyOrderNumber() {
  const store = getStore(ORDER_COUNTER_STORE);
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  // Scope key by Stripe mode so test runs never bump the live sequence.
  const mode = IS_DEV ? "test" : "live";
  const key = `${mode}-${day}`;
  const numberPrefix = IS_DEV ? "LCM-TEST-" : "LCM-";
  for (let attempt = 0; attempt < ORDER_COUNTER_MAX_RETRIES; attempt++) {
    const current = await store.getWithMetadata(key, { type: "text" });
    const value = current?.data ? Number(current.data) : 0;
    const next = value + 1;
    const writeOpts = current?.etag
      ? { onlyIfMatch: current.etag }
      : { onlyIfNew: true };
    const { modified } = await store.set(key, String(next), writeOpts);
    if (modified) {
      return `${numberPrefix}${day}-${String(next).padStart(3, "0")}`;
    }
    // Another delivery beat us to it; loop and re-read.
  }
  throw new Error(
    `Couldn't acquire order counter for ${key} after ${ORDER_COUNTER_MAX_RETRIES} attempts`
  );
}

// Releases the claim so a Stripe dashboard replay can re-process the session.
// Called from every alert-and-skip path (env-var missing, cap rejection,
// transient Shippo error, etc.) — anything an operator might fix and retry.
// NOT called after a label is successfully bought; metadata becomes the
// primary idempotency mechanism from that point on.
async function releaseSessionClaim(sessionId) {
  try {
    const store = getStore("shippo-claimed-sessions");
    await store.delete(sessionId);
  } catch (err) {
    console.warn("⚠️  Couldn't release Blob claim:", err.message);
  }
}

async function purchaseShippoLabel(eventSession, eventId) {
  // Re-fetch the live session — webhook event payloads are frozen snapshots,
  // so retries/replays would otherwise see stale metadata and double-buy.
  // Expanding line items here also avoids a second API call in countGames.
  let session;
  try {
    maybeForceFailure("retrieve");
    session = await stripe.checkout.sessions.retrieve(eventSession.id, {
      expand: ["line_items.data.price.product"],
    });
  } catch (err) {
    console.error("❌ Couldn't fetch Stripe session:", err.message);
    await alert(
      `Couldn't fetch Stripe session — can't buy label: ${err.message}`,
      { source: "stripe", sessionId: eventSession.id }
    );
    return;
  }

  try {
    if (session.metadata?.shippo_transaction_id) {
      console.log(
        `📦 Shippo label already purchased (${session.metadata.shippo_transaction_id}), skipping`
      );
      return;
    }

    const address = shippingAddressFromSession(session);
    if (!address) {
      console.log("📦 No shipping address on session, skipping Shippo");
      return;
    }
    const { shipping, to } = address;

    // Race-window lock against concurrent webhook deliveries of the same
    // session. Claim BEFORE the non-US alert so a Stripe replay (e.g. a
    // dashboard "Resend") doesn't re-fire the same alert — the claim is kept
    // (not released) on non-US so replays short-circuit here.
    const claim = await claimSessionForLabel(session.id, eventId);
    if (!claim.claimed) {
      let claimedBy = claim.by;
      try {
        claimedBy = JSON.parse(claim.by).eventId || claim.by;
      } catch {}
      console.log(
        `📦 Another delivery already claimed this session (by ${claimedBy}); skipping`
      );
      return;
    }

    if (shipping.address.country !== "US") {
      // Intentionally NOT releasing the claim — non-US orders are handled
      // manually and we don't want a replay to re-alert. The claim becomes
      // the dedupe key.
      await alert(
        `Non-US order received (country=${shipping.address.country}). Skipping Shippo — handle manually.`,
        { source: "shippo", sessionId: session.id }
      );
      return;
    }

    const gameCount = countGames(session);
    if (gameCount === null) {
      await releaseSessionClaim(session.id);
      await alert(
        "Can't determine game count — `STRIPE_LCM_PRODUCT_ID` env var is missing. **No label was bought.** Set the env var in Netlify and retry the event from the Stripe dashboard.",
        { source: "shippo", sessionId: session.id }
      );
      return;
    }
    if (gameCount === 0) {
      await releaseSessionClaim(session.id);
      await alert(
        "No LCM games found in this order, but the session has a shipping address. **No label was bought.** Verify the line items match `STRIPE_LCM_PRODUCT_ID`, or if this is a non-game SKU, handle fulfillment manually.",
        {
          source: "shippo",
          sessionId: session.id,
          customer: session.customer_details?.email || "—",
        }
      );
      return;
    }
    if (gameCount >= 3 && gameCount <= 11) {
      await releaseSessionClaim(session.id);
      await alert(
        `Order is for **${gameCount} games**, which doesn't match any of our parcel templates (we only stock boxes for 1, 2, and 12). Auto-buying a 12x label would waste a much larger carton than needed. **No label was bought** — decide on packaging manually (e.g. combine smaller boxes, or buy the 12x label by hand), then patch the Stripe session metadata so a webhook retry won't double-buy.`,
        {
          source: "shippo",
          sessionId: session.id,
          customer: session.customer_details?.email || "—",
          gameCount: String(gameCount),
          nextSteps:
            "Buy the label manually in Shippo with the right box size, then patch the Stripe session metadata (shippo_transaction_id, shippo_tracking_number, shippo_label_url).",
        }
      );
      return;
    }
    const parcelConfig = await parcelForGameCount(gameCount);
    if (!parcelConfig) {
      await releaseSessionClaim(session.id);
      await alert(
        `Cannot pick parcel for session ${session.id} — gameCount=${gameCount}. Handle manually.`,
        { source: "shippo", sessionId: session.id }
      );
      return;
    }

    // Best-effort: create a Shippo Order so the transaction shows up linked
    // under the dashboard's Orders view (line items, totals, customer info).
    // Cosmetic — if this fails we still buy the label.
    let shippoOrderId;
    let shippoOrderNumber;
    try {
      try {
        shippoOrderNumber = await nextDailyOrderNumber();
      } catch (err) {
        // Counter unreachable / contended. Fall back to the session id so the
        // order still gets a unique number — we just lose the human-friendly
        // sequential format for this one order.
        console.warn("⚠️  Daily order counter failed, using session id:", err.message);
        shippoOrderNumber = session.id.replace(/^cs_(test|live)_/, "");
      }
      const order = await createOrder({
        to,
        orderNumber: shippoOrderNumber,
        notes: `Stripe: ${stripeSessionUrl(session.id)}`,
        placedAt: new Date(
          (session.created || Date.now() / 1000) * 1000
        ).toISOString(),
        totalPrice: (session.amount_total || 0) / 100,
        subtotalPrice:
          session.amount_subtotal != null
            ? session.amount_subtotal / 100
            : undefined,
        totalTax: session.total_details?.amount_tax
          ? session.total_details.amount_tax / 100
          : undefined,
        shippingCost: session.total_details?.amount_shipping
          ? session.total_details.amount_shipping / 100
          : undefined,
        currency: (session.currency || "usd").toUpperCase(),
        weightOz: gameCount * 20,
        lineItems: shippoLineItemsFromSession(session),
      });
      shippoOrderId = order.object_id;
      console.log(`📦 Created Shippo order ${shippoOrderNumber} (${shippoOrderId})`);
    } catch (err) {
      console.warn(
        "⚠️  Shippo order creation failed (proceeding without):",
        err.message
      );
      // Label is still being purchased — surface the failure so the dashboard
      // gap (missing Order, "Unknown" on the shipment row) gets noticed.
      await alert(
        "Shippo Order creation failed — the label will still be bought, but the dashboard's Orders view won't have this order and the shipment row will show \"Unknown\". Fix the underlying issue (often a field that exceeded its char limit).",
        {
          source: "shippo",
          sessionId: session.id,
          titleSuffix: "order",
          orderNumber: shippoOrderNumber,
          error: err.message,
        }
      );
    }

    console.log(
      `📦 Buying Shippo label for ${to.name} (${session.id}, ${gameCount} game(s))`
    );
    const label = await createLabel({
      to,
      parcel: parcelConfig.parcel,
      maxLabelUsd: parcelConfig.maxLabelUsd,
      metadata: `stripe_session=${session.id}`,
      shipmentMetadata: shippoOrderNumber,
      order: shippoOrderId,
      reference1: shippoOrderNumber,
    });
    console.log(
      `✅ Label ${label.transactionId} — ${label.rate.provider} ${label.rate.service} $${label.rate.amount} — tracking ${label.trackingNumber}`
    );
    await notifyLabelPurchased({
      session,
      to,
      gameCount,
      parcel: parcelConfig.parcel,
      label,
      orderNumber: shippoOrderNumber,
    });

    // Persist tracking back to the Stripe session for idempotency + dashboard visibility.
    try {
      maybeForceFailure("metadata");
      await stripe.checkout.sessions.update(session.id, {
        metadata: {
          ...(session.metadata || {}),
          shippo_transaction_id: label.transactionId,
          shippo_tracking_number: label.trackingNumber,
          shippo_label_url: label.labelUrl,
          ...(shippoOrderId && { shippo_order_id: shippoOrderId }),
        },
      });
    } catch (err) {
      console.error("⚠️  Failed to persist Shippo metadata to Stripe:", err.message);
      // Label was bought but idempotency is broken — a webhook replay would
      // buy a second label. Loud alert so the metadata can be patched by hand.
      await alert(
        `Label bought but couldn't write tracking to Stripe metadata. Idempotency is broken — a replay of this event will double-buy. Patch metadata manually.`,
        {
          source: "stripe",
          sessionId: session.id,
          trackingNumber: label.trackingNumber,
          shippoTransactionId: label.transactionId,
          error: err.message,
        }
      );
    }
  } catch (err) {
    // Never throw — Stripe would retry the webhook forever.
    console.error("❌ Shippo label purchase failed:", err.message);

    // Release the claim so the operator can fix the underlying issue
    // (raise cap, fix address, etc.) and replay the event from the Stripe
    // dashboard. Without this, a replay would silently skip on the blob lock.
    await releaseSessionClaim(session.id);

    const isCapRejection = /exceeds cap/i.test(err.message);
    const description = isCapRejection
      ? "A paying customer's order needs a shipping label, but the cheapest Shippo rate exceeded our per-label safety cap (`SHIPPO_MAX_LABEL_USD_*` in env). The cap is there to stop runaway shipping charges from a misrouted rate or address. **No label was bought and the order has NOT shipped yet** — handle manually."
      : "A paying customer's order needs a shipping label, but the Shippo flow failed. **No label was bought and the order has NOT shipped yet** — handle manually.";

    await alert(description, {
      source: "shippo",
      sessionId: session.id,
      customer: session.customer_details?.email || "—",
      shipTo: session.shipping_details?.address
        ? `${session.shipping_details.name || ""} — ${session.shipping_details.address.city || ""}, ${session.shipping_details.address.state || ""} ${session.shipping_details.address.postal_code || ""} ${session.shipping_details.address.country || ""}`.trim()
        : "—",
      error: err.message,
      nextSteps:
        "Buy the label manually in Shippo, then patch the Stripe session metadata (shippo_transaction_id, shippo_tracking_number, shippo_label_url) so any webhook retry won't double-buy.",
    });
  }
}

// Returns the number of LCM games in the session, or null if we can't
// determine it (env missing). Callers must treat null as "alert + don't buy".
function countGames(session) {
  if (!STRIPE_LCM_PRODUCT_ID) {
    console.error("❌ STRIPE_LCM_PRODUCT_ID not set; cannot count games");
    return null;
  }
  const items = session.line_items?.data || [];
  let qty = 0;
  for (const item of items) {
    const productId =
      typeof item.price?.product === "string"
        ? item.price.product
        : item.price?.product?.id;
    if (productId === STRIPE_LCM_PRODUCT_ID) qty += item.quantity || 0;
  }
  return qty;
}

async function postToDiscord(payload) {
  if (!ALERT_WEBHOOK_URL) return;
  try {
    await fetch(ALERT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("⚠️  Discord webhook failed:", err.message);
  }
}

function stripeSessionUrl(sessionId) {
  const isTest = sessionId.startsWith("cs_test_");
  return `https://dashboard.stripe.com${isTest ? "/test" : ""}/checkout/sessions/${sessionId}`;
}

// "Quick links" field — clickable shortcuts to every place you'd want to
// jump to investigate. Falls through gracefully when bits are missing.
function quickLinks({ sessionId, trackingUrl, labelUrl }) {
  const links = [];
  if (sessionId) links.push(`[Stripe session](${stripeSessionUrl(sessionId)})`);
  if (trackingUrl) links.push(`[Track package](${trackingUrl})`);
  if (labelUrl) links.push(`[Label PDF](${labelUrl})`);
  links.push("[Shippo dashboard](https://apps.goshippo.com/shipments)");
  return links.join(" • ");
}

// Errors / skips that need attention. Always sent.
// `context.source` ("shippo" | "stripe" | "mailerlite") picks the title + footer.
const FIELD_LABELS = {
  customer: "Customer",
  shipTo: "Ship to",
  gameCount: "Game count",
  error: "Error",
  nextSteps: "Next steps",
  trackingNumber: "Tracking number",
  shippoTransactionId: "Shippo transaction",
  orderNumber: "Order #",
  email: "Email",
  group: "MailerLite group",
  response: "Response",
};
async function alert(message, context = {}) {
  console.error(`🚨 ALERT: ${message}`, context);
  const { sessionId, source = "webhook", titleSuffix, ...rest } = context;
  const titles = {
    shippo: "🚨 Shippo label issue",
    stripe: "🚨 Stripe issue",
    mailerlite: "🚨 MailerLite issue",
    webhook: "🚨 Checkout webhook issue",
  };
  const baseTitle = titles[source] || titles.webhook;
  const title = titleSuffix ? `${baseTitle} (${titleSuffix})` : baseTitle;
  const fields = [];
  if (sessionId) {
    fields.push({
      name: "Stripe session",
      value: `[\`${sessionId}\`](${stripeSessionUrl(sessionId)})`,
      inline: false,
    });
  }
  for (const [key, value] of Object.entries(rest)) {
    // Discord caps field values at 1024 chars; Shippo error bodies can be
    // huge JSON dumps. Truncate with headroom for the ``` wrappers.
    const str = String(value);
    const truncated =
      str.length > 1000 ? str.slice(0, 1000) + "… [truncated]" : str;
    fields.push({
      name: FIELD_LABELS[key] || key,
      value: "```" + truncated + "```",
      inline: false,
    });
  }
  fields.push({
    name: "Quick links",
    value: quickLinks({ sessionId }),
    inline: false,
  });
  await postToDiscord({
    embeds: [
      {
        title,
        description: message,
        color: 0xed4245, // Discord red
        fields,
        timestamp: new Date().toISOString(),
      },
    ],
  });
}

function formatMoney(amountCents, currency) {
  if (amountCents == null) return "—";
  const cur = (currency || "usd").toUpperCase();
  return `$${(amountCents / 100).toFixed(2)} ${cur}`;
}

// Maps Stripe line items to Shippo Order line_items shape. Per-item weight
// is omitted — we set order-level weight from gameCount instead, which is
// close enough for the dashboard's cosmetic display.
function shippoLineItemsFromSession(session) {
  const items = session.line_items?.data || [];
  const currency = (session.currency || "usd").toUpperCase();
  return items.map((item) => {
    const name =
      item.description ||
      item.price?.product?.name ||
      item.price?.nickname ||
      "item";
    const productId =
      typeof item.price?.product === "string"
        ? item.price.product
        : item.price?.product?.id;
    return {
      title: name,
      quantity: item.quantity || 1,
      total_price: ((item.amount_total || 0) / 100).toFixed(2),
      currency,
      ...(productId && { sku: productId }),
    };
  });
}

// Comma-joined single-line variant for MailerLite custom fields.
// e.g. "1× Love, Career & Magic" or "1× LCM, 1× Bizz pin".
function formatCartItemsForField(session) {
  const items = session.line_items?.data || [];
  if (!items.length) return null;
  return items
    .map((item) => {
      const name =
        item.description ||
        item.price?.product?.name ||
        item.price?.nickname ||
        "item";
      const qty = item.quantity || 1;
      return `${qty}× ${name}`;
    })
    .join(", ");
}

function formatLineItems(session) {
  const items = session.line_items?.data || [];
  if (!items.length) return "—";
  const currency = session.currency || "usd";
  return items
    .map((item) => {
      const name =
        item.description ||
        item.price?.product?.name ||
        item.price?.nickname ||
        item.price?.id ||
        "item";
      const qty = item.quantity || 1;
      const lineTotal = formatMoney(item.amount_total, currency);
      return `• ${qty}× **${name}** — ${lineTotal}`;
    })
    .join("\n");
}

function formatOrderSummary(session) {
  const currency = session.currency || "usd";
  const sub = session.amount_subtotal;
  const total = session.amount_total;
  const tax = session.total_details?.amount_tax || 0;
  const shipping = session.total_details?.amount_shipping || 0;
  const discount = session.total_details?.amount_discount || 0;
  // Stripe sets subtotal == total when tax is inclusive (price already contains tax).
  const taxInclusive = sub != null && total != null && sub === total && tax > 0;

  const lines = [formatLineItems(session)];
  if (sub != null && sub !== total) {
    lines.push(`Subtotal: ${formatMoney(sub, currency)}`);
  }
  if (discount > 0) lines.push(`Discount: −${formatMoney(discount, currency)}`);
  if (shipping > 0) lines.push(`Shipping: ${formatMoney(shipping, currency)}`);
  if (tax > 0) {
    lines.push(
      `Tax: ${formatMoney(tax, currency)}${taxInclusive ? " (incl.)" : ""}`
    );
  }
  lines.push(`**Total: ${formatMoney(total, currency)}**`);
  return lines.join("\n");
}

// Successes / informational. Only sent when VERBOSE_LOGGING=true.
async function notifyLabelPurchased({ session, to, gameCount, parcel, label, orderNumber }) {
  if (!VERBOSE_LOGGING) return;

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

  await postToDiscord({
    embeds: [
      {
        title: orderNumber
          ? `📦 Shipping label purchased — ${orderNumber}`
          : "📦 Shipping label purchased",
        url: label.labelUrl,
        color: 0x57f287, // Discord green
        fields: [
          { name: "Customer", value: customerLines.join("\n"), inline: true },
          { name: "Ship to", value: shipToLines.join("\n"), inline: true },
          {
            name: "Package",
            value: `${parcel.length} × ${parcel.width} × ${parcel.height} ${parcel.distance_unit}\n${parcel.weight} ${parcel.mass_unit} (${gameCount}× game)`,
            inline: true,
          },
          {
            name: "Order",
            value: formatOrderSummary(session),
            inline: false,
          },
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
      },
    ],
  });
}

async function notifySubscriberAdded({
  subscriber,
  email,
  name,
  groupId,
  groupKind,
  groupLabel,
  sessionId,
  alreadyExisted,
}) {
  if (!VERBOSE_LOGGING) return;

  const subscriberId = subscriber?.id;
  const subscriberLink = subscriberId
    ? `https://dashboard.mailerlite.com/subscribers/${subscriberId}`
    : null;

  // Already-on-list: terse one-liner. Skips the full embed because nothing
  // new happened — they just paid/abandoned again with the same email.
  if (alreadyExisted) {
    await postToDiscord({
      embeds: [
        {
          title: `📧 ${email} already on the ${groupKind || "subscriber"} list`,
          color: 0x99aab5,
          description: subscriberLink
            ? `[View subscriber](${subscriberLink})`
            : undefined,
          timestamp: new Date().toISOString(),
        },
      ],
    });
    return;
  }

  const status = subscriber?.status || "active";
  const subscriberLinkMd = subscriberId
    ? `[\`${subscriberId}\`](${subscriberLink})`
    : "—";

  const links = [];
  if (sessionId) links.push(`[Stripe session](${stripeSessionUrl(sessionId)})`);
  if (subscriberLink)
    links.push(`[MailerLite subscriber](${subscriberLink})`);
  links.push(
    `[MailerLite group](https://dashboard.mailerlite.com/subscribers?rules=%5B%5B%7B%22operator%22%3A%22in_group%22%2C%22args%22%3A%5B%22${groupId}%22%5D%7D%5D%5D)`
  );

  await postToDiscord({
    embeds: [
      {
        title: `📧 Subscriber added to MailerLite (${groupKind || "subscriber"})`,
        color: 0x57f287,
        fields: [
          {
            name: "Customer",
            value: [name ? `**${name}**` : null, email].filter(Boolean).join("\n"),
            inline: true,
          },
          { name: "Group", value: groupLabel, inline: true },
          { name: "Status", value: status, inline: true },
          { name: "Subscriber", value: subscriberLinkMd, inline: false },
          { name: "Quick links", value: links.join(" • "), inline: false },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  });
}

async function addEmailToMailerLite(email, fields, group_id, alertContext = {}) {
  const { groupKind = "subscriber", ...restCtx } = alertContext;
  const groupLabel =
    groupKind === "purchase"
      ? "purchase (post-checkout) email group"
      : groupKind === "abandoned"
        ? "abandoned-checkout email group"
        : `email group ${group_id}`;

  if (!MAILER_LITE_KEY) {
    await alert(
      `MailerLite API key is missing — customer was NOT enrolled in the ${groupLabel}. Set MAILER_LITE_KEY in Netlify env.`,
      {
        source: "mailerlite",
        titleSuffix: groupKind,
        ...restCtx,
        email,
        group: group_id,
      }
    );
    return;
  }

  const cleanFields = Object.fromEntries(
    Object.entries(fields || {}).filter(([, v]) => v != null && v !== "")
  );

  const url = "https://connect.mailerlite.com/api/subscribers";
  const payload = {
    email,
    groups: [group_id],
    status: "active",
    ...(Object.keys(cleanFields).length && { fields: cleanFields }),
  };

  try {
    maybeForceFailure("mailerlite");
    console.log(
      `📧 Trying to add subscriber to MailerLite: ${email} for group ${group_id}`,
      cleanFields
    );
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MAILER_LITE_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`MailerLite API error: ${response.status} - ${errorText}`);
      await alert(
        `Failed to add customer to ${groupLabel} (HTTP ${response.status}). They won't receive the follow-up email flow.`,
        {
          source: "mailerlite",
          titleSuffix: groupKind,
          ...restCtx,
          email,
          group: group_id,
          response: errorText.slice(0, 500),
        }
      );
      return null;
    }

    const data = await response.json();
    // MailerLite returns 201 for a brand-new subscriber and 200 when the
    // email was already on file (the call upserts + re-adds to group).
    const alreadyExisted = response.status === 200;
    console.log(
      alreadyExisted
        ? "ℹ️  Subscriber already existed on MailerLite, re-added to group"
        : "✅ Subscriber added to MailerLite!"
    );
    await notifySubscriberAdded({
      subscriber: data?.data || data,
      email,
      name: cleanFields.name,
      groupId: group_id,
      groupKind,
      groupLabel,
      sessionId: restCtx.sessionId,
      alreadyExisted,
    });
    return data;
  } catch (error) {
    console.error("❌ Error adding subscriber:", error.message);
    await alert(
      `Failed to add customer to ${groupLabel} — request threw: ${error.message}`,
      {
        source: "mailerlite",
        titleSuffix: groupKind,
        ...restCtx,
        email,
        group: group_id,
      }
    );
    return null;
  }
}
