import DefaultButton from "../utils/DefaultButton";
import Modal from "../utils/Modal";
import modalStyles from "../../css/utils/modal.module.css";

// A yes or no, in the site's own dialog
const Confirm = ({
  title,
  text,
  action,
  icon,
  onConfirm,
  onClose,
}: {
  title: string;
  text: string;
  action: string;
  // (the action button's icon)
  icon?: string;
  onConfirm: () => void;
  onClose: () => void;
}) => (
  <Modal onClose={onClose} ariaLabel={title}>
    <h2 className={modalStyles.title}>{title}</h2>
    <p className={modalStyles.text}>{text}</p>
    <div className={modalStyles.actions}>
      <DefaultButton onClick={onClose} text="Cancel" icon="close" variant="secondary" border="dark" />
      <DefaultButton onClick={onConfirm} text={action} icon={icon} color="red" />
    </div>
  </Modal>
);

export default Confirm;
