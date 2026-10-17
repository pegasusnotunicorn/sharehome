// Looks up a MailerLite subscriber so the caller can decide what to change.
// Returns one of:
//   { status: "found", id, groups: Set<string>, fields, subscriberStatus }
//   { status: "absent" }  — no such subscriber
//   { status: "error" }   — we don't know; caller should fail closed
// One retry absorbs the usual transient blip before we give up.
export async function fetchSubscriber(email) {
  const key = process.env.MAILER_LITE_KEY;
  if (!key) return { status: "error" };

  const url = `https://connect.mailerlite.com/api/subscribers/${encodeURIComponent(email)}`;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (response.status === 404) return { status: "absent" };
      if (!response.ok) {
        console.warn(`⚠️  MailerLite subscriber lookup returned HTTP ${response.status} (attempt ${attempt + 1})`);
        continue;
      }
      const data = await response.json();
      const subscriber = data?.data ?? {};
      return {
        status: "found",
        id: subscriber.id,
        groups: new Set((subscriber.groups ?? []).map((g) => String(g.id))),
        fields: subscriber.fields ?? {},
        // ("active", "unsubscribed", …: someone who unsubscribed isn't signed back up)
        subscriberStatus: subscriber.status ?? null,
      };
    } catch (err) {
      console.warn(`⚠️  MailerLite subscriber lookup threw (attempt ${attempt + 1}):`, err.message);
    }
  }

  return { status: "error" };
}
