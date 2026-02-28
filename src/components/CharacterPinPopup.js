import DefaultButton from "./utils/DefaultButton.js";

const CharacterPinPopup = ({ closePopup }) => {
  return (
    <>
      <div
        className="videoModalWrapper"
        style={{
          zIndex: 999997,
        }}
        onClick={(e) => {
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
              I am incredibly excited to announce that an expansion is currently
              in development! Follow the link below to stay updated on the
              release date and other updates!
            </p>

            <div className="button-wrapper">
              <DefaultButton
                href="https://www.kickstarter.com/projects/pegasusgamesnyc/love-career-and-magic-the-second-season"
                text="Follow on Kickstarter"
                icon="forward"
                className="is-green"
              />
            </div>
            <button className="close-btn" onClick={closePopup}>
              No thanks, I'm not interested.
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        @media only screen and (max-width: 900px) {
          .modal-popup {
            width: calc(100% - 4em);
          }
          .modal-content .forminputText,
          .modal-content .emailInput {
            font-size: 0.8em;
          }
        }
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
        }
        .close-x-btn {
          cursor: pointer;
          position: absolute;
          top: 0.5em;
          right: 0.5em;
          width: 1em;
          height: 1em;
          opacity: 0.5;
        }
        .close-x-btn:hover {
          opacity: 1;
        }
        .modal-content {
          max-width: 400px;
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
