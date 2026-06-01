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

  // Extract Facebook tracking data
  const fbClientId = await context.cookies.get("_fbp");
  const fbClickId = await context.cookies.get("_fbc");

  const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid"];
  const hasUTMsInUrl = UTM_PARAMS.some((p) => searchParams.get(p));
  const existingUtmData = await context.cookies.get("utm_data");

  // Only overwrite the cookie when UTMs are present in the URL, or when no
  // cookie exists yet. Without this guard every page load would clobber good
  // attribution with "direct / unknown" (e.g. user navigates to /about after
  // landing on /?utm_source=instagram).
  if (hasUTMsInUrl || !existingUtmData) {
    const utmData = {
      client_id: clientId,
      utm_source: searchParams.get("utm_source") || "direct",
      utm_medium: searchParams.get("utm_medium") || "unknown",
      utm_campaign: searchParams.get("utm_campaign") || "unknown",
      utm_term: searchParams.get("utm_term") || "unknown",
      utm_content: searchParams.get("utm_content") || "unknown",
      referrer: request.headers.get("referer") || "none",
      fbclid: searchParams.get("fbclid") || fbClickId || "none",
      fb_client_id: fbClientId || "none",
    };

    await context.cookies.set("utm_data", btoa(JSON.stringify(utmData)), {
      secure: true,
      httpOnly: true,
      sameSite: "Lax",
      maxAge: 86400, // 1-day expiration
    });

    console.log("📦 Stored UTM Data:", utmData);
  } else if (IS_DEV) {
    console.log("🔄 Preserved existing UTM cookie (no UTMs in URL)");
  }
  return context.rewrite(new URL("/index.html", request.url));
};

export default trackUtm;
