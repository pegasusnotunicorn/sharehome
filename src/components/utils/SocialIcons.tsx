export interface SocialLink {
  href: string;
  label: string;
  iconId: string;
  external?: boolean;
  brandColor: string;
  hoverBackground?: string;
  hoverIconColor?: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: "https://www.tiktok.com/@pegasusgamesnyc",
    label: "TikTok",
    iconId: "social-icon-tiktok",
    brandColor: "#fe2c55",
    hoverBackground:
      "linear-gradient(135deg, #00f2ea 0%, #00f2ea 26%, #000000 26%, #000000 74%, #ff0050 74%, #ff0050 100%)",
  },
  {
    href: "https://instagram.com/pegasusgamesnyc",
    label: "Instagram",
    iconId: "social-icon-instagram",
    brandColor: "#e4405f",
  },
  {
    href: "https://www.youtube.com/channel/UCLVCLQPt9jIGwWOA2kaaaxA",
    label: "YouTube",
    iconId: "social-icon-youtube",
    brandColor: "#ff0000",
  },
  {
    href: "https://discord.com/invite/nv89cRgEsS",
    label: "Discord",
    iconId: "social-icon-discord",
    brandColor: "#5865f2",
  },
  {
    href: "https://bsky.app/profile/pegasusgamesnyc.bsky.social",
    label: "Bluesky",
    iconId: "social-icon-bluesky",
    brandColor: "#1185fe",
  },
  {
    href: "https://x.com/pegasusgamesnyc",
    label: "Twitter / X",
    iconId: "social-icon-twitter",
    brandColor: "#000000",
  },
  {
    href: "https://www.threads.com/@pegasusgamesnyc",
    label: "Threads",
    iconId: "social-icon-threads",
    brandColor: "#101010",
  },
  {
    href: "https://www.facebook.com/PegasusGamesNYC/",
    label: "Facebook",
    iconId: "social-icon-facebook",
    brandColor: "#1877f2",
  },
  {
    href: "mailto:hello@lovecareermagic.com",
    label: "Email",
    iconId: "social-icon-email",
    external: false,
    brandColor: "#649a85",
    hoverBackground:
      "linear-gradient(to right, #dd7373 0 50%, #5f5aa2 50% 100%) top / 100% 50.5% no-repeat, linear-gradient(to right, #649a85 0 50%, #f1db4b 50% 100%) bottom / 100% 50.5% no-repeat",
  },
];

export const SocialIconDefs = ({ className }: { className?: string }) => (
  <svg aria-hidden="true" className={className}>
    <symbol
      id="social-icon-email"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10" />
      <path d="M3 7l9 6l9 -6" />
    </symbol>
    <symbol
      id="social-icon-tiktok"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M21 7.917v4.034a9.948 9.948 0 0 1 -5 -1.951v4.5a6.5 6.5 0 1 1 -8 -6.326v4.326a2.5 2.5 0 1 0 4 2v-11.5h4.083a6.005 6.005 0 0 0 4.917 4.917" />
    </symbol>
    <symbol
      id="social-icon-instagram"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M4 8a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4l0 -8" />
      <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
      <path d="M16.5 7.5v.01" />
    </symbol>
    <symbol
      id="social-icon-discord"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M8 12a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
      <path d="M14 12a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
      <path d="M15.5 17c0 1 1.5 3 2 3c1.5 0 2.833 -1.667 3.5 -3c.667 -1.667 .5 -5.833 -1.5 -11.5c-1.457 -1.015 -3 -1.34 -4.5 -1.5l-.972 1.923a11.913 11.913 0 0 0 -4.053 0l-.975 -1.923c-1.5 .16 -3.043 .485 -4.5 1.5c-2 5.667 -2.167 9.833 -1.5 11.5c.667 1.333 2 3 3.5 3c.5 0 2 -2 2 -3" />
      <path d="M7 16.5c3.5 1 6.5 1 10 0" />
    </symbol>
    <symbol
      id="social-icon-facebook"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3" />
    </symbol>
    <symbol
      id="social-icon-threads"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M19 7.5c-1.333 -3 -3.667 -4.5 -7 -4.5c-5 0 -8 2.5 -8 9s3.5 9 8 9s7 -3 7 -5s-1 -5 -7 -5c-2.5 0 -3 1.25 -3 2.5c0 1.5 1 2.5 2.5 2.5c2.5 0 3.5 -1.5 3.5 -5s-2 -4 -3 -4s-1.833 .333 -2.5 1" />
    </symbol>
    <symbol
      id="social-icon-bluesky"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M6.335 5.144c-1.654 -1.199 -4.335 -2.127 -4.335 .826c0 .59 .35 4.953 .556 5.661c.713 2.463 3.13 2.75 5.444 2.369c-4.045 .665 -4.889 3.208 -2.667 5.41c1.03 1.018 1.913 1.59 2.667 1.59c2 0 3.134 -2.769 3.5 -3.5c.333 -.667 .5 -1.167 .5 -1.5c0 .333 .167 .833 .5 1.5c.366 .731 1.5 3.5 3.5 3.5c.754 0 1.637 -.571 2.667 -1.59c2.222 -2.203 1.378 -4.746 -2.667 -5.41c2.314 .38 4.73 .094 5.444 -2.369c.206 -.708 .556 -5.072 .556 -5.661c0 -2.953 -2.68 -2.025 -4.335 -.826c-2.293 1.662 -4.76 5.048 -5.665 6.856c-.905 -1.808 -3.372 -5.194 -5.665 -6.856" />
    </symbol>
    <symbol
      id="social-icon-twitter"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M4 4l11.733 16h4.267l-11.733 -16l-4.267 0" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </symbol>
    <symbol
      id="social-icon-youtube"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M2 8a4 4 0 0 1 4 -4h12a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-12a4 4 0 0 1 -4 -4v-8" />
      <path d="M10 9l5 3l-5 3l0 -6" />
    </symbol>
  </svg>
);

export const SocialIcon = ({
  iconId,
  className,
}: {
  iconId: string;
  className?: string;
}) => (
  <svg className={className} aria-hidden="true" viewBox="0 0 24 24">
    <use href={`#${iconId}`} />
  </svg>
);
