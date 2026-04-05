import { useState } from "react";
import Card from "../../Card/Card";
import { getRandomTrait } from "../../Card/ExampleTraits";
import DefaultButton from "../../utils/DefaultButton";
import useWindowDimensions from "../../utils/useWindowDimensions";
import aboutStyles from "../../../css/pages/aboutPage.module.css";
import type { CardMainStyle } from "../../../types/card";

interface RoleplayProps {
  cardStyle: CardMainStyle;
}

interface SetupProps {
  showRules: boolean;
  cardStyle: CardMainStyle;
  toggleSteps: () => void;
}

interface RulesProps {
  showRules: boolean;
  toggleSteps: () => void;
}

const Roleplay = ({ cardStyle }: RoleplayProps) => {
  const [showRules, setshowRules] = useState(false);
  const [tabKey, setTabKey] = useState(0);
  const toggleSteps = () => {
    setshowRules(!showRules);
  };

  const switchTab = (rules: boolean) => {
    if (rules === showRules) {
      return;
    }

    setshowRules(rules);
    setTabKey(k => k + 1);
  };

  return (
    <>
      <div className={aboutStyles.tabsWrapper}>
        <button
          className={`${aboutStyles.tab} ${!showRules ? aboutStyles.tabActive : ""}`}
          onClick={() => switchTab(false)}
        >
          Game setup<span className={aboutStyles.tabSubtext}>less than 3 min</span>
        </button>
        <button
          className={`${aboutStyles.tab} ${showRules ? aboutStyles.tabActive : ""}`}
          onClick={() => switchTab(true)}
        >
          Game rules<span className={aboutStyles.tabSubtext}>12 min per game</span>
        </button>
      </div>
      <Setup
        key={`setup-${tabKey}`}
        showRules={showRules}
        cardStyle={cardStyle}
        toggleSteps={toggleSteps}
      />
      <Rules key={`rules-${tabKey}`} showRules={showRules} toggleSteps={toggleSteps} />
    </>
  );
};

const Setup = ({ showRules, cardStyle, toggleSteps }: SetupProps) => {
  const cardProps = {
    type: "member",
    mainStyle: cardStyle,
    disableFlip: true,
    showFront: true,
    disableText: true,
    enableQuestionMark: true,
  };

  const [randomTraits] = useState(() =>
    [
      { text: getRandomTrait("good"), type: "good" as const },
      { text: getRandomTrait("bad"), type: "bad" as const },
      { text: getRandomTrait("chaotic"), type: "chaotic" as const },
    ].sort(() => 0.5 - Math.random())
  );

  return (
    <div className={`${aboutStyles.allStepsContainer}${!showRules ? " is-active" : ""}`}>
      {/* STEP 1: Deal character cards & traits */}
      <div className={aboutStyles.stepWrapper}>
        <h2 className={aboutStyles.stepTitle}>
          Step 1 — Deal character cards & traits
        </h2>
        <div className={aboutStyles.stepLayout}>
          <div className={aboutStyles.stepIllustration}>
            <Card {...cardProps} />
            <div className={aboutStyles.traitsList}>
              {randomTraits.map((trait, i) => (
                <div key={i} className={`${aboutStyles.characterArc} ${aboutStyles[`${trait.type}Arc`]}`}>
                  <div className={aboutStyles.characterArcText}>{trait.text}</div>
                </div>
              ))}
            </div>
          </div>
          <div className={aboutStyles.stepTextContent}>
            <h3 className={aboutStyles.boldText}>
              Each player is given a random Character Card and three random Character Traits.
            </h3>
            <ul className={aboutStyles.bulletList}>
              <li>Place your Character Card in the plastic card standee for all to see.</li>
              <li>For Character Traits, every player receives one of each color at random.</li>
              <li>Form your Character Arc by rearranging the order of your Character Traits.</li>
            </ul>
            <div className={aboutStyles.stepNote}>
              <img loading="lazy" src="/images/icons/flag.svg" alt="goal" />
              <p>
                The goal of the game is to score points. The higher you score, the
                better the ratings will be for your season. Fulfill as many Direction
                Cards as you can as a group and complete your Character Arcs to earn points.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 2: Set up the table */}
      <div className={aboutStyles.stepWrapper}>
        <h2 className={aboutStyles.stepTitle}>
          Step 2 — Set up the table
        </h2>
        <div className={aboutStyles.stepLayout}>
          <div className={aboutStyles.stepIllustration}>
            <img
              loading="lazy"
              className={aboutStyles.cardImg}
              src="/images/illustrations/episodecard.webp"
              alt="episode card"
            />
            <div className={aboutStyles.cardImgRow}>
              <img
                loading="lazy"
                className={aboutStyles.cardImgSmall}
                src="/images/illustrations/directioncard0.webp"
                alt="direction card"
              />
              <img
                loading="lazy"
                className={aboutStyles.cardImgSmall}
                src="/images/illustrations/directioncard1.webp"
                alt="direction card"
              />
            </div>
          </div>
          <div className={aboutStyles.stepTextContent}>
            <h3 className={aboutStyles.boldText}>
              Place the Episode Cards, Direction Cards, and Point Tokens in the center of the table.
            </h3>
            <ul className={aboutStyles.bulletList}>
              <li>Every player must be able to read the cards clearly so please sit accordingly.</li>
              <li>Place a phone in clear view of everyone and set a timer for 3 minutes.</li>
              <li>Split the Direction Cards into two decks according to their point values.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* STEP 3: Start playing */}
      <div className={aboutStyles.stepWrapper}>
        <h2 className={aboutStyles.stepTitle}>
          Step 3 — Start playing!
        </h2>
        <div className={aboutStyles.stepLayout}>
          <div className={aboutStyles.stepIllustration}>
            <Card {...cardProps} enableQuestionMark={false} />
            <img
              loading="lazy"
              className={aboutStyles.wideImage}
              src="/images/illustrations/rules/membertalk.svg"
              alt="members talking"
            />
          </div>
          <div className={aboutStyles.stepTextContent}>
            <h3 className={aboutStyles.boldText}>
              Starting with the oldest Character, all players introduce themselves.
            </h3>
            <ul className={aboutStyles.bulletList}>
              <li>Feel free to omit or replace any of the written character details as you see fit.</li>
              <li>Make sure to also mention your Character Arc so others are aware of it.</li>
              <li>Remember, this is your reality TV show debut!</li>
              <li>Continue clockwise until all players have introduced themselves.</li>
            </ul>
          </div>
        </div>
      </div>

      <DefaultButton
        className={aboutStyles.showRulesButtonBottom}
        variant="secondary"
        border="dark"
        iconPosition="right"
        icon="next"
        onClick={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          toggleSteps();
        }}
        text="Take me to the game rules"
      />
    </div>
  );
};

const tokenSources = [
  ["/images/icons/5point.png", "/images/icons/1point.png", "/images/icons/5point.png", "/images/icons/1point.png"],
  ["/images/icons/1point.png", "/images/icons/5point.png", "/images/icons/1point.png", "/images/icons/5point.png"],
];

const Rules = ({ showRules, toggleSteps }: RulesProps) => {
  const { width } = useWindowDimensions();
  const [tokenRotations] = useState(() =>
    tokenSources.map(row => row.map(() => Math.floor(Math.random() * 360)))
  );

  const isMobile = width <= 900;
  const isSmall = width <= 480;
  const goalCardStyle = {
    type: "episode",
    disableFlip: true,
    showFront: true,
    mainStyle: {
      width: isSmall ? "180px" : isMobile ? "160px" : "180px",
      height: isSmall ? "120px" : isMobile ? "110px" : "120px",
      fontSize: isSmall ? "5px" : isMobile ? "4.5px" : "4.5px",
    },
  };

  return (
    <div className={`${aboutStyles.allStepsContainer}${showRules ? " is-active" : ""}`}>
      {/* EPISODE CARDS */}
      <div className={aboutStyles.stepWrapper}>
        <h2 className={aboutStyles.stepTitle}>
          Episode Cards — Drive the story each round
        </h2>
        <div className={aboutStyles.stepLayout}>
          <div className={aboutStyles.stepIllustration}>
            <Card {...goalCardStyle} />
          </div>
          <div className={aboutStyles.stepTextContent}>
            <h3 className={aboutStyles.boldText}>
              Flip over an Episode Card. This will be the location for Episode One.
            </h3>
            <ul className={aboutStyles.bulletList}>
              <li>Every episode is one &quot;round&quot; of the game.</li>
              <li>Each episode lasts three minutes.</li>
              <li>You will play four episodes in total.</li>
              <li>Do not start the timer just yet.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* DIRECTION CARDS */}
      <div className={aboutStyles.stepWrapper}>
        <h2 className={aboutStyles.stepTitle}>
          Direction Cards — Score points by completing challenges
        </h2>
        <div className={aboutStyles.stepLayout}>
          <div className={aboutStyles.stepIllustration}>
            <div className={aboutStyles.cardImgRow}>
              <img
                loading="lazy"
                className={aboutStyles.cardImgSmall}
                src="/images/illustrations/directioncard0.webp"
                alt="direction card"
              />
              <img
                loading="lazy"
                className={aboutStyles.cardImgSmall}
                src="/images/illustrations/directioncard1.webp"
                alt="direction card"
              />
              <img
                loading="lazy"
                className={aboutStyles.cardImgSmall}
                src="/images/illustrations/directioncard2.webp"
                alt="direction card"
              />
            </div>
            <img
              loading="lazy"
              className={aboutStyles.wideImage}
              src="/images/illustrations/rules/commentatortalk.svg"
              alt="commentators talking"
            />
          </div>
          <div className={aboutStyles.stepTextContent}>
            <h3 className={aboutStyles.boldText}>
              Flip over three cards from both Direction Card decks. Six total cards should be face up at all times.
            </h3>
            <ul className={aboutStyles.bulletList}>
              <li>The executives of the show are trying to instill chaos into the plot!</li>
              <li>In three minutes, complete as many Direction Cards as you can as a group.</li>
              <li>Each Direction Card is worth one or two points.</li>
              <li>Replenish a card as soon as you complete it.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* POINT TOKENS */}
      <div className={aboutStyles.stepWrapper}>
        <h2 className={aboutStyles.stepTitle}>
          Point Tokens — Track your progress
        </h2>
        <div className={aboutStyles.stepLayout}>
          <div className={aboutStyles.stepIllustration}>
            {tokenSources.map((row, ri) => (
              <div key={ri} className={aboutStyles.tokenRow}>
                {row.map((src, ci) => (
                  <img
                    key={ci}
                    loading="lazy"
                    className={aboutStyles.tokenImg}
                    style={{ transform: `rotate(${tokenRotations[ri][ci]}deg)` }}
                    src={src}
                    alt="point token"
                  />
                ))}
              </div>
            ))}
          </div>
          <div className={aboutStyles.stepTextContent}>
            <h3 className={aboutStyles.boldText}>
              Point tokens can be used to earn extra points during the game.
            </h3>
            <ul className={aboutStyles.bulletList}>
              <li>
                Anytime someone references something from a previous episode, place a
                Point Token on that Episode Card to earn an extra point.
              </li>
              <li>
                Just because someone else completed a Direction Card before you had a
                chance to speak, does not mean you lost your chance. Place a Point Token
                on the current Episode Card to earn an extra point and say what you
                wanted to say.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* TWO GOLDEN RULES */}
      <div className={aboutStyles.stepWrapper}>
        <h2 className={aboutStyles.stepTitle}>
          Two golden rules — Always keep these in mind
        </h2>
        <div className={aboutStyles.goldenRulesGrid}>
          <div className={aboutStyles.goldenRuleCard}>
            <div className={aboutStyles.ruleIllustration}>
              <img
                loading="lazy"
                src="/images/illustrations/rules/commentatorpoint2.svg"
                alt="everything must make sense"
              />
            </div>
            <div>
              <h3 className={aboutStyles.boldText}>Everything must somehow make sense.</h3>
              <ul className={aboutStyles.bulletList}>
                <li>
                  It does not matter how convoluted, far-fetched, or shoe-horned in
                  your story is. As long as it makes sense, it&apos;s okay.
                </li>
              </ul>
            </div>
          </div>
          <div className={aboutStyles.goldenRuleCard}>
            <div className={aboutStyles.ruleIllustration}>
              <img
                loading="lazy"
                src="/images/illustrations/rules/reveal2.svg"
                alt="yes and rule"
              />
            </div>
            <div>
              <h3 className={aboutStyles.boldText}>
                The golden improv rule of &quot;Yes, and...&quot;
              </h3>
              <ul className={aboutStyles.bulletList}>
                <li>
                  If something is said, it is true unless it directly contradicts
                  something else that was already said.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <DefaultButton
        className={`${aboutStyles.showRulesButtonBottom} ${aboutStyles.showSetupButtonBottom}`}
        variant="secondary"
        border="dark"
        icon="prev"
        onClick={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          toggleSteps();
        }}
        text="Back to game setup"
      />
    </div>
  );
};

export default Roleplay;
