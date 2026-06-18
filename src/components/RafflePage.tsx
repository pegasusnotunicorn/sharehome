import { useEffect, useRef, useState } from "react";
import PageIntro from "./utils/PageIntro";
import DefaultButton from "./utils/DefaultButton";
import styles from "../css/pages/rafflePage.module.css";

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
  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    document.title = "Enter the raffle!";
  }, []);

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
    <div className={`content max-width ${styles.rafflePage}`}>
      <PageIntro
        title="Enter the raffle! 🎟️"
        lead="Complete two quick steps below to win a free copy of Love, Career & Magic."
      />

      <div className="subcontentWrapper min-width">
        <div className={styles.prizeBanner}>
          <span className={styles.prizeTrophy}>🏆</span>
          <div>
            <p className={styles.prizeLabel}>Prize</p>
            <p className={styles.prizeText}>1 free copy of Love, Career & Magic</p>
          </div>
        </div>

        <div className={styles.stepsWrapper}>

          {/* Step 1 */}
          <div className={`${styles.stepCard} ${done ? styles.stepCardDone : ""}`}>
            <div className={styles.stepHeader}>
              <span className={`${styles.stepBadge} ${done ? styles.stepBadgeDone : ""}`}>
                {done ? <CheckCircleIcon /> : "1"}
              </span>
              <h3 className={styles.stepTitle}>Sign up for updates</h3>
            </div>

            {!done ? (
              <>
                <p className={styles.stepDesc}>
                  Join our mailing list to enter and receive your raffle ticket number by email.
                </p>
                <form onSubmit={handleSubmit} className={styles.emailFormRow} noValidate>
                  <input
                    ref={emailRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className={styles.emailInput}
                    disabled={status === "loading"}
                    autoComplete="email"
                  />
                  <DefaultButton
                    button="submit"
                    text={status === "loading" ? "Entering…" : "Enter!"}
                    variant="primary"
                    color="dark"
                    compact
                    icon="forward"
                  />
                </form>
                {status === "error" && (
                  <p className={styles.errorMsg}>{errorMsg}</p>
                )}
              </>
            ) : (
              <div className={styles.successMsg}>
                <span className={styles.successIcon}><MailIcon /></span>
                <div>
                  <strong>You're entered!</strong>
                  <p>Check your email for your raffle ticket number 🎟️</p>
                </div>
              </div>
            )}
          </div>

          {/* Step 2 */}
          <div className={`${styles.stepCard} ${done ? styles.stepCardHighlighted : ""}`}>
            <div className={styles.stepHeader}>
              <span className={styles.stepBadge}>2</span>
              <h3 className={styles.stepTitle}>Follow us on Kickstarter</h3>
            </div>
            <p className={styles.stepDesc}>
              Follow our Season 2 campaign — it's free! Then show a staff member your screen to confirm.
            </p>
            <a
              href={KICKSTARTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.kickstarterBtn}
            >
              <DefaultButton
                text="Follow on Kickstarter →"
                variant="primary"
                color="purple"
                size="large"
                className={styles.kickstarterBtnInner}
              />
            </a>
            <p className={styles.staffNote}>
              Show your follow confirmation screen to any staff member at the booth!
            </p>
          </div>

        </div>

        <p className={styles.footerNote}>
          One winner announced at the end of the convention and notified by email. No purchase necessary.
        </p>
      </div>
    </div>
  );
};

export default RafflePage;
