const IS_DEV = process.env.NETLIFY_DEV === "true";

const SHIPPO_API_KEY = IS_DEV
  ? process.env.SHIPPO_API_KEY_DEV
  : process.env.SHIPPO_API_KEY;

const SHIPPO_BASE = "https://api.goshippo.com";

export const DEFAULT_FROM_ADDRESS = {
  name: "Wonmin Lee",
  street1: "971 Stewart Ave",
  city: "Garden City",
  state: "NY",
  zip: "11530",
  country: "US",
  phone: process.env.SHIPPER_PHONE || "+15555555555",
  email: "1min@unicornwithwings.com",
};

// Each SHARE-home game weighs ~20 oz. Box weight is rolled into the rate cushion.
const GAME_WEIGHT_OZ = 20;

// Names of the user parcel templates in the Shippo dashboard. Box dims are
// pulled from those templates at runtime — change them in Shippo, not here.
const TEMPLATE_NAME_1X = "LCM 1x";
const TEMPLATE_NAME_2X = "LCM 2x";
const TEMPLATE_NAME_12X = "LCM 12x";

// Per-size rate caps. Anything above these = alert + skip, never auto-buy.
const MAX_USD_1X = Number(process.env.SHIPPO_MAX_LABEL_USD_1X || "15");
const MAX_USD_2X = Number(process.env.SHIPPO_MAX_LABEL_USD_2X || "15");
const MAX_USD_12X = Number(process.env.SHIPPO_MAX_LABEL_USD_12X || "30");

// Module-level cache. Shippo templates rarely change; one fetch per warm
// Netlify function instance is fine. Cold start re-fetches.
let templatesByNamePromise = null;

// A Shippo response as JSON, or its text when it isn't any (a gateway 502/504 page), so a failure
// still reports its HTTP status rather than a JSON SyntaxError
async function readBody(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text.slice(0, 300);
  }
}

async function getTemplatesByName() {
  if (templatesByNamePromise) return templatesByNamePromise;
  templatesByNamePromise = (async () => {
    if (!SHIPPO_API_KEY) {
      throw new Error("SHIPPO_API_KEY missing — set SHIPPO_API_KEY_DEV in .env");
    }
    const res = await fetch(`${SHIPPO_BASE}/user-parcel-templates/`, {
      headers: { Authorization: `ShippoToken ${SHIPPO_API_KEY}` },
    });
    const data = await readBody(res);
    if (!res.ok) {
      throw new Error(`Shippo /user-parcel-templates/ ${res.status}: ${JSON.stringify(data)}`);
    }
    const map = new Map();
    for (const tpl of data.results || []) map.set(tpl.name, tpl);
    return map;
  })().catch((err) => {
    // Don't cache failures — next call should retry.
    templatesByNamePromise = null;
    throw err;
  });
  return templatesByNamePromise;
}

async function parcelFromTemplate(name, qty) {
  const templates = await getTemplatesByName();
  const tpl = templates.get(name);
  if (!tpl) {
    throw new Error(
      `Shippo user parcel template "${name}" not found. Available: ${[...templates.keys()].join(", ") || "none"}`
    );
  }
  // Use template dims; weight scales with how many games actually ship.
  return {
    length: tpl.length,
    width: tpl.width,
    height: tpl.height,
    distance_unit: tpl.distance_unit,
    weight: (qty * GAME_WEIGHT_OZ).toString(),
    mass_unit: "oz",
    templateName: tpl.name,
    templateId: tpl.object_id,
  };
}

// Pick a parcel + cap by total game quantity. Only 1, 2, and 12 map to a
// template — we don't stock boxes for 3-11, so those return null and the
// caller must alert for manual packaging. Returns { parcel, maxLabelUsd }
// or null. Throws only if the template lookup itself fails.
export async function parcelForGameCount(qty) {
  if (qty === 1) {
    return { parcel: await parcelFromTemplate(TEMPLATE_NAME_1X, qty), maxLabelUsd: MAX_USD_1X };
  }
  if (qty === 2) {
    return { parcel: await parcelFromTemplate(TEMPLATE_NAME_2X, qty), maxLabelUsd: MAX_USD_2X };
  }
  if (qty === 12) {
    return { parcel: await parcelFromTemplate(TEMPLATE_NAME_12X, qty), maxLabelUsd: MAX_USD_12X };
  }
  return null;
}


const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// A Shippo call. Calls that can't buy anything (rates, addresses, orders,
// customs, lookups) are tried again on a network error, a 429 or a 5xx, after
// 0.5s then 1.5s (short: the webhook has seconds to finish). A label purchase
// (POST /transactions/) is never repeated here: if it fails without an answer
// we can't tell whether a label was bought, so the caller looks it up first
// (findExistingLabel) on the next try instead.
async function shippoFetch(path, body, { method = body ? "POST" : "GET" } = {}) {
  if (!SHIPPO_API_KEY) {
    throw new Error("SHIPPO_API_KEY missing — set SHIPPO_API_KEY_DEV in .env");
  }
  const buys = method === "POST" && path.startsWith("/transactions");
  const waits = buys ? [] : [500, 1500];
  for (let attempt = 0; ; attempt++) {
    let res;
    try {
      res = await fetch(`${SHIPPO_BASE}${path}`, {
        method,
        headers: {
          ...(body && { "Content-Type": "application/json" }),
          Authorization: `ShippoToken ${SHIPPO_API_KEY}`,
        },
        ...(body && { body: JSON.stringify(body) }),
      });
    } catch (err) {
      if (attempt < waits.length) {
        await sleep(waits[attempt]);
        continue;
      }
      const e = new Error(`Shippo ${path} unreachable: ${err.message}`);
      e.transient = true;
      if (buys) e.unknownOutcome = true;
      throw e;
    }
    const data = await readBody(res);
    if (res.ok) return data;
    const transient = res.status === 429 || res.status >= 500;
    if (transient && attempt < waits.length) {
      await sleep(waits[attempt]);
      continue;
    }
    const e = new Error(`Shippo ${path} ${res.status}: ${JSON.stringify(data)}`);
    e.transient = transient;
    if (buys && res.status >= 500) e.unknownOutcome = true;
    throw e;
  }
}

// True when a Shippo or carrier message says the recipient address is the
// problem ("Recipient address invalid: Address not found.", UPS "Address
// Validation Error on ShipTo address", ...).
export function isAddressError(message) {
  return /address (not found|invalid|validation)|invalid address|ship ?to address/i.test(String(message || ""));
}

// Spellings of a street line that USPS knows better: "8295 US-20" is
// "8295 US Highway 20" to USPS (a real failure, Nov 2026).
export function streetVariants(street) {
  const s = String(street || "").trim();
  const out = new Set();
  const swap = (re, rep) => {
    const v = s.replace(re, rep).replace(/\s+/g, " ").trim();
    if (v && v.toLowerCase() !== s.toLowerCase()) out.add(v);
  };
  swap(/\bU\.?S\.?[-\s]*(?:HWY|HIGHWAY|RTE|ROUTE)?[-\s]*(\d+[A-Z]?)\b/i, "US Highway $1");
  swap(/\bU\.?S\.?[-\s]*(?:HWY|HIGHWAY|RTE|ROUTE)?[-\s]*(\d+[A-Z]?)\b/i, "Highway $1");
  swap(/\b(?:SR|ST RTE|STATE RTE|STATE ROUTE)[-\s]*(\d+[A-Z]?)\b/i, "State Route $1");
  swap(/\b(?:SR|ST RTE|STATE RTE|STATE ROUTE|STATE HWY|STATE HIGHWAY)[-\s]*(\d+[A-Z]?)\b/i, "Highway $1");
  swap(/\b(?:HWY|HIWAY)[-\s]*(\d+[A-Z]?)\b/i, "Highway $1");
  swap(/\b(?:CR|CO RD|CO RTE)[-\s]*(\d+[A-Z]?)\b/i, "County Road $1");
  swap(/\bFM[-\s]*(\d+)\b/i, "Farm to Market Road $1");
  swap(/\bRR[-\s]*(\d+)\b/i, "Rural Route $1");
  // a state route written with the state's code: "OR-34", "CA 1"
  swap(/\b(?!US\b)[A-Z]{2}-(\d+[A-Z]?)\b/, "Highway $1");
  swap(/\b(?!US\b)[A-Z]{2}-(\d+[A-Z]?)\b/, "State Highway $1");
  return [...out];
}

const zip5 = (zip) => String(zip || "").trim().slice(0, 5);

// An address Shippo's validator accepts for the same place: the address as
// given, then each street spelling above, then with a 5-digit ZIP. Only a
// result in the same state and the same 5-digit ZIP is taken, so a fix can
// never send the box somewhere else; apartment lines, name, phone and email
// are kept as the buyer typed them. Returns { to, tried } with `to` null when
// nothing validates.
export async function fixAddress(to) {
  const candidates = [];
  const add = (street1, zip) => {
    if (!candidates.some((c) => c.street1 === street1 && c.zip === zip)) candidates.push({ street1, zip });
  };
  add(to.street1, to.zip);
  for (const v of streetVariants(to.street1)) add(v, to.zip);
  if (zip5(to.zip) !== String(to.zip || "").trim()) {
    add(to.street1, zip5(to.zip));
    for (const v of streetVariants(to.street1)) add(v, zip5(to.zip));
  }
  const tried = [];
  for (const c of candidates.slice(0, 8)) {
    tried.push(`${c.street1}, ${c.zip}`);
    let a;
    try {
      a = await shippoFetch("/addresses/", {
        name: to.name,
        street1: c.street1,
        ...(to.street2 && { street2: to.street2 }),
        city: to.city,
        state: to.state,
        zip: c.zip,
        country: to.country || "US",
        validate: true,
      });
    } catch (err) {
      tried[tried.length - 1] += ` (validator error: ${err.message.slice(0, 80)})`;
      continue;
    }
    const ok = a.validation_results?.is_valid === true;
    const sameState = String(a.state || "").toUpperCase() === String(to.state || "").toUpperCase();
    const sameZip = zip5(a.zip) === zip5(to.zip);
    if (ok && sameState && sameZip && a.street1) {
      return {
        to: {
          ...to,
          street1: a.street1,
          ...(a.street2 ? { street2: a.street2 } : {}),
          city: a.city || to.city,
          zip: a.zip || c.zip,
        },
        tried,
      };
    }
  }
  return { to: null, tried };
}

// A label already bought (or being bought) for this Stripe session: one
// whose metadata names the session, or one on the same Shippo order (bought
// by hand from the Orders view). Looks at labels made since `sinceIso`.
// Returns { transactionId, trackingNumber, trackingUrl, labelUrl } or null.
export async function findExistingLabel({ sessionId, orderId, sinceIso }) {
  const meta = `stripe_session=${sessionId}`;
  const since = sinceIso || new Date(Date.now() - 14 * 864e5).toISOString();
  for (let page = 1; page <= 5; page++) {
    const data = await shippoFetch(
      `/transactions/?results=100&page=${page}&object_created_gte=${encodeURIComponent(since)}`
    );
    for (const t of data.results || []) {
      const st = String(t.status || t.object_status || "").toUpperCase();
      if (!["SUCCESS", "QUEUED", "WAITING"].includes(st)) continue;
      const order = typeof t.order === "string" ? t.order : t.order?.object_id;
      if (t.metadata === meta || (orderId && order === orderId)) {
        return {
          transactionId: t.object_id,
          trackingNumber: t.tracking_number,
          trackingUrl: t.tracking_url_provider,
          labelUrl: t.label_url,
          status: st,
        };
      }
    }
    if (!data.next) break;
  }
  return null;
}

// Labels that failed in the last `days` days for a Stripe session (the
// webhook's metadata) and have no working label since: the retry job's
// backstop for a failure that never made it into its queue.
export async function failedSessionLabels({ days = 3 } = {}) {
  const since = new Date(Date.now() - days * 864e5).toISOString();
  const failed = new Map();
  const good = new Set();
  for (let page = 1; page <= 5; page++) {
    const data = await shippoFetch(
      `/transactions/?results=100&page=${page}&object_created_gte=${encodeURIComponent(since)}`
    );
    for (const t of data.results || []) {
      const m = /^stripe_session=(cs_\w+)$/.exec(t.metadata || "");
      const st = String(t.status || t.object_status || "").toUpperCase();
      const order = typeof t.order === "string" ? t.order : t.order?.object_id;
      if (st === "ERROR" && m) {
        if (!failed.has(m[1])) {
          failed.set(m[1], {
            sessionId: m[1],
            orderId: order || null,
            error: (t.messages || []).map((x) => x.text).join("; "),
            at: t.object_created,
          });
        }
      } else if (st !== "ERROR" && st !== "REFUNDED") {
        if (m) good.add(m[1]);
        if (order) good.add(order);
      }
    }
    if (!data.next) break;
  }
  return [...failed.values()].filter((f) => !good.has(f.sessionId) && !(f.orderId && good.has(f.orderId)));
}

// The order number of a Shippo order (to reuse it on a retry).
export async function getOrder(orderId) {
  return shippoFetch(`/orders/${orderId}`);
}

function pickCheapest(rates) {
  return rates.reduce((a, b) =>
    parseFloat(a.amount) <= parseFloat(b.amount) ? a : b
  );
}

// USPS treats these US state/territory codes as international destinations
// and requires a customs declaration even though the country is "US".
// AE/AP/AA = APO/FPO/DPO military mail; PR = Puerto Rico.
const CUSTOMS_REQUIRED_STATES = new Set(["AE", "AP", "AA", "PR"]);
function requiresCustomsDeclaration(to) {
  return (!to.country || to.country === "US") && CUSTOMS_REQUIRED_STATES.has(to.state);
}

async function createCustomsDeclaration({ description, quantity, valueUsd, originCountry, weightOz, destinationState }) {
  const qty = Math.max(quantity, 1);
  const perUnitValue = (valueUsd / qty).toFixed(2);
  const perUnitWeightOz = (weightOz / qty).toFixed(2);
  // NOEEI_30_36 = exemption for shipments to US military post offices (APO/FPO/DPO).
  // NOEEI_30_37_a = exemption for goods valued under $2,500 to US territories (PR, etc.).
  const eel_pfc = destinationState !== "PR" ? "NOEEI_30_36" : "NOEEI_30_37_a";
  return shippoFetch("/customs/declarations/", {
    certify: true,
    certify_signer: DEFAULT_FROM_ADDRESS.name,
    contents_type: "MERCHANDISE",
    non_delivery_option: "RETURN",
    eel_pfc,
    items: [{
      description: String(description).slice(0, 255),
      quantity: qty,
      net_weight: perUnitWeightOz,
      mass_unit: "oz",
      value_amount: perUnitValue,
      value_currency: "USD",
      origin_country: originCountry,
      tariff_number: "9504.90",
    }],
  });
}

// Create a Shippo Order so the transaction shows up under the dashboard's
// "Orders" view with line items, totals, and customer info. Cosmetic — the
// label still works without it. Returns the full order object; callers
// typically only need `.object_id` to pass as `order` on createLabel().
export async function createOrder({
  to,
  from = DEFAULT_FROM_ADDRESS,
  lineItems,
  orderNumber,
  placedAt,
  totalPrice,
  subtotalPrice,
  totalTax,
  shippingCost,
  currency = "USD",
  weightOz,
  notes,
}) {
  const body = {
    to_address: to,
    from_address: from,
    placed_at: placedAt,
    order_status: "PAID",
    currency,
    ...(orderNumber && { order_number: orderNumber }),
    ...(notes && { notes: String(notes).slice(0, 200) }),
    ...(totalPrice != null && { total_price: totalPrice.toFixed(2) }),
    ...(subtotalPrice != null && { subtotal_price: subtotalPrice.toFixed(2) }),
    ...(totalTax != null && { total_tax: totalTax.toFixed(2) }),
    ...(shippingCost != null && {
      shipping_cost: shippingCost.toFixed(2),
      shipping_cost_currency: currency,
    }),
    ...(weightOz != null && {
      weight: weightOz.toString(),
      weight_unit: "oz",
    }),
    ...(lineItems?.length && { line_items: lineItems }),
  };
  return shippoFetch("/orders/", body);
}

/**
 * Create a shipment, buy a label, and return the tracking info.
 *
 * @param {Object} opts
 * @param {Object} opts.to - recipient address
 * @param {Object} [opts.from] - override DEFAULT_FROM_ADDRESS
 * @param {Object} opts.parcel - parcel dims + weight (use parcelForGameCount)
 * @param {string} [opts.preferredServiceToken] - e.g. "usps_priority"; falls back to cheapest
 * @param {string} [opts.metadata] - free-form string Shippo stores on the transaction
 * @param {string} [opts.shipmentMetadata] - free-form string on the shipment (max 100 chars). Visible from Shippo's Shipments view.
 * @param {number} opts.maxLabelUsd - hard ceiling; refuse to buy above this.
 * @param {string} [opts.order] - Shippo Order object_id to link the transaction to.
 * @param {string} [opts.reference1] - prints on the USPS label (max 30 chars).
 * @param {string} [opts.reference2] - second label reference (max 30 chars).
 * @param {Object} [opts.customs] - customs declaration data for military/international shipments.
 *   Automatically applied when `to.state` is AE/AP/AA (military).
 *   Shape: { description, quantity, valueUsd, originCountry, weightOz }
 * @param {boolean} [opts.recover] - retry job: fix an address the carrier can't find and fall back to the
 *   next cheapest carrier under the cap. Errors carry `tried` (what was attempted), `addressError`, `capRejection`.
 * @param {boolean} [opts.fixAddressFirst] - with `recover`, check the address before the first try.
 */
export async function createLabel({
  to,
  from = DEFAULT_FROM_ADDRESS,
  parcel,
  preferredServiceToken,
  metadata,
  shipmentMetadata,
  maxLabelUsd,
  order,
  reference1,
  reference2,
  customs,
  recover = false,
  fixAddressFirst = false,
}) {
  if (!parcel) throw new Error("createLabel: parcel is required");
  if (typeof maxLabelUsd !== "number") {
    throw new Error("createLabel: maxLabelUsd is required");
  }
  // Strip our bookkeeping fields before sending to Shippo.
  const { templateName: _t, templateId: _id, ...shippoParcel } = parcel;

  // USPS caps reference fields at 30 chars; truncate defensively.
  const extra = {};
  if (reference1) extra.reference_1 = String(reference1).slice(0, 30);
  if (reference2) extra.reference_2 = String(reference2).slice(0, 30);

  let customsDeclarationId;
  if (customs && requiresCustomsDeclaration(to)) {
    const decl = await createCustomsDeclaration({ ...customs, destinationState: to.state });
    customsDeclarationId = decl.object_id;
    console.log(`📦 Created customs declaration ${customsDeclarationId} for ${to.state} address`);
  }

  const makeShipment = (address) =>
    shippoFetch("/shipments/", {
      address_from: from,
      address_to: address,
      parcels: [shippoParcel],
      async: false,
      ...(Object.keys(extra).length && { extra }),
      ...(shipmentMetadata && { metadata: String(shipmentMetadata).slice(0, 100) }),
      ...(customsDeclarationId && { customs_declaration: customsDeclarationId }),
    });
  // USD rates under the cap, cheapest first (the preferred service, if any, first of all)
  const affordable = (shipment) =>
    (shipment.rates || [])
      .filter((r) => r.currency === "USD" && parseFloat(r.amount) <= maxLabelUsd)
      .sort((x, y) => {
        if (preferredServiceToken) {
          const px = x.servicelevel?.token === preferredServiceToken ? 0 : 1;
          const py = y.servicelevel?.token === preferredServiceToken ? 0 : 1;
          if (px !== py) return px - py;
        }
        return parseFloat(x.amount) - parseFloat(y.amount);
      });

  // `recover` (the retry job): fix an address the carrier can't find, and
  // when a carrier refuses a label, try the next cheapest carrier under the
  // cap. A refused label costs nothing, so each new try is safe; it stops at
  // the first label bought.
  const tried = [];
  const fail = (message, props = {}) => {
    const e = new Error(message);
    Object.assign(e, { tried, ...props });
    return e;
  };
  let address = to;
  let addressFixed = false;
  if (recover && fixAddressFirst) {
    addressFixed = true;
    const fixed = await fixAddress(to);
    tried.push(...fixed.tried.map((t) => `address check: ${t}`));
    if (fixed.to) {
      address = fixed.to;
      tried.push(`using address ${address.street1}, ${address.city}, ${address.state} ${address.zip}`);
    }
  }

  let shipment = await makeShipment(address);
  if (!shipment.rates?.length) {
    const msg = JSON.stringify(shipment.messages);
    throw fail(`No rates returned. Shipment messages: ${msg}`, { addressError: isAddressError(msg) });
  }
  let rates = affordable(shipment);
  if (!rates.length) {
    const cheapest = pickCheapest(shipment.rates);
    throw fail(
      `Refusing to buy label: rate ${cheapest.amount} ${cheapest.currency} exceeds cap of ${maxLabelUsd} USD`,
      { capRejection: true }
    );
  }

  const refusedCarriers = new Set();
  let txn;
  let rate;
  let lastMessage = "";
  for (let attempt = 0; attempt < (recover ? 4 : 1); attempt++) {
    rate = rates.find((r) => !refusedCarriers.has(r.provider));
    if (!rate) break;
    txn = await shippoFetch("/transactions/", {
      rate: rate.object_id,
      // 4x6 = the standard thermal/peel-and-stick shipping label size. "PDF"
      // (no size suffix) is 8.5x11 letter with the label centered on a full
      // page — wasteful to print and not what we get from the dashboard.
      label_file_type: "PDF_4x6",
      async: false,
      ...(metadata && { metadata }),
      ...(order && { order }),
    });
    if (txn.status === "SUCCESS") break;
    lastMessage = (txn.messages || []).map((m) => m.text).join("; ") || txn.status;
    tried.push(`${rate.provider} ${rate.servicelevel?.name || ""} $${rate.amount}: ${lastMessage}`);
    if (!recover) break;
    if (isAddressError(lastMessage) && !addressFixed) {
      addressFixed = true;
      const fixed = await fixAddress(to);
      tried.push(...fixed.tried.map((t) => `address check: ${t}`));
      if (fixed.to) {
        address = fixed.to;
        tried.push(`using address ${address.street1}, ${address.city}, ${address.state} ${address.zip}`);
        shipment = await makeShipment(address);
        rates = affordable(shipment);
        refusedCarriers.clear();
        continue;
      }
    }
    refusedCarriers.add(rate.provider);
  }

  if (txn?.status !== "SUCCESS") {
    throw fail(`Label purchase failed: ${lastMessage || "no carrier under the cap took it"}`, {
      addressError: isAddressError(lastMessage),
    });
  }

  return {
    tried,
    to: address,
    trackingNumber: txn.tracking_number,
    trackingUrl: txn.tracking_url_provider,
    labelUrl: txn.label_url,
    transactionId: txn.object_id,
    rate: {
      provider: rate.provider,
      service: rate.servicelevel?.name,
      token: rate.servicelevel?.token,
      amount: rate.amount,
      currency: rate.currency,
    },
  };
}
