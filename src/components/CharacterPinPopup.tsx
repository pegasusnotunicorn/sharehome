import { MouseEvent, useEffect, useRef, useState, type CSSProperties } from "react";
import DefaultButton from "./utils/DefaultButton";
import styles from "../css/utils/lazyYoutube.module.css";

interface CharacterPinPopupProps {
  closePopup: (how: string) => void; // how: "close", "outside", "escape" or "not_now"
  followed: () => void;
}

// The expansion news, once (usePinPopup.ts says when): a card in the middle of the screen, or on
// phones one that slides up from the bottom without covering the page.
const CharacterPinPopup = ({ closePopup, followed }: CharacterPinPopupProps) => {
  const card = useRef<HTMLDivElement | null>(null);
  const [phone] = useState(() => !!window.matchMedia?.("(max-width: 600px)").matches);

  // Esc closes it; the keyboard starts in it, and goes back where it was after
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    card.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closePopup("escape");
    addEventListener("keydown", onKey);
    return () => {
      removeEventListener("keydown", onKey);
      before?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const content = (
    <div
      ref={card}
      className={`modal-popup${phone ? " modal-popup-sheet" : ""}`}
      role="dialog"
      aria-modal={!phone}
      aria-labelledby="expansion-popup-title"
      tabIndex={-1}
    >
      <button type="button" className="close-x-btn" aria-label="Close" onClick={() => closePopup("close")}>
        <img src="/images/icons/cross.svg" alt="" />
      </button>
      <div className="modal-content">
        <img className="expansion-image" src="/images/kitchen_chaos.webp" alt="Expansion update" />
        <h2 id="expansion-popup-title">An expansion is coming!</h2>
        <p>An expansion is officially in development. Follow the link below for release news and updates.</p>

        <div className="button-wrapper" onClick={followed}>
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
        <button type="button" className="close-btn" onClick={() => closePopup("not_now")}>
          Not now
        </button>
      </div>
    </div>
  );

  return (
    <>
      {phone ? (
        content
      ) : (
        <div
          className={styles.videoModalWrapper}
          style={{
            zIndex: 999997,
          }}
          onClick={(e: MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget) closePopup("outside");
          }}
        >
          {content}
        </div>
      )}
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
        .modal-popup:focus {
          outline: none;
        }
        /* phones: a card along the bottom, over the page's own buttons, the page still usable */
        .modal-popup-sheet {
          top: auto;
          bottom: 0.75rem;
          left: 0.75rem;
          right: 0.75rem;
          width: auto;
          max-width: none;
          transform: none;
          z-index: 999997;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35);
          animation: expansion-sheet-in 0.35s ease-out;
        }
        /* compact: the picture beside the words, the buttons under them */
        .modal-popup-sheet .modal-content {
          display: grid;
          grid-template-columns: 96px 1fr;
          grid-template-areas: "pic title" "pic text" "go go" "no no";
          column-gap: 0.75em;
          align-items: center;
          text-align: left;
          padding-right: 1.75rem;
        }
        .modal-popup-sheet .expansion-image {
          grid-area: pic;
          width: 96px;
          height: 96px;
          object-fit: cover;
          margin: 0;
        }
        .modal-popup-sheet h2 {
          grid-area: title;
          font-size: 1.05rem;
          align-self: end;
        }
        .modal-popup-sheet p {
          grid-area: text;
          font-size: 0.8rem;
          line-height: 1.35;
          margin: 0.25em 0 0;
          align-self: start;
        }
        .modal-popup-sheet .button-wrapper {
          grid-area: go;
          margin: 0.75em 0 0;
          margin-right: -1.75rem;
          width: calc(100% + 1.75rem);
        }
        .modal-popup-sheet .close-btn {
          grid-area: no;
          justify-self: center;
          padding-top: 0.5em;
          margin-top: 0.6em;
          margin-right: -1.75rem;
        }
        @keyframes expansion-sheet-in {
          from { transform: translateY(110%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .modal-popup-sheet { animation: none; }
        }
        .close-x-btn {
          display: grid;
          place-items: center;
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
        .close-x-btn img {
          width: 100%;
          height: 100%;
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
