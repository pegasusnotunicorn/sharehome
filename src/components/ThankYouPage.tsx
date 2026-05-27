import { useMemo } from "react";
import { NavLink } from "react-router";
import CustomHelmet from "./utils/CustomHelmet";
import PageIntro from "./utils/PageIntro";
import PolaroidGallery from "./utils/PolaroidGallery";
import { CONTACT_POLAROIDS } from "./utils/contactPolaroids";
import styles from "../css/pages/thankYouPage.module.css";

const RANDOM_POLAROID_COUNT = 4;

const pickRandomPolaroids = (count: number) => {
  const indices = CONTACT_POLAROIDS.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices
    .slice(0, count)
    .sort((a, b) => a - b)
    .map((i) => ({ ...CONTACT_POLAROIDS[i], hideOnMobile: false }));
};

const ThankYouPage = () => {
  const title = "Thank you for your order!";

  const polaroids = useMemo(() => pickRandomPolaroids(RANDOM_POLAROID_COUNT), []);

  return (
    <div className={`content ${styles.thankYouPage}`}>
      <CustomHelmet
        title={title}
        splashImage="https://lovecareermagic.com/images/loucheck.webp"
        description="We have received your order and will ship your game to you within 3-5 business days."
      />

      <PageIntro title="Thank you for your order!" lead="Your game is on its way 📦">
        <NavLink to="/" className={styles.homeLink}>
          Click here to go back home
        </NavLink>
      </PageIntro>

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

      <PolaroidGallery items={polaroids} />
    </div>
  );
};

export default ThankYouPage;
