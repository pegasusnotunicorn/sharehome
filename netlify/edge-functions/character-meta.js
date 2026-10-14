// Link previews (Facebook, iMessage, Discord, X…) don't run JavaScript, so they
// only ever see the generic share tags baked into index.html. For
// /characters/<name> this swaps those tags for the character's own title,
// description and image before the page is sent.
//
// It also takes the trailing slash off these pages' addresses.
//
// Must be declared before track-utm in netlify.toml: context.next() runs
// track-utm (which serves index.html) and we edit its response.
import {
  getCharacterShareMeta,
  getSpecificPersonByURL,
} from "../../src/components/Characters/Characters.ts";

const SITE = "https://lovecareermagic.com";

const escapeAttr = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// Replaces the content="" of <meta property|name="key" content="..."> tags
const setMeta = (html, key, value) =>
  html.replace(
    new RegExp(
      `(<meta\\s+(?:property|name)="${key.replace(/[.:]/g, "\\$&")}"\\s+content=")[^"]*(")`,
      "g"
    ),
    `$1${escapeAttr(value)}$2`
  );

export default async function characterMeta(request, context) {
  const url = new URL(request.url);
  // /characters/ (and /characters/<name>/) is the same page without the slash. (Netlify's
  // _redirects can't say this: it matches a path with or without its trailing slash, so the rule
  // would send the page to itself.)
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.replace(/\/+$/, "");
    return Response.redirect(url.toString(), 301);
  }
  const slug = url.pathname.replace(/\/+$/, "").split("/")[2];
  const character = slug ? getSpecificPersonByURL(slug) : false;

  const response = await context.next();
  if (!character || character.ignoreInRandom) return response;
  if (!response.headers.get("content-type")?.includes("text/html")) {
    return response;
  }

  const { title, description, image } = getCharacterShareMeta(character);
  const pageUrl = `${SITE}/characters/${character.urlName}`;
  const imageUrl = `${SITE}${image.url}`;
  const imageExt = image.url.split(".").pop().toLowerCase();
  const imageType = imageExt === "jpg" ? "image/jpeg" : `image/${imageExt}`;

  let html = await response.text();
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeAttr(title)}</title>`
  );
  html = setMeta(html, "description", description);
  html = setMeta(html, "og:url", pageUrl);
  html = setMeta(html, "og:title", title);
  html = setMeta(html, "og:description", description);
  html = setMeta(html, "og:image", imageUrl);
  html = setMeta(html, "og:image:width", image.width);
  html = setMeta(html, "og:image:height", image.height);
  html = setMeta(html, "og:image:type", imageType);
  html = setMeta(html, "twitter:url", pageUrl);
  html = setMeta(html, "twitter:title", title);
  html = setMeta(html, "twitter:description", description);
  html = setMeta(html, "twitter:image", imageUrl);

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
