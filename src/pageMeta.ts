// Every page's title, description and share image: what a link to it shows in a preview (Facebook,
// iMessage, Discord, X…). Link previews don't run JavaScript, so the track-utm edge function writes
// these into the page before it's sent; the site sets the same ones in the browser (PageMeta).
// (A character's page has its own, from the character: getCharacterShareMeta.)

export const SITE = "https://lovecareermagic.com";

export interface ShareImage {
  url: string; // (from the site's root)
  width: number;
  height: number;
}

export interface PageMeta {
  title: string;
  description: string;
  image: ShareImage;
}

const NAME = "Love, Career & Magic";
const card = (name: string): ShareImage => ({ url: `/images/og/${name}.jpg`, width: 1200, height: 630 });

export const DEFAULT_META: PageMeta = {
  title: `${NAME} — a 12-minute party game for 2–6 players`,
  description:
    "A party game where fantasy meets reality TV. Play as a mythical creature, complete chaotic character arcs, and achieve high ratings for the season!",
  image: { url: "/images/og-image-1200x630.jpg", width: 1200, height: 630 },
};

const PAGES: Record<string, Partial<PageMeta>> = {
  "/howtoplay": {
    title: `How to play — ${NAME}`,
    description:
      "Four episodes, three minutes each. Improvise your way through a reality TV show as a mythical creature and keep the ratings up. 2–6 players, 12 minutes.",
    image: card("howtoplay"),
  },
  "/characters": {
    title: `Meet the cast — ${NAME}`,
    description:
      "An ogre, a dragon, a talking puppet, a gingerbread being and more: meet the mythical housemates of SHAREHOME, the reality TV show in Love, Career & Magic.",
    image: card("characters"),
  },
  "/play": {
    title: `Play online — ${NAME}`,
    description: "Make a game room, send your friends the link, and play Love, Career & Magic together online, right in your browser.",
    image: card("play"),
  },
  "/digitalartbook": {
    title: `The digital artbook — ${NAME}`,
    description: "The watercolour art of Love, Career & Magic's mythical cast, free for newsletter subscribers.",
    image: card("artbook"),
  },
  "/contact": {
    title: `Contact us — ${NAME}`,
    description: "Say hi to Pegasus Games, the indie studio behind Love, Career & Magic, and follow along on the game dev journey.",
    image: card("contact"),
  },
  "/signup": {
    title: `Don’t miss a thing — ${NAME}`,
    description: "Sign up for news about Love, Career & Magic: the expansion, events and new games.",
    image: card("signup"),
  },
  "/raffle": {
    title: `Win a free copy — ${NAME}`,
    description: "Enter the raffle for a free copy of Love, Career & Magic, the 12-minute party game where fantasy meets reality TV.",
    image: card("raffle"),
  },
  "/checkout": {
    title: `Checkout — ${NAME}`,
    description: "Get your copy of Love, Career & Magic, the 12-minute party game for 2–6 players where fantasy meets reality TV.",
    image: card("checkout"),
  },
  "/thankyou": {
    title: `Thank you for your order! — ${NAME}`,
    description: "We’ve received your order and will ship your game within 3–5 business days.",
  },
  "/terms": {
    title: `Terms — ${NAME}`,
    description: "Terms, returns and a privacy summary for Love, Career & Magic.",
  },
  "/privacy": {
    title: `Privacy policy — ${NAME}`,
    description: "How Pegasus Games collects, uses and protects your information on lovecareermagic.com and our social media accounts.",
  },
};

// a game room's link, sent to friends: an invitation
const roomMeta = (code: string): PageMeta => ({
  title: `Join my game of ${NAME}!`,
  description: `You’re invited to game ${code}. Pick a character and play together online, right in your browser.`,
  image: card("invite"),
});

// the page at this address (the home page's for anything not listed)
export const pageMeta = (pathname: string): PageMeta => {
  const path = pathname.replace(/\/+$/, "") || "/";
  const room = path.match(/^\/play\/([A-Za-z]{4})$/);
  if (room) return roomMeta(room[1].toUpperCase());
  return { ...DEFAULT_META, ...PAGES[path] };
};
