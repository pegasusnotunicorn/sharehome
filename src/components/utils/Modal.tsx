import { ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "../../css/utils/modal.module.css";
import Icon from "./Icons";

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
  panelClassName?: string;
  // its accessible name: a heading inside it (that heading's id), or else a label
  ariaLabelledby?: string;
  ariaLabel?: string;
}

// A dialog over the page: Escape or a click outside closes it. Focus moves into it as it opens, stays in
// it while it's open, and goes back where it was when it closes.
const Modal = ({ onClose, children, panelClassName, ariaLabelledby, ariaLabel }: ModalProps) => {
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return close.current();
      if (e.key !== "Tab" || !panel.current) return;
      const all = [...panel.current.querySelectorAll<HTMLElement>("button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])")].filter((x) => !x.hasAttribute("disabled"));
      if (!all.length) return;
      const first = all[0], last = all[all.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      before?.focus?.();
    };
  }, []);

  return createPortal(
    <div className={`${styles.overlay} modal-overlay`} onClick={onClose}>
      <div
        ref={panel}
        className={panelClassName ?? styles.panel}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledby}
        aria-label={ariaLabelledby ? undefined : ariaLabel}
      >
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <Icon name="close" className={styles.closeIcon} strokeWidth={2.6} />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
