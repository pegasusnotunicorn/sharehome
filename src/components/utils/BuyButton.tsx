import DefaultButton from "./DefaultButton";
import { trackEvent } from "./trackEvent";

// Buy buttons navigate straight to /checkout inside the app. Going through
// /buy instead costs two full page loads (the /buy request, then its redirect)
// right when someone has decided to buy — 1-2s on a phone.
const BUY_DESTINATION = "/checkout";

// Pages with no buy buttons in the navbar or footer: the shop's own (they'd lead where you already
// are), and the online game's (they'd sit over the game).
export const hidesBuyButtons = (pathname: string) =>
  ["/buy", BUY_DESTINATION, "/thankyou", "/raffle", "/play"].includes(pathname) || pathname.startsWith("/play/");

// /buy's edge function records the checkout_flow_assigned GA4 event from the
// visitor's _ga cookies. A beacon keeps that server-side event firing for
// every Buy click without making the visitor wait on the round trip.
export const recordBuyClick = () => {
  try {
    navigator.sendBeacon?.("/buy");
  } catch {
    // Analytics only — never block the navigation.
  }
};

// Someone heading for a Buy button (a hover, a touch, a tab onto it): checkout's code starts coming
// down, and with it Stripe.js, so the page is mostly there by the time it opens. Once a visit.
let checkoutWarmed = false;
const warmCheckout = () => {
  if (checkoutWarmed) return;
  checkoutWarmed = true;
  import("../CheckoutPage").catch(() => {
    checkoutWarmed = false; // (it'll be fetched on the way in instead)
  });
};

// (native listeners on the button itself: a wrapper around it would upset the layouts it sits in)
const listenForIntent = (el: HTMLElement | null) => {
  if (!el) return;
  for (const type of ["pointerenter", "touchstart", "focus"]) el.addEventListener(type, warmCheckout, { once: true, passive: true });
};

interface BuyButtonProps {
  text?: string;
  icon?: string;
  iconPosition?: "left" | "right";
  variant?: "primary" | "secondary" | "ghost";
  color?: "dark" | "red" | "green" | "purple" | "yellow" | "white";
  size?: "default" | "large";
  border?: "dark" | "light" | "none";
  animated?: boolean;
  compact?: boolean;
  id?: string;
  className?: string;
  from?: string; // where on the site it is, sent with a buy_click event
}

const BuyButton = ({ from, ...props }: BuyButtonProps) => (
  <DefaultButton
    {...props}
    ref={listenForIntent}
    navlink={BUY_DESTINATION}
    onClick={() => {
      if (from) trackEvent("buy_click", { from });
      recordBuyClick();
    }}
  />
);

export default BuyButton;
export { BUY_DESTINATION };
