// The character art is 2000px wide. Cards and the character grid show it at most about 490px wide
// (cropped to fill), so browsers get a 1000px copy (images/members/1000/) unless the screen needs more.
const ART = /^\/images\/members\/(characters\d+\.webp)$/;

export const characterArtSrcSet = (url: string) => {
  const m = ART.exec(url);
  return m ? `/images/members/1000/${m[1]} 1000w, ${url} 2000w` : undefined;
};

// the 1000px copy, where there is one
export const characterArtSmall = (url: string) => {
  const m = ART.exec(url);
  return m ? `/images/members/1000/${m[1]}` : url;
};

// the width the art needs to fill these boxes (they're narrower than the art, so it's cropped to height)
export const CHARACTER_ART_SIZES = "(max-width: 900px) 290px, 490px";
