import React, { useState } from "react";

import Card from "../../Card/Card.js";
import { getRandomTrait } from "../../Card/ExampleTraits.js";
import DefaultButton from "../../utils/DefaultButton.js";
import useWindowDimensions from "../../utils/useWindowDimensions.js";

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
      <div className="setupRulesButtonWrapper">
        <DefaultButton
          shadowless
          borderedBlack
          className={`showRulesButton ${showSetupClass}`}
          onClick={() => {
            setshowRules(false);
          }}
          text={setupButtonText}
        />
        <DefaultButton
          shadowless
          borderedBlack
          className={`showRulesButton ${showRulesClass}`}
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

//show the setup
const Setup = ({ showRules, setshowRules, cardStyle, toggleSteps }) => {
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
  ].sort((a, b) => 0.5 - Math.random());

  return (
    <div className={"allStepsContainer" + (!showRules ? " is-active" : "")}>
      {/* STEP 1 SETUP */}
      <div className="stepWrapper">
        <h2 className="stepTitle">Step 1</h2>
        <div className="stepBlockWrapper vertical">
          {/* MEMBERS TITLE */}
          <div className="stepBlockHorizontal">
            <div className="stepBlockFlex is-hidden-mobile">
              <img
                className="translateYDown iconImage is-hidden-mobile"
                src="/images/icons/darkperson.svg"
                alt="member icon"
              />
              <img
                className="translateYUp iconImage is-hidden-mobile"
                src="/images/icons/darkperson.svg"
                alt="member icon"
              />
              <img
                className="translateYDown iconImage is-hidden-mobile"
                src="/images/icons/darkperson.svg"
                alt="member icon"
              />
            </div>
            <Card {...cardProps} />
            <div className="stepBlockFlex">
              <div className="stepBlockVertical characterArcWrapperAbout">
                <div className={`characterArc ${randomTraits[0].type}Arc`}>
                  <div className="characterArcText">{randomTraits[0].text}</div>
                </div>
                <div className={`characterArc ${randomTraits[1].type}Arc`}>
                  <div className="characterArcText">{randomTraits[1].text}</div>
                </div>
                <div className={`characterArc ${randomTraits[2].type}Arc`}>
                  <div className="characterArcText">{randomTraits[2].text}</div>
                </div>
              </div>
              <div className="arrowWrapper">
                <img
                  className="arrowArc arrowTailSVG"
                  src="/images/icons/arrowtail.svg"
                  alt="part of the arrow"
                />
                <img
                  className="arrowArc arrowHeadSVG"
                  src="/images/icons/arrowhead.svg"
                  alt="part of the arrow"
                />
              </div>
            </div>
          </div>

          {/* MEMBERS PT 2 */}
          <div className="stepBlockHorizontal topAlign paddingTop evenWidthChildren">
            <div className="stepBlockLeft">
              <h2 className="boldText">
                Each player is given a random Character Card and three random
                Character Traits.
              </h2>
            </div>
            <div className="stepBlockRight">
              <div className="stepBlockVertical leftAlign">
                <li className="subtext">
                  Place your Character Card in the plastic card standee for all
                  to see.
                </li>
                <li className="subtext">
                  For Character Traits, every player receives one of each color
                  at random.
                </li>
                <li className="subtext">
                  Form your Character Arc by rearranging the order of your
                  Character Traits.
                </li>
              </div>
            </div>
          </div>

          {/* MEMBERS TITLE */}
          <div className="stepBlockHorizontal leftAlign paddingTopHalf">
            <img
              className="paddingRight iconImage"
              src="/images/icons/flag.svg"
              alt="flag icon"
            />
            <p className="subtext marginTop">
              The goal of the game is to score points. The higher you score, the
              better the ratings will be for your season. Fulfill as many
              Direction Cards as you can as a group and complete your Character
              Arcs to earn points.
            </p>
          </div>
        </div>
      </div>

      {/* STEP 2 SETUP */}
      <div className="stepWrapper">
        <h2 className="stepTitle">Step 2</h2>

        <div className="stepBlockWrapper vertical">
          <div className="stepBlockHorizontal">
            <div className="stepBlockLeft">
              <div className="stepBlockVertical">
                <div className="stepBlockHorizontal">
                  <img
                    className="translateYDown iconImage"
                    src="/images/icons/darkperson.svg"
                    alt="member icon"
                  />
                  <img
                    className="translateYUp iconImage"
                    src="/images/icons/darkperson.svg"
                    alt="member icon"
                  />
                  <img
                    className="translateYDown iconImage is-hidden-mobile"
                    src="/images/icons/darkperson.svg"
                    alt="member icon"
                  />
                </div>
              </div>
            </div>

            <div className="stepBlockVertical cardVertical">
              <img
                className="paddedBottomVertical cardImg"
                src="/images/illustrations/locationcard.webp"
                alt="episode cards"
              />
              <img
                className="paddedBottomVertical cardImg"
                src="/images/illustrations/directioncard0.webp"
                alt="direction cards"
              />
              <img
                className="paddedBottomVertical cardImg"
                src="/images/illustrations/directioncard1.webp"
                alt="direction cards"
              />
            </div>

            <div className="stepBlockRight paddless">
              <div className="stepBlockVertical">
                <div className="stepBlockHorizontal">
                  <img
                    className="translateYDown iconImage"
                    src="/images/icons/whiteperson.svg"
                    alt="commentator icon"
                  />
                  <img
                    className="translateYUp iconImage"
                    src="/images/icons/whiteperson.svg"
                    alt="commentator icon"
                  />
                  <img
                    className="translateYDown iconImage is-hidden-mobile"
                    src="/images/icons/whiteperson.svg"
                    alt="commentator icon"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="stepBlockHorizontal topAlign paddingTop evenWidthChildren">
            <div className="stepBlockLeft">
              <h2 className="boldText">
                Place the Episode Cards, Direction Cards, and Point Tokens in
                the center of the table.
              </h2>
            </div>
            <div className="stepBlockRight">
              <li className="subtext">
                Every player must be able to read the cards clearly so please
                sit accordingly.
              </li>
              <li className="subtext">
                Place a phone in clear view of everyone and set a timer for 3
                minutes.
              </li>
              <li className="subtext">
                Split the Direction Cards into two decks according to their
                point values.
              </li>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 3 SETUP */}
      <div className="stepWrapper">
        <h2 className="stepTitle">Step 3</h2>

        <div className="stepBlockWrapper vertical">
          <div className="stepBlockHorizontal">
            <Card {...cardProps} enableQuestionMark={false} />
            <img
              className="wideImage paddingLeft"
              src="/images/illustrations/rules/membertalk.svg"
              alt="members talking icon"
            />
          </div>

          <div className="stepBlockHorizontal topAlign paddingTop evenWidthChildren">
            <div className="stepBlockLeft">
              <h2 className="boldText">
                Starting with the oldest Character, all players introduce
                themselves.
              </h2>
            </div>
            <div className="stepBlockRight">
              <li className="subtext">
                Feel free to omit or replace any of the written character
                details as you see fit.
              </li>
              <li className="subtext">
                Make sure to also mention your Character Arc so others are aware
                of it.
              </li>
              <li className="subtext">
                Remember, this is your reality TV show debut!
              </li>
              <li className="subtext">
                Continue clockwise until all players have introduced themselves.
              </li>
            </div>
          </div>
        </div>
      </div>

      <p
        className="showRulesButtonBottom"
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

//show the rules
const Rules = ({ showRules, setshowRules, cardStyle }) => {
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
    <div className={"allStepsContainer" + (showRules ? " is-active" : "")}>
      {/* EPISODE CARD */}
      <div className="stepWrapper">
        <h2 className="stepTitle">Episode Cards</h2>

        <div className="stepBlockWrapper vertical">
          <div className="stepBlockHorizontal">
            <div className="stepBlockFlex">
              <Card {...goalCardStyle} />
            </div>
            <div className="stepBlockFlex">
              <img
                className="translateYDown iconImage paddingLeft"
                src="/images/icons/darkperson.svg"
                alt="member icon"
              />
              <img
                className="translateYUp iconImage"
                src="/images/icons/darkperson.svg"
                alt="member icon"
              />
              <img
                className="translateYDown iconImage is-hidden-mobile"
                src="/images/icons/darkperson.svg"
                alt="member icon"
              />
              <img
                className="translateYUp iconImage is-hidden-mobile"
                src="/images/icons/darkperson.svg"
                alt="member icon"
              />
              <img
                className="translateYDown iconImage is-hidden-mobile"
                src="/images/icons/darkperson.svg"
                alt="member icon"
              />
              <img
                className="translateYUp iconImage is-hidden-mobile"
                src="/images/icons/darkperson.svg"
                alt="member icon"
              />
            </div>
          </div>

          <div className="stepBlockHorizontal paddingTopHalf topAlign evenWidthChildren">
            <div className="stepBlockLeft leftAlign">
              <div className="stepBlockVertical leftAlign topAlign">
                <h2 className="boldText">
                  Flip over an Episode Card. This will be the location for
                  Episode One.
                </h2>
              </div>
            </div>
            <div className="stepBlockRight leftAlign">
              <li className="subtext">
                Every episode is one "round" of the game.
              </li>
              <li className="subtext">Each episode lasts three minutes.</li>
              <li className="subtext">You will play four episodes in total.</li>
              <li className="subtext">Do not start the timer just yet.</li>
            </div>
          </div>
        </div>
      </div>

      {/* DIRECTION CARDS */}
      <div className="stepWrapper">
        <h2 className="stepTitle">Direction Cards</h2>

        <div className="stepBlockWrapper vertical">
          <div className="stepBlockHorizontal paddingTopHalf evenWidthChildren topAlign">
            <div className="stepBlockLeft">
              <div className="stepBlockVertical leftAlign">
                <div className="stepBlockHorizontal">
                  <img
                    className="paddedBottomVertical cardImg halfCardImg"
                    src="/images/illustrations/directioncard0.webp"
                    alt="direction cards"
                  />
                  <img
                    className="paddedBottomVertical cardImg halfCardImg"
                    src="/images/illustrations/directioncard1.webp"
                    alt="direction cards"
                  />
                  <img
                    className="paddedBottomVertical cardImg halfCardImg"
                    src="/images/illustrations/directioncard2.webp"
                    alt="direction cards"
                  />
                </div>
                <div className="stepBlockHorizontal">
                  <img
                    className="paddedBottomVertical cardImg halfCardImg"
                    src="/images/illustrations/directioncard0.webp"
                    alt="direction cards"
                  />
                  <img
                    className="paddedBottomVertical cardImg halfCardImg"
                    src="/images/illustrations/directioncard1.webp"
                    alt="direction cards"
                  />
                  <img
                    className="paddedBottomVertical cardImg halfCardImg"
                    src="/images/illustrations/directioncard2.webp"
                    alt="direction cards"
                  />
                </div>
              </div>
            </div>
            <div className="stepBlockRight is-hidden-mobile">
              <div className="stepBlockVertical leftAlign">
                <div className="stepBlockVertical paddingBottomHalf">
                  <img
                    className="wideImage"
                    src="/images/illustrations/rules/commentatortalk.svg"
                    alt="commentators talking icon"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="stepBlockHorizontal paddingTopHalf evenWidthChildren topAlign">
            <div className="stepBlockLeft leftAlign">
              <div className="stepBlockVertical leftAlign topAlign">
                <h2 className="boldText">
                  Flip over three cards from both Direction Card decks. Six
                  total cards should be face up at all times.
                </h2>
              </div>
            </div>
            <div className="stepBlockRight leftAlign">
              <li className="subtext">
                The executives of the show are trying to instill chaos into the
                plot!
              </li>
              <li className="subtext">
                In three minutes, complete as many Direction Cards as you can as
                a group.
              </li>
              <li className="subtext">
                Each Direction Card is worth one or two points.
              </li>
              <li className="subtext">
                Replenish a card as soon as you complete it.
              </li>
            </div>
          </div>
        </div>
      </div>

      {/* POINT TOKENS */}
      <div className="stepWrapper">
        <h2 className="stepTitle">Point Tokens</h2>

        <div className="stepBlockWrapper vertical">
          <div className="stepBlockHorizontal paddingTopHalf evenWidthChildren topAlign">
            <div className="stepBlockLeft">
              <div className="stepBlockVertical leftAlign">
                <div className="stepBlockHorizontal">
                  <img
                    className="paddedBottomVertical translateYUp iconImage"
                    src="/images/icons/5point.png"
                    alt="point tokens"
                  />
                  <img
                    className="paddedBottomVertical translateYDown iconImage"
                    src="/images/icons/1point.png"
                    alt="point tokens"
                  />
                  <img
                    className="paddedBottomVertical translateYUp iconImage"
                    src="/images/icons/5point.png"
                    alt="point tokens"
                  />
                  <img
                    className="paddedBottomVertical translateYDown iconImage"
                    src="/images/icons/1point.png"
                    alt="point tokens"
                  />
                  <img
                    className="paddedBottomVertical translateYUp iconImage"
                    src="/images/icons/5point.png"
                    alt="point tokens"
                  />
                  <img
                    className="paddedBottomVertical translateYDown iconImage is-hidden-mobile"
                    src="/images/icons/1point.png"
                    alt="point tokens"
                  />
                </div>
              </div>
            </div>
            <div className="stepBlockRight is-hidden-mobile">
              <div className="stepBlockVertical leftAlign">
                <div className="stepBlockVertical paddingBottomHalf">
                  <img
                    className="wideImage"
                    src="/images/illustrations/rules/membertalk.svg"
                    alt="commentators talking icon"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="stepBlockHorizontal evenWidthChildren paddingTopHalf topAlign">
            <div className="stepBlockLeft leftAlign">
              <div className="stepBlockVertical leftAlign topAlign">
                <h2 className="boldText">
                  Point tokens can be used to earn extra points during the game.
                </h2>
              </div>
            </div>
            <div className="stepBlockRight leftAlign">
              <li className="subtext">
                Anytime someone references something from a previous episode,
                place a Point Token on that Episode Card to earn an extra point.
              </li>
              <li className="subtext">
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
      <div className="stepWrapper">
        <h2 className="stepTitle">Two golden rules</h2>

        <div className="stepBlockWrapper vertical">
          <div className="stepBlockHorizontal paddingTopHalf evenWidthChildren topAlign">
            <div className="stepBlockLeft">
              <div className="stepBlockVertical leftAlign">
                <div className="stepBlockVertical paddingBottomHalf">
                  <img
                    className="wideImage"
                    src="/images/illustrations/rules/commentatorpoint2.svg"
                    alt="commentators talking icon"
                  />
                </div>
              </div>
            </div>
            <div className="stepBlockRight is-hidden-mobile">
              <div className="stepBlockVertical leftAlign">
                <div className="stepBlockVertical paddingBottomHalf">
                  <img
                    className="wideImage"
                    src="/images/illustrations/rules/reveal2.svg"
                    alt="commentators talking icon"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="stepBlockHorizontal evenWidthChildren paddingTopHalf topAlign">
            <div className="stepBlockLeft leftAlign">
              <div className="stepBlockVertical leftAlign topAlign">
                <h2 className="boldText">
                  Everything must somehow make sense.
                </h2>
                <li className="subtext">
                  It does not matter how convoluted, far-fetched, or shoe-horned
                  in your story is. As long as it makes sense, it's okay.
                </li>
              </div>
            </div>
            <div className="stepBlockRight leftAlign">
              <h2 className="boldText">
                The golden improv rule of "Yes, and..."
              </h2>
              <li className="subtext">
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

export default Roleplay;
