import Modal from "./utils/Modal";
import DefaultButton from "./utils/DefaultButton";
import modalStyles from "../css/utils/modal.module.css";

interface CharacterPinPopupProps {
  closePopup: (how: string) => void; // how: "close" or "not_now"
  followed: () => void;
}

const KICKSTARTER_URL = "https://www.kickstarter.com/projects/pegasusgamesnyc/love-career-and-magic-the-second-season";

// The expansion news, once (usePinPopup.ts says when): the site's dialog, its band in Kickstarter green.
const CharacterPinPopup = ({ closePopup, followed }: CharacterPinPopupProps) => (
  <Modal onClose={() => closePopup("close")} panelClassName={`${modalStyles.panel} ${modalStyles.kickstarter}`} ariaLabel="An expansion is coming!">
    <img className={modalStyles.picture} src="/images/kitchen_chaos.webp" alt="" width="900" height="614" />
    <h2 className={modalStyles.title}>An expansion is coming!</h2>
    <p className={modalStyles.text}>An expansion is officially in development. Follow it on Kickstarter for release news and updates.</p>
    <div className={modalStyles.stack} onClick={followed}>
      <DefaultButton href={KICKSTARTER_URL} text="Follow on Kickstarter" icon="forward" color="kickstarter" />
    </div>
    <button type="button" className={modalStyles.later} onClick={() => closePopup("not_now")}>
      Not now
    </button>
  </Modal>
);

export default CharacterPinPopup;
