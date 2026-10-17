import Roleplay from "./components/Roleplay";
import DefaultButton from "../utils/DefaultButton";
import PageIntro from "../utils/PageIntro";
import VideoPoster from "../utils/VideoPoster";
import { sized } from "../utils/imageCopies";
import aboutStyles from "../../css/pages/aboutPage.module.css";

const AboutPage = () => {
  return (
    <div className={`content ${aboutStyles.page}`}>
      <PageIntro
        eyebrow="2–6 players · 12 minutes"
        title="How to play"
        lead="Four episodes, three minutes each. Improvise your way through a reality show and keep the ratings up ✨"
      >
        <DefaultButton
          href="/rulebook.pdf"
          variant="secondary"
          border="dark"
          icon="rulebook"
          text="Rulebook PDF"
        />
      </PageIntro>

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
