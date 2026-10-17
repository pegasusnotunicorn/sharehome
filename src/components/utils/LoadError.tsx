import type { ReactNode } from "react";
import { NavLink } from "react-router";
import DefaultButton from "./DefaultButton";
import styles from "../../css/utils/loadError.module.css";

interface LoadErrorProps {
  title: string;
  children?: ReactNode; // (what went wrong, and what might fix it)
  onRetry?: () => void;
  className?: string;
}

// Something the page needs didn't load: say so, with a way to try again and a way to reach us.
const LoadError = ({ title, children, onRetry, className }: LoadErrorProps) => (
  <div className={`${styles.box} ${className ?? ""}`.trim()} role="alert">
    <p className={styles.title}>{title}</p>
    {children && <p className={styles.body}>{children}</p>}
    <div className={styles.actions}>
      {onRetry && <DefaultButton button="button" text="Try again" icon="again" variant="primary" color="dark" compact onClick={onRetry} />}
      <NavLink to="/contact" className={styles.contact}>
        Contact us
      </NavLink>
    </div>
  </div>
);

export default LoadError;
