// The home page's reviews (ReviewsSection.tsx): word for word from LCM's brain/mined/reviews.md, typos and
// all. A public reviewer (an outlet, a creator) is named and their review linked; a private person never
// is, by name or by a link to their own review: at most, a link to where the ratings are. (A TikTok Shop
// customer goes by the masked name the store shows, like "R**i".)

export interface Rating {
  label: string; // what it says, as of `asOf`
  asOf: string; // YYYY-MM-DD
  href: string;
}

export interface Review {
  quote: string;
  by: string; // the outlet or creator; for a private person, "a BoardGameGeek reviewer" and the like
  press?: boolean; // an outlet's or a creator's
  score?: string; // only as the source gives it
  href?: string;
  linkText?: string;
}

const BGG_RATINGS =
  "https://boardgamegeek.com/boardgame/355824/love-career-and-magic/ratings";
const TIKTOK_STORE =
  "https://shop.tiktok.com/us/pdp/love-career-magic-fantasy-reality-tv-game-family-fun/1732132920084697114";

export const RATINGS: Rating[] = [
  { label: "5.0 ★ on TikTok Shop", asOf: "2026-10-20", href: TIKTOK_STORE },
  { label: "8.1/10 on BoardGameGeek", asOf: "2026-10-08", href: BGG_RATINGS },
];

// press and creators first (named, their review linked), then players (never named)
export const REVIEWS: Review[] = [
  {
    quote:
      "Love, Career & Magic had me laughing harder than almost any game I’ve played, and created stories my group will tell for months to come.",
    by: "Roll to Review",
    press: true,
    score: "4.5/5",
    href: "https://rolltoreview.com/love-career-magic-review-improv-party-game/",
    linkText: "Read the review",
  },
  {
    quote: "Everything nails the vibes of low stakes, high drama reality TV.",
    by: "EN World (Rob Wieland)",
    press: true,
    href: "https://www.enworld.org/threads/love-career-magic-brings-bite-sized-fantasy-to-reality-tv.713185/",
    linkText: "Read the review",
  },
  {
    quote:
      "The game delivers on its promise of zany humor and amusing roleplay challenges.",
    by: "Board Gamers Anonymous",
    press: true,
    href: "https://www.boardgamersanonymous.com/love-career-magic-review/",
    linkText: "Read the review",
  },
  {
    quote:
      "A charming, fast-paced, fantasy storytelling rpg where you get to be on reality TV without all the unnecessary drama.",
    by: "King's Entertainment Reviews",
    press: true,
    href: "https://youtu.be/ZrUFVSHTPI0",
    linkText: "Watch the review",
  },
  {
    quote:
      "a fast, low-friction party game that gets people talking and laughing within five minutes of opening the box",
    by: "a BoardGameGeek reviewer",
    score: "10/10",
    href: BGG_RATINGS,
    linkText: "BoardGameGeek ratings",
  },
  {
    quote:
      "Cute art, funny prompts that will definitely work up some laughter, engaging and definitely will be a game night edition!",
    by: "R**i on TikTok Shop",
    score: "5★",
    href: TIKTOK_STORE,
    linkText: "TikTok Shop reviews",
  },
  {
    quote:
      "It feels like I'm actually watching a reality tv show being made in real time.",
    by: "a YouTube commenter on Smosh Games' Board AF episode",
    score: "273 likes",
  },
  {
    quote:
      "This fast paced roleplaying experience is incredible for first timers and veterans of the genre",
    by: "a BoardGameGeek reviewer",
    score: "10/10",
    href: BGG_RATINGS,
    linkText: "BoardGameGeek ratings",
  },
  {
    quote: "This is such a fun game. Quick adventures for a night of laughing.",
    by: "c**1 on TikTok Shop",
    score: "5★",
    href: TIKTOK_STORE,
    linkText: "TikTok Shop reviews",
  },
  {
    quote:
      "Absolute must if you enjoy super fun, silly explorations of fantasy tropes in a unique and hilarious presentation.",
    by: "a BoardGameGeek reviewer",
    score: "10/10",
    href: BGG_RATINGS,
    linkText: "BoardGameGeek ratings",
  },
];
