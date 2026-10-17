import PageIntro from "./utils/PageIntro";
import DefaultButton from "./utils/DefaultButton";
import { NavLink } from "react-router";

const TermsPage = () => {
  return (
    <div className="content max-width">
      <PageIntro eyebrow="The fine print" title="Terms" lead="Returns, and how your information is used." />

      <div className="subcontentWrapper legalWrapper">
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
              <NavLink to="/contact">reach out</NavLink> and I’ll do my best to fix it!
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
            post office myself. Because I don’t have the scale or budget of a
            large corporation, I have to be very careful with my return policy.
          </p>
          <p>
            Since games that have been opened and played cannot be resold to
            another player, I unfortunately cannot accept them as returns. Every
            copy is a significant investment of my time and resources, and I
            simply don’t have the overhead to absorb the cost of “open box”
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
            signed up for, and find more people who’ll love the game. I never
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

      <div className="legalBack">
        <DefaultButton navlink="/" variant="secondary" border="dark" icon="prev" text="Back to home" />
      </div>
    </div>
  );
};

export default TermsPage;
