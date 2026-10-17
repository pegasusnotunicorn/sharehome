import { useEffect } from "react";
import Roleplay from "./components/Roleplay";
import DefaultButton from "../utils/DefaultButton";
import VideoPoster from "../utils/VideoPoster";
import { sized } from "../utils/imageCopies";
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
            text="Rulebook PDF (2.4 MB)"
          />
        </div>
      </header>

      <section className={aboutStyles.video} aria-label="Video">
        <div className={aboutStyles.videoEmbed}>
          {/* (the cast in the kitchen until it's played: the player loads only then) */}
          <VideoPoster
            id="jKp0NWvWEQY"
            title="How to play Love, Career & Magic"
            label="Play the how-to-play video"
            poster={sized("/images/illustrations/splash.webp", 1000)}
            posterWidth={1000}
            posterHeight={600}
            first
          >
            <span className={aboutStyles.videoCaption} aria-hidden="true">
              Watch how to play
            </span>
          </VideoPoster>
        </div>
      </section>

      <Roleplay />
    </div>
  );
};

export default AboutPage;
