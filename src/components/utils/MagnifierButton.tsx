import { ReactNode } from "react";
import styles from "../../css/utils/magnifierButton.module.css";

interface MagnifierButtonProps {
  onClick: () => void;
  ariaLabel: string;
  children: ReactNode;
  size?: "sm" | "md";
}

const ZoomInIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M3 10a7 7 0 1 0 14 0a7 7 0 0 0 -14 0" />
    <path d="M21 21l-6 -6" />
    <path d="M7 10l6 0" />
    <path d="M10 7l0 6" />
  </svg>
);

const MagnifierButton = ({ onClick, ariaLabel, children, size = "md" }: MagnifierButtonProps) => (
  <button className={styles.wrapper} onClick={onClick} aria-label={ariaLabel}>
    {children}
    <div className={`${styles.badge} ${size === "sm" ? styles.badgeSm : ""}`}>
      <ZoomInIcon className={`${styles.icon} ${size === "sm" ? styles.iconSm : ""}`} />
    </div>
  </button>
);

export default MagnifierButton;
