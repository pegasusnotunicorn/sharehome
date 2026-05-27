import { ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "../../css/utils/modal.module.css";

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
  panelClassName?: string;
  ariaLabel?: string;
}

const Modal = ({ onClose, children, panelClassName, ariaLabel }: ModalProps) =>
  createPortal(
    <div className={`${styles.overlay} modal-overlay`} onClick={onClose}>
      <div
        className={panelClassName ?? styles.panel}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <img src="/images/icons/cross.svg" alt="" className={styles.closeIcon} />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );

export default Modal;
