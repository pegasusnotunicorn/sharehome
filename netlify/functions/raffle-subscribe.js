const MAILER_LITE_KEY = process.env.MAILER_LITE_KEY;
const RAFFLE_GROUP_ID = process.env.MAILERLITE_RAFFLE_GROUP_ID;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function raffleSubscribe(req) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  if (!MAILER_LITE_KEY || !RAFFLE_GROUP_ID) {
    console.error("raffle-subscribe: missing env vars");
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { email } = body;

  if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
    return new Response(JSON.stringify({ error: "Please enter a valid email address." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const ticketNumber = Math.floor(10000 + Math.random() * 90000);

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
        fields: { raffle_ticket: ticketNumber },
        groups: [RAFFLE_GROUP_ID],
        status: "active",
      }),
    });

    if (!mlRes.ok) {
      const data = await mlRes.json().catch(() => ({}));
      console.error("raffle-subscribe: MailerLite error", mlRes.status, data);

      if (mlRes.status === 422) {
        return new Response(JSON.stringify({ error: "Please enter a valid email address." }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Something went wrong. Please try again." }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("raffle-subscribe: fetch error", err);
    return new Response(JSON.stringify({ error: "Something went wrong. Please try again." }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}
