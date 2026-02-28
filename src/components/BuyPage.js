import { useEffect } from "react";
import "../css/pages/buyPage.css";
import DefaultButton from "./utils/DefaultButton.js";
import EmailForm from "./utils/EmailForm.js";

const BuyPage = () => {
  useEffect(() => {
    document.title = "Love, Career & Magic is sold out!";
  });

  return (
    <div className="content max-width">
      <div className="subcontentWrapper margin-top">
        <div className="characterContent">
          <h2 className="subtitle">Love, Career & Magic is fully sold out!</h2>
          <p>
            Thank you so much for your interest in Love, Career & Magic!
            Unfortunately, the game is currently completely SOLD OUT.
          </p>
          <p>
            If you'd like to read more about this milestone,{" "}
            <a href="https://pegasusgames.medium.com/i-cannot-believe-it-but-love-career-magic-is-sold-out-e986b8f5747a">
              check out the blog post here
            </a>
            .
          </p>
          <p>
            If you'd like to place a back order, you can do so at the link
            below. As a token of my appreciation, I will include a{" "}
            <strong>free mystery gift</strong> with your purchase. I haven’t
            decided yet what that gift will be 😅
          </p>
          <div className="buyPageButtonWrapper">
            <DefaultButton
              href="https://buy.stripe.com/28E14oahReFa6Zx74m0Jq04"
              text="Place a back order"
              icon="forward"
              className="is-red is-large"
              size="large"
            />
          </div>

          <h2 className="subtitle">An expansion is coming!</h2>
          <p>
            I am incredibly excited to announce that an expansion is coming! I
            have been working on the expansion for the past few months and I am
            incredibly excited to share it with you.
          </p>
          <div className="buyPageButtonWrapper">
            <DefaultButton
              href="https://www.kickstarter.com/projects/pegasusgamesnyc/love-career-and-magic-the-second-season"
              text="Follow the expansion on Kickstarter"
              icon="forward"
              className="is-green is-large"
              size="large"
            />
          </div>

          <EmailForm
            hideTitle={true}
            isActiveAndDesktop={false}
            responseOverride="An expansion is officially in development! Sign up below to be notified about the release date and other updates!"
          />

          <div className="buyPageImageWrapper">
            <img
              src="/images/final_shipment.webp"
              alt="Final shipment"
              className="buyPageImage"
            />
            <br />
            <p className="buyPageCaption">
              On my way to drop off the final shipment to the post office, the
              car was completely full!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyPage;
