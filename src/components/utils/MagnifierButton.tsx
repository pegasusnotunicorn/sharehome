import { ReactNode } from "react";
import styles from "../../css/utils/magnifierButton.module.css";

interface MagnifierButtonProps {
  onClick: () => void;
  ariaLabel: string;
  children: ReactNode;
  size?: "sm" | "md";
}

const MagnifierButton = ({ onClick, ariaLabel, children, size = "md" }: MagnifierButtonProps) => (
  <button className={styles.wrapper} onClick={onClick} aria-label={ariaLabel}>
    {children}
    <div className={`${styles.badge} ${size === "sm" ? styles.badgeSm : ""}`}>
      <img src="/images/icons/magnifier.svg" alt="" className={`${styles.icon} ${size === "sm" ? styles.iconSm : ""}`} />
    </div>
  </button>
);

export default MagnifierButton;
