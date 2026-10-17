import type { ReactNode } from "react";
import { useOffline } from "./useRoom";
import styles from "../../css/pages/playPage.module.css";

// The part of a room that talks to it: while the connection's down, every control in it is off (and
// dimmed), so nothing's pressed into the void. (A fieldset: disabled, it disables all it holds.)
const Live = ({ children, className }: { children: ReactNode; className?: string }) => {
  const offline = useOffline();
  return (
    <fieldset className={`${styles.live}${className ? ` ${className}` : ""}`} disabled={offline}>
      {children}
    </fieldset>
  );
};

export default Live;
