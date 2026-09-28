import DefaultButton from "./DefaultButton";

// Buy buttons navigate straight to /checkout inside the app. Going through
// /buy instead costs two full page loads (the /buy request, then its redirect)
// right when someone has decided to buy — 1-2s on a phone.
const BUY_DESTINATION = "/checkout";

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

type OmitNavlink<T> = Omit<T, "navlink" | "href">;

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
}

const BuyButton = (props: BuyButtonProps) => (
  <DefaultButton {...props} navlink={BUY_DESTINATION} onClick={recordBuyClick} />
);

export default BuyButton;
export { BUY_DESTINATION };
