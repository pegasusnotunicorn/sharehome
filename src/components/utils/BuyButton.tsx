import DefaultButton from "./DefaultButton";

const BUY_DESTINATION = import.meta.env.VITE_USE_EMBEDDED_CHECKOUT === "true" ? "/cart" : "/buy";

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
  <DefaultButton {...props} navlink={BUY_DESTINATION} />
);

export default BuyButton;
export { BUY_DESTINATION };
