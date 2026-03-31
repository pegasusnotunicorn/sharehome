import { useEffect } from "react";
import Roleplay from "./components/Roleplay";
import useWindowDimensions from "../utils/useWindowDimensions";
import aboutStyles from "../../css/pages/aboutPage.module.css";
import type { CardMainStyle } from "../../types/card";

const AboutPage = () => {
  const { isMobile } = useWindowDimensions();

  // styling for character cards on about page
  let cardStyle: CardMainStyle = isMobile
    ? { width: "120px", height: "70px", fontSize: "1px" }
    : { width: "175px", height: "100px", fontSize: "1.5px" };

  useEffect(() => {
    document.title = "How to play";
  }, []);

  return (
    <div className="content max-width">
      <div className="subcontentWrapper margin-top">
        <div className={`characterContent ${aboutStyles.pageIntro}`}>
          <h2 className={`subtitle ${aboutStyles.pageIntroTitle}`}>
            How to play
          </h2>
          <a
            href="/rulebook.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className={aboutStyles.rulebookLink}
          >
            <img
              loading="lazy"
              src="/images/icons/rulebook.svg"
              alt=""
            />
            Click here for the rulebook PDF
          </a>
        </div>
      </div>
      <div className={aboutStyles.videoWrapper}>
        <div className={aboutStyles.videoEmbed}>
          <iframe
            src="https://www.youtube.com/embed/jKp0NWvWEQY?rel=0&modestbranding=1"
            title="How to play Love, Career & Magic"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            frameBorder="0"
          />
        </div>
      </div>
      <Roleplay cardStyle={cardStyle} />
    </div>
  );
};

export default AboutPage;
