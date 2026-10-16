import DefaultButton from "../utils/DefaultButton";
import Modal from "../utils/Modal";
import styles from "../../css/pages/playPage.module.css";

// A yes or no, in the site's own dialog
const Confirm = ({
  title,
  text,
  action,
  onConfirm,
  onClose,
}: {
  title: string;
  text: string;
  action: string;
  onConfirm: () => void;
  onClose: () => void;
}) => (
  <Modal onClose={onClose} panelClassName={styles.dialog} ariaLabel={title}>
    <h2 className={styles.dialogTitle}>{title}</h2>
    <p className={styles.dialogText}>{text}</p>
    <div className={styles.dialogActions}>
      <DefaultButton onClick={onClose} text="Cancel" variant="secondary" border="dark" />
      <DefaultButton onClick={onConfirm} text={action} color="red" />
    </div>
  </Modal>
);

export default Confirm;
