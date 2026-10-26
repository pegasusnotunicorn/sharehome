import DefaultButton from "./DefaultButton";
import { KICKSTARTER_URL } from "../../utils/links";

// The "Expansion!" button (the top bar's, the phones' bar along the foot of the screen): off to the
// expansion's Kickstarter. An outlined violet one, so Buy now beside it reads as the one to press.
const ExpansionButton = ({ className }: { className?: string }) => (
  <DefaultButton
    compact
    icon="star"
    variant="secondary"
    color="purple"
    className={className}
    href={KICKSTARTER_URL}
    text="Expansion!"
  />
);

export default ExpansionButton;
