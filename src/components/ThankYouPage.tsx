import { useEffect } from "react";
import { useLocation, NavLink } from "react-router";
import CustomHelmet from "./utils/CustomHelmet";
import styles from "../css/pages/thankYouPage.module.css";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const ThankYouPage = () => {
  const title = "Thank you for your order!";

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const checkoutSessionId = params.get("checkout_session_id");

  useEffect(() => {
    document.title = title;

    if (checkoutSessionId && import.meta.env.PROD) {
      window.gtag?.("event", "conversion", {
        send_to: "AW-16828802079/rZXLCJXiqJcaEJ_IzNg-",
        transaction_id: checkoutSessionId,
      });
    }
  }, [title, checkoutSessionId]);

  return (
    <div className={`content ${styles.thankYouPage}`}>
      <CustomHelmet
        title={title}
        splashImage="https://lovecareermagic.com/images/loucheck.webp"
        description="We have received your order and will ship your game to you within 3-5 business days."
      />

      <div className="subcontentWrapper margin-top min-width">
        <div className={`characterContent ${styles.pageIntro}`}>
          <h2 className={`subtitle ${styles.pageIntroTitle}`}>
            Thank you for your order!
          </h2>
          <p className={styles.pageIntroLead}>
            Your game is on its way 📦
          </p>
          <NavLink to="/" className={styles.homeLink}>
            Click here to go back home
          </NavLink>
        </div>
      </div>

      <div className={styles.shipmentCard}>
        <div className={styles.shipmentVerticalWrapper}>
          <img
            src="/images/loucheck.webp"
            alt="Lou the cat is checking your order"
            className={styles.louImage}
            loading="lazy"
          />
        </div>
        <div className={styles.shipmentVerticalWrapper}>
          <h2>
            Lou the cat is on the case 🐈
            <br />
            Head of Fulfillment.
          </h2>
          <p>
            I have received your order and will ship your game to you within
            3-5 business days, after an extensive QA process by our Head of
            Fulfillment,{" "}
            <a
              aria-label="Lou the cat on Instagram"
              target="_blank"
              rel="noreferrer"
              href="https://www.instagram.com/nekonolou"
            >
              Lou the cat
            </a>
            .
          </p>
          <p className={styles.notice}>
            <strong>Please note</strong>
            I am just one person hand-packing and shipping out each game
            manually. I truly appreciate your patience and understanding.
            Thank you for supporting indie game devs! 😊
          </p>
          <p>
            Orders typically arrive within 1-2 weeks. If it's been longer,{" "}
            <a
              aria-label="Contact us"
              target="_blank"
              rel="noreferrer"
              href="/contact"
            >
              let me know
            </a>{" "}
            and I'll sort it out. Email is the fastest way to reach me.
          </p>
        </div>
      </div>

    </div>
  );
};

export default ThankYouPage;
