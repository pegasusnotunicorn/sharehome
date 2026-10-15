import { useEffect } from "react";
import Roleplay from "./components/Roleplay";
import DefaultButton from "../utils/DefaultButton";
import aboutStyles from "../../css/pages/aboutPage.module.css";

const AboutPage = () => {
  useEffect(() => {
    document.title = "How to play";
  }, []);

  return (
    <div className={`content ${aboutStyles.page}`}>
      <header className={aboutStyles.intro}>
        <p className={aboutStyles.eyebrow}>2–6 players · 12 minutes</p>
        <h1 className={aboutStyles.title}>How to play</h1>
        <p className={aboutStyles.lede}>
          Four episodes, three minutes each. Improvise your way through a reality show and keep the ratings
          up ✨
        </p>
        <div className={aboutStyles.actions}>
          <DefaultButton
            href="/rulebook.pdf"
            variant="secondary"
            border="dark"
            icon="rulebook"
            text="Rulebook PDF"
          />
        </div>
      </header>

      <section className={aboutStyles.video} aria-label="Video">
        <div className={aboutStyles.videoEmbed}>
          <iframe
            src="https://www.youtube.com/embed/jKp0NWvWEQY?rel=0&modestbranding=1"
            title="How to play Love, Career & Magic"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            frameBorder="0"
          />
        </div>
      </section>

      <Roleplay />
    </div>
  );
};

export default AboutPage;
