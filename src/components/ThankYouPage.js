import { useEffect } from "react";
import { useLocation } from "react-router"; // To access URL params
import { NavLink } from "react-router";
import EmailForm from "./utils/EmailForm.js";
import CustomHelmet from "./utils/CustomHelmet.js";

const ThankYouPage = () => {
  //custom meta tags for this page
  const title = "Thank you for your order!";

  // Get checkout_session_id from the URL
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const checkoutSessionId = params.get("checkout_session_id");

  // Change the page title and trigger Google Ads conversion tracking
  useEffect(() => {
    document.title = title;

    if (checkoutSessionId) {
      // Google Ads conversion tracking with the session ID as the transaction_id
      window.gtag("event", "conversion", {
        send_to: "AW-16828802079/rZXLCJXiqJcaEJ_IzNg-",
        transaction_id: checkoutSessionId,
      });
    }
  }, [title, checkoutSessionId]);

  return (
    <div className="content max-width">
      <CustomHelmet
        title={title}
        splashImage="https://lovecareermagic.com/images/loucheck.webp"
        description="We have received your order and will ship your game to you within 3-5 business days."
      />

      <div className="subcontentWrapper margin-top min-width">
        <div className="characterContent">
          <h2 className="subtitle">Thank you for your order!</h2>
          <img
            loading="lazy"
            className="couch"
            style={{ width: "100%", marginBottom: "1em" }}
            src="/images/loucheck.webp"
            alt="Lou the cat is checking your order"
          />
          <p>
            I have received your order and will ship your game to you within 3-5
            business days (after an extensive QA process by our Head of
            Fulfillment, Lou the cat).
          </p>
          <p>
            PLEASE NOTE: I am just one person running this shop, so I appreciate
            your patience and understanding.
          </p>
          <p>
            I pack and ship out every game manually, which means there is no
            automated system where you will receive a tracking number or
            shipping details. Generally it takes about 1-2 weeks for US orders
            and 2-4 weeks for international orders from the day you order it. If
            it has passed that time, please{" "}
            <a
              aria-label="Contact us"
              target="_blank"
              rel="noreferrer"
              href="/contact"
            >
              let me know
            </a>{" "}
            and I will try my best to sort out the issue. Sending me an email is
            the best and fastest way to get in touch with me.
          </p>

          <EmailForm hideTitle={false} isActiveAndDesktop />
        </div>
      </div>

      <div className="subcontentWrapper">
        <div className="couchContainer">
          <p style={{ marginTop: "1em" }}>
            <NavLink to="/">Click here to go back home.</NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
