// Putting off what the first screen doesn't need: until the page is idle, until it's painted, until
// it's loaded. And whether the visitor would rather not download much at all.

// once the page is idle (or after `timeout` ms, whichever's first)
export const whenIdle = (f: () => void, timeout = 1000) => {
  if ("requestIdleCallback" in window) requestIdleCallback(() => f(), { timeout });
  else setTimeout(f, 16);
};

// after the next frame is on screen, once the page is idle
export const afterPaint = () => new Promise<void>((done) => requestAnimationFrame(() => whenIdle(done)));

// after the page has loaded (its pictures and all), once it's idle
let loadedP: Promise<void> | null = null;
export const afterLoad = () =>
  (loadedP ||= new Promise<void>((done) => {
    const go = () => whenIdle(done, 3000);
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
  }));

// A visitor who'd rather not download much: Data Saver, or a 2G connection (or a 3G one too, with
// `orSlow3g`, for extras nobody misses)
export const savingData = (orSlow3g = false) => {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  const slow = orSlow3g ? /(^|-)[23]g$/ : /(^|-)2g$/;
  return !!c?.saveData || slow.test(c?.effectiveType ?? "") || !!window.matchMedia?.("(prefers-reduced-data: reduce)").matches;
};
