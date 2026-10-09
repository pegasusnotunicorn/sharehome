import CustomHelmet from "./utils/CustomHelmet";
import PageIntro from "./utils/PageIntro";
import { NavLink } from "react-router";

const TermsPage = () => {
  return (
    <div className="content max-width">
      <CustomHelmet
        title="Terms & privacy policy"
        description="Terms, return policy and privacy summary for Love, Career & Magic."
      />

      <PageIntro title="Terms & privacy policy" />

      <div className="subcontentWrapper min-width">
        <div className="termsWrapper">
          <h2 className="subtitle">Terms and conditions</h2>
          <p>
            Love, Career & Magic is a passion project—just me, an indie game
            dev, bringing this game to life. When you buy from me, you agree to
            the following:
          </p>
          <ul>
            <li>
              Your information is used as described in the{" "}
              <NavLink to="/privacy">privacy policy</NavLink>.
            </li>
            <li>
              All sales are final unless your order arrives damaged or something
              goes missing. Open box returns are not accepted.
            </li>
            <li>
              If anything goes wrong with your order,{" "}
              <a href="/contact">reach out</a> and I'll do my best to fix it!
              Just keep in mind, I’m a one-person team, so it might take a
              little time to get back to you.
            </li>
          </ul>
        </div>

        <div className="termsWrapper">
          <h2 className="subtitle">Return policy</h2>
          <p>
            I am a one-person team. I handle everything from the initial game
            design to hand-packaging every box and driving them to the local
            post office myself. Because I don't have the scale or budget of a
            large corporation, I have to be very careful with my return policy.
          </p>
          <p>
            Since games that have been opened and played cannot be resold to
            another player, I unfortunately cannot accept them as returns. Every
            copy is a significant investment of my time and resources, and I
            simply don't have the overhead to absorb the cost of "open box"
            returns.
          </p>
          <p>
            Thank you for understanding and for supporting independent creators.
          </p>
        </div>

        <div className="termsWrapper">
          <h2 className="subtitle">Privacy policy</h2>
          <p>
            I only collect what I need to ship your order, send the updates you
            signed up for, and find more people who'll love the game. I never
            sell your personal information. Payments go through Stripe, and you
            can unsubscribe from emails at any time.
          </p>
          <p>
            The full details, including cookies, the services I use and how to
            delete your data, are in the{" "}
            <NavLink to="/privacy">privacy policy</NavLink>.
          </p>
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

export default TermsPage;
