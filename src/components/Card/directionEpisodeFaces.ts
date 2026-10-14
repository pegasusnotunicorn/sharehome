import type { CardFaces } from "../utils/cardViewer3d";

// The printed Direction and Episode cards (scans of a selection, in images/cards/): each Direction
// card comes from one of three executives, the Director, the Producer or the Showrunner, whose deck
// has its own back.
export const DIRECTION_MM: [number, number] = [88.9, 57.6];
export const EPISODE_MM: [number, number] = [88.9, 63.5];

const EXECUTIVES = ["director", "producer", "showrunner"] as const;
const PER_EXECUTIVE = 8;
const EPISODES = 12;

const shuffle = <T,>(a: T[]) => a.map((x) => [Math.random(), x] as const).sort((p, q) => p[0] - q[0]).map(([, x]) => x);
const pick = (n: number, count: number) => shuffle(Array.from({ length: n }, (_, i) => i + 1)).slice(0, count);

// `count` different Direction cards, one from each executive in turn
export const randomDirectionFaces = (count: number): (() => Promise<CardFaces>)[] =>
  shuffle([...EXECUTIVES]).flatMap((who, i) =>
    i < count
      ? pick(PER_EXECUTIVE, 1).map((n) => async () => ({
          front: `/images/cards/directions/${who}-${n}.webp`,
          back: `/images/cards/directions/${who}-back.webp`,
        }))
      : []
  );

// `count` different Episode cards
export const randomEpisodeFaces = (count: number): (() => Promise<CardFaces>)[] =>
  pick(EPISODES, count).map((n) => async () => ({
    front: `/images/cards/episodes/episode-${n}.webp`,
    back: "/images/cards/episodes/episode-back.webp",
  }));
