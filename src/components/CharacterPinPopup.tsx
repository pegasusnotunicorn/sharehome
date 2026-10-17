import { useEffect } from "react";
import Modal from "./utils/Modal";
import DefaultButton from "./utils/DefaultButton";
import { POPUP_TITLE_ID } from "./utils/usePinPopup";
import modalStyles from "../css/utils/modal.module.css";
import { KICKSTARTER_URL } from "../utils/links";

interface CharacterPinPopupProps {
  shown: () => void; // it's on the screen
  closePopup: (how: string) => void; // how: "close" or "not_now"
  followed: () => void;
}

// The expansion news, once (usePinPopup.ts says when): the site's dialog, its band in Kickstarter green.
const CharacterPinPopup = ({ shown, closePopup, followed }: CharacterPinPopupProps) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => shown(), []); // (once, as it opens)

  return (
    <Modal onClose={() => closePopup("close")} panelClassName={`${modalStyles.panel} ${modalStyles.kickstarter}`} ariaLabelledBy={POPUP_TITLE_ID}>
      <img className={modalStyles.picture} src="/images/kitchen_chaos.webp" alt="" width="900" height="614" />
      <h2 id={POPUP_TITLE_ID} className={modalStyles.title}>An expansion is coming!</h2>
      <p className={modalStyles.text}>An expansion is officially in development. Follow it on Kickstarter for release news and updates.</p>
      <div className={modalStyles.stack}>
        <DefaultButton
          href={KICKSTARTER_URL}
          onClick={followed}
          text={<>Follow on Kickstarter<span className="visually-hidden"> (opens in a new tab)</span></>}
          icon="forward"
          color="kickstarter"
        />
      </div>
      <button type="button" className={modalStyles.later} onClick={() => closePopup("not_now")}>
        Not now
      </button>
    </Modal>
  );
};

export default CharacterPinPopup;
