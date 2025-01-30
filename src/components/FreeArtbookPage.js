import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import EmailForm from "./utils/EmailForm.js";
import CustomHelmet from "./utils/CustomHelmet.js";

const FreeArtbookPage = () => {
  //custom meta tags for this page
  const title = "Free digital artbook!";
  const splashImage = `https://lovecareermagic.com/images/artbook/mockup2.webp`;
  const description = `Get your free digital artbook, Love, Career & Magic, by signing up for the newsletter!`;

  //change title of page
  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className="content max-width">
      <CustomHelmet
        title={title}
        splashImage={splashImage}
        description={description}
      />

      <div className="subcontentWrapper margin-top min-width">
        <div className="characterContent">
          <h2 className="subtitle">Free digital artbook</h2>
          <EmailForm className="artbookEmail" hideTitle isActiveAndDesktop />
        </div>
      </div>

      <div className="subcontentWrapper">
        <div className="couchContainer">
          <img
            loading="lazy"
            className="couch"
            style={{ width: "100%" }}
            src="/images/artbook/mockup2.webp"
            alt="Love, Career & Magic artbook cover"
          ></img>
          <img
            loading="lazy"
            className="couch"
            style={{ width: "100%" }}
            src="/images/artbook/mockup1.webp"
            alt="Love, Career & Magic artbook cover"
          ></img>
          <p style={{ marginTop: "1em" }}>
            <NavLink to="/">Click here to go back home.</NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FreeArtbookPage;
