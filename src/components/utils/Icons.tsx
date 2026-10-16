import type { ReactNode } from "react";

// The site's icons: one rounded line style, drawn in the color of the text around them (so a button's
// icon is always its words' color)

const PATHS = {
  // →
  forward: (
    <>
      <path d="M5 12h14" />
      <path d="M13 6l6 6l-6 6" />
    </>
  ),
  next: (
    <>
      <path d="M5 12h14" />
      <path d="M13 6l6 6l-6 6" />
    </>
  ),
  // ←
  prev: (
    <>
      <path d="M19 12H5" />
      <path d="M11 6l-6 6l6 6" />
    </>
  ),
  // a sparkle
  star: (
    <>
      <path d="M12 3c.4 3.9 2.1 5.6 6 6c-3.9 .4-5.6 2.1-6 6c-.4-3.9-2.1-5.6-6-6c3.9-.4 5.6-2.1 6-6z" />
      <path d="M18.5 15c.2 1.6 .9 2.3 2.5 2.5c-1.6 .2-2.3 .9-2.5 2.5c-.2-1.6-.9-2.3-2.5-2.5c1.6-.2 2.3-.9 2.5-2.5z" />
    </>
  ),
  // play
  watch: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8.8v6.4a.6 .6 0 0 0 .9 .5l5.1-3.2a.6 .6 0 0 0 0-1l-5.1-3.2a.6 .6 0 0 0-.9 .5z" />
    </>
  ),
  // an open book
  rulebook: (
    <>
      <path d="M3 6.5c3-1.6 6-1.6 9 0c3-1.6 6-1.6 9 0v12c-3-1.6-6-1.6-9 0c-3-1.6-6-1.6-9 0z" />
      <path d="M12 6.5v12" />
    </>
  ),
  download: (
    <>
      <path d="M4 17v1.5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V17" />
      <path d="M7 11l5 5l5-5" />
      <path d="M12 4v12" />
    </>
  ),
  discord: (
    <>
      <path d="M8 12a1 1 0 1 0 2 0a1 1 0 0 0-2 0" />
      <path d="M14 12a1 1 0 1 0 2 0a1 1 0 0 0-2 0" />
      <path d="M15.5 17c0 1 1.5 3 2 3c1.5 0 2.833-1.667 3.5-3c.667-1.667 .5-5.833-1.5-11.5c-1.457-1.015-3-1.34-4.5-1.5l-.972 1.923a11.913 11.913 0 0 0-4.053 0l-.975-1.923c-1.5 .16-3.043 .485-4.5 1.5c-2 5.667-2.167 9.833-1.5 11.5c.667 1.333 2 3 3.5 3c.5 0 2-2 2-3" />
      <path d="M7 16.5c3.5 1 6.5 1 10 0" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  // in through a door
  enter: (
    <>
      <path d="M14 4h3a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-3" />
      <path d="M4 12h11" />
      <path d="M11 8l4 4l-4 4" />
    </>
  ),
  leave: (
    <>
      <path d="M14 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2" />
      <path d="M9 12h12" />
      <path d="M18 9l3 3l-3 3" />
    </>
  ),
  link: (
    <>
      <path d="M9 15l6-6" />
      <path d="M11 6l.46-.54a5 5 0 0 1 7.07 7.07l-.53 .47" />
      <path d="M13 18l-.4 .53a5.07 5.07 0 0 1-7.13 0a4.97 4.97 0 0 1 0-7.07l.53-.46" />
    </>
  ),
  // a clapperboard: the show's starting
  clapper: (
    <>
      <path d="M4 10h16v8.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z" />
      <path d="M4 10l-.55-3.1a1.2 1.2 0 0 1 .98-1.4l13.4-2.36a1.2 1.2 0 0 1 1.4 .98L19.8 7.2L4 10" />
      <path d="M8.2 5l2.3 3.6" />
      <path d="M13.4 4.1l2.3 3.6" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5l9.5-10" />,
  play: <path d="M7.5 5.3v13.4a1 1 0 0 0 1.5 .86l11-6.7a1 1 0 0 0 0-1.72l-11-6.7a1 1 0 0 0-1.5 .86z" />,
  trophy: (
    <>
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10" />
      <path d="M17 4v8a5 5 0 0 1-10 0V4" />
      <path d="M3 9a2 2 0 1 0 4 0a2 2 0 1 0-4 0" />
      <path d="M17 9a2 2 0 1 0 4 0a2 2 0 1 0-4 0" />
    </>
  ),
  share: (
    <>
      <path d="M8 9H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1" />
      <path d="M12 14V3" />
      <path d="M9 6l3-3l3 3" />
    </>
  ),
  copy: (
    <>
      <path d="M8 10.5A2.5 2.5 0 0 1 10.5 8h8A2.5 2.5 0 0 1 21 10.5v8a2.5 2.5 0 0 1-2.5 2.5h-8A2.5 2.5 0 0 1 8 18.5z" />
      <path d="M4.5 16.2A2 2 0 0 1 3 14.3V5a2 2 0 0 1 2-2h9.3a2 2 0 0 1 1.9 1.5" />
    </>
  ),
  image: (
    <>
      <path d="M15 8h.01" />
      <path d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z" />
      <path d="M3 16l5-5c.93-.9 2.07-.9 3 0l5 5" />
      <path d="M14 14l1-1c.93-.9 2.07-.9 3 0l3 3" />
    </>
  ),
  // round again
  again: (
    <>
      <path d="M20 11a8.1 8.1 0 0 0-15.5-2" />
      <path d="M4 5v4h4" />
      <path d="M4 13a8.1 8.1 0 0 0 15.5 2" />
      <path d="M20 19v-4h-4" />
    </>
  ),
  // (i)
  info: (
    <>
      <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0" />
      <path d="M12 11v5" />
      <path d="M12 7.5h.01" />
    </>
  ),
  // two people
  players: (
    <>
      <path d="M6 7.5a3 3 0 1 0 6 0a3 3 0 1 0-6 0" />
      <path d="M3 20v-1.5a4.5 4.5 0 0 1 4.5-4.5h3a4.5 4.5 0 0 1 4.5 4.5V20" />
      <path d="M15.5 4.6a3 3 0 0 1 0 5.8" />
      <path d="M18 14.2a4.5 4.5 0 0 1 3 4.3V20" />
    </>
  ),
  // a stopwatch
  timer: (
    <>
      <path d="M5 13a7 7 0 1 0 14 0a7 7 0 1 0-14 0" />
      <path d="M12 10v3l2 2" />
      <path d="M10 3h4" />
      <path d="M12 3v3" />
    </>
  ),
  // crossed arrows: at random
  shuffle: (
    <>
      <path d="M18 4l3 3l-3 3" />
      <path d="M18 20l3-3l-3-3" />
      <path d="M3 7h3a5 5 0 0 1 5 5a5 5 0 0 0 5 5h5" />
      <path d="M21 7h-5a4.98 4.98 0 0 0-3 1m-4 8a4.98 4.98 0 0 1-3 1h-3" />
    </>
  ),
  // ↶ take it back
  undo: (
    <>
      <path d="M9 14l-4-4l4-4" />
      <path d="M5 10h10a5 5 0 0 1 0 10h-3" />
    </>
  ),
  removePerson: (
    <>
      <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0-8 0" />
      <path d="M6 21v-2a4 4 0 0 1 4-4h4" />
      <path d="M16 19h6" />
    </>
  ),
  flag: (
    <>
      <path d="M5 5a5 5 0 0 1 7 0a5 5 0 0 0 7 0v9a5 5 0 0 1-7 0a5 5 0 0 0-7 0z" />
      <path d="M5 21v-7" />
    </>
  ),
  // waiting: a faint ring, and an arc of it that goes round (the spinning is the button's, see
  // defaultButton.module.css .loading, or the `spin` class here)
  spinner: (
    <>
      <circle cx="12" cy="12" r="9" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </>
  ),
  close: (
    <>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof PATHS;

export const isIconName = (name: string): name is IconName => name in PATHS;

const Icon = ({ name, className, strokeWidth = 2 }: { name: IconName; className?: string; strokeWidth?: number }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {PATHS[name]}
  </svg>
);

export default Icon;
