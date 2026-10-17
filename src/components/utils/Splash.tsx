import { FETCH_FIRST, sized, srcSet } from "./imageCopies";

// The cast in the kitchen, as a picture across the page (the 404 page, where it's the main picture: fetched
// first, its room kept while it loads, and the 1000px copy unless the screen needs more)
const SPLASH = "/images/illustrations/splash.webp";

export const Splash = () => (
  <div className="subcontentWrapper">
    <img
      src={sized(SPLASH, 1000)}
      srcSet={srcSet(SPLASH)}
      sizes="(max-width: 900px) 92vw, 840px"
      width={2000}
      height={1200}
      {...FETCH_FIRST}
      alt="Characters in the kitchen"
      style={{ display: "block", width: "100%", height: "auto", borderRadius: 20 }}
    />
  </div>
);
