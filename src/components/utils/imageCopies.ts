// Smaller copies of the site's bigger pictures, for where they're shown small: each in a folder named
// for its width, beside the picture (e.g. /images/members/1000/characters1.webp for
// /images/members/characters1.webp). `srcSet` lists them for an <img> (with `sizes`, the browser picks
// the smallest that's sharp enough); `sized` picks one for a canvas or a 3D texture.

// the pictures that have copies: which, how wide they are, the widths of their copies (and, for one that
// isn't in a folder of its width, where a copy is)
const COPIES: { match: RegExp; width: number; copies: number[]; at?: (url: string, w: number) => string }[] = [
  { match: /^\/images\/illustrations\/splash\.webp$/, width: 2000, copies: [1000], at: (url, w) => url.replace(".webp", `-${w}.webp`) },
  { match: /^\/images\/members\/characters\d+\.webp$/, width: 2000, copies: [600, 1000] },
  { match: /^\/images\/members\/expansion-[a-z]+-\d\.webp$/, width: 1600, copies: [560] },
  { match: /^\/images\/pieces\/characters\/\d\d(-back)?\.webp$/, width: 768, copies: [560] },
  { match: /^\/images\/pieces\/characters\/stills\/\d\d\.webp$/, width: 1120, copies: [720] },
  { match: /^\/images\/pieces\/(episodes|director|producer|showrunner)\/(\d\d|back)\.webp$/, width: 768, copies: [480] },
  { match: /^\/images\/photoshoot\/playtest\/playtest\d+\.webp$/, width: 900, copies: [480] },
  { match: /^\/images\/illustrations\/(improv|laughing|stories|party|acting)\.webp$/, width: 600, copies: [400] },
  { match: /^\/images\/polaroids\/contact\/polaroid-\d+\.webp$/, width: 900, copies: [640] },
  { match: /^\/images\/artbook\/mockup\d\.webp$/, width: 1700, copies: [1000] },
  { match: /^\/images\/box_trimmed\.webp$/, width: 1200, copies: [600] },
];

const inFolder = (url: string, w: number) => url.replace(/\/([^/]+)$/, `/${w}/$1`);
const copiesOf = (url: string) => COPIES.find((x) => x.match.test(url));

// "<copy> <width>w, …, <picture> <width>w", or nothing if the picture has no copies
export const srcSet = (url: string) => {
  const c = copiesOf(url);
  return c ? [...c.copies.map((w) => `${(c.at ?? inFolder)(url, w)} ${w}w`), `${url} ${c.width}w`].join(", ") : undefined;
};

// the smallest copy at least `px` wide (or the picture itself)
export const sized = (url: string, px: number) => {
  const c = copiesOf(url), w = c?.copies.find((w) => w >= px);
  return c && w ? (c.at ?? inFolder)(url, w) : url;
};

// for a page's main picture: fetched ahead of the others (spread onto its <img>: React 18 doesn't know
// fetchPriority yet, so it's given as the attribute itself)
export const FETCH_FIRST = { fetchpriority: "high" } as object;
