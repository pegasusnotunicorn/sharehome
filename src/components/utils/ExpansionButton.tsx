import DefaultButton from "./DefaultButton";
import { KICKSTARTER_URL } from "../../utils/links";

// The yellow "Expansion!" button (the top bar's, the home page's): off to the expansion's Kickstarter
const ExpansionButton = ({ className }: { className?: string }) => (
  <DefaultButton compact icon="star" variant="primary" color="yellow" className={className} href={KICKSTARTER_URL} text="Expansion!" />
);

export default ExpansionButton;
