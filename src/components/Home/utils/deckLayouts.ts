import type { DeckPose } from "../../utils/deckPoses";

// Where each "How to play" deck's three cards land, in px from the deck area's centre (w x h).
// `stacked`: on phones and small tablets the deck spans the whole step, with the words in the middle,
// so two cards go above the words and one below; otherwise they run down the deck's side of the step.

export const characterLayout = (w: number, h: number, stacked: boolean): DeckPose[] => {
  const cw = stacked ? Math.min(w * 0.52, h * 0.28, 340) : Math.min(w * 0.46, h * 0.5, 440);
  if (stacked)
    return [
      { x: -w * 0.17, y: -h * 0.4, w: cw, tilt: 7 },
      { x: w * 0.2, y: -h * 0.3, w: cw, tilt: -6 },
      { x: w * 0.04, y: h * 0.35, w: cw, tilt: 3 },
    ];
  return [
    { x: -w * 0.13, y: -h * 0.28, w: cw, tilt: 8 },
    { x: w * 0.14, y: 0, w: cw, tilt: -6 },
    { x: -w * 0.1, y: h * 0.28, w: cw, tilt: 3 },
  ];
};

// the Direction deck (on the right of its step); the Episode deck (on the left) is its mirror image
export const directionEpisodeLayout = (mirror: 1 | -1) => (w: number, h: number, stacked: boolean): DeckPose[] => {
  const cw = stacked ? Math.min(w * 0.46, h * 0.27, 300) : Math.min(w * 0.5, h * 0.48, 400);
  const poses: DeckPose[] = stacked
    ? [
        { x: w * 0.19, y: -h * 0.4, w: cw, tilt: -6 },
        { x: -w * 0.19, y: -h * 0.29, w: cw, tilt: 5 },
        { x: -w * 0.05, y: h * 0.35, w: cw, tilt: -4 },
      ]
    : [
        { x: -w * 0.12, y: -h * 0.27, w: cw, tilt: -5 },
        { x: w * 0.15, y: 0, w: cw, tilt: 5 },
        { x: -w * 0.05, y: h * 0.28, w: cw, tilt: -4 },
      ];
  return poses.map((p) => ({ ...p, x: p.x * mirror, tilt: p.tilt * mirror }));
};
