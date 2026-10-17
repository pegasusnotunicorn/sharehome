import { ReactNode, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "../../css/utils/modal.module.css";
import Icon from "./Icons";
import useDialogFocus from "./useDialogFocus";

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
  panelClassName?: string;
  // its accessible name: a heading inside it (that heading's id), or else a label
  ariaLabelledBy?: string;
  ariaLabel?: string;
}

// The site's × in a corner: a dialog's, or anything else that closes (in its parent's top right)
export const CloseButton = ({ onClick, label = "Close", className }: { onClick: () => void; label?: string; className?: string }) => (
  <button type="button" className={`${styles.closeBtn}${className ? ` ${className}` : ""}`} onClick={onClick} aria-label={label}>
    <Icon name="close" className={styles.closeIcon} strokeWidth={2.6} />
  </button>
);

// A dialog over the page: Escape or a click outside closes it. Focus moves into it as it opens (to a field
// that focuses itself, else its first button), stays in it while it's open, and goes back where it was
// when it closes (useDialogFocus).
const Modal = ({ onClose, children, panelClassName, ariaLabel, ariaLabelledBy }: ModalProps) => {
  const panel = useRef<HTMLDivElement>(null);

  useDialogFocus(panel, onClose);

  return createPortal(
    <div className={`${styles.overlay} modal-overlay`} onClick={onClose}>
      <div
        ref={panel}
        className={panelClassName ?? styles.panel}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabelledBy ? undefined : ariaLabel}
        aria-labelledby={ariaLabelledBy}
      >
        <CloseButton onClick={onClose} />
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
