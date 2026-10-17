// Every page is the same index.html; this also writes in the page's own title, description, share
// image and canonical address (src/pageMeta.ts, or a character's), since link previews (Facebook,
// iMessage, Discord, X…) and search engines don't run JavaScript and only see the page as it's sent.
// An address with no page is sent as a 404, kept out of search results.
import { getCharacterShareMeta, getSpecificPersonByURL } from "../../src/components/Characters/Characters.ts";
import { CHARACTER_NOT_FOUND_META, NOT_FOUND_META, SITE, cleanPath, headTags, isPage, pageMeta } from "../../src/pageMeta.ts";

const escapeAttr = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Sets a <meta name|property="key" content="..."> or <link rel="canonical" href="...">'s value, adds the
// tag if the page hasn't one, or takes it out (a null value). (A function replacer, so a "$" in the
// value is written as it is, not read as a replace pattern.)
const setTag = (html, [attr, key, value]) => {
  const tag = attr === "rel" ? "link" : "meta";
  const valueAttr = tag === "link" ? "href" : "content";
  const name = key.replace(/[.:]/g, "\\$&");
  const re = new RegExp(`<${tag}\\s+${attr}="${name}"\\s+${valueAttr}="[^"]*"\\s*/?>\\s*`, "g");
  const written = value === null ? "" : `<${tag} ${attr}="${key}" ${valueAttr}="${escapeAttr(value)}" />\n    `;
  if (re.test(html)) return html.replace(re, () => written);
  return value === null ? html : html.replace("</head>", () => written + "</head>");
};

// the page at this address, with its own address, and whether there is one
const metaFor = (pathname) => {
  const path = cleanPath(pathname);
  const slug = path.match(/^\/characters\/([^/]+)$/)?.[1];
  if (slug) {
    let name = slug;
    try {
      name = decodeURIComponent(slug);
    } catch {
      // (a broken %-escape: as it is)
    }
    const character = getSpecificPersonByURL(name);
    if (!character) return { meta: CHARACTER_NOT_FOUND_META, url: SITE + path, found: false };
    return { meta: getCharacterShareMeta(character), url: `${SITE}/characters/${character.urlName}`, found: true };
  }
  if (!isPage(path)) return { meta: NOT_FOUND_META, url: SITE + path, found: false };
  return { meta: pageMeta(path), url: SITE + path, found: true };
};

const withMeta = async (response, pathname) => {
  if (!response.headers.get("content-type")?.includes("text/html")) return response;
  const { meta, url, found } = metaFor(pathname);
  let html = await response.text();
  html = html.replace(/<title>[^<]*<\/title>/, () => `<title>${escapeAttr(meta.tab ?? meta.title)}</title>`);
  for (const tag of headTags(meta, url)) html = setTag(html, tag);
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  if (!found) headers.set("X-Robots-Tag", "noindex");
  return new Response(html, {
    status: found ? response.status : 404,
    statusText: found ? response.statusText : "Not Found",
    headers,
  });
};

// The UTM cookie: JSON in base64. btoa only takes Latin-1, and campaign tags can hold emoji or
// any script, so anything past ASCII is written as a JSON \\u escape first (JSON.parse turns it back,
// so the readers in create-checkout-session and track-conversions read it as before).
const encodeUtm = (data) =>
  btoa(JSON.stringify(data).replace(/[\u0080-\uffff]/g, (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0")));

const IS_DEV = Deno.env.get("NETLIFY_DEV") === "true";

// (a campaign tag or referrer can be any length: kept short enough that the cookie always fits)
const MAX_UTM = 200;
const clip = (value) => (value ? String(value).slice(0, MAX_UTM) : value);

// the cookies this sets: on every path, for 30 days, never read by the page's own scripts
const setCookie = (context, name, value) =>
  context.cookies.set({
    name,
    value,
    path: "/",
    maxAge: 86400 * 30, // 30-day expiration
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
  });

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
    await setCookie(context, "client_id", clientId);
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
  const existingUtmData = await context.cookies.get("utm_data");

  // Overwrite when source UTMs are in the URL (fresh attribution), or when no
  // cookie exists yet. A fbclid-only URL preserves any existing utm_source
  // while still updating the fbclid field.
  if (hasSourceUTMs || !existingUtmData) {
    const utmData = {
      client_id: clientId,
      utm_source: clip(searchParams.get("utm_source")) || "direct",
      utm_medium: clip(searchParams.get("utm_medium")) || "none",
      utm_campaign: clip(searchParams.get("utm_campaign")) || "none",
      utm_term: clip(searchParams.get("utm_term")) || "none",
      utm_content: clip(searchParams.get("utm_content")) || "none",
      referrer: clip(request.headers.get("referer")) || "none",
      fbclid: clip(searchParams.get("fbclid") || fbClickId) || "none",
      fb_client_id: clip(fbClientId) || "none",
    };

    try {
      await setCookie(context, "utm_data", encodeUtm(utmData));
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
      existing.fbclid = clip(searchParams.get("fbclid"));
      existing.fb_client_id = clip(fbClientId) || existing.fb_client_id || "none";
      await setCookie(context, "utm_data", encodeUtm(existing));
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
