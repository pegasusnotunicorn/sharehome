// Every page's title, description and share image: the browser tab's title, and what a link to it
// shows in a preview (Facebook, iMessage, Discord, X…). Link previews don't run JavaScript, so the
// track-utm edge function writes these into the page before it's sent; the site sets the same ones in
// the browser as it goes from page to page (useHeadTags).
// (A character's page has its own, from the character: getCharacterShareMeta.)
import { CODE_PATTERN } from "../game-server/src/protocol.ts"; // (with its .ts: the edge function runs this as it is)

export const SITE = "https://lovecareermagic.com";
const BRAND = "Love, Career & Magic";

// a page's title, as every tab shows one: the page, then the game
export const withBrand = (title: string) => `${title} — ${BRAND}`;

interface ShareImage {
  url: string; // (from the site's root)
  width: number;
  height: number;
}

export interface PageMeta {
  title: string;
  description: string;
  image: ShareImage;
  tab?: string; // (the browser tab's title, where it's not the share title)
  noindex?: boolean; // (kept out of search results: a page that isn't there)
}

const card = (name: string): ShareImage => ({ url: `/images/og/${name}.jpg`, width: 1200, height: 630 });

const DEFAULT_META: PageMeta = {
  title: withBrand("A 12-minute party game for 2–6 players"),
  description:
    "A party game where fantasy meets reality TV. Play as a mythical creature, complete chaotic character arcs, and achieve high ratings for the season!",
  image: { url: "/images/og-image-1200x630.jpg", width: 1200, height: 630 },
};

const PAGES: Record<string, Partial<PageMeta>> = {
  "/": {},
  "/howtoplay": {
    title: withBrand("How to play"),
    description:
      "Four episodes, three minutes each. Act your way through a reality TV show as a mythical creature and keep the ratings up. 2–6 players, 12 minutes.",
    image: card("howtoplay"),
  },
  "/characters": {
    title: withBrand("Meet the cast"),
    description:
      "An ogre, a dragon, a talking puppet, a gingerbread being and more: meet the mythical housemates of SHAREHOME, the reality TV show in Love, Career & Magic.",
    image: card("characters"),
  },
  "/play": {
    title: withBrand("Play online"),
    description: "Make a game room, send your friends the link, and play Love, Career & Magic together online, right in your browser.",
    image: card("play"),
  },
  "/digitalartbook": {
    title: withBrand("The digital artbook"),
    description: "The watercolour art of Love, Career & Magic’s mythical cast, free for newsletter subscribers.",
    image: card("artbook"),
  },
  "/contact": {
    title: withBrand("Contact us"),
    description: "Say hi to Pegasus Games, the indie studio behind Love, Career & Magic, and follow along on the game dev journey.",
    image: card("contact"),
  },
  "/signup": {
    title: withBrand("Don’t miss a thing"),
    description: "Sign up for news about Love, Career & Magic: the expansion, events and new games.",
    image: card("signup"),
  },
  "/raffle": {
    title: withBrand("Win a free copy"),
    description: "Enter the raffle for a free copy of Love, Career & Magic, the 12-minute party game where fantasy meets reality TV.",
    image: card("raffle"),
  },
  "/checkout": {
    title: withBrand("Checkout"),
    description: "Get your copy of Love, Career & Magic, the 12-minute party game for 2–6 players where fantasy meets reality TV.",
    image: card("checkout"),
  },
  "/thankyou": {
    title: withBrand("Thank you for your order!"),
    description: "We’ve received your order and will ship your game within 3–5 business days.",
  },
  "/terms": {
    title: withBrand("Terms"),
    description: "Terms, returns and a privacy summary for Love, Career & Magic.",
  },
  "/privacy": {
    title: withBrand("Privacy policy"),
    description: "How Pegasus Games collects, uses and protects your information on lovecareermagic.com and our social media accounts.",
  },
};

// the addresses the site sends on elsewhere (src/Router.tsx's redirects)
const REDIRECTS = ["/ttrpg", "/about", "/blog", "/cart", "/buy", "/rulebook"];

export const NOT_FOUND_META: PageMeta = {
  ...DEFAULT_META,
  title: withBrand("Page not found"),
  description: "Sorry, but we couldn’t find the page you were looking for.",
  noindex: true,
};

// (/characters/<a name that isn't one>: the cast, saying so)
export const CHARACTER_NOT_FOUND_META: PageMeta = { ...NOT_FOUND_META, title: withBrand("Character not found") };

// a game room's link, sent to friends: an invitation (the tab says which game it is)
const roomMeta = (code: string): PageMeta => ({
  title: `Join my game of ${BRAND}!`,
  tab: withBrand(`Game ${code}`),
  description: `You’re invited to game ${code}. Pick a character and play together online, right in your browser.`,
  image: card("invite"),
});

// the address without a trailing slash (the home page: "/")
export const cleanPath = (pathname: string) => pathname.replace(/\/+$/, "") || "/";

// a game room's code, from its address (/play/bcdf: BCDF), if it's one
const roomCode = (path: string) => {
  const code = path.match(/^\/play\/([^/]+)$/)?.[1].toUpperCase();
  return code && CODE_PATTERN.test(code) ? code : null;
};

// Whether there's a page at this address (a character's is checked against the cast: the edge
// function does that, so the cast's data isn't in every page's code)
export const isPage = (pathname: string) => {
  const path = cleanPath(pathname);
  return path in PAGES || REDIRECTS.includes(path) || !!roomCode(path);
};

// the page at this address (the home page's, for one that isn't listed)
export const pageMeta = (pathname: string): PageMeta => {
  const code = roomCode(cleanPath(pathname));
  if (code) return roomMeta(code);
  return { ...DEFAULT_META, ...PAGES[cleanPath(pathname)] };
};

// The tags in a page's <head> that say what it is, as [attribute, its value, content]: a
// <meta name|property="…" content="…">, or the <link rel="canonical" href="…">. A null content: the
// page has no such tag. (Both the edge function and the browser write the page's in from this.)
export type HeadTag = [attr: "name" | "property" | "rel", key: string, content: string | null];
export const headTags = ({ title, description, image, noindex }: PageMeta, url: string): HeadTag[] => {
  const imageUrl = SITE + image.url;
  const ext = image.url.split(".").pop()!.toLowerCase();
  return [
    ["name", "description", description],
    ["property", "og:url", url],
    ["property", "og:title", title],
    ["property", "og:description", description],
    ["property", "og:image", imageUrl],
    ["property", "og:image:width", String(image.width)],
    ["property", "og:image:height", String(image.height)],
    ["property", "og:image:type", ext === "jpg" ? "image/jpeg" : `image/${ext}`],
    ["name", "twitter:url", url],
    ["name", "twitter:title", title],
    ["name", "twitter:description", description],
    ["name", "twitter:image", imageUrl],
    ["name", "robots", noindex ? "noindex" : null],
    ["rel", "canonical", noindex ? null : url],
  ];
};
