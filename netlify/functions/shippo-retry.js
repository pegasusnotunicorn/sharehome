// Every 10 minutes: buys the labels that failed, so a Shippo error never
// needs Wonmin unless it truly can't be fixed (purchaseShippoLabel alerts
// then, with why). Works through the retry queue (lib/label-retry.js), and as
// a backstop queues any order whose label failed in Shippo in the last 3 days
// with no label bought since (a failure that never reached the queue).
import { purchaseShippoLabel } from "./stripe-webhooks.js";
import { failedSessionLabels } from "./lib/shippo.js";
import { KEEP_FINISHED_DAYS, deleteRetry, getRetry, listRetries, putRetry } from "./lib/label-retry.js";

// Scheduled functions get 30 s. One recovery (address check, new rates, a
// label or two) can take ~20 s, so a new order starts only in the first 5 s.
const START_BUDGET_MS = 5 * 1000;

export default async function shippoRetry() {
  const t0 = Date.now();

  try {
    for (const f of await failedSessionLabels({ days: 3 })) {
      if (await getRetry(f.sessionId)) continue;
      await putRetry({
        sessionId: f.sessionId,
        eventId: "backstop",
        orderId: f.orderId,
        orderNumber: null,
        attempts: 0,
        firstAt: f.at,
        nextAt: new Date().toISOString(),
        lastError: f.error,
        tried: [],
        state: "waiting",
      });
      console.log(`🔁 Backstop: queued ${f.sessionId} (${f.error})`);
    }
  } catch (err) {
    console.warn("⚠️  Backstop scan of failed Shippo labels failed:", err.message);
  }

  let entries;
  try {
    entries = await listRetries();
  } catch (err) {
    console.error("⚠️  Couldn't read the label retry queue:", err.message);
    return new Response("queue unreadable", { status: 500 });
  }

  const now = Date.now();
  const due = entries
    .filter((e) => e.state === "waiting" && Date.parse(e.nextAt) <= now)
    .sort((a, b) => Date.parse(a.nextAt) - Date.parse(b.nextAt));
  const results = [];
  for (const entry of due) {
    if (Date.now() - t0 > START_BUDGET_MS) break;
    const outcome = await purchaseShippoLabel({ id: entry.sessionId }, entry.eventId || "retry", null, entry);
    results.push(`${entry.sessionId.slice(0, 16)}… ${outcome}`);
  }

  // finished entries go after 30 days (well past the backstop's 3-day look-back)
  const cutoff = now - KEEP_FINISHED_DAYS * 864e5;
  for (const e of entries) {
    if (e.state !== "waiting" && Date.parse(e.updatedAt || e.firstAt) < cutoff) {
      await deleteRetry(e.sessionId).catch(() => {});
    }
  }

  console.log(`🔁 Label retries: ${due.length} due, ${results.join(", ") || "none run"}`);
  return new Response("ok");
}

export const config = { schedule: "*/10 * * * *" };
