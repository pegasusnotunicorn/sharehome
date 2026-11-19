// Offline test of the label recovery (no real Shippo, Stripe, Blobs or Discord):
// a fake Shippo, Stripe and Blobs stand in, and each case checks what got
// bought and whether Wonmin was alerted.
//
// Run: node --experimental-test-module-mocks --test scripts/test-label-recovery.mjs
import { test, mock, beforeEach } from "node:test";
import assert from "node:assert/strict";

process.env.SHIPPO_API_KEY = "fake";
process.env.STRIPE_SECRET_KEY = "sk_fake";
process.env.STRIPE_LCM_PRODUCT_ID_LIVE = "prod_lcm";
process.env.ALERT_WEBHOOK_URL = "https://discord.test/hook";
delete process.env.NETLIFY_DEV;

// ---- fake Netlify Blobs
const blobs = new Map(); // "store/key" -> { data, etag }
let etagN = 0;
mock.module("@netlify/blobs", {
  namedExports: {
    getStore(opts) {
      const name = typeof opts === "string" ? opts : opts.name;
      const k = (key) => `${name}/${key}`;
      return {
        async set(key, data, o = {}) {
          const cur = blobs.get(k(key));
          if (o.onlyIfNew && cur) return { modified: false };
          if (o.onlyIfMatch && cur?.etag !== o.onlyIfMatch) return { modified: false };
          blobs.set(k(key), { data: String(data), etag: `e${++etagN}` });
          return { modified: true };
        },
        async setJSON(key, v) {
          blobs.set(k(key), { data: JSON.stringify(v), etag: `e${++etagN}` });
          return { modified: true };
        },
        async get(key, o = {}) {
          const cur = blobs.get(k(key));
          if (!cur) return null;
          return o.type === "json" ? JSON.parse(cur.data) : cur.data;
        },
        async getWithMetadata(key) {
          const cur = blobs.get(k(key));
          return cur ? { data: cur.data, etag: cur.etag } : null;
        },
        async delete(key) {
          blobs.delete(k(key));
        },
        async list() {
          return {
            blobs: [...blobs.keys()].filter((x) => x.startsWith(`${name}/`)).map((x) => ({ key: x.slice(name.length + 1) })),
          };
        },
      };
    },
  },
});

// ---- fake Stripe
const sessions = new Map();
mock.module("stripe", {
  defaultExport: () => ({
    checkout: {
      sessions: {
        async retrieve(id) {
          if (!sessions.has(id)) throw new Error("No such session");
          return structuredClone(sessions.get(id));
        },
        async update(id, { metadata }) {
          sessions.get(id).metadata = metadata;
        },
      },
    },
    webhooks: { constructEvent: () => ({}) },
  }),
});

// ---- fake Shippo + Discord
let shippo;
const alerts = [];
function resetShippo() {
  shippo = {
    txns: [], // { object_id, status, metadata, order, messages, object_created }
    buys: 0,
    // (rate provider, address street) -> outcome: "ok" | "address" | "refuse" | "500-bought"
    outcome: () => "ok",
    validStreets: new Set(),
    shipmentFails: 0,
    rateAmount: { USPS: 5.1, UPS: 6.2 },
  };
}
let idN = 0;
const json = (body, status = 200) => new Response(JSON.stringify(body), { status });
globalThis.fetch = async (url, init = {}) => {
  url = String(url);
  if (url.startsWith("https://discord.test")) {
    alerts.push(JSON.parse(init.body).embeds[0]);
    return new Response("ok", { status: 200 });
  }
  const path = url.replace("https://api.goshippo.com", "");
  const body = init.body ? JSON.parse(init.body) : null;
  if (path.startsWith("/user-parcel-templates")) {
    return json({ results: ["LCM 1x", "LCM 2x", "LCM 12x"].map((name) => ({ name, object_id: name, length: "10", width: "8", height: "4", distance_unit: "in" })) });
  }
  if (path === "/orders/" && init.method === "POST") return json({ object_id: `order${++idN}`, order_number: body.order_number });
  if (path.startsWith("/orders/")) return json({ object_id: path.split("/")[2], order_number: "LCM-OLD-001" });
  if (path === "/addresses/") {
    const ok = shippo.validStreets.has(body.street1) || [...shippo.validStreets].some((v) => v.startsWith(`${body.street1}=>`));
    const fixed = [...shippo.validStreets].find((v) => v.startsWith(`${body.street1}=>`));
    return json({
      ...body,
      street1: fixed ? fixed.split("=>")[1] : body.street1,
      validation_results: { is_valid: ok, messages: [] },
    });
  }
  if (path === "/shipments/") {
    if (shippo.shipmentFails > 0) {
      shippo.shipmentFails--;
      return new Response("<html>502 Bad Gateway</html>", { status: 502 });
    }
    const street = body.address_to.street1;
    return json({
      object_id: `shp${++idN}`,
      rates: Object.entries(shippo.rateAmount).map(([provider, amount]) => ({
        object_id: `rate|${provider}|${street}`,
        provider,
        amount: String(amount),
        currency: "USD",
        servicelevel: { name: "Ground", token: `${provider.toLowerCase()}_ground` },
      })),
    });
  }
  if (path === "/transactions/" && init.method === "POST") {
    const [, provider, street] = body.rate.split("|");
    const out = shippo.outcome(provider, street);
    const t = {
      object_id: `txn${++idN}`,
      metadata: body.metadata,
      order: body.order,
      object_created: new Date().toISOString(),
      tracking_number: `TRK${idN}`,
      label_url: `https://label/${idN}.pdf`,
      tracking_url_provider: `https://track/${idN}`,
    };
    if (out === "ok" || out === "500-bought") {
      shippo.buys++;
      shippo.txns.push({ ...t, status: "SUCCESS", messages: [] });
      if (out === "500-bought") return new Response("upstream timeout", { status: 504 });
      return json({ ...t, status: "SUCCESS", messages: [] });
    }
    const text = out === "address" ? "Recipient address invalid: Address not found." : "Carrier refused: service unavailable";
    shippo.txns.push({ ...t, status: "ERROR", messages: [{ text }] });
    return json({ ...t, status: "ERROR", messages: [{ text }] });
  }
  if (path.startsWith("/transactions/?")) return json({ results: [...shippo.txns].reverse(), next: null });
  throw new Error(`unexpected fetch ${init.method || "GET"} ${url}`);
};

const { purchaseShippoLabel } = await import("../netlify/functions/stripe-webhooks.js");
const { default: shippoRetry } = await import("../netlify/functions/shippo-retry.js");
const { streetVariants } = await import("../netlify/functions/lib/shippo.js");

function addSession(id, street1 = "8295 US-20", games = 1) {
  sessions.set(id, {
    id,
    created: Math.floor(Date.now() / 1000) - 60,
    amount_total: 4500,
    amount_subtotal: 4000,
    currency: "usd",
    customer_details: { email: "buyer@example.com", name: "Test Buyer" },
    collected_information: {
      shipping_details: {
        name: "Test Buyer",
        address: { line1: street1, line2: null, city: "Toledo", state: "OR", postal_code: "97391-9769", country: "US" },
      },
    },
    metadata: {},
    line_items: { data: [{ quantity: games, price: { product: { id: "prod_lcm" } } }] },
  });
}
const queueEntry = (id) => JSON.parse(blobs.get(`shippo-label-retries/${id}`)?.data || "null");
function makeDue(id) {
  const e = queueEntry(id);
  e.nextAt = new Date(Date.now() - 1000).toISOString();
  blobs.set(`shippo-label-retries/${id}`, { data: JSON.stringify(e), etag: "x" });
}

beforeEach(() => {
  blobs.clear();
  sessions.clear();
  alerts.length = 0;
  resetShippo();
});

test("street spellings USPS knows better", () => {
  assert.deepEqual(streetVariants("8295 US-20"), ["8295 US Highway 20", "8295 Highway 20"]);
  assert.ok(streetVariants("12 OR-34").includes("12 Highway 34"));
  assert.ok(streetVariants("4 Hwy 101 N").includes("4 Highway 101 N"));
  assert.deepEqual(streetVariants("5 Main St"), []);
});

test("address the carrier can't find: queued quietly, fixed and bought by the retry job", async () => {
  addSession("cs_live_A");
  shippo.outcome = (_p, street) => (street === "8295 US-20" ? "address" : "ok");
  shippo.validStreets.add("8295 US Highway 20=>8295 Highway 20");
  assert.equal(await purchaseShippoLabel({ id: "cs_live_A" }, "evt_1", null), "queued");
  assert.equal(alerts.length, 0);
  assert.equal(queueEntry("cs_live_A").attempts, 0);
  assert.ok(queueEntry("cs_live_A").orderId);
  await shippoRetry();
  assert.equal(shippo.buys, 1);
  assert.equal(alerts.length, 0);
  assert.equal(queueEntry("cs_live_A").state, "done");
  assert.ok(sessions.get("cs_live_A").metadata.shippo_transaction_id);
  // the label went to the fixed street, on the first try's Shippo order
  const ok = shippo.txns.find((t) => t.status === "SUCCESS");
  assert.equal(ok.order, queueEntry("cs_live_A").orderId);
  await shippoRetry(); // nothing left to do
  assert.equal(shippo.buys, 1);
});

test("an address nothing can find: two retries, then one alert saying why", async () => {
  addSession("cs_live_B", "1 Nowhere Rd");
  shippo.outcome = () => "address";
  await purchaseShippoLabel({ id: "cs_live_B" }, "evt_1", null);
  await shippoRetry();
  assert.equal(queueEntry("cs_live_B").state, "waiting");
  assert.equal(alerts.length, 0);
  makeDue("cs_live_B");
  await shippoRetry();
  assert.equal(queueEntry("cs_live_B").state, "gave-up");
  assert.equal(shippo.buys, 0);
  assert.equal(alerts.length, 1);
  assert.match(alerts[0].description, /can't find this address/);
  assert.ok(alerts[0].fields.some((f) => f.name === "What was tried" && /USPS/.test(f.value) && /UPS/.test(f.value)));
  makeDue("cs_live_B");
  await shippoRetry(); // given up: no more tries, no more alerts
  assert.equal(alerts.length, 1);
});

test("a label bought but its answer lost (504): the retry finds it and never buys twice", async () => {
  addSession("cs_live_C", "5 Main St");
  shippo.outcome = () => "500-bought";
  assert.equal(await purchaseShippoLabel({ id: "cs_live_C" }, "evt_1", null), "queued");
  shippo.outcome = () => "ok";
  await shippoRetry();
  assert.equal(shippo.buys, 1);
  assert.equal(queueEntry("cs_live_C").state, "done");
  assert.ok(sessions.get("cs_live_C").metadata.shippo_transaction_id);
  assert.equal(alerts.length, 0);
});

test("a carrier refuses: the next cheapest carrier under the cap is bought", async () => {
  addSession("cs_live_D", "5 Main St");
  shippo.outcome = (p) => (p === "USPS" ? "refuse" : "ok");
  await purchaseShippoLabel({ id: "cs_live_D" }, "evt_1", null);
  await shippoRetry();
  assert.equal(shippo.buys, 1);
  assert.equal(shippo.txns.find((t) => t.status === "SUCCESS").object_id.length > 0, true);
  assert.equal(alerts.length, 0);
});

test("a Shippo 502 on rates is retried inside the same try", async () => {
  addSession("cs_live_E", "5 Main St");
  shippo.shipmentFails = 2;
  assert.equal(await purchaseShippoLabel({ id: "cs_live_E" }, "evt_1", null), "done");
  assert.equal(shippo.buys, 1);
});

test("over the safety cap: no retries, one alert", async () => {
  addSession("cs_live_F", "5 Main St");
  shippo.rateAmount = { USPS: 99, UPS: 120 };
  assert.equal(await purchaseShippoLabel({ id: "cs_live_F" }, "evt_1", null), "gave-up");
  assert.equal(alerts.length, 1);
  assert.match(alerts[0].description, /safety cap/);
  assert.equal(queueEntry("cs_live_F"), null);
});

test("backstop: a failed label in Shippo that never reached the queue gets bought", async () => {
  addSession("cs_live_G", "5 Main St");
  shippo.txns.push({
    object_id: "txn_old",
    status: "ERROR",
    metadata: "stripe_session=cs_live_G",
    order: "order_old",
    messages: [{ text: "Recipient address invalid: Address not found." }],
    object_created: new Date().toISOString(),
  });
  shippo.validStreets.add("5 Main St");
  await shippoRetry();
  assert.equal(shippo.buys, 1);
  assert.equal(shippo.txns.find((t) => t.status === "SUCCESS").order, "order_old");
  assert.equal(queueEntry("cs_live_G").state, "done");
});

test("bought by hand on the Shippo order meanwhile: the retry records it and buys nothing", async () => {
  addSession("cs_live_H", "5 Main St");
  shippo.outcome = () => "address";
  await purchaseShippoLabel({ id: "cs_live_H" }, "evt_1", null);
  const orderId = queueEntry("cs_live_H").orderId;
  shippo.txns.push({ object_id: "txn_hand", status: "SUCCESS", metadata: "", order: orderId, messages: [], object_created: new Date().toISOString() });
  shippo.outcome = () => "ok";
  await shippoRetry();
  assert.equal(shippo.buys, 0);
  assert.equal(sessions.get("cs_live_H").metadata.shippo_transaction_id, "txn_hand");
  assert.equal(queueEntry("cs_live_H").state, "done");
});
