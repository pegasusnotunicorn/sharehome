import { useEffect, useMemo, useState } from "react";
import usePageTitle from "./utils/usePageTitle";
import DefaultButton from "./utils/DefaultButton";
import PolaroidJourney from "./utils/PolaroidJourney";
import { CONTACT_POLAROIDS } from "./utils/contactPolaroids";
import { FETCH_FIRST } from "./utils/imageCopies";
import styles from "../css/pages/thankYouPage.module.css";

type ShippingRegion = "loading" | "us" | "europe";

// Which shipping copy to show, looked up from the order's shipping address.
// Anything that isn't a confirmed Europe order falls back to the US copy.
// (?preview=europe or ?preview=us shows that one, to see how it reads.)
const useShippingRegion = (): ShippingRegion => {
  const [sessionId, preview] = useMemo(() => {
    const q = new URLSearchParams(window.location.search);
    return [q.get("checkout_session_id"), q.get("preview")];
  }, []);
  const [region, setRegion] = useState<ShippingRegion>(
    preview === "europe" ? "europe" : preview === "us" || !sessionId ? "us" : "loading"
  );

  useEffect(() => {
    if (!sessionId || preview) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    fetch(`/.netlify/functions/order-region?checkout_session_id=${encodeURIComponent(sessionId)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then(({ region: r }) => setRegion(r === "europe" ? "europe" : "us"))
      .catch(() => setRegion("us"))
      .finally(() => clearTimeout(timeout));
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [sessionId, preview]);

  return region;
};

const ThankYouPage = () => {
  const title = "Thank you for your order!";
  usePageTitle(title);

  const [start] = useState(() => Math.floor(Math.random() * CONTACT_POLAROIDS.length));
  const region = useShippingRegion();
  const isEurope = region === "europe";
  // Hold the region-specific copy back until the lookup settles, so a Europe
  // buyer never sees the US delivery times flash first.
  const regionReady = region !== "loading";

  return (
    <div className={`content ${styles.thankYouPage}`}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Order confirmed</p>
        <h1 className={styles.title}>Thank you!</h1>
        {/* (true wherever it ships: a Europe order goes out with the next batch, not today) */}
        <p className={styles.lede}>Your order is in, and a receipt is on its way to your email 📦</p>
        <div className={styles.actions}>
          <DefaultButton navlink="/" variant="secondary" border="dark" icon="prev" text="Back to home" />
        </div>
      </header>

      <section className={styles.lou}>
        <img
          src="/images/loucheck.webp"
          alt="Lou the cat is checking your order"
          className={styles.louImage}
          width={1000}
          height={758}
          {...FETCH_FIRST}
        />
        <div className={styles.louWords}>
          <p className={styles.label}>Head of Fulfillment</p>
          <h2 className={styles.louTitle}>Lou the cat is on the case&nbsp;🐈</h2>
          {regionReady && (
            <>
              {isEurope ? (
                <p>
                  I have received your order! You're part of the first wave of
                  European orders, which will ship out in the coming month through
                  a Europe-based logistics company.
                </p>
              ) : (
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
              )}
              {isEurope ? (
                <p className={styles.notice}>
                  <strong>Please note</strong>
                  European shipments may take up to a month or two to arrive.
                  It's the only way to keep costs down and make sure you don't pay
                  any VAT. This is my first time trying something like this, so I
                  truly appreciate your patience and understanding. Thank you for
                  supporting indie game devs! 😊
                </p>
              ) : (
                <p className={styles.notice}>
                  <strong>Please note</strong>
                  I am just one person hand-packing and shipping out each game
                  manually. I truly appreciate your patience and understanding.
                  Thank you for supporting indie game devs! 😊
                </p>
              )}
              <p>
                {isEurope
                  ? "If you have any questions about your order, "
                  : "Orders typically arrive within 1-2 weeks. If it's been longer, "}
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="/contact"
                >
                  let me know
                </a>
                {isEurope ? "." : " and I'll sort it out."} Email is the fastest way to reach me.
              </p>
            </>
          )}
        </div>
      </section>

      <PolaroidJourney label="Thanks for being part of it" title="The journey so far" start={start} />
    </div>
  );
};

export default ThankYouPage;
