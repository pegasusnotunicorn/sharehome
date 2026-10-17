// Every page is the same index.html; this also writes in the page's own title, description and
// share image (src/pageMeta.ts, or a character's), since link previews (Facebook, iMessage, Discord,
// X…) don't run JavaScript and only ever see what's in the page as it's sent.
import { getCharacterShareMeta, getSpecificPersonByURL } from "../../src/components/Characters/Characters.ts";
import { SITE, pageMeta } from "../../src/pageMeta.ts";

const escapeAttr = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Replaces the content="" of <meta property|name="key" content="..."> tags
const setMeta = (html, key, value) =>
  html.replace(
    new RegExp(`(<meta\\s+(?:property|name)="${key.replace(/[.:]/g, "\\$&")}"\\s+content=")[^"]*(")`, "g"),
    `$1${escapeAttr(value)}$2`
  );

// the page's share tags: a character's own, or the page's from the list
const metaFor = (pathname) => {
  const slug = pathname.match(/^\/characters\/([^/]+)$/)?.[1];
  const character = slug ? getSpecificPersonByURL(slug) : false;
  if (character && !character.ignoreInRandom) {
    const { title, description, image } = getCharacterShareMeta(character);
    return { title, description, image, url: `${SITE}/characters/${character.urlName}` };
  }
  return { ...pageMeta(pathname), url: SITE + (pathname.replace(/\/+$/, "") || "/") };
};

const withMeta = async (response, pathname) => {
  if (!response.headers.get("content-type")?.includes("text/html")) return response;
  const { title, description, image, url } = metaFor(pathname);
  const imageUrl = SITE + image.url;
  const ext = image.url.split(".").pop().toLowerCase();
  let html = await response.text();
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(title)}</title>`);
  html = setMeta(html, "description", description);
  html = setMeta(html, "og:url", url);
  html = setMeta(html, "og:title", title);
  html = setMeta(html, "og:description", description);
  html = setMeta(html, "og:image", imageUrl);
  html = setMeta(html, "og:image:width", image.width);
  html = setMeta(html, "og:image:height", image.height);
  html = setMeta(html, "og:image:type", ext === "jpg" ? "image/jpeg" : `image/${ext}`);
  html = setMeta(html, "twitter:url", url);
  html = setMeta(html, "twitter:title", title);
  html = setMeta(html, "twitter:description", description);
  html = setMeta(html, "twitter:image", imageUrl);
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(html, { status: response.status, statusText: response.statusText, headers });
};

// The UTM cookie: JSON in base64. btoa only takes Latin-1, and campaign tags can hold emoji or
// any script, so anything past ASCII is written as a JSON \\u escape first (JSON.parse turns it back,
// so the readers in create-checkout-session and track-conversions read it as before).
const encodeUtm = (data) =>
  btoa(JSON.stringify(data).replace(/[\u0080-\uffff]/g, (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0")));

const IS_DEV = Deno.env.get("NETLIFY_DEV") === "true";

const trackUtm = async (request, context) => {
  const url = new URL(request.url);
  // /characters/ (and /characters/<name>/) is the same page without the slash. (Netlify's
  // _redirects can't say this: it matches a path with or without its trailing slash, so the rule
  // would send the page to itself.)
  if (/^\/characters(\/[^/]+)?\/+$/.test(url.pathname)) {
    url.pathname = url.pathname.replace(/\/+$/, "");
    return Response.redirect(url.toString(), 301);
  }
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

    try {
      await context.cookies.set("utm_data", encodeUtm(utmData), {
        secure: true,
        httpOnly: true,
        sameSite: "Lax",
        maxAge: 86400 * 30, // 30-day expiration
      });
    } catch (err) {
      // (never worth an error page in place of the site)
      console.warn("⚠️ Couldn't store UTM data:", err.message);
    }

    if (IS_DEV) console.log("📦 Stored UTM Data:", utmData);
  } else if (hasFbclid && existingUtmData) {
    // fbclid arrived without source UTMs — patch just the fbclid field so
    // click-tracking stays fresh without clobbering the existing attribution.
    try {
      const existing = JSON.parse(atob(existingUtmData));
      existing.fbclid = searchParams.get("fbclid");
      existing.fb_client_id = fbClientId || existing.fb_client_id || "none";
      await context.cookies.set("utm_data", encodeUtm(existing), {
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
  return withMeta(await context.rewrite(new URL("/index.html", request.url)), url.pathname);
};

export default trackUtm;
