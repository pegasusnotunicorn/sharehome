import CustomHelmet from "./utils/CustomHelmet.js";
import { NavLink } from "react-router";

const TermsPage = () => {
  const title = "Terms & privacy policy";

  return (
    <div className="content max-width">
      <CustomHelmet
        title={title}
        description="Terms & privacy policy for Love, Career & Magic."
      />

      <div className="subcontentWrapper min-width">
        <div className="termsWrapper">
          <h2 className="subtitle">Terms and conditions</h2>
          <p>
            By purchasing <b>Love, Career & Magic</b>, you agree to the
            following terms:
          </p>
          <ul>
            <li>
              Your information is only used to process and ship your order.
            </li>
            <li>
              All sales are final, except in cases of damaged or missing items.
            </li>
            <li>
              If you encounter any issues with your order, please{" "}
              <a href="/contact">contact me</a> and I'll do my best to resolve
              it! But please remember, I am just one person operating this
              business, so it may take a little while to get back to you.
            </li>
          </ul>
        </div>
        <div className="termsWrapper">
          <h2 className="subtitle">Privacy policy</h2>
          <ul>
            <li>
              We only collect the necessary information to process and ship your
              order.
            </li>
            <li>
              We do not sell, share, or store your data beyond what is required
              for order fulfillment.
            </li>
            <li>
              Payments are securely processed through third-party providers like
              Stripe, which have their own privacy policies.
            </li>
            <li>
              If you have any concerns about your data, please{" "}
              <a href="/contact">reach out</a>.
            </li>
          </ul>
        </div>

        <p>Thank you for supporting a small, independent creator!</p>
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

export default TermsPage;
