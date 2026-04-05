import { MouseEvent, type CSSProperties } from "react";
import DefaultButton from "./utils/DefaultButton";
import styles from "../css/utils/lazyYoutube.module.css";

interface CharacterPinPopupProps {
  closePopup: () => void;
  dismissPopup: () => void;
}

const CharacterPinPopup = ({ closePopup, dismissPopup }: CharacterPinPopupProps) => {
  return (
    <>
      <div
        className={styles.videoModalWrapper}
        style={{
          zIndex: 999997,
        }}
        onClick={(e: MouseEvent<HTMLDivElement>) => {
          if (e.target === e.currentTarget) closePopup();
        }}
      >
        <div className="modal-popup">
          <img
            src="/images/icons/cross.svg"
            alt="Close"
            className="close-x-btn"
            onClick={closePopup}
          />
          <div className="modal-content">
            <img
              className="expansion-image"
              src="/images/kitchen_chaos.jpeg"
              alt="Expansion update"
            />
            <h2>An expansion is coming!</h2>
            <p>
              An expansion is officially in development. Follow the link below
              for release news and updates.
            </p>

            <div className="button-wrapper" onClick={dismissPopup}>
              <DefaultButton
                variant="primary"
                color="green"
                href="https://www.kickstarter.com/projects/pegasusgamesnyc/love-career-and-magic-the-second-season"
                text="Follow on Kickstarter"
                icon="forward"
                style={
                  {
                    "--btn-color": "#05ce78",
                    "--btn-color-light": "#2bd88e",
                    "--btn-color-dark": "#03b86b",
                    "--btn-color-glow": "rgba(5, 206, 120, 0.3)",
                  } as CSSProperties
                }
              />
            </div>
            <button className="close-btn" onClick={closePopup}>
              No thanks, I'm not interested.
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .modal-popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #fff;
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 1em;
          border-radius: 4px;
          box-shadow: 1px 1px 4px 0px #323232;
          width: calc(100% - 4em);
          max-width: 420px;
        }
        .close-x-btn {
          cursor: pointer;
          position: absolute;
          top: 0.5em;
          right: 0.5em;
          width: 2rem;
          height: 2rem;
          padding: 0.45rem;
          border: 1px solid rgba(50, 50, 50, 0.12);
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 8px 18px -14px rgba(0, 0, 0, 0.35);
          box-sizing: border-box;
          transition: background-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
        }
        .close-x-btn:hover {
          background-color: #f5f5f5;
          box-shadow:
            0 0 0 1px rgba(50, 50, 50, 0.2),
            3px 4px 8px rgba(0, 0, 0, 0.12);
          transform: scale(1.03);
        }
        .modal-content {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
        }
        .modal-content h2 {
          margin: 0;
        }
        .expansion-image {
          width: 100%;
          height: auto;
          border-radius: 5px;
          margin-bottom: 1em;
        }
        .button-wrapper {
          margin-bottom: 1em;
          width: 100%;
        }
        .button-wrapper a {
          width: 100%;
          padding: 10px 15px;
        }
        .pin-images {
          display: flex;
          justify-content: space-between;
          gap: 0.5em;
        }
        .pin-images img {
          width: 50%;
          height: auto;
        }
        .close-btn {
          background: transparent;
          text-decoration: underline;
          font-size: 0.75em;
          padding: 0;
          margin: 0;
          margin-top: 1em;
          border: 0;
          white-space: nowrap;
          cursor: pointer;
        }
      `}</style>
    </>
  );
};

export default CharacterPinPopup;
