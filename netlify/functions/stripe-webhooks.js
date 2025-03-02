import stripeModule from "stripe";
import fetch from "node-fetch";

const IS_DEV = process.env.NETLIFY_DEV === "true";
const STRIPE_SECRET_KEY = IS_DEV
  ? process.env.STRIPE_SECRET_KEY_DEV
  : process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = stripeModule(STRIPE_SECRET_KEY);

export default async function stripeWebhooks(request) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const sig = request.headers.get("stripe-signature");

  let event;
  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook Error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      const customerEmail = event.data.object.customer_details.email;
      const name = event.data.object.customer_details.name;
      addCustomerToMailerLite(customerEmail, name);
      break;
    default:
      if (IS_DEV) console.log(`Unhandled event type: ${event.type}`);
  }

  return new Response("Webhook received", { status: 200 });
}

// #region MailerLite

const MAILER_LITE_KEY = process.env.MAILER_LITE_KEY;
const MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID;

async function addCustomerToMailerLite(email, name) {
  if (!MAILER_LITE_KEY) {
    console.error("❌ MailerLite API key is missing.");
    return;
  }

  const url = "https://connect.mailerlite.com/api/subscribers";
  const payload = {
    email,
    fields: {
      name,
    },
    groups: [MAILERLITE_GROUP_ID],
    status: "active",
  };

  try {
    console.log(`📧 Adding subscriber to MailerLite: ${email} ${name}`);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MAILER_LITE_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`MailerLite API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Subscriber added to MailerLite!");
    return data;
  } catch (error) {
    console.error("❌ Error adding subscriber:", error.message);
    return null;
  }
}

// #endregion
