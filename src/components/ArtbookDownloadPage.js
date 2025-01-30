import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";

import CustomHelmet from "./utils/CustomHelmet.js";
import DefaultButton from "./utils/DefaultButton.js";

const ArtbookDownloadPage = (props) => {
  //custom meta tags for this page
  const title = "Digital artbook download";
  const splashImage = "https://lovecareermagic.com/images/artbook/mockup2.webp";
  const description =
    "Thank you so much for signing up for my newsletter. Here is the free digital artbook!";

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
          <h2 className="subtitle">Here's your digital artbook!</h2>
          <p>{description}</p>
          <DefaultButton
            shadowless
            icon="rulebookWhite"
            href="/artbook v2.pdf"
            className="artbookDownload"
            text="Download artbook"
          />
        </div>
      </div>

      <div className="subcontentWrapper">
        <div className="couchContainer">
          <img
            className="couch"
            style={{ width: "100%" }}
            src="/images/artbook/mockup2.webp"
            alt={description}
          ></img>
          <img
            className="couch"
            style={{ width: "100%" }}
            src="/images/artbook/mockup1.webp"
            alt={description}
          ></img>
          <p style={{ marginTop: "1em" }}>
            <NavLink to="/">Click here to go back home.</NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArtbookDownloadPage;
