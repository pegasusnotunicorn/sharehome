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

      <div className="subcontentWrapper margin-top min-width">
        <div className="termsWrapper">
          <h2 className="subtitle">Terms and conditions</h2>
          <p>
            Love, Career & Magic is a passion project—just me, an indie game
            dev, bringing this game to life. When you buy from me, you agree to
            the following:
          </p>
          <ul>
            <li>
              Your information is only used to process and ship your order.
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
            Big game studios can throw millions at advertising—I can’t. I just
            want my game to be played by the people who will{" "}
            <strong>actually</strong> love it.
          </p>
          <p>
            To do that, I use cookies and data to help figure out where to find
            those players. I don't store or sell any of your personal data. I
            just use it to connect with the right audience.
          </p>
          <ul>
            <li>
              I only collect the bare minimum information needed to process and
              ship your order.
            </li>
            <li>
              I also add your email address to my mailing list, so I can send
              you updates about the game. You can unsubscribe at any time.
            </li>
            <li>
              I don’t sell, share, or store your data beyond what’s necessary
              for order fulfillment.
            </li>
            <li>
              I use cookies and analytics to figure out who might enjoy the
              game, so I can show my ads to the right people.
            </li>
            <li>
              Payments are securely processed through Stripe, which has its own
              privacy policies.
            </li>
            <li>
              If you have any concerns, <a href="/contact">reach out</a>. I’m
              happy to help.
            </li>
          </ul>
          <p>
            Thanks for supporting an independent creator! Every purchase helps
            keep this dream alive.
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
