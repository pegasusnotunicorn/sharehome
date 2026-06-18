import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import PageIntro from "./utils/PageIntro";
import Modal from "./utils/Modal";
import MagnifierButton from "./utils/MagnifierButton";
import DefaultButton from "./utils/DefaultButton";
import styles from "../css/pages/rafflePage.module.css";
import buyStyles from "../css/pages/buyPage.module.css";

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
      <PageIntro title="Free game" lead="You must complete all 3 steps to be entered in the raffle 🎟️" />

      <div className="subcontentWrapper min-width">

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
          <p className={styles.prizeSubtitle}>Love, Career &amp; Magic &nbsp;·&nbsp; 1 free copy &nbsp;·&nbsp; retail $34.99</p>
        </div>

        {/* Steps */}
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
                  Respond to the confirmation email with your raffle ticket number and shipping address.
                </p>
                <form onSubmit={handleSubmit} className={styles.emailFormRow} noValidate>
                  <input
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
                    text={status === "loading" ? "Submitting…" : "Submit"}
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
              <h3 className={styles.stepTitle}>Follow the expansion on Kickstarter</h3>
            </div>
            {kickstarterClicked ? (
              <div className={styles.successMsg}>
                <span className={styles.successIcon}><MailIcon /></span>
                <div>
                  <strong>Following!</strong>
                  <p>Now show your Kickstarter screen to a staff member.</p>
                </div>
              </div>
            ) : (
              <>
                <p className={styles.stepDesc}>We're making a Season 2. Follow along and be the first to know!</p>
                <a
                  href={KICKSTARTER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.kickstarterBtn}
                  onClick={() => setKickstarterClicked(true)}
                >
                  <DefaultButton
                    text="Follow on Kickstarter →"
                    variant="primary"
                    color="kickstarter"
                    className={styles.kickstarterBtnInner}
                  />
                </a>
              </>
            )}
          </div>

          {/* Step 3 */}
          <div className={styles.stepCard}>
            <div className={styles.stepHeader}>
              <span className={styles.stepBadge}>3</span>
              <h3 className={styles.stepTitle}>Show a staff member your screen</h3>
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
        <Modal
          onClose={() => setBoxCarouselOpen(false)}
          ariaLabel="Game contents preview"
          panelClassName={buyStyles.carouselPanel}
        >
          <Swiper
            modules={[Navigation, Pagination, A11y, Keyboard]}
            navigation
            pagination={{ clickable: true }}
            keyboard={{ enabled: true }}
            spaceBetween={0}
            slidesPerView={1}
            className={buyStyles.carouselSwiper}
          >
            {BOX_IMAGES.map((img, i) => (
              <SwiperSlide key={i}>
                <div className={buyStyles.carouselSlide}>
                  <img src={img.src} alt={img.alt} className={buyStyles.carouselImage} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </Modal>
      )}
    </div>
  );
};

export default RafflePage;
