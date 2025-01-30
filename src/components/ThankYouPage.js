import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import EmailForm from "./utils/EmailForm.js";
import CustomHelmet from "./utils/CustomHelmet.js";

const ThankYouPage = () => {
  //custom meta tags for this page
  const title = "Thank you for your order!";

  //change title of page
  useEffect(() => {
    document.title = title;
  }, [title]);

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
            You will soon receive the details about your purchase via email. If
            you do not receive anything within the hour, please{" "}
            <a href="/contact">let me know</a> and I will try to sort out the
            issue.
          </p>
          <p>
            I am just one person running this shop, so I appreciate your
            patience and understanding.
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
