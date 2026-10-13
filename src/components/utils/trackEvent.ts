// eslint-disable-next-line @typescript-eslint/no-explicit-any
const w = window as any;

// GA4 events reach the property through GTM, so they have to be pushed in the
// shape GTM triggers on: an object with an `event` key. gtag.js is never
// loaded (see index.html), so gtag()-style calls would be silently dropped.
export function trackEvent(name: string, params?: Record<string, string | number>) {
  w.dataLayer?.push({ event: name, ...params });
  w.clarity?.("event", name);
}
