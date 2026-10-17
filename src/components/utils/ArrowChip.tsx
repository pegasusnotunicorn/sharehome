import Icon from "./Icons";
import styles from "../../css/utils/arrowChip.module.css";

// A carousel's Prev or Next: the site's small square chip, a chevron in it (`dir` -1: back, 1: on)
interface ArrowChipProps {
  dir: -1 | 1;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

const ArrowChip = ({ dir, label, onClick, disabled, className }: ArrowChipProps) => (
  <button type="button" className={`${styles.chip} tap-area${className ? ` ${className}` : ""}`} onClick={onClick} disabled={disabled} aria-label={label}>
    <Icon name={dir < 0 ? "chevronBack" : "chevron"} className={styles.icon} strokeWidth={2.5} />
  </button>
);

export default ArrowChip;
