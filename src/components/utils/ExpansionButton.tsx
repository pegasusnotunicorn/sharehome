import DefaultButton from "./DefaultButton";
import { KICKSTARTER_URL } from "../../utils/links";

// The "Expansion!" button (the top bar's, the home page's): off to the expansion's Kickstarter. Yellow in
// the top bar; in the phones' bar along the foot of the screen (`bar`), an outlined violet one, so Buy now
// beside it reads as the one to press.
const ExpansionButton = ({ className, bar }: { className?: string; bar?: boolean }) => (
  <DefaultButton
    compact
    icon="star"
    variant={bar ? "secondary" : "primary"}
    color={bar ? "purple" : "yellow"}
    className={className}
    href={KICKSTARTER_URL}
    text="Expansion!"
  />
);

export default ExpansionButton;
