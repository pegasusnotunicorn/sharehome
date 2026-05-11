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

async function getTemplatesByName() {
  if (templatesByNamePromise) return templatesByNamePromise;
  templatesByNamePromise = (async () => {
    if (!SHIPPO_API_KEY) {
      throw new Error("SHIPPO_API_KEY missing — set SHIPPO_API_KEY_DEV in .env");
    }
    const res = await fetch(`${SHIPPO_BASE}/user-parcel-templates/`, {
      headers: { Authorization: `ShippoToken ${SHIPPO_API_KEY}` },
    });
    const data = await res.json();
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


async function shippoFetch(path, body) {
  if (!SHIPPO_API_KEY) {
    throw new Error("SHIPPO_API_KEY missing — set SHIPPO_API_KEY_DEV in .env");
  }

  const res = await fetch(`${SHIPPO_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `ShippoToken ${SHIPPO_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `Shippo ${path} ${res.status}: ${JSON.stringify(data)}`
    );
  }
  return data;
}

function pickCheapest(rates) {
  return rates.reduce((a, b) =>
    parseFloat(a.amount) <= parseFloat(b.amount) ? a : b
  );
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
 * @param {number} opts.maxLabelUsd - hard ceiling; refuse to buy above this.
 */
export async function createLabel({
  to,
  from = DEFAULT_FROM_ADDRESS,
  parcel,
  preferredServiceToken,
  metadata,
  maxLabelUsd,
}) {
  if (!parcel) throw new Error("createLabel: parcel is required");
  if (typeof maxLabelUsd !== "number") {
    throw new Error("createLabel: maxLabelUsd is required");
  }
  // Strip our bookkeeping fields before sending to Shippo.
  const { templateName: _t, templateId: _id, ...shippoParcel } = parcel;

  const shipment = await shippoFetch("/shipments/", {
    address_from: from,
    address_to: to,
    parcels: [shippoParcel],
    async: false,
  });

  if (!shipment.rates?.length) {
    throw new Error(
      `No rates returned. Shipment messages: ${JSON.stringify(
        shipment.messages
      )}`
    );
  }

  const rate = preferredServiceToken
    ? shipment.rates.find(
        (r) => r.servicelevel?.token === preferredServiceToken
      ) ?? pickCheapest(shipment.rates)
    : pickCheapest(shipment.rates);

  const rateAmount = parseFloat(rate.amount);
  if (rate.currency !== "USD" || rateAmount > maxLabelUsd) {
    throw new Error(
      `Refusing to buy label: rate ${rate.amount} ${rate.currency} exceeds cap of ${maxLabelUsd} USD`
    );
  }

  const txn = await shippoFetch("/transactions/", {
    rate: rate.object_id,
    label_file_type: "PDF",
    async: false,
    ...(metadata && { metadata }),
  });

  if (txn.status !== "SUCCESS") {
    const msgs = (txn.messages || []).map((m) => m.text).join("; ");
    throw new Error(`Label purchase failed: ${msgs || txn.status}`);
  }

  return {
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
