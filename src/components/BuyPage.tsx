import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import CustomHelmet from "./utils/CustomHelmet";
import PageIntro from "./utils/PageIntro";
import Stepper from "./utils/Stepper";
import Modal from "./utils/Modal";
import MagnifierButton from "./utils/MagnifierButton";
import styles from "../css/pages/buyPage.module.css";

const LCM_PRICE = 34.99;
const PIN_PRICE = 10.0;
const LCM_MAX_QTY = 12;
const PIN_MAX_QTY = 99;

const BOX_IMAGES = [
  { src: "/images/box_transparent.webp", alt: "Love, Career & Magic box" },
  { src: "/images/cards-fan.webp", alt: "Character cards fan" },
  { src: "/images/cards-floating.webp", alt: "Character cards" },
  { src: "/images/cards-mockup.webp", alt: "Character cards mockup" },
  { src: "/images/rulebook-mockup.webp", alt: "Rulebook mockup" },
];

const formatPrice = (unit: number, qty: number) =>
  qty > 1 ? `$${unit.toFixed(2)} × ${qty}` : `$${unit.toFixed(2)}`;

const BuyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = location.state as { lcmQty?: number; urgPinQty?: number; bizzPinQty?: number } | null;
  const [lcmQty, setLcmQty] = useState(prefill?.lcmQty ?? 1);
  const [urgPinQty, setUrgPinQty] = useState(prefill?.urgPinQty ?? 0);
  const [bizzPinQty, setBizzPinQty] = useState(prefill?.bizzPinQty ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [internationalModalOpen, setInternationalModalOpen] = useState(false);
  const [boxCarouselOpen, setBoxCarouselOpen] = useState(false);
  const [previewPin, setPreviewPin] = useState<{ src: string; alt: string } | null>(null);

  const total = LCM_PRICE * lcmQty + PIN_PRICE * urgPinQty + PIN_PRICE * bizzPinQty;

  const handleCheckout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items: Record<string, number> = {
        lcm: lcmQty,
        ...(urgPinQty > 0 && { urg_pin: urgPinQty }),
        ...(bizzPinQty > 0 && { bizz_pin: bizzPinQty }),
      };
      const prefillEmail = new URLSearchParams(window.location.search).get("prefilled_email");
      const res = await fetch("/.netlify/functions/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, ...(prefillEmail && { email: prefillEmail }) }),
      });
      if (!res.ok) throw new Error("Something went wrong. Please try again.");
      const { clientSecret } = await res.json();
      navigate("/checkout", {
        state: {
          clientSecret,
          cart: { lcmQty, urgPinQty, bizzPinQty, total },
        },
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [lcmQty, urgPinQty, bizzPinQty, navigate]);

  return (
    <div className={`content ${styles.buyPage}`}>
      <CustomHelmet
        title="Shopping cart — Love, Career & Magic"
        description="Get Love, Career & Magic — the party game where fantasy meets reality TV. Free US shipping."
      />

      <PageIntro
        title="Shopping cart"
        lead="Free shipping within the US. Ships within 3-5 business days."
      />

      <div className={styles.shopSection}>
        <div className={`${styles.productCard} ${styles.productCardFeatured}`}>
          <MagnifierButton
            onClick={() => setBoxCarouselOpen(true)}
            ariaLabel="Preview game box"
          >
            <img
              src="/images/box_transparent.webp"
              alt="Love, Career & Magic box"
              className={`${styles.productImage} ${styles.productImageLarge}`}
            />
          </MagnifierButton>
          <div className={styles.productInfo}>
            <p className={`${styles.productName} ${styles.productNameLarge}`}>
              Love, Career & Magic
            </p>
            <p className={styles.productDescription}>
              A party game where fantasy meets reality TV.
            </p>
          </div>
          <div className={styles.productActions}>
            <span className={styles.productPrice}>{formatPrice(LCM_PRICE, lcmQty)}</span>
            <Stepper value={lcmQty} onChange={setLcmQty} min={1} max={LCM_MAX_QTY} />
          </div>
        </div>

        <p
          className={styles.maxQtyNote}
          style={{ visibility: lcmQty === LCM_MAX_QTY ? "visible" : "hidden" }}
        >
          Need more than 12?{" "}
          <a href="mailto:1min@unicornwithwings.com">Send me an email</a> and we'll sort it out.
        </p>

        <p className={styles.addOnLabel}>Add to your order</p>

        <div className={`${styles.productCard} ${styles.productCardAddOn}`}>
          <MagnifierButton
            onClick={() => setPreviewPin({ src: "/images/members/urg-pin.webp", alt: "Urg pin" })}
            ariaLabel="Preview Urg pin"
            size="sm"
          >
            <img
              src="/images/members/urg-pin.webp"
              alt="Urg pin"
              className={`${styles.productImage} ${styles.productImageSmall}`}
            />
          </MagnifierButton>
          <div className={styles.productInfo}>
            <p className={styles.productName}>Urg pin</p>
            <p className={styles.productDescription}>An enamel pin of Urg, the Hacker.</p>
          </div>
          <div className={styles.productActions}>
            <span className={styles.productPrice}>{formatPrice(PIN_PRICE, urgPinQty || 1)}</span>
            {urgPinQty === 0 ? (
              <button className={styles.addButton} onClick={() => setUrgPinQty(1)}>+ Add</button>
            ) : (
              <Stepper value={urgPinQty} onChange={setUrgPinQty} min={0} max={PIN_MAX_QTY} />
            )}
          </div>
        </div>

        <div className={`${styles.productCard} ${styles.productCardAddOn}`}>
          <MagnifierButton
            onClick={() => setPreviewPin({ src: "/images/members/bizz-pin.webp", alt: "Bizz pin" })}
            ariaLabel="Preview Bizz pin"
            size="sm"
          >
            <img
              src="/images/members/bizz-pin.webp"
              alt="Bizz pin"
              className={`${styles.productImage} ${styles.productImageSmall}`}
            />
          </MagnifierButton>
          <div className={styles.productInfo}>
            <p className={styles.productName}>Bizz pin</p>
            <p className={styles.productDescription}>An enamel pin of Bizz Hagglefeet.</p>
          </div>
          <div className={styles.productActions}>
            <span className={styles.productPrice}>{formatPrice(PIN_PRICE, bizzPinQty || 1)}</span>
            {bizzPinQty === 0 ? (
              <button className={styles.addButton} onClick={() => setBizzPinQty(1)}>+ Add</button>
            ) : (
              <Stepper value={bizzPinQty} onChange={setBizzPinQty} min={0} max={PIN_MAX_QTY} />
            )}
          </div>
        </div>
      </div>

      <div className={styles.summarySection}>
        <hr className={styles.divider} />
        <div className={styles.totalRow}>
          <span>Total</span>
          <span className={styles.totalAmount}>${total.toFixed(2)}</span>
        </div>
        <p
          style={{
            color: "#DD7373",
            fontFamily: "Roboto Light",
            fontSize: "0.875rem",
            margin: 0,
            visibility: error ? "visible" : "hidden",
          }}
        >
          {error || " "}
        </p>
        <button
          className={styles.checkoutButton}
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading ? "Starting checkout..." : "Proceed to checkout →"}
        </button>
        <button
          className={styles.internationalLink}
          onClick={() => setInternationalModalOpen(true)}
        >
          Shipping internationally?
        </button>
      </div>

      {boxCarouselOpen && (
        <Modal
          onClose={() => setBoxCarouselOpen(false)}
          ariaLabel="Game contents preview"
          panelClassName={styles.carouselPanel}
        >
          <Swiper
            modules={[Navigation, Pagination, A11y, Keyboard]}
            navigation
            pagination={{ clickable: true }}
            keyboard={{ enabled: true }}
            spaceBetween={0}
            slidesPerView={1}
            className={styles.carouselSwiper}
          >
            {BOX_IMAGES.map((img, i) => (
              <SwiperSlide key={i}>
                <div className={styles.carouselSlide}>
                  <img src={img.src} alt={img.alt} className={styles.carouselImage} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </Modal>
      )}

      {previewPin && (
        <Modal onClose={() => setPreviewPin(null)} ariaLabel={previewPin.alt}>
          <img src={previewPin.src} alt={previewPin.alt} className={styles.pinPreviewImage} />
        </Modal>
      )}

      {internationalModalOpen && (
        <Modal onClose={() => setInternationalModalOpen(false)}>
          <h2 className={styles.modalTitle}>International shipping</h2>
          <p className={styles.modalBody}>
            I recently started working with a distributor who can ship
            internationally to retailers. If you have a local hobby store you
            frequent, you could ask them to{" "}
            <a
              href="https://qmdirect.com/products/pegasuslcm001"
              target="_blank"
              rel="noreferrer"
              className={styles.modalLink}
            >
              order via this link
            </a>
            .
          </p>
          <p className={styles.modalBody}>
            <a
              href="https://pegasusgames.medium.com/an-update-on-international-shipments-to-outside-the-usa-4e53a216ceb8"
              target="_blank"
              rel="noreferrer"
              className={styles.modalLink}
            >
              Read more about international shipping here.
            </a>
          </p>
          <button
            className={styles.modalClose}
            onClick={() => setInternationalModalOpen(false)}
          >
            Got it
          </button>
        </Modal>
      )}
    </div>
  );
};

export default BuyPage;
