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

  // utm_source/medium/etc. are the real attribution signals; fbclid is a
  // click-tracking param only. Separating them prevents a fbclid-only URL
  // (e.g. a Meta retargeting redirect with no utm_source) from triggering a
  // full cookie overwrite that clobbers an existing utm_source=instagram.
  const SOURCE_UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
  const hasSourceUTMs = SOURCE_UTM_PARAMS.some((p) => searchParams.get(p));
  const hasFbclid = !!searchParams.get("fbclid");
  const hasUTMsInUrl = hasSourceUTMs || hasFbclid;
  const existingUtmData = await context.cookies.get("utm_data");

  // Overwrite when source UTMs are in the URL (fresh attribution), or when no
  // cookie exists yet. A fbclid-only URL preserves any existing utm_source
  // while still updating the fbclid field.
  if (hasSourceUTMs || !existingUtmData) {
    const utmData = {
      client_id: clientId,
      utm_source: searchParams.get("utm_source") || "direct",
      utm_medium: searchParams.get("utm_medium") || "none",
      utm_campaign: searchParams.get("utm_campaign") || "none",
      utm_term: searchParams.get("utm_term") || "none",
      utm_content: searchParams.get("utm_content") || "none",
      referrer: request.headers.get("referer") || "none",
      fbclid: searchParams.get("fbclid") || fbClickId || "none",
      fb_client_id: fbClientId || "none",
    };

    await context.cookies.set("utm_data", btoa(JSON.stringify(utmData)), {
      secure: true,
      httpOnly: true,
      sameSite: "Lax",
      maxAge: 86400 * 30, // 30-day expiration
    });

    console.log("📦 Stored UTM Data:", utmData);
  } else if (hasFbclid && existingUtmData) {
    // fbclid arrived without source UTMs — patch just the fbclid field so
    // click-tracking stays fresh without clobbering the existing attribution.
    try {
      const existing = JSON.parse(atob(existingUtmData));
      existing.fbclid = searchParams.get("fbclid");
      existing.fb_client_id = fbClientId || existing.fb_client_id || "none";
      await context.cookies.set("utm_data", btoa(JSON.stringify(existing)), {
        secure: true,
        httpOnly: true,
        sameSite: "Lax",
        maxAge: 86400 * 30,
      });
      if (IS_DEV) console.log("🔄 Updated fbclid in existing UTM cookie");
    } catch {
      // corrupt cookie — leave as-is
    }
  } else if (IS_DEV) {
    console.log("🔄 Preserved existing UTM cookie (no UTMs in URL)");
  }
  return context.rewrite(new URL("/index.html", request.url));
};

export default trackUtm;
