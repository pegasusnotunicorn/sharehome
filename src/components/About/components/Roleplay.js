import { useState } from "react";
import Card from "../../Card/Card.js";
import { getRandomTrait } from "../../Card/ExampleTraits.js";
import DefaultButton from "../../utils/DefaultButton.js";
import useWindowDimensions from "../../utils/useWindowDimensions.js";
import PropTypes from "prop-types";
import aboutStyles from "../../../css/pages/aboutPage.module.css";

const Roleplay = (props) => {
  //sizing for about page card styles
  let cardStyle = props.cardStyle;

  //state to keep track of if we are showing game rules or game setup
  const [showRules, setshowRules] = useState(false);
  const toggleSteps = () => {
    setshowRules(!showRules);
  };

  const showRulesClass = showRules ? "is-active is-inverted" : "";
  const showSetupClass = !showRules ? "is-active is-inverted" : "";
  const setupButtonText = "Game setup ( < 5 min)";
  const rulesButtonText = "Game rules";

  return (
    <>
      <div className={aboutStyles.setupRulesButtonWrapper}>
        <DefaultButton
          shadowless
          borderedBlack
          className={`${aboutStyles.showRulesButton} ${showSetupClass}`}
          onClick={() => {
            setshowRules(false);
          }}
          text={setupButtonText}
        />
        <DefaultButton
          shadowless
          borderedBlack
          className={`${aboutStyles.showRulesButton} ${showRulesClass}`}
          onClick={() => {
            setshowRules(true);
          }}
          text={rulesButtonText}
        />
      </div>
      <Setup
        showRules={showRules}
        setshowRules={setshowRules}
        cardStyle={cardStyle}
        toggleSteps={toggleSteps}
      />
      <Rules
        showRules={showRules}
        setshowRules={setshowRules}
        cardStyle={cardStyle}
      />
    </>
  );
};

Roleplay.propTypes = {
  cardStyle: PropTypes.object.isRequired,
};

//show the setup
const Setup = ({ showRules, cardStyle, toggleSteps }) => {
  let cardProps = {
    type: "member",
    mainStyle: cardStyle,
    disableFlip: true,
    showFront: true,
    disableText: true,
    enableQuestionMark: true,
  };

  //random character traits
  let randomTraits = [
    {
      text: getRandomTrait("good"),
      type: "good",
    },
    {
      text: getRandomTrait("bad"),
      type: "bad",
    },
    {
      text: getRandomTrait("chaotic"),
      type: "chaotic",
    },
  ].sort(() => 0.5 - Math.random());

  return (
    <div className={`${aboutStyles.allStepsContainer}${!showRules ? " is-active" : ""}`}>
      {/* STEP 1 SETUP */}
      <div className={aboutStyles.stepWrapper}>
        <h2 className={aboutStyles.stepTitle}>Step 1</h2>
        <div className={`${aboutStyles.stepBlockWrapper} ${aboutStyles.vertical}`}>
          {/* MEMBERS TITLE */}
          <div className={aboutStyles.stepBlockHorizontal}>
            <div className={`${aboutStyles.stepBlockFlex} is-hidden-mobile`}>
              <img
                loading="lazy"
                className={`${aboutStyles.translateYDown} ${aboutStyles.iconImage} is-hidden-mobile`}
                src="/images/icons/darkperson.svg"
                alt="member icon"
              />
              <img
                loading="lazy"
                className={`${aboutStyles.translateYUp} ${aboutStyles.iconImage} is-hidden-mobile`}
                src="/images/icons/darkperson.svg"
                alt="member icon"
              />
              <img
                loading="lazy"
                className={`${aboutStyles.translateYDown} ${aboutStyles.iconImage} is-hidden-mobile`}
                src="/images/icons/darkperson.svg"
                alt="member icon"
              />
            </div>
            <Card {...cardProps} />
            <div className={aboutStyles.stepBlockFlex}>
              <div className={`${aboutStyles.stepBlockVertical} ${aboutStyles.characterArcWrapperAbout}`}>
                <div className={`${aboutStyles.characterArc} ${aboutStyles[`${randomTraits[0].type}Arc`]}`}>
                  <div className={aboutStyles.characterArcText}>{randomTraits[0].text}</div>
                </div>
                <div className={`${aboutStyles.characterArc} ${aboutStyles[`${randomTraits[1].type}Arc`]}`}>
                  <div className={aboutStyles.characterArcText}>{randomTraits[1].text}</div>
                </div>
                <div className={`${aboutStyles.characterArc} ${aboutStyles[`${randomTraits[2].type}Arc`]}`}>
                  <div className={aboutStyles.characterArcText}>{randomTraits[2].text}</div>
                </div>
              </div>
              <div className={aboutStyles.arrowWrapper}>
                <img
                  loading="lazy"
                  className={`${aboutStyles.arrowArc} ${aboutStyles.arrowTailSVG}`}
                  src="/images/icons/arrowtail.svg"
                  alt="part of the arrow"
                />
                <img
                  loading="lazy"
                  className={`${aboutStyles.arrowArc} ${aboutStyles.arrowHeadSVG}`}
                  src="/images/icons/arrowhead.svg"
                  alt="part of the arrow"
                />
              </div>
            </div>
          </div>

          {/* MEMBERS PT 2 */}
          <div className={`${aboutStyles.stepBlockHorizontal} ${aboutStyles.topAlign} ${aboutStyles.paddingTop} ${aboutStyles.evenWidthChildren}`}>
            <div className={aboutStyles.stepBlockLeft}>
              <h2 className={aboutStyles.boldText}>
                Each player is given a random Character Card and three random
                Character Traits.
              </h2>
            </div>
            <div className={aboutStyles.stepBlockRight}>
              <div className={`${aboutStyles.stepBlockVertical} ${aboutStyles.leftAlign}`}>
                <li className={aboutStyles.subtext}>
                  Place your Character Card in the plastic card standee for all
                  to see.
                </li>
                <li className={aboutStyles.subtext}>
                  For Character Traits, every player receives one of each color
                  at random.
                </li>
                <li className={aboutStyles.subtext}>
                  Form your Character Arc by rearranging the order of your
                  Character Traits.
                </li>
              </div>
            </div>
          </div>

          {/* MEMBERS TITLE */}
          <div className={`${aboutStyles.stepBlockHorizontal} ${aboutStyles.leftAlign} ${aboutStyles.paddingTopHalf}`}>
            <img
              loading="lazy"
              className={`${aboutStyles.paddingRight} ${aboutStyles.iconImage}`}
              src="/images/icons/flag.svg"
              alt="flag icon"
            />
            <p className={`${aboutStyles.subtext} ${aboutStyles.marginTop}`}>
              The goal of the game is to score points. The higher you score, the
              better the ratings will be for your season. Fulfill as many
              Direction Cards as you can as a group and complete your Character
              Arcs to earn points.
            </p>
          </div>
        </div>
      </div>

      {/* STEP 2 SETUP */}
      <div className={aboutStyles.stepWrapper}>
        <h2 className={aboutStyles.stepTitle}>Step 2</h2>

        <div className={`${aboutStyles.stepBlockWrapper} ${aboutStyles.vertical}`}>
          <div className={aboutStyles.stepBlockHorizontal}>
            <div className={aboutStyles.stepBlockLeft}>
              <div className={aboutStyles.stepBlockVertical}>
                <div className={aboutStyles.stepBlockHorizontal}>
                  <img
                    loading="lazy"
                    className={`${aboutStyles.translateYDown} ${aboutStyles.iconImage}`}
                    src="/images/icons/darkperson.svg"
                    alt="member icon"
                  />
                  <img
                    loading="lazy"
                    className={`${aboutStyles.translateYUp} ${aboutStyles.iconImage}`}
                    src="/images/icons/darkperson.svg"
                    alt="member icon"
                  />
                  <img
                    loading="lazy"
                    className={`${aboutStyles.translateYDown} ${aboutStyles.iconImage} is-hidden-mobile`}
                    src="/images/icons/darkperson.svg"
                    alt="member icon"
                  />
                </div>
              </div>
            </div>

            <div className={`${aboutStyles.stepBlockVertical} ${aboutStyles.cardVertical}`}>
              <img
                loading="lazy"
                className={`paddedBottomVertical ${aboutStyles.cardImg}`}
                src="/images/illustrations/locationcard.webp"
                alt="episode cards"
              />
              <img
                loading="lazy"
                className={`paddedBottomVertical ${aboutStyles.cardImg}`}
                src="/images/illustrations/directioncard0.webp"
                alt="direction cards"
              />
              <img
                loading="lazy"
                className={`paddedBottomVertical ${aboutStyles.cardImg}`}
                src="/images/illustrations/directioncard1.webp"
                alt="direction cards"
              />
            </div>

            <div className={`${aboutStyles.stepBlockRight} ${aboutStyles.paddless}`}>
              <div className={aboutStyles.stepBlockVertical}>
                <div className={aboutStyles.stepBlockHorizontal}>
                  <img
                    loading="lazy"
                    className={`${aboutStyles.translateYDown} ${aboutStyles.iconImage}`}
                    src="/images/icons/whiteperson.svg"
                    alt="commentator icon"
                  />
                  <img
                    loading="lazy"
                    className={`${aboutStyles.translateYUp} ${aboutStyles.iconImage}`}
                    src="/images/icons/whiteperson.svg"
                    alt="commentator icon"
                  />
                  <img
                    loading="lazy"
                    className={`${aboutStyles.translateYDown} ${aboutStyles.iconImage} is-hidden-mobile`}
                    src="/images/icons/whiteperson.svg"
                    alt="commentator icon"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={`${aboutStyles.stepBlockHorizontal} ${aboutStyles.topAlign} ${aboutStyles.paddingTop} ${aboutStyles.evenWidthChildren}`}>
            <div className={aboutStyles.stepBlockLeft}>
              <h2 className={aboutStyles.boldText}>
                Place the Episode Cards, Direction Cards, and Point Tokens in
                the center of the table.
              </h2>
            </div>
            <div className={aboutStyles.stepBlockRight}>
              <li className={aboutStyles.subtext}>
                Every player must be able to read the cards clearly so please
                sit accordingly.
              </li>
              <li className={aboutStyles.subtext}>
                Place a phone in clear view of everyone and set a timer for 3
                minutes.
              </li>
              <li className={aboutStyles.subtext}>
                Split the Direction Cards into two decks according to their
                point values.
              </li>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 3 SETUP */}
      <div className={aboutStyles.stepWrapper}>
        <h2 className={aboutStyles.stepTitle}>Step 3</h2>

        <div className={`${aboutStyles.stepBlockWrapper} ${aboutStyles.vertical}`}>
          <div className={aboutStyles.stepBlockHorizontal}>
            <Card {...cardProps} enableQuestionMark={false} />
            <img
              loading="lazy"
              className={`${aboutStyles.wideImage} ${aboutStyles.paddingLeft}`}
              src="/images/illustrations/rules/membertalk.svg"
              alt="members talking icon"
            />
          </div>

          <div className={`${aboutStyles.stepBlockHorizontal} ${aboutStyles.topAlign} ${aboutStyles.paddingTop} ${aboutStyles.evenWidthChildren}`}>
            <div className={aboutStyles.stepBlockLeft}>
              <h2 className={aboutStyles.boldText}>
                Starting with the oldest Character, all players introduce
                themselves.
              </h2>
            </div>
            <div className={aboutStyles.stepBlockRight}>
              <li className={aboutStyles.subtext}>
                Feel free to omit or replace any of the written character
                details as you see fit.
              </li>
              <li className={aboutStyles.subtext}>
                Make sure to also mention your Character Arc so others are aware
                of it.
              </li>
              <li className={aboutStyles.subtext}>
                Remember, this is your reality TV show debut!
              </li>
              <li className={aboutStyles.subtext}>
                Continue clockwise until all players have introduced themselves.
              </li>
            </div>
          </div>
        </div>
      </div>

      <p
        className={aboutStyles.showRulesButtonBottom}
        onClick={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          toggleSteps();
        }}
      >
        Sounds good! Take me to the game rules.
      </p>
    </div>
  );
};

Setup.propTypes = {
  showRules: PropTypes.bool.isRequired,
  cardStyle: PropTypes.object.isRequired,
  toggleSteps: PropTypes.func.isRequired,
};

//show the rules
const Rules = ({ showRules }) => {
  let { width } = useWindowDimensions();

  const goalCardStyle = {
    type: "goal",
    disableFlip: true,
    showFront: true,
    mainStyle: {
      width: "150px",
      height: "100px",
      fontSize: "3.5px",
    },
  };

  if (width <= 900) {
    goalCardStyle.mainStyle.fontSize = "6px";
  }

  return (
    <div className={`${aboutStyles.allStepsContainer}${showRules ? " is-active" : ""}`}>
      {/* EPISODE CARD */}
      <div className={aboutStyles.stepWrapper}>
        <h2 className={aboutStyles.stepTitle}>Episode Cards</h2>

        <div className={`${aboutStyles.stepBlockWrapper} ${aboutStyles.vertical}`}>
          <div className={aboutStyles.stepBlockHorizontal}>
            <div className={aboutStyles.stepBlockFlex}>
              <Card {...goalCardStyle} />
            </div>
            <div className={aboutStyles.stepBlockFlex}>
              <img
                loading="lazy"
                className={`${aboutStyles.translateYDown} ${aboutStyles.iconImage} ${aboutStyles.paddingLeft}`}
                src="/images/icons/darkperson.svg"
                alt="member icon"
              />
              <img
                loading="lazy"
                className={`${aboutStyles.translateYUp} ${aboutStyles.iconImage}`}
                src="/images/icons/darkperson.svg"
                alt="member icon"
              />
              <img
                loading="lazy"
                className={`${aboutStyles.translateYDown} ${aboutStyles.iconImage} is-hidden-mobile`}
                src="/images/icons/darkperson.svg"
                alt="member icon"
              />
              <img
                loading="lazy"
                className={`${aboutStyles.translateYUp} ${aboutStyles.iconImage} is-hidden-mobile`}
                src="/images/icons/darkperson.svg"
                alt="member icon"
              />
              <img
                loading="lazy"
                className={`${aboutStyles.translateYDown} ${aboutStyles.iconImage} is-hidden-mobile`}
                src="/images/icons/darkperson.svg"
                alt="member icon"
              />
              <img
                loading="lazy"
                className={`${aboutStyles.translateYUp} ${aboutStyles.iconImage} is-hidden-mobile`}
                src="/images/icons/darkperson.svg"
                alt="member icon"
              />
            </div>
          </div>

          <div className={`${aboutStyles.stepBlockHorizontal} ${aboutStyles.paddingTopHalf} ${aboutStyles.topAlign} ${aboutStyles.evenWidthChildren}`}>
            <div className={`${aboutStyles.stepBlockLeft} ${aboutStyles.leftAlign}`}>
              <div className={`${aboutStyles.stepBlockVertical} ${aboutStyles.leftAlign} ${aboutStyles.topAlign}`}>
                <h2 className={aboutStyles.boldText}>
                  Flip over an Episode Card. This will be the location for
                  Episode One.
                </h2>
              </div>
            </div>
            <div className={`${aboutStyles.stepBlockRight} ${aboutStyles.leftAlign}`}>
              <li className={aboutStyles.subtext}>
                Every episode is one &quot;round&quot; of the game.
              </li>
              <li className={aboutStyles.subtext}>Each episode lasts three minutes.</li>
              <li className={aboutStyles.subtext}>You will play four episodes in total.</li>
              <li className={aboutStyles.subtext}>Do not start the timer just yet.</li>
            </div>
          </div>
        </div>
      </div>

      {/* DIRECTION CARDS */}
      <div className={aboutStyles.stepWrapper}>
        <h2 className={aboutStyles.stepTitle}>Direction Cards</h2>

        <div className={`${aboutStyles.stepBlockWrapper} ${aboutStyles.vertical}`}>
          <div className={`${aboutStyles.stepBlockHorizontal} ${aboutStyles.paddingTopHalf} ${aboutStyles.evenWidthChildren} ${aboutStyles.topAlign}`}>
            <div className={aboutStyles.stepBlockLeft}>
              <div className={`${aboutStyles.stepBlockVertical} ${aboutStyles.leftAlign}`}>
                <div className={aboutStyles.stepBlockHorizontal}>
                  <img
                    loading="lazy"
                    className={`paddedBottomVertical ${aboutStyles.cardImg} ${aboutStyles.halfCardImg}`}
                    src="/images/illustrations/directioncard0.webp"
                    alt="direction cards"
                  />
                  <img
                    loading="lazy"
                    className={`paddedBottomVertical ${aboutStyles.cardImg} ${aboutStyles.halfCardImg}`}
                    src="/images/illustrations/directioncard1.webp"
                    alt="direction cards"
                  />
                  <img
                    loading="lazy"
                    className={`paddedBottomVertical ${aboutStyles.cardImg} ${aboutStyles.halfCardImg}`}
                    src="/images/illustrations/directioncard2.webp"
                    alt="direction cards"
                  />
                </div>
                <div className={aboutStyles.stepBlockHorizontal}>
                  <img
                    loading="lazy"
                    className={`paddedBottomVertical ${aboutStyles.cardImg} ${aboutStyles.halfCardImg}`}
                    src="/images/illustrations/directioncard0.webp"
                    alt="direction cards"
                  />
                  <img
                    loading="lazy"
                    className={`paddedBottomVertical ${aboutStyles.cardImg} ${aboutStyles.halfCardImg}`}
                    src="/images/illustrations/directioncard1.webp"
                    alt="direction cards"
                  />
                  <img
                    loading="lazy"
                    className={`paddedBottomVertical ${aboutStyles.cardImg} ${aboutStyles.halfCardImg}`}
                    src="/images/illustrations/directioncard2.webp"
                    alt="direction cards"
                  />
                </div>
              </div>
            </div>
            <div className={`${aboutStyles.stepBlockRight} is-hidden-mobile`}>
              <div className={`${aboutStyles.stepBlockVertical} ${aboutStyles.leftAlign}`}>
                <div className={`${aboutStyles.stepBlockVertical} ${aboutStyles.paddingBottomHalf}`}>
                  <img
                    loading="lazy"
                    className={aboutStyles.wideImage}
                    src="/images/illustrations/rules/commentatortalk.svg"
                    alt="commentators talking icon"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={`${aboutStyles.stepBlockHorizontal} ${aboutStyles.paddingTopHalf} ${aboutStyles.evenWidthChildren} ${aboutStyles.topAlign}`}>
            <div className={`${aboutStyles.stepBlockLeft} ${aboutStyles.leftAlign}`}>
              <div className={`${aboutStyles.stepBlockVertical} ${aboutStyles.leftAlign} ${aboutStyles.topAlign}`}>
                <h2 className={aboutStyles.boldText}>
                  Flip over three cards from both Direction Card decks. Six
                  total cards should be face up at all times.
                </h2>
              </div>
            </div>
            <div className={`${aboutStyles.stepBlockRight} ${aboutStyles.leftAlign}`}>
              <li className={aboutStyles.subtext}>
                The executives of the show are trying to instill chaos into the
                plot!
              </li>
              <li className={aboutStyles.subtext}>
                In three minutes, complete as many Direction Cards as you can as
                a group.
              </li>
              <li className={aboutStyles.subtext}>
                Each Direction Card is worth one or two points.
              </li>
              <li className={aboutStyles.subtext}>
                Replenish a card as soon as you complete it.
              </li>
            </div>
          </div>
        </div>
      </div>

      {/* POINT TOKENS */}
      <div className={aboutStyles.stepWrapper}>
        <h2 className={aboutStyles.stepTitle}>Point Tokens</h2>

        <div className={`${aboutStyles.stepBlockWrapper} ${aboutStyles.vertical}`}>
          <div className={`${aboutStyles.stepBlockHorizontal} ${aboutStyles.paddingTopHalf} ${aboutStyles.evenWidthChildren} ${aboutStyles.topAlign}`}>
            <div className={aboutStyles.stepBlockLeft}>
              <div className={`${aboutStyles.stepBlockVertical} ${aboutStyles.leftAlign}`}>
                <div className={aboutStyles.stepBlockHorizontal}>
                  <img
                    loading="lazy"
                    className={`paddedBottomVertical ${aboutStyles.translateYUp} ${aboutStyles.iconImage}`}
                    src="/images/icons/5point.png"
                    alt="point tokens"
                  />
                  <img
                    loading="lazy"
                    className={`paddedBottomVertical ${aboutStyles.translateYDown} ${aboutStyles.iconImage}`}
                    src="/images/icons/1point.png"
                    alt="point tokens"
                  />
                  <img
                    loading="lazy"
                    className={`paddedBottomVertical ${aboutStyles.translateYUp} ${aboutStyles.iconImage}`}
                    src="/images/icons/5point.png"
                    alt="point tokens"
                  />
                  <img
                    loading="lazy"
                    className={`paddedBottomVertical ${aboutStyles.translateYDown} ${aboutStyles.iconImage}`}
                    src="/images/icons/1point.png"
                    alt="point tokens"
                  />
                  <img
                    loading="lazy"
                    className={`paddedBottomVertical ${aboutStyles.translateYUp} ${aboutStyles.iconImage}`}
                    src="/images/icons/5point.png"
                    alt="point tokens"
                  />
                  <img
                    loading="lazy"
                    className={`paddedBottomVertical ${aboutStyles.translateYDown} ${aboutStyles.iconImage} is-hidden-mobile`}
                    src="/images/icons/1point.png"
                    alt="point tokens"
                  />
                </div>
              </div>
            </div>
            <div className={`${aboutStyles.stepBlockRight} is-hidden-mobile`}>
              <div className={`${aboutStyles.stepBlockVertical} ${aboutStyles.leftAlign}`}>
                <div className={`${aboutStyles.stepBlockVertical} ${aboutStyles.paddingBottomHalf}`}>
                  <img
                    loading="lazy"
                    className={aboutStyles.wideImage}
                    src="/images/illustrations/rules/membertalk.svg"
                    alt="commentators talking icon"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={`${aboutStyles.stepBlockHorizontal} ${aboutStyles.evenWidthChildren} ${aboutStyles.paddingTopHalf} ${aboutStyles.topAlign}`}>
            <div className={`${aboutStyles.stepBlockLeft} ${aboutStyles.leftAlign}`}>
              <div className={`${aboutStyles.stepBlockVertical} ${aboutStyles.leftAlign} ${aboutStyles.topAlign}`}>
                <h2 className={aboutStyles.boldText}>
                  Point tokens can be used to earn extra points during the game.
                </h2>
              </div>
            </div>
            <div className={`${aboutStyles.stepBlockRight} ${aboutStyles.leftAlign}`}>
              <li className={aboutStyles.subtext}>
                Anytime someone references something from a previous episode,
                place a Point Token on that Episode Card to earn an extra point.
              </li>
              <li className={aboutStyles.subtext}>
                Just because someone else completed a Direction Card before you
                had a chance to speak, does not mean you lost your chance. Place
                a Point Token on the current Episode Card to earn an extra point
                and say what you wanted to say.
              </li>
            </div>
          </div>
        </div>
      </div>

      {/* OTHER RULES */}
      <div className={aboutStyles.stepWrapper}>
        <h2 className={aboutStyles.stepTitle}>Two golden rules</h2>

        <div className={`${aboutStyles.stepBlockWrapper} ${aboutStyles.vertical}`}>
          <div className={`${aboutStyles.stepBlockHorizontal} ${aboutStyles.paddingTopHalf} ${aboutStyles.evenWidthChildren} ${aboutStyles.topAlign}`}>
            <div className={aboutStyles.stepBlockLeft}>
              <div className={`${aboutStyles.stepBlockVertical} ${aboutStyles.leftAlign}`}>
                <div className={`${aboutStyles.stepBlockVertical} ${aboutStyles.paddingBottomHalf}`}>
                  <img
                    loading="lazy"
                    className={aboutStyles.wideImage}
                    src="/images/illustrations/rules/commentatorpoint2.svg"
                    alt="commentators talking icon"
                  />
                </div>
              </div>
            </div>
            <div className={`${aboutStyles.stepBlockRight} is-hidden-mobile`}>
              <div className={`${aboutStyles.stepBlockVertical} ${aboutStyles.leftAlign}`}>
                <div className={`${aboutStyles.stepBlockVertical} ${aboutStyles.paddingBottomHalf}`}>
                  <img
                    loading="lazy"
                    className={aboutStyles.wideImage}
                    src="/images/illustrations/rules/reveal2.svg"
                    alt="commentators talking icon"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={`${aboutStyles.stepBlockHorizontal} ${aboutStyles.evenWidthChildren} ${aboutStyles.paddingTopHalf} ${aboutStyles.topAlign}`}>
            <div className={`${aboutStyles.stepBlockLeft} ${aboutStyles.leftAlign}`}>
              <div className={`${aboutStyles.stepBlockVertical} ${aboutStyles.leftAlign} ${aboutStyles.topAlign}`}>
                <h2 className={aboutStyles.boldText}>
                  Everything must somehow make sense.
                </h2>
                <li className={aboutStyles.subtext}>
                  It does not matter how convoluted, far-fetched, or shoe-horned
                  in your story is. As long as it makes sense, it&apos;s okay.
                </li>
              </div>
            </div>
            <div className={`${aboutStyles.stepBlockRight} ${aboutStyles.leftAlign}`}>
              <h2 className={aboutStyles.boldText}>
                The golden improv rule of &quot;Yes, and...&quot;
              </h2>
              <li className={aboutStyles.subtext}>
                If something is said, it is true unless it directly contradicts
                something else that was already said.
              </li>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Rules.propTypes = {
  showRules: PropTypes.bool.isRequired,
};

export default Roleplay;
