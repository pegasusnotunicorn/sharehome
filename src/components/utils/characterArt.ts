import { sized, srcSet } from "./imageCopies";

// The character art is 2000px wide. Cards and the character grid show it at most about 490px wide
// (cropped to fill), so browsers get a 600px or 1000px copy (imageCopies.ts) unless the screen needs more.
export const characterArtSrcSet = srcSet;

// the 1000px copy (or, given the width it's drawn at, the smallest that's enough)
export const characterArtSmall = (url: string, px = 1000) => sized(url, px);

// the width the art needs to fill these boxes (they're narrower than the art, so it's cropped to height)
export const CHARACTER_ART_SIZES = "(max-width: 900px) 290px, 490px";
