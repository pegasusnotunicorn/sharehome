import { MouseEvent, useEffect, useRef, useState, type CSSProperties } from "react";
import DefaultButton from "./utils/DefaultButton";
import styles from "../css/utils/lazyYoutube.module.css";
import Icon from "./utils/Icons";

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
        <Icon name="close" strokeWidth={2.6} />
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
          /* the site's dialog (modal.module.css): a band of red along its top, round corners */
          padding: 2rem 1.75rem 1.6rem;
          box-sizing: border-box;
          border-radius: 22px;
          box-shadow: inset 0 6px 0 #d81e18, 0 30px 60px -30px rgba(0, 0, 0, 0.5);
          width: calc(100% - 4em);
          max-width: 28rem;
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
          padding: 1.25rem 1.1rem 1rem;
          border-radius: 18px;
          box-shadow: inset 0 5px 0 #d81e18, 0 10px 40px rgba(0, 0, 0, 0.35);
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
        .modal-popup-sheet .modal-content h2 {
          grid-area: title;
          font-size: 1.05rem;
          align-self: end;
        }
        .modal-popup-sheet .modal-content p {
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
          top: 0.9rem;
          right: 0.9rem;
          width: 2.25rem;
          height: 2.25rem;
          padding: 0.5rem;
          box-sizing: border-box;
          /* the site's small square button (see defaultButton.module.css) */
          border: 2px solid var(--chip-edge);
          border-radius: var(--chip-radius);
          background: #fff;
          box-shadow: 0 3px 0 var(--chip-edge);
          transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.15s ease;
        }
        .close-x-btn svg {
          width: 100%;
          height: 100%;
        }
        .close-x-btn:hover {
          border-color: var(--btn-ink);
          transform: translateY(-1px);
          box-shadow: 0 4px 0 var(--btn-ink);
        }
        .close-x-btn:active {
          transform: translateY(2px);
          box-shadow: 0 1px 0 var(--btn-ink);
        }
        .modal-content {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
        }
        .modal-content h2 {
          margin: 0 0 0.5rem;
          font-family: "Rowdies-Bold";
          font-size: 1.5rem;
          font-weight: normal;
          line-height: 1.15;
          color: #323232;
        }
        .modal-content p {
          margin: 0 0 1.4rem;
          font-family: "Roboto Light";
          font-size: 1rem;
          line-height: 1.5;
          color: rgba(50, 50, 50, 0.8);
          opacity: 1;
        }
        .expansion-image {
          width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 1.75rem 0 1.25rem;
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
