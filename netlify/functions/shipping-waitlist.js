// Email capture for visitors in countries checkout can't ship to yet. Adds
// them to a MailerLite group so they can be emailed when shipping opens up.
//
// The country comes from Netlify's geolocation of the request rather than the
// client, and is stored in MailerLite's built-in `country` field (as an
// ISO code) so the group can later be segmented by destination.
const MAILER_LITE_KEY = process.env.MAILER_LITE_KEY;
const WAITLIST_GROUP_ID = process.env.MAILERLITE_SHIPPING_WAITLIST_GROUP_ID;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (body, status) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async function shippingWaitlist(req, context) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  if (!MAILER_LITE_KEY || !WAITLIST_GROUP_ID) {
    console.error("shipping-waitlist: missing env vars");
    return json({ error: "Something went wrong. Please try again." }, 500);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  const { email } = body;
  if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
    return json({ error: "Please enter a valid email address." }, 400);
  }

  const country = context?.geo?.country?.code || null;

  try {
    const mlRes = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MAILER_LITE_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        ...(country && { fields: { country } }),
        groups: [WAITLIST_GROUP_ID],
        status: "active",
      }),
    });

    if (!mlRes.ok) {
      const data = await mlRes.json().catch(() => ({}));
      console.error("shipping-waitlist: MailerLite error", mlRes.status, data);
      if (mlRes.status === 422) {
        return json({ error: "Please enter a valid email address." }, 400);
      }
      return json({ error: "Something went wrong. Please try again." }, 502);
    }

    console.log(`🌍 Shipping waitlist signup (country=${country ?? "unknown"})`);
    return json({ success: true }, 200);
  } catch (err) {
    console.error("shipping-waitlist: fetch error", err);
    return json({ error: "Something went wrong. Please try again." }, 502);
  }
}
