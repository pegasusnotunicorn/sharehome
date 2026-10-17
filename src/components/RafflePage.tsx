import { lazy, Suspense, useId, useState } from "react";
import PageIntro from "./utils/PageIntro";
import MagnifierButton from "./utils/MagnifierButton";
import DefaultButton from "./utils/DefaultButton";
import usePageTitle from "./utils/usePageTitle";
import { PRICES, formatUsd } from "./utils/prices";
import styles from "../css/pages/rafflePage.module.css";

// (the carousel library comes down only when the box preview opens)
const ImageCarouselModal = lazy(() => import("./utils/ImageCarouselModal"));

const BOX_IMAGES = [
  { src: "/images/box_trimmed.webp", alt: "Love, Career & Magic box" },
  { src: "/images/cards-fan.webp", alt: "Character cards fan" },
  { src: "/images/cards-floating.webp", alt: "Character cards" },
  { src: "/images/cards-mockup.webp", alt: "Character cards mockup" },
  { src: "/images/rulebook-mockup.webp", alt: "Rulebook mockup" },
];

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
    <path d="M9 12l2 2l4 -4" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" />
    <path d="M3 7l9 6l9 -6" />
  </svg>
);

const KICKSTARTER_URL =
  "https://www.kickstarter.com/projects/pegasusgamesnyc/love-career-and-magic-the-second-season";

const RafflePage = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [kickstarterClicked, setKickstarterClicked] = useState(false);
  const [boxCarouselOpen, setBoxCarouselOpen] = useState(false);
  const emailId = useId();
  usePageTitle("Win a free copy");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/.netlify/functions/raffle-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
      } else {
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  const done = status === "success";

  return (
    <div className={`content ${styles.rafflePage}`}>
      <PageIntro eyebrow="Raffle" title="Free game" lead="You must complete all 3 steps to be entered in the raffle 🎟️" />

      <div className={styles.raffleContent}>

        {/* Prize section */}
        <div className={styles.prizeSection}>
          <p className={styles.prizeEyebrow}>🏆 Grand prize</p>
          <MagnifierButton onClick={() => setBoxCarouselOpen(true)} ariaLabel="Preview game box">
            <img
              src="/images/box_trimmed.webp"
              alt="Love, Career & Magic"
              className={styles.prizeImage}
            />
          </MagnifierButton>
          <p className={styles.prizeSubtitle}>1 free copy of Love, Career &amp; Magic. Retails for {formatUsd(PRICES.game)}.</p>
        </div>

        {/* Steps */}
        <div className={styles.stepsWrapper}>

          {/* Step 1 */}
          <div className={`${styles.stepCard} ${done ? styles.stepCardDone : ""}`}>
            <div className={styles.stepHeader}>
              <span className={`${styles.stepBadge} ${done ? styles.stepBadgeDone : ""}`}>
                {done ? <CheckCircleIcon /> : "1"}
              </span>
              <h2 className={styles.stepTitle}>Sign up for updates</h2>
            </div>

            {!done ? (
              <>
                <p className={styles.stepDesc}>
                  Enter your email. You'll get a confirmation email with your raffle ticket number: reply to it with
                  your shipping address.
                </p>
                <form onSubmit={handleSubmit} className={styles.emailFormRow}>
                  <label htmlFor={emailId} className="visually-hidden">
                    Email address
                  </label>
                  <input
                    id={emailId}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className={styles.emailInput}
                    disabled={status === "loading"}
                    autoComplete="email"
                    aria-invalid={status === "error"}
                  />
                  <DefaultButton
                    button="submit"
                    text={status === "loading" ? "Submitting…" : "Submit"}
                    variant="primary"
                    color="dark"
                    icon="forward"
                    loading={status === "loading"}
                  />
                </form>
                {status === "error" && (
                  <p className={styles.errorMsg} role="alert">{errorMsg}</p>
                )}
              </>
            ) : (
              <div className={styles.successMsg} role="status">
                <span className={styles.successIcon}><MailIcon /></span>
                <div>
                  <strong>Done!</strong>
                  <p>Check your inbox and reply with your raffle ticket number and shipping address.</p>
                </div>
              </div>
            )}
          </div>

          {/* Step 2 */}
          <div className={`${styles.stepCard} ${kickstarterClicked ? styles.stepCardDone : ""}`}>
            <div className={styles.stepHeader}>
              <span className={`${styles.stepBadge} ${kickstarterClicked ? styles.stepBadgeDone : ""}`}>
                {kickstarterClicked ? <CheckCircleIcon /> : "2"}
              </span>
              <h2 className={styles.stepTitle}>Follow the expansion on Kickstarter</h2>
            </div>
            {kickstarterClicked ? (
              <div className={styles.successMsg}>
                <span className={styles.successIcon}><CheckCircleIcon /></span>
                <div>
                  <strong>Kickstarter's open</strong>
                  <p>Press Follow there, then show that screen to a staff member.</p>
                </div>
              </div>
            ) : (
              <>
                <p className={styles.stepDesc}>We're making a Season 2. Follow along and be the first to know!</p>
                <DefaultButton
                  href={KICKSTARTER_URL}
                  onClick={() => setKickstarterClicked(true)}
                  text="Follow on Kickstarter"
                  icon="forward"
                  variant="primary"
                  color="kickstarter"
                  className={styles.kickstarterBtnInner}
                />
              </>
            )}
          </div>

          {/* Step 3 */}
          <div className={styles.stepCard}>
            <div className={styles.stepHeader}>
              <span className={styles.stepBadge}>3</span>
              <h2 className={styles.stepTitle}>Show a staff member your screen</h2>
            </div>
            <p className={styles.stepDesc}>
              Show your follow screen to any staff member at the booth to get your ticket!
            </p>
          </div>

        </div>

        <p className={styles.finalNotice}>
          One winner will be announced at the end of the convention and will be notified by email.
        </p>
      </div>

      {boxCarouselOpen && (
        <Suspense fallback={null}>
          <ImageCarouselModal images={BOX_IMAGES} ariaLabel="Game contents preview" onClose={() => setBoxCarouselOpen(false)} />
        </Suspense>
      )}
    </div>
  );
};

export default RafflePage;
