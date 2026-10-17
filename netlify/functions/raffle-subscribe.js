import crypto from "node:crypto";
import { fetchSubscriber } from "../lib/mailerlite.js";
import { nextCount } from "../lib/counter.js";

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

  const cleanEmail = email.toLowerCase().trim();

  try {
    // Someone entering again keeps the ticket they were given, and someone who'd unsubscribed
    // isn't signed back up. (Not knowing which, nothing is changed: try again.)
    const existing = await fetchSubscriber(cleanEmail);
    if (existing.status === "error") {
      return new Response(JSON.stringify({ error: "Something went wrong. Please try again." }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }
    const found = existing.status === "found";
    const ticketNumber = found && existing.fields?.raffle_ticket ? null : await nextTicket();

    const mlRes = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MAILER_LITE_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: cleanEmail,
        ...(ticketNumber && { fields: { raffle_ticket: ticketNumber } }),
        groups: [RAFFLE_GROUP_ID],
        ...(!found && { status: "active" }),
      }),
    });

    if (!mlRes.ok) {
      const data = await mlRes.json().catch(() => ({}));
      console.error("raffle-subscribe: MailerLite error", mlRes.status, data?.message ?? "");

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

// Tickets are numbered in order from 10001, so no two are the same. (If the count can't be reached,
// a random 6-digit one: a different range, so it can't land on a counted one.)
async function nextTicket() {
  try {
    return 10000 + (await nextCount("raffle-tickets", "count"));
  } catch (err) {
    console.warn("raffle-subscribe: ticket counter unavailable, using a random ticket:", err.message);
    return crypto.randomInt(100000, 1000000);
  }
}
