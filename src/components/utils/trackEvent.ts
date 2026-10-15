// eslint-disable-next-line @typescript-eslint/no-explicit-any
const w = window as any;

// GA4 events reach the property through GTM, so they have to be pushed in the
// shape GTM triggers on: an object with an `event` key. gtag.js is never
// loaded (see index.html), so gtag()-style calls would be silently dropped.
//
// GTM keeps every key ever pushed and reads them for each later event, so an event without one of
// these would carry the last event's value (a popup's "how" on a trailer's close). Each push clears
// them first, then sets its own.
const PARAM_KEYS = ["from", "seconds_open", "game", "country", "page", "how", "error_message", "trigger", "item_slug", "new_qty"];
const CLEARED = Object.fromEntries(PARAM_KEYS.map((k) => [k, undefined]));

export function trackEvent(name: string, params?: Record<string, string | number>) {
  w.dataLayer?.push({ event: name, ...CLEARED, ...params });
  w.clarity?.("event", name);
}
