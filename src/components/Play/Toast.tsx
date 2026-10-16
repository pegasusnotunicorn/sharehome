import { useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "../../css/pages/playPage.module.css";

// A short message at the foot of the screen that goes away on its own (or with its ×)
const Toast = ({ message, onClose, duration = 5000 }: { message: string; onClose: () => void; duration?: number }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  return createPortal(
    <div className={styles.toast} role="alert">
      <span>{message}</span>
      <button type="button" className={styles.toastClose} onClick={onClose} aria-label="Dismiss">
        ×
      </button>
    </div>,
    document.body
  );
};

export default Toast;
