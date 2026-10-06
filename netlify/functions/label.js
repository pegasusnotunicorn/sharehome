import { getStore } from "@netlify/blobs";
import { STAMPED_LABEL_STORE } from "./lib/label-note.js";

// Serves a label PDF that stripe-webhooks stamped with the order note (UPS
// Ground Saver labels can't print one themselves). Keyed by the Shippo
// transaction id, which is as unguessable as Shippo's own signed label URL.
export default async function label(req) {
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id || !/^[0-9a-f]{32}$/.test(id)) {
    return new Response("Not found", { status: 404 });
  }

  const pdf = await getStore(STAMPED_LABEL_STORE).get(id, { type: "arrayBuffer" });
  if (!pdf) return new Response("Not found", { status: 404 });

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="label-${id}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
