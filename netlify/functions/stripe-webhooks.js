import stripeModule from "stripe";
import fetch from "node-fetch";

const IS_DEV = process.env.NETLIFY_DEV === "true";
const STRIPE_SECRET_KEY = IS_DEV
  ? process.env.STRIPE_SECRET_KEY_DEV
  : process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = IS_DEV
  ? process.env.STRIPE_WEBHOOK_SECRET_DEV
  : process.env.STRIPE_WEBHOOK_SECRET;

const stripe = stripeModule(STRIPE_SECRET_KEY);

const MAILER_LITE_KEY = process.env.MAILER_LITE_KEY;
const MAILERLITE_PURCHASE_GROUP_ID = process.env.MAILERLITE_PURCHASE_GROUP_ID;
const MAILERLITE_ABANDONED_GROUP_ID = process.env.MAILERLITE_ABANDONED_GROUP_ID;

export default async function stripeWebhooks(request) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const sig = request.headers.get("stripe-signature");

  let event;
  try {
    const rawBody = await request.arrayBuffer();
    const textBody = new TextDecoder().decode(rawBody);
    event = stripe.webhooks.constructEvent(
      textBody,
      sig,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook Error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      const customerEmail = event.data.object.customer_details.email;
      const name = event.data.object.customer_details.name;
      addEmailToMailerLite(customerEmail, name, MAILERLITE_PURCHASE_GROUP_ID);
      break;
    case "checkout.session.expired":
      const abandonedEmail =
        event.data.object.customer_details?.email ??
        event.data.object.customer_email;
      const abandonedName = event.data.object.customer_details?.name;

      // if (IS_DEV) console.log(event.data.object);
      if (!abandonedEmail) {
        if (IS_DEV) console.log("No email found for abandoned checkout");
        break;
      }

      // email found for abandoned checkout, add to MailerLite abandoned group
      addEmailToMailerLite(
        abandonedEmail,
        abandonedName,
        MAILERLITE_ABANDONED_GROUP_ID
      );
      break;
    default:
      if (IS_DEV) console.log(`Unhandled event type: ${event.type}`);
  }

  return new Response("Webhook received", { status: 200 });
}

async function addEmailToMailerLite(email, name, group_id) {
  if (!MAILER_LITE_KEY) {
    console.error("❌ MailerLite API key is missing.");
    return;
  }

  const url = "https://connect.mailerlite.com/api/subscribers";
  const payload = {
    email,
    groups: [group_id],
    status: "active",
    // add name to fields obj if it's defined
    ...(name && { fields: { name } }),
  };

  try {
    console.log("📌 MAILER_LITE_KEY:", MAILER_LITE_KEY ? "Exists" : "Missing!");

    const testUrl = "https://www.google.com";
    const testResponse = await fetch(testUrl);
    console.log("🌐 Outbound Test:", testResponse.status);

    console.log(
      `📧 Adding subscriber to MailerLite: ${email} ${name} for group ${group_id}`
    );
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MAILER_LITE_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    console.log(response);
    console.log("📨 MailerLite Response Status:", response.status);
    console.log("📨 MailerLite Response Headers:", response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`MailerLite API error: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    console.log("✅ Subscriber added to MailerLite!");
    return data;
  } catch (error) {
    console.error("❌ Error adding subscriber:", error.message);
    return null;
  }
}
