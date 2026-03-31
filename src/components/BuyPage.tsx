import { useEffect } from "react";
import styles from "../css/pages/buyPage.module.css";
import DefaultButton from "./utils/DefaultButton";
import EmailForm from "./utils/EmailForm";
import PolaroidGallery, { type PolaroidGalleryItem } from "./utils/PolaroidGallery";

const BACKORDER_URL = "https://buy.stripe.com/28E14oahReFa6Zx74m0Jq04";
const RESTOCK_EMAIL_INPUT_ID = "buy-page-restock-email";
const POLAROID_ITEMS: PolaroidGalleryItem[] = [
  {
    src: "/images/polaroids/back-order/polaroid-1.webp",
    alt: "Orders going viral",
    caption: "Going viral and receiving 400+ orders",
  },
  {
    src: "/images/polaroids/back-order/polaroid-2.webp",
    alt: "Hand packing orders",
    caption: "Hand packing and shipping all orders",
  },
  {
    src: "/images/polaroids/back-order/polaroid-3.webp",
    alt: "Car full of orders",
    caption: "A car full of orders on the way to the post office",
  },
  {
    src: "/images/polaroids/back-order/polaroid-4.webp",
    alt: "Happy holidays",
    caption: "Happy holidays 🎄✨",
  },
];

const BuyPage = () => {
  useEffect(() => {
    document.title = "Love, Career & Magic is sold out!";
  }, []);

  return (
    <div className={`content max-width ${styles.buyPage}`}>
      <div className="subcontentWrapper margin-top">
        <div className={`characterContent ${styles.pageIntro}`}>
          <h2 className={`subtitle ${styles.pageIntroTitle}`}>Sold out</h2>
          <p className={styles.pageIntroLead}>
            Love, Career & Magic has been out of stock since
            <br />
            <span className={styles.pageIntroDate}>
              <strong>December 19, 2025</strong> 💔
            </span>
          </p>
        </div>
      </div>

      <div className={styles.ctaGrid}>
        <a
          className={`${styles.ctaPanel} ${styles.ctaPanelPrimary} ${styles.ctaPanelClickable}`}
          href={BACKORDER_URL}
          target="_blank"
          rel="noreferrer"
        >
          <div className={styles.panelTopRow}>
            <p className={styles.panelEyebrow}>Option 1</p>
            <p className={styles.panelPill}>Mystery gift included 🎁</p>
          </div>
          <h3 className={styles.panelTitle}>Place a back order 📦</h3>
          <p className={styles.panelBody}>
            Reserve a copy now and I&apos;ll include a{" "}
            <strong>free mystery gift 🎁</strong> as a thank-you.
          </p>
          <ul className={styles.panelTimeline}>
            <li>Estimated delivery date: early/mid May.</li>
          </ul>
          <div className={styles.panelAction}>
            <DefaultButton
              text="Place a back order"
              icon="forward"
              variant="primary"
              color="red"
              compact
              className={`${styles.buyPageButton} ${styles.backOrderButton}`}
            />
          </div>
        </a>

        <section
          className={`${styles.ctaPanel} ${styles.ctaPanelClickable}`}
          onClick={() => {
            document.getElementById(RESTOCK_EMAIL_INPUT_ID)?.focus();
          }}
        >
          <p className={styles.panelEyebrow}>Option 2</p>
          <h3 className={styles.panelTitle}>Get restock updates ✉️</h3>
          <p className={styles.panelBody}>
            Join the newsletter and I&apos;ll email you when the game is
            officially back in stock.
          </p>
          <EmailForm
            hideTitle
            isActiveAndDesktop={false}
            className={styles.buyPageEmailForm}
            inputId={RESTOCK_EMAIL_INPUT_ID}
            responseOverride=""
            responseClassName={styles.buyPageEmailResponse}
            inputClassName={styles.buyPageEmailInput}
            submitButtonClassName={styles.buyPageButton}
            submitButtonColor="dark"
          />
        </section>
      </div>

      <PolaroidGallery items={POLAROID_ITEMS} />
    </div>
  );
};

export default BuyPage;
