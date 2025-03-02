const IS_DEV = Deno.env.get("NETLIFY_DEV") === "true";

const trackUtm = async (request, context) => {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);

  if (IS_DEV) console.log("🔍 Processing UTM tracking for:", request.url);

  // Check if client_id exists, otherwise generate a new one
  let clientId = await context.cookies.get("client_id");

  if (!clientId) {
    clientId = crypto.randomUUID();
    await context.cookies.set("client_id", clientId, {
      secure: true,
      httpOnly: true,
      sameSite: "Lax",
      maxAge: 86400 * 30, // 30-day expiration
    });
    if (IS_DEV) console.log("🆕 Generated new client_id:", clientId);
  } else if (IS_DEV) {
    console.log("🔄 Existing client_id found:", clientId);
  }

  // Extract UTM parameters
  const utmData = {
    client_id: clientId,
    utm_source: searchParams.get("utm_source") || "direct",
    utm_medium: searchParams.get("utm_medium") || "unknown",
    utm_campaign: searchParams.get("utm_campaign") || "unknown",
    utm_term: searchParams.get("utm_term") || "unknown",
    utm_content: searchParams.get("utm_content") || "unknown",
    referrer: request.headers.get("referer") || "none",
  };

  // Store UTM data in Netlify Edge Session (Server-Side Cookie)
  await context.cookies.set("utm_data", btoa(JSON.stringify(utmData)), {
    secure: true,
    httpOnly: true,
    sameSite: "Lax",
    maxAge: 86400, // 1-day expiration
  });

  console.log("📦 Stored UTM Data:", utmData);
  return context.rewrite(new URL("/index.html", request.url));
};

export default trackUtm;
