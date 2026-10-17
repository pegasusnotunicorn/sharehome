import { getStore } from "@netlify/blobs";

// The next number in a count kept in Netlify Blobs (1, 2, 3…), safe when several requests ask at
// once: each write is a compare-and-swap on what was read. Throws if it loses every try, so callers
// should have a fallback.
export async function nextCount(storeName, key, attempts = 5) {
  // (strong reads: a stale count would only waste tries)
  const store = getStore({ name: storeName, consistency: "strong" });
  for (let attempt = 0; attempt < attempts; attempt++) {
    const current = await store.getWithMetadata(key, { type: "text" });
    const next = (current?.data ? Number(current.data) : 0) + 1;
    const { modified } = await store.set(key, String(next), current?.etag ? { onlyIfMatch: current.etag } : { onlyIfNew: true });
    if (modified) return next;
    // Another request got there first; read again.
  }
  throw new Error(`Couldn't take the next number for ${key} after ${attempts} tries`);
}
