// The queue of orders whose Shippo label failed, retried by shippo-retry.js
// (every 10 minutes) until a label is bought. One Netlify Blobs entry per
// Stripe session:
//   { sessionId, eventId, orderId, orderNumber, attempts, firstAt, nextAt,
//     lastError, tried, state: "waiting" | "done" | "gave-up" }
// Finished entries are kept for 30 days so the retry job's backstop (failed
// labels in Shippo) never queues the same order again.
import { getStore } from "@netlify/blobs";

export const RETRY_STORE = "shippo-label-retries";

// Wait before retry n (n = attempts so far): next run, then 10 min, 30 min,
// 1 h, 2 h, 4 h. Six retries cover about 8 hours, so an order that fails in
// the evening is either bought or flagged before the 9:30 AM label batch.
const RETRY_WAITS_MIN = [0, 10, 30, 60, 120, 240];
export const MAX_RETRIES = RETRY_WAITS_MIN.length;
// An address no carrier and no address check can find won't fix itself:
// one more try after the first full recovery attempt, then Wonmin hears.
export const MAX_ADDRESS_RETRIES = 2;
export const KEEP_FINISHED_DAYS = 30;

export function nextRetryAt(attempts, now = Date.now()) {
  const wait = RETRY_WAITS_MIN[Math.min(attempts, RETRY_WAITS_MIN.length - 1)];
  return new Date(now + wait * 60 * 1000).toISOString();
}

// Whether a failure after `attempts` retries is the last one.
export function outOfRetries({ attempts, addressError }) {
  return attempts >= (addressError ? MAX_ADDRESS_RETRIES : MAX_RETRIES);
}

const store = () => getStore({ name: RETRY_STORE, consistency: "strong" });

export async function getRetry(sessionId) {
  try {
    return await store().get(sessionId, { type: "json" });
  } catch (err) {
    console.warn("⚠️  Couldn't read the label retry queue:", err.message);
    return null;
  }
}

// Throws when Blobs is unreachable: the caller then alerts, since nothing
// would retry the order.
export async function putRetry(entry) {
  await store().setJSON(entry.sessionId, { ...entry, updatedAt: new Date().toISOString() });
}

export async function finishRetry(sessionId, state, extra = {}) {
  try {
    const prior = await store().get(sessionId, { type: "json" });
    if (!prior) return;
    await putRetry({ ...prior, ...extra, state });
  } catch (err) {
    console.warn("⚠️  Couldn't update the label retry queue:", err.message);
  }
}

export async function listRetries() {
  const s = store();
  const { blobs = [] } = await s.list();
  const entries = [];
  for (const { key } of blobs) {
    const e = await s.get(key, { type: "json" }).catch(() => null);
    if (e) entries.push(e);
  }
  return entries;
}

export async function deleteRetry(sessionId) {
  await store().delete(sessionId);
}
