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
