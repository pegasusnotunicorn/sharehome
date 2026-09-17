import { useState, useEffect, useRef } from "react";
import useWindowDimensions from "./utils/useWindowDimensions";
import { loadStripe } from "@stripe/stripe-js";
import {
  CheckoutElementsProvider,
  useCheckoutElements,
  ContactDetailsElement,
  ShippingAddressElement,
  PaymentElement,
} from "@stripe/react-stripe-js/checkout";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import CustomHelmet from "./utils/CustomHelmet";
import PageIntro from "./utils/PageIntro";
import Modal from "./utils/Modal";
import Stepper from "./utils/Stepper";
import MagnifierButton from "./utils/MagnifierButton";
import styles from "../css/pages/buyPage.module.css";

const LCM_PRICE = 34.99;
const PIN_PRICE = 10.0;
const LCM_MAX_QTY = 12;
const PIN_MAX_QTY = 99;

interface CartState {
  lcmQty: number;
  urgPinQty: number;
  bizzPinQty: number;
}

type ItemSlug = "lcm" | "urg_pin" | "bizz_pin";

// Shipping rate IDs attached to the current session, handed back by
// create-checkout-session. `europe` is null where Europe isn't enabled.
interface ShippingRates {
  us: string;
  europe: string | null;
}

const CART_ITEMS_META: Record<ItemSlug, { name: string; desc: string; img: string; price: number; min: number; max: number }> = {
  lcm: { name: "Love, Career & Magic", desc: "", img: "/images/box_transparent.webp", price: LCM_PRICE, min: 1, max: LCM_MAX_QTY },
  urg_pin: { name: "Urg pin", desc: "An enamel pin of Urg, the Hacker.", img: "/images/members/urg-pin.webp", price: PIN_PRICE, min: 0, max: PIN_MAX_QTY },
  bizz_pin: { name: "Bizz pin", desc: "An enamel pin of Bizz Hagglefeet.", img: "/images/members/bizz-pin.webp", price: PIN_PRICE, min: 0, max: PIN_MAX_QTY },
};

const BOX_IMAGES = [
  { src: "/images/box_transparent.webp", alt: "Love, Career & Magic box" },
  { src: "/images/cards-fan.webp", alt: "Character cards fan" },
  { src: "/images/cards-floating.webp", alt: "Character cards" },
  { src: "/images/cards-mockup.webp", alt: "Character cards mockup" },
  { src: "/images/rulebook-mockup.webp", alt: "Rulebook mockup" },
];

const UPSELL_PINS = [
  { slug: "urg_pin" as const, name: "Urg pin", desc: "Enamel pin of Urg, the Hacker.", img: "/images/members/urg-pin.webp" },
  { slug: "bizz_pin" as const, name: "Bizz pin", desc: "Enamel pin of Bizz Hagglefeet.", img: "/images/members/bizz-pin.webp" },
];

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
    <path d="M12 8l.01 0" />
    <path d="M11 12l1 0l0 4l1 0" />
  </svg>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const w = window as any;
// GA4 events reach the property through GTM, so they have to be pushed in the
// shape GTM triggers on: an object with an `event` key. The previous
// gtag()-style call pushed an arguments object (keys "0", "1", "2") that no
// Custom Event trigger could match, and gtag.js — which would have drained
// those — is never loaded, so every one of these events was silently dropped.
function trackEvent(name: string, params?: Record<string, string | number>) {
  w.dataLayer?.push({ event: name, ...params });
  w.clarity?.("event", name);
}

function getStoredUtms(): Record<string, string> {
  const out: Record<string, string> = {};

  // Read URL params first — handles the iOS tab-reload race condition where
  // sessionStorage is empty but useUTMPreservation already wrote UTMs to the
  // URL via replaceState in the previous session (child effects like ours run
  // before the parent AppRoutes useUTMPreservation effect on first render).
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("utm_source")) out.utmSource = urlParams.get("utm_source")!;
  if (urlParams.get("utm_medium")) out.utmMedium = urlParams.get("utm_medium")!;
  if (urlParams.get("utm_campaign")) out.utmCampaign = urlParams.get("utm_campaign")!;
  if (urlParams.get("utm_content")) out.utmContent = urlParams.get("utm_content")!;

  // sessionStorage overrides URL — more authoritative when present.
  try {
    const raw = sessionStorage.getItem("utm_params");
    if (raw) {
      const data = JSON.parse(raw) as Record<string, string>;
      if (data.utm_source) out.utmSource = data.utm_source;
      if (data.utm_medium) out.utmMedium = data.utm_medium;
      if (data.utm_campaign) out.utmCampaign = data.utm_campaign;
      if (data.utm_content) out.utmContent = data.utm_content;
    }
  } catch {}

  return out;
}

const stripePromise = loadStripe(
  import.meta.env.DEV
    ? import.meta.env.VITE_STRIPE_PUBLIC_KEY_TEST
    : import.meta.env.VITE_STRIPE_PUBLIC_KEY_LIVE
);

const appearanceBase = {
  inputs: "condensed" as const,
  labels: "auto" as const,
  variables: {
    colorPrimary: "#5f5aa2",
    colorText: "#323232",
    borderRadius: "8px",
  },
};

const appearanceMobile = {
  ...appearanceBase,
  variables: {
    ...appearanceBase.variables,
    spacingUnit: "4px",
    fontSizeBase: "14px",
  },
};


const TOTAL_ELEMENTS = 3;

// Shown when a Stripe call throws instead of returning an error result —
// those messages are written for developers, not buyers.
const GENERIC_CHECKOUT_ERROR = "Something went wrong. Please try again.";

const CheckoutFormSkeleton = () => (
  <div className={styles.skeletonForm}>
    <div className={styles.skeletonFormSection}>
      <p className={styles.formSectionLabel}>Contact</p>
      <div className={`${styles.skeletonBlock} ${styles.skeletonField}`} />
    </div>
    <div className={styles.skeletonFormSection}>
      <p className={styles.formSectionLabel}>Shipping</p>
      <div className={`${styles.skeletonBlock} ${styles.skeletonField}`} />
    </div>
    <div className={styles.skeletonFormSection}>
      <p className={styles.formSectionLabel}>Payment</p>
      <div className={`${styles.skeletonBlock} ${styles.skeletonCard}`} />
    </div>
    <div className={`${styles.skeletonBlock} ${styles.skeletonButton}`} />
  </div>
);

// ── Checkout form ─────────────────────────────────────────────────────────────

const CheckoutForm = ({ sessionId, shippingRates, onEmailCaptured, onOpenInternational }: { sessionId: string | null; shippingRates: ShippingRates | null; onEmailCaptured: (email: string) => void; onOpenInternational: () => void }) => {
  const checkoutState = useCheckoutElements();
  const [readyCount, setReadyCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [shippingSyncing, setShippingSyncing] = useState(false);
  const requestedRateRef = useRef<string | null>(null);
  const pendingRateUpdates = useRef(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lastError = useRef("");
  if (errorMessage) lastError.current = errorMessage;
  const [termsAgreed, setTermsAgreed] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCapturedEmailRef = useRef("");

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const onReady = () => setReadyCount((n) => n + 1);
  const allReady = readyCount >= TOTAL_ELEMENTS;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleContactChange = (e: any) => {
    const email = e.value?.email ?? "";
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!email || email === lastCapturedEmailRef.current) return;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
      lastCapturedEmailRef.current = email;
      // Hand the address up before the session check — changing the cart
      // mints a replacement session, and the parent needs the email to carry
      // it over so the customer doesn't have to retype it.
      onEmailCaptured(email);
      if (!sessionId) return;
      fetch("/.netlify/functions/save-checkout-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, email }),
      }).catch(() => {});
    }, 800);
  };

  useEffect(() => {
    if (allReady) trackEvent("checkout_form_ready");
  }, [allReady]);

  // Second trigger for the rate switch: the country on the session itself.
  // The address element can arrive with a country already filled in (e.g.
  // from the buyer's location) without firing onChange, which would leave a
  // European address on the free US rate.
  const sessionCountry =
    checkoutState.type === "success" ? checkoutState.checkout.shippingAddress?.address.country : undefined;
  const syncShippingRateRef = useRef<(country: string | undefined) => void>(() => {});
  useEffect(() => {
    syncShippingRateRef.current(sessionCountry);
  }, [sessionCountry]);

  if (checkoutState.type === "error") {
    return <p className={styles.checkoutError}>{checkoutState.error.message}</p>;
  }

  const checkout = checkoutState.type !== "loading" ? checkoutState.checkout : null;

  // Both rates ride on the session; the country dropdown picks between them.
  // US gets the free rate, any other country the address element allows
  // (the server limits it to Europe) gets the Europe rate.
  const syncShippingRate = async (country: string | undefined) => {
    if (!checkout || !shippingRates?.europe || !country) return;
    const target = country === "US" ? shippingRates.us : shippingRates.europe;
    // Compare against the last rate we asked for, not the session snapshot —
    // a quick US → DE → US flip would otherwise see the stale US rate and
    // skip the switch back.
    const current = requestedRateRef.current ?? checkout.shipping?.shippingOption.id;
    if (current === target) return;
    requestedRateRef.current = target;
    pendingRateUpdates.current += 1;
    setShippingSyncing(true);
    try {
      const result = await checkout.updateShippingOption(target);
      if (result.type === "error") {
        requestedRateRef.current = null;
        setErrorMessage(result.error.message);
      } else {
        setErrorMessage(null);
        if (target === shippingRates.europe) {
          trackEvent("checkout_europe_shipping_selected", { country });
        }
      }
    } catch (err) {
      // Forget the request so picking the country again retries it.
      requestedRateRef.current = null;
      trackEvent("checkout_error", { error_message: `shipping_rate: ${err instanceof Error ? err.message : String(err)}` });
      setErrorMessage(GENERIC_CHECKOUT_ERROR);
    } finally {
      // Always release the Pay button, or a failed update would lock it.
      pendingRateUpdates.current -= 1;
      if (pendingRateUpdates.current === 0) setShippingSyncing(false);
    }
  };
  syncShippingRateRef.current = syncShippingRate;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleShippingChange = (e: any) => syncShippingRate(e.value?.address?.country);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkout) return;
    setLoading(true);
    setErrorMessage(null);
    trackEvent("checkout_submitted");
    try {
      const result = await checkout.confirm();
      if (result.type === "error") {
        trackEvent("checkout_error", { error_message: result.error.message });
        setErrorMessage(result.error.message);
        setLoading(false);
      }
      // On success Stripe redirects to /thankyou, so the button stays in
      // its processing state until the page unloads.
    } catch (err) {
      // confirm() can throw (integration errors, network failures) rather
      // than return an error result — without this the button stays on
      // "Processing..." with nothing on screen.
      trackEvent("checkout_error", { error_message: err instanceof Error ? err.message : String(err) });
      setErrorMessage(GENERIC_CHECKOUT_ERROR);
      setLoading(false);
    }
  };

  return (
    <div className={styles.checkoutFormWrapper}>
      {!allReady && <CheckoutFormSkeleton />}
      <form
        onSubmit={handleSubmit}
        className={`${styles.checkoutForm} ${!allReady ? styles.checkoutFormHiding : ""}`.trim()}
        style={{ visibility: allReady ? "visible" : "hidden" }}
      >
        <div className={styles.formSection}>
          <p className={styles.formSectionLabel}>Contact</p>
          <ContactDetailsElement onReady={onReady} onChange={handleContactChange} />
        </div>
        <div className={styles.formSection}>
          <p className={styles.formSectionLabel}>
            Shipping
            {shippingRates?.europe && (
              <button
                className={styles.shippingLabelBtn}
                onClick={onOpenInternational}
                type="button"
              >
                Shipping to Europe?
              </button>
            )}
          </p>
          <ShippingAddressElement onReady={onReady} onChange={handleShippingChange} />
        </div>
        <div className={styles.formSection}>
          <p className={styles.formSectionLabel}>Payment</p>
          <PaymentElement onReady={onReady} />
        </div>
        <div className={`${styles.errorSlide} ${errorMessage ? styles.errorSlideVisible : ""}`}>
          <div className={styles.errorSlideInner}>
            <p className={styles.checkoutError}>{lastError.current}</p>
          </div>
        </div>
        <label className={styles.termsLabel}>
          <input
            type="checkbox"
            checked={termsAgreed}
            onChange={(e) => setTermsAgreed(e.target.checked)}
            className={styles.termsCheckbox}
          />
          <span>
            I agree to the{" "}
            <a href="/terms" target="_blank" rel="noreferrer" className={styles.termsLink}>
              <span className={styles.termsLong}>terms of service and privacy policy</span>
              <span className={styles.termsShort}>terms &amp; privacy policy</span>
            </a>
          </span>
        </label>
        <button
          type="submit"
          disabled={loading || shippingSyncing || !checkout?.canConfirm || !termsAgreed}
          className={styles.checkoutButton}
        >
          {loading ? "Processing..." : "Pay now"}
        </button>
      </form>
    </div>
  );
};

// ── Cart upsell ───────────────────────────────────────────────────────────────

const CartUpsell = ({
  cart,
  onUpdateItem,
  updatingSlug,
}: {
  cart: CartState;
  onUpdateItem: (slug: ItemSlug, qty: number) => Promise<void>;
  updatingSlug: ItemSlug | null;
}) => {
  const { isDesktop } = useWindowDimensions();
  const [previewPin, setPreviewPin] = useState<{ src: string; alt: string } | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const upsells = UPSELL_PINS.filter(
    (p) => (p.slug === "urg_pin" ? cart.urgPinQty : cart.bizzPinQty) === 0
  );

  useEffect(() => {
    if (upsells.length > 0 && currentIndex >= upsells.length) {
      setCurrentIndex(upsells.length - 1);
    }
  }, [upsells.length, currentIndex]);

  if (upsells.length === 0) return null;

  const safeIndex = Math.min(currentIndex, upsells.length - 1);

  const upsellItem = (pin: typeof UPSELL_PINS[number]) => (
    <div className={styles.cartUpsellItem}>
      <MagnifierButton size="sm" onClick={() => setPreviewPin({ src: pin.img, alt: pin.name })} ariaLabel={`Preview ${pin.name}`}>
        <img src={pin.img} alt={pin.name} className={styles.cartUpsellImage} />
      </MagnifierButton>
      <div className={styles.cartUpsellInfo}>
        <p className={styles.cartUpsellName}>{pin.name}</p>
        <p className={styles.cartUpsellDesc}>{pin.desc}</p>
      </div>
      <div className={styles.cartUpsellActions}>
        <span className={styles.cartUpsellPrice}>$10.00</span>
        <button
          className={styles.cartUpsellBtn}
          onClick={() => onUpdateItem(pin.slug, 1)}
          disabled={updatingSlug !== null}
        >
          {updatingSlug === pin.slug
            ? <span className={styles.spinner} aria-label="Loading" />
            : "+ Add"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className={styles.upsellCard}>
        {isDesktop ? (
          <>
            <p className={styles.cartUpsellLabel}>Add to your order</p>
            {upsells.map((pin) => (
              <div key={pin.slug}>{upsellItem(pin)}</div>
            ))}
          </>
        ) : (
          <>
            <div className={styles.upsellCarouselHeader}>
              <p className={styles.cartUpsellLabel}>Add to your order</p>
              <div className={styles.upsellNavButtons}>
<button
                  className={styles.upsellNavBtn}
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  disabled={safeIndex === 0}
                  aria-label="Previous add-on"
                >←</button>
                <button
                  className={styles.upsellNavBtn}
                  onClick={() => setCurrentIndex((i) => Math.min(upsells.length - 1, i + 1))}
                  disabled={safeIndex === upsells.length - 1}
                  aria-label="Next add-on"
                >→</button>
              </div>
            </div>
            <div className={styles.upsellCarouselViewport}>
              <div
                className={styles.upsellCarouselTrack}
                style={{ transform: `translateX(-${safeIndex * 100}%)` }}
              >
                {upsells.map((pin) => (
                  <div key={pin.slug} className={styles.upsellCarouselSlide}>
                    {upsellItem(pin)}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {previewPin && (
        <Modal onClose={() => setPreviewPin(null)} ariaLabel={previewPin.alt}>
          <img src={previewPin.src} alt={previewPin.alt} className={styles.pinPreviewImage} />
        </Modal>
      )}

    </>
  );
};

// ── Cart summary (must be inside CheckoutElementsProvider for promo code) ─────

const CartSummary = ({
  cart,
  onUpdateItem,
  updatingSlug,
  shippingRates,
}: {
  cart: CartState;
  onUpdateItem: (slug: ItemSlug, qty: number) => Promise<void>;
  updatingSlug: ItemSlug | null;
  shippingRates: ShippingRates | null;
}) => {
  const checkoutState = useCheckoutElements();
  const checkout = checkoutState.type === "success" ? checkoutState.checkout : null;
  const europeShipping =
    shippingRates?.europe && checkout?.shipping?.shippingOption.id === shippingRates.europe
      ? checkout.shipping.shippingOption
      : null;

  const [editItem, setEditItem] = useState<{ slug: ItemSlug; qty: number } | null>(null);
  const [boxCarouselOpen, setBoxCarouselOpen] = useState(false);
  const [previewPin, setPreviewPin] = useState<{ src: string; alt: string } | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const lastPromoError = useRef("");
  if (promoError) lastPromoError.current = promoError;
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  const handleApplyPromo = async () => {
    if (!checkout || !promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (checkout as any).applyPromotionCode(promoCode.trim());
      if (result?.type === "error") {
        setPromoError(result.error?.message ?? "Invalid promo code.");
      } else {
        setAppliedCode(promoCode.trim().toUpperCase());
        setPromoCode("");
        setPromoOpen(false);
      }
    } catch {
      setPromoError("Couldn't apply code. Try again.");
    }
    setPromoLoading(false);
  };

  const handleRemovePromo = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (checkout as any).removePromotionCode?.();
    } catch {
      // ignore
    }
    setAppliedCode(null);
  };

  const activeItems = (["lcm", "urg_pin", "bizz_pin"] as ItemSlug[])
    .map((slug) => {
      const qty = slug === "lcm" ? cart.lcmQty : slug === "urg_pin" ? cart.urgPinQty : cart.bizzPinQty;
      return { slug, qty, ...CART_ITEMS_META[slug] };
    })
    .filter((item) => item.qty > 0);

  const handleEditConfirm = async () => {
    if (!editItem) return;
    const { slug, qty } = editItem;
    setEditItem(null);
    await onUpdateItem(slug, qty);
  };

  const handleRemoveItem = async () => {
    if (!editItem) return;
    const { slug } = editItem;
    setEditItem(null);
    await onUpdateItem(slug, 0);
  };

  return (
    <div className={styles.cartSummary}>
      <div className={styles.cartSummaryHeader}>
        <p className={styles.cartSummaryEyebrow}>Your order</p>
        <button
          className={styles.cartDetailsToggle}
          onClick={() => setDetailsOpen((o) => !o)}
        >
          {detailsOpen ? "Hide ▴" : "See details ▾"}
        </button>
      </div>
      <div className={styles.cartItems}>
        {activeItems.map((item) => (
          <div key={item.slug} className={styles.cartItem}>
            {item.slug === "lcm" ? (
              <MagnifierButton size="sm" onClick={() => setBoxCarouselOpen(true)} ariaLabel="Preview game box">
                <img src={item.img} alt={item.name} className={styles.cartItemImage} />
              </MagnifierButton>
            ) : (
              <MagnifierButton size="sm" onClick={() => setPreviewPin({ src: item.img, alt: item.name })} ariaLabel={`Preview ${item.name}`}>
                <img src={item.img} alt={item.name} className={styles.cartItemImage} />
              </MagnifierButton>
            )}
            <div className={styles.cartItemInfo}>
              <p className={styles.cartItemName}>{item.name}</p>
              <button
                className={styles.cartQtyBtn}
                onClick={() => setEditItem({ slug: item.slug, qty: item.qty })}
                disabled={updatingSlug !== null}
              >
                Qty {item.qty} ▾
              </button>
            </div>
            <p className={styles.cartItemPrice}>${(item.price * item.qty).toFixed(2)}</p>
          </div>
        ))}
      </div>

      <hr className={styles.cartDivider} />

      {appliedCode ? (
        <div className={styles.promoApplied}>
          <span className={styles.promoAppliedCode}>{appliedCode} applied</span>
          <button className={styles.promoRemoveBtn} onClick={handleRemovePromo}>Remove</button>
        </div>
      ) : (
        <div className={styles.promoSection}>
          {promoOpen ? (
            <div className={styles.promoInputRow}>
              <input
                className={styles.promoInput}
                type="text"
                placeholder="Promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                autoFocus
              />
              <button
                className={styles.promoApplyBtn}
                onClick={handleApplyPromo}
                disabled={promoLoading || !promoCode.trim()}
              >
                {promoLoading
                  ? <span className={`${styles.spinner} ${styles.spinnerLight}`} aria-label="Loading" />
                  : "Apply"}
              </button>
            </div>
          ) : (
            <button className={styles.promoToggleBtn} onClick={() => setPromoOpen(true)}>
              + Add promotion code
            </button>
          )}
          <div className={`${styles.errorSlide} ${styles.errorSlideCompact} ${promoError ? styles.errorSlideVisible : ""}`}>
            <div className={styles.errorSlideInner}>
              <p className={styles.promoError}>{lastPromoError.current}</p>
            </div>
          </div>
        </div>
      )}

      <div className={`${styles.cartDetailsCollapse} ${detailsOpen ? styles.cartDetailsOpen : ""}`}>
        <div className={styles.cartDetailsInner}>
          <div className={styles.cartRow}>
            <span className={styles.cartRowLabel}>Subtotal</span>
            {checkout
              ? <span>{checkout.total.subtotal.amount}</span>
              : <span className={styles.cartAmountSkeleton} />}
          </div>
          {checkout && checkout.total.discount.minorUnitsAmount > 0 && (
            <div className={styles.cartRow}>
              <span>Discount</span>
              <span className={styles.cartDiscount}>-{checkout.total.discount.amount}</span>
            </div>
          )}
          <div className={styles.cartRow}>
            <span className={styles.cartRowLabel}>Shipping</span>
            <span>{europeShipping ? `${europeShipping.amount} to Europe` : "Free US shipping"}</span>
          </div>
          <div className={styles.cartRow}>
            <span className={`${styles.cartTaxLabel} ${styles.cartRowLabel}`}>
              Tax
              <span className={styles.taxInfoIcon}>
                <InfoIcon />
                <span className={styles.taxInfoBubble}>
                  Tax is determined by shipping information.
                </span>
              </span>
            </span>
            {!checkout ? (
              <span className={styles.cartAmountSkeleton} />
            ) : checkout.shippingAddress !== null ? (
              <span>{checkout.total.taxExclusive.amount}</span>
            ) : (
              <span className={styles.cartTaxPending}>Enter address to calculate</span>
            )}
          </div>
          <hr className={styles.cartTotalDivider} />
          <div className={`${styles.cartRow} ${styles.cartTotalRow}`}>
            <span>Total</span>
            {checkout
              ? <span>{checkout.total.total.amount}</span>
              : <span className={`${styles.cartAmountSkeleton} ${styles.cartTotalSkeleton}`} />}
          </div>
        </div>
      </div>

      {previewPin && (
        <Modal onClose={() => setPreviewPin(null)} ariaLabel={previewPin.alt}>
          <img src={previewPin.src} alt={previewPin.alt} className={styles.pinPreviewImage} />
        </Modal>
      )}

      {boxCarouselOpen && (
        <Modal onClose={() => setBoxCarouselOpen(false)} ariaLabel="Game contents preview" panelClassName={styles.carouselPanel}>
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

      {editItem && (
        <Modal onClose={() => setEditItem(null)} ariaLabel="Edit quantity">
          <h3 className={styles.modalTitle}>{CART_ITEMS_META[editItem.slug].name}</h3>
          {(() => {
            const desc = editItem.slug === "lcm" && editItem.qty >= LCM_MAX_QTY
              ? <span>Need more than 12? <a href="mailto:1min@unicornwithwings.com" className={styles.modalLink}>Send me an email</a>.</span>
              : CART_ITEMS_META[editItem.slug].desc;
            return (
              <div className={`${styles.qtyDescSlide} ${desc ? styles.qtyDescSlideVisible : ""}`}>
                <div className={styles.errorSlideInner}>
                  <p className={styles.qtyModalDesc}>{desc}</p>
                </div>
              </div>
            );
          })()}
          <Stepper
            value={editItem.qty}
            onChange={(qty) => setEditItem({ ...editItem, qty })}
            min={CART_ITEMS_META[editItem.slug].min}
            max={CART_ITEMS_META[editItem.slug].max}
            size="lg"
          />
          <div className={styles.qtyModalButtons}>
            {CART_ITEMS_META[editItem.slug].min === 0 && (
              <button
                className={styles.qtyModalRemoveBtn}
                onClick={handleRemoveItem}
                disabled={updatingSlug !== null}
              >
                Remove
              </button>
            )}
            <button
              className={`${styles.modalClose} ${styles.qtyModalConfirm}`}
              onClick={handleEditConfirm}
              disabled={updatingSlug !== null}
            >
              Update
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── International modal ───────────────────────────────────────────────────────

const InternationalModal = ({ onClose }: { onClose: () => void }) => (
  <Modal onClose={onClose} panelClassName={styles.internationalPanel}>
    <h2 className={styles.modalTitle}>Shipping to Europe 🇪🇺</h2>
    <p className={styles.modalBody}>
      I'm currently in talks with a Europe-based logistics company so I can
      offer cheaper shipping to everyone in Europe.
    </p>
    <p className={styles.modalBody}>
      By placing an order now, you'll be part of the first wave of orders,
      shipping out in the coming month. Shipping to Europe is $5.
    </p>
    <p className={styles.modalNotice}>
      <strong>Please note:</strong> it may take up to a month or two for
      European shipments to arrive. This is my first time trying something
      like this, so please understand.
    </p>
    <button className={styles.modalClose} onClick={onClose}>
      Got it
    </button>
  </Modal>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const CheckoutPage = () => {
  const { isDesktop } = useWindowDimensions();
  const appearance = isDesktop ? appearanceBase : appearanceMobile;
  const [lcmQty, setLcmQty] = useState(1);
  const [urgPinQty, setUrgPinQty] = useState(0);
  const [bizzPinQty, setBizzPinQty] = useState(0);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [shippingRates, setShippingRates] = useState<ShippingRates | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [internationalModalOpen, setInternationalModalOpen] = useState(false);
  const [updatingSlug, setUpdatingSlug] = useState<ItemSlug | null>(null);
  // Survives the remount that a cart change forces, so the replacement
  // session can be created with the email already filled in. A ref, not
  // state — nothing renders from it and it shouldn't trigger a re-render.
  const capturedEmailRef = useRef("");

  useEffect(() => {
    const prefillEmail = new URLSearchParams(window.location.search).get("prefilled_email");
    // Someone arriving from a recovery email already gave us their address —
    // keep it if they change the cart before touching the contact field.
    if (prefillEmail) capturedEmailRef.current = prefillEmail;
    fetch("/.netlify/functions/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: { lcm: 1 }, returnUrl: `${window.location.origin}/thankyou?checkout_flow=custom_checkout&checkout_session_id={CHECKOUT_SESSION_ID}`, ...getStoredUtms(), ...(prefillEmail && { email: prefillEmail }) }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then(({ clientSecret: secret, sessionId: sid, shippingRates: rates }) => {
        setClientSecret(secret);
        setSessionId(sid);
        setShippingRates(rates ?? null);
        trackEvent("checkout_started");
      })
      .catch(() => setInitError("Something went wrong. Please refresh to try again."));
  }, []);

  const cart: CartState = { lcmQty, urgPinQty, bizzPinQty };

  const handleUpdateItem = async (slug: ItemSlug, newQty: number) => {
    const newLcmQty = slug === "lcm" ? newQty : lcmQty;
    const newUrgQty = slug === "urg_pin" ? newQty : urgPinQty;
    const newBizzQty = slug === "bizz_pin" ? newQty : bizzPinQty;

    if (newLcmQty < 1) return;

    setUpdatingSlug(slug);
    try {
      const items: Record<string, number> = {
        lcm: newLcmQty,
        ...(newUrgQty > 0 && { urg_pin: newUrgQty }),
        ...(newBizzQty > 0 && { bizz_pin: newBizzQty }),
      };
      const res = await fetch("/.netlify/functions/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, returnUrl: `${window.location.origin}/thankyou?checkout_session_id={CHECKOUT_SESSION_ID}&checkout_flow=custom_checkout`, ...getStoredUtms(), ...(capturedEmailRef.current && { email: capturedEmailRef.current }) }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const { clientSecret: newSecret, sessionId: newSid, shippingRates: newRates } = await res.json();
      const prevQty = slug === "lcm" ? lcmQty : slug === "urg_pin" ? urgPinQty : bizzPinQty;
      const trigger = newQty === 0 ? "remove_item" : prevQty === 0 ? "add_item" : "change_qty";
      trackEvent("checkout_cart_reset", { trigger, item_slug: slug, new_qty: newQty });
      setLcmQty(newLcmQty);
      setUrgPinQty(newUrgQty);
      setBizzPinQty(newBizzQty);
      setClientSecret(newSecret);
      setSessionId(newSid);
      setShippingRates(newRates ?? null);
    } catch {
      // silently fail — user can retry
    } finally {
      setUpdatingSlug(null);
    }
  };

  if (initError) {
    return (
      <div className={`content ${styles.buyPage}`}>
        <CustomHelmet
          title="Checkout — Love, Career & Magic"
          description="Complete your purchase of Love, Career & Magic."
        />
        <PageIntro title="Checkout" />
        <p style={{ textAlign: "center", fontFamily: "Roboto Light", color: "#dd7373", marginTop: "2rem" }}>
          {initError}
        </p>
      </div>
    );
  }

  return (
    <div className={`content ${styles.buyPage}`}>
      <CustomHelmet
        title="Checkout — Love, Career & Magic"
        description="Complete your purchase of Love, Career & Magic."
      />
      <PageIntro title="Checkout" />
      <div className={styles.checkoutSection}>
        {clientSecret ? (
          <CheckoutElementsProvider
            key={clientSecret}
            stripe={stripePromise}
            options={{ clientSecret, elementsOptions: { appearance } }}
          >
            <div className={styles.checkoutLayout}>
              <div className={styles.checkoutLeft}>
                <CartSummary
                  cart={cart}
                  onUpdateItem={handleUpdateItem}
                  updatingSlug={updatingSlug}
                  shippingRates={shippingRates}
                />
                <CartUpsell
                  cart={cart}
                  onUpdateItem={handleUpdateItem}
                  updatingSlug={updatingSlug}
                />
              </div>
              <CheckoutForm
                sessionId={sessionId}
                shippingRates={shippingRates}
                onEmailCaptured={(email) => { capturedEmailRef.current = email; }}
                onOpenInternational={() => setInternationalModalOpen(true)}
              />
            </div>
          </CheckoutElementsProvider>
        ) : (
          <div className={styles.checkoutLayout}>
            <div className={styles.checkoutLeft}>
              <div className={styles.cartSummary}>
                <p className={styles.cartSummaryEyebrow}>Your order</p>
                <div className={`${styles.skeletonBlock} ${styles.skeletonField}`} />
                <div className={`${styles.skeletonBlock} ${styles.skeletonField}`} style={{ height: "32px" }} />
                <div className={`${styles.skeletonBlock} ${styles.skeletonField}`} style={{ height: "32px" }} />
                <div className={`${styles.skeletonBlock} ${styles.skeletonField}`} style={{ height: "32px" }} />
              </div>
              <div className={styles.upsellCard}>
                <p className={styles.cartUpsellLabel}>Add to your order</p>
                <div className={`${styles.skeletonBlock} ${styles.skeletonUpsellItem}`} />
                <div className={`${styles.skeletonBlock} ${styles.skeletonUpsellItem}`} />
              </div>
            </div>
            <div className={styles.checkoutFormWrapper}>
              <CheckoutFormSkeleton />
            </div>
          </div>
        )}
      </div>
      <p className={styles.stripeAttr}>
        Payments secured by{" "}
        <a href="https://stripe.com" target="_blank" rel="noreferrer">Stripe</a>
      </p>
      {internationalModalOpen && (
        <InternationalModal onClose={() => setInternationalModalOpen(false)} />
      )}
    </div>
  );
};

export default CheckoutPage;
