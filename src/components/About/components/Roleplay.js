import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Card from '../../Card/Card.js';
import { getRandomTrait } from "../../Card/ExampleTraits.js";
import DefaultButton from '../../utils/DefaultButton.js';
import useWindowDimensions from '../../utils/useWindowDimensions.js';

const Roleplay = (props) => {
  const { t } = useTranslation();

  //sizing for about page card styles
  let cardStyle = props.cardStyle;

  //state to keep track of if we are showing game rules or game setup
  const [showRules, setshowRules] = useState(false);
  const toggleSteps = ()=> {
    setshowRules(!showRules);
  }

  const showRulesClass = (showRules) ? "is-active is-inverted" : "";
  const showSetupClass = (!showRules) ? "is-active is-inverted" : "";
  const setupButtonText = (showRules) ? `${t('about page.roleplay.setup.title')}` : `${t('about page.roleplay.setup.title')}`;
  const rulesButtonText = (showRules) ? `${t('about page.roleplay.rules.title')}` : `${t('about page.roleplay.rules.title')}`;

  return (
    <>
      <div className="setupRulesButtonWrapper">
        <DefaultButton shadowless borderedBlack className={`showRulesButton ${showSetupClass}`} onClick={()=>{setshowRules(false)}} text={setupButtonText} />
        <DefaultButton shadowless borderedBlack className={`showRulesButton ${showRulesClass}`} onClick={()=>{setshowRules(true)}} text={rulesButtonText} />
      </div>
      <Setup showRules={showRules} setshowRules={setshowRules} cardStyle={cardStyle} toggleSteps={toggleSteps} />
      <Rules showRules={showRules} setshowRules={setshowRules} cardStyle={cardStyle} />
    </>
  );
}

//show the setup
const Setup = ({showRules, setshowRules, cardStyle, toggleSteps}) => {
  const { t } = useTranslation();

  let cardProps = {
    type:"member",
    mainStyle:cardStyle,
    disableFlip: true,
    showFront: true,
    disableText: true,
    enableQuestionMark: true,
  }

  //random character traits
  let randomTraits = [{
    text: getRandomTrait("good"),
    type: "good",
  }, {
    text: getRandomTrait("bad"),
    type: "bad",
  }, {
    text: getRandomTrait("chaotic"),
    type: "chaotic",
  }].sort((a, b) => 0.5 - Math.random());

  return (
    <div className={"allStepsContainer" + ((!showRules) ? " is-active" : "")}>

      {/* STEP 1 SETUP */}
      <div className="stepWrapper">
        <h2 className="stepTitle">{t('about page.roleplay.setup.step1')}</h2>
        <div className="stepBlockWrapper vertical">

          {/* MEMBERS TITLE */}
          <div className="stepBlockHorizontal">
            <div className="stepBlockFlex">
              <img className="translateYDown iconImage is-hidden-mobile" src="/images/icons/darkperson.svg" alt="member icon" />
              <img className="translateYUp iconImage is-hidden-mobile" src="/images/icons/darkperson.svg" alt="member icon" />
              <img className="translateYDown iconImage paddingRight" src="/images/icons/darkperson.svg" alt="member icon" />
            </div>
            <Card {...cardProps}/>
            <div className="stepBlockFlex">
              <div className="stepBlockVertical characterArcWrapperAbout">
                <div className={`characterArc ${randomTraits[0].type}Arc`}>
                  <div className="characterArcText">{ randomTraits[0].text }</div>
                </div>
                <div className={`characterArc ${randomTraits[1].type}Arc`}>
                  <div className="characterArcText">{ randomTraits[1].text }</div>
                </div>
                <div className={`characterArc ${randomTraits[2].type}Arc`}>
                  <div className="characterArcText">{ randomTraits[2].text }</div>
                </div>
              </div>
              <div className="arrowWrapper">
                <img className="arrowArc arrowTailSVG" src="/images/icons/arrowtail.svg" alt="part of the arrow" />
                <img className="arrowArc arrowHeadSVG" src="/images/icons/arrowhead.svg" alt="part of the arrow" />
              </div>
            </div>
          </div>

          {/* MEMBERS PT 2 */}
          <div className="stepBlockHorizontal topAlign paddingTop evenWidthChildren">
            <div className="stepBlockLeft">
              <h2 className="boldText">{t('about page.roleplay.setup.step1m 1')}</h2>
            </div>
            <div className="stepBlockRight">
              <div className="stepBlockVertical leftAlign">
                <li className="subtext">{t('about page.roleplay.setup.step1m 3')}</li>
                <li className="subtext">{t('about page.roleplay.setup.step1m 4')}</li>
                <li className="subtext">{t('about page.roleplay.setup.step1m 5')}</li>
              </div>
            </div>
          </div>

          {/* MEMBERS TITLE */}
          <div className="stepBlockHorizontal leftAlign paddingTopHalf">
            <img className="paddingRight iconImage" src="/images/icons/flag.svg" alt="flag icon" />
            <p className="subtext marginTop">{t('about page.roleplay.setup.step1m 2')}</p>
          </div>
        </div>
      </div>

      {/* STEP 2 SETUP */}
      <div className="stepWrapper">
        <h2 className="stepTitle">{t('about page.step2')}</h2>

        <div className="stepBlockWrapper vertical">
          <div className="stepBlockHorizontal">

            <div className="stepBlockLeft">
              <div className="stepBlockVertical">
                <div className="stepBlockHorizontal">
                  <img className="translateYDown iconImage" src="/images/icons/darkperson.svg" alt="member icon" />
                  <img className="translateYUp iconImage" src="/images/icons/darkperson.svg" alt="member icon" />
                  <img className="translateYDown iconImage is-hidden-mobile" src="/images/icons/darkperson.svg" alt="member icon" />
                </div>
              </div>
            </div>

            <div className="stepBlockVertical cardVertical">
              <img className="paddedBottomVertical cardImg" src="/images/illustrations/episodecard.jpg" alt="episode cards" />
              <img className="paddedBottomVertical cardImg" src="/images/illustrations/directioncard.jpg" alt="direction cards" />
              <img className="paddedBottomVertical cardImg" src="/images/illustrations/directioncard.jpg" alt="direction cards" />
            </div>

            <div className="stepBlockRight paddless">
              <div className="stepBlockVertical">
                <div className="stepBlockHorizontal">
                  <img className="translateYDown iconImage" src="/images/icons/whiteperson.svg" alt="commentator icon" />
                  <img className="translateYUp iconImage" src="/images/icons/whiteperson.svg" alt="commentator icon" />
                  <img className="translateYDown iconImage is-hidden-mobile" src="/images/icons/whiteperson.svg" alt="commentator icon" />
                </div>
              </div>
            </div>
          </div>

          <div className="stepBlockHorizontal topAlign paddingTop evenWidthChildren">
            <div className="stepBlockLeft">
              <h2 className="boldText">{t('about page.roleplay.setup.step2 1')}</h2>
            </div>
            <div className="stepBlockRight">
              <li className="subtext">{t('about page.roleplay.setup.step2 2')}</li>
              <li className="subtext">{t('about page.roleplay.setup.step2 3')}</li>
              <li className="subtext">{t('about page.roleplay.setup.step2 4')}</li>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 3 SETUP */}
      <div className="stepWrapper">
        <h2 className="stepTitle">{t('about page.step3')}</h2>

        <div className="stepBlockWrapper vertical">
          <div className="stepBlockHorizontal">
            <Card {...cardProps} enableQuestionMark={false}/>
            <img className="wideImage paddingLeft" src="/images/illustrations/rules/membertalk.svg" alt="members talking icon"/>
          </div>

          <div className="stepBlockHorizontal topAlign paddingTop evenWidthChildren">
            <div className="stepBlockLeft">
              <h2 className="boldText">{t('about page.roleplay.setup.step3 1')}</h2>
            </div>
            <div className="stepBlockRight">
              <li className="subtext">{t('about page.roleplay.setup.step3 2')}</li>
              <li className="subtext">{t('about page.roleplay.setup.step3 3')}</li>
              <li className="subtext">{t('about page.roleplay.setup.step3 4')}</li>
              <li className="subtext">{t('about page.roleplay.setup.step3 5')}</li>
            </div>
          </div>
        </div>
      </div>

      <p
        className="showRulesButtonBottom"
        onClick={()=>{
          window.scrollTo({top:0,behavior:"smooth"});
          toggleSteps();
        }}
      >
        {t('about page.roleplay.setup.description2')}
      </p>

    </div>
  )
}

//show the rules
const Rules = ({showRules, setshowRules, cardStyle}) => {
  const { t } = useTranslation();
  let { width } = useWindowDimensions();

  const goalCardStyle = {
    type:"goal",
    disableFlip:true,
    showFront:true,
    mainStyle:{
      width:"150px",
      height:"100px",
      fontSize:"3.5px",
    }
  }

  if (width <= 900) {
    goalCardStyle.mainStyle.fontSize = "6px";
  }

  return (
    <div className={"allStepsContainer" + ((showRules) ? " is-active" : "")}>

      {/* EPISODE CARD */}
      <div className="stepWrapper">
        <h2 className="stepTitle">{t('about page.roleplay.rules.step1')}</h2>

        <div className="stepBlockWrapper vertical">

          <div className="stepBlockHorizontal">
            <div className="stepBlockFlex">
              <Card {...goalCardStyle} />
            </div>
            <div className="stepBlockFlex">
              <img className="translateYDown iconImage paddingLeft" src="/images/icons/darkperson.svg" alt="member icon" />
              <img className="translateYUp iconImage" src="/images/icons/darkperson.svg" alt="member icon" />
              <img className="translateYDown iconImage is-hidden-mobile" src="/images/icons/darkperson.svg" alt="member icon" />
              <img className="translateYUp iconImage is-hidden-mobile" src="/images/icons/darkperson.svg" alt="member icon" />
              <img className="translateYDown iconImage" src="/images/icons/darkperson.svg" alt="member icon" />
              <img className="translateYUp iconImage is-hidden-mobile" src="/images/icons/darkperson.svg" alt="member icon" />
            </div>
          </div>

          <div className="stepBlockHorizontal paddingTopHalf topAlign evenWidthChildren">
            <div className="stepBlockLeft leftAlign">
              <div className="stepBlockVertical leftAlign topAlign">
                <h2 className="boldText">{t('about page.roleplay.rules.step1 1')}</h2>
              </div>
            </div>
            <div className="stepBlockRight leftAlign">
              <li className="subtext">{t('about page.roleplay.rules.step1 2')}</li>
              <li className="subtext">{t('about page.roleplay.rules.step1 3')}</li>
              <li className="subtext">{t('about page.roleplay.rules.step1 4')}</li>
              <li className="subtext">{t('about page.roleplay.rules.step1 5')}</li>
            </div>
          </div>


        </div>
      </div>

      {/* DIRECTION CARDS */}
      <div className="stepWrapper">
        <h2 className="stepTitle">{t('about page.roleplay.rules.step2')}</h2>

        <div className="stepBlockWrapper vertical">

          <div className="stepBlockHorizontal paddingTopHalf evenWidthChildren topAlign">
            <div className="stepBlockLeft">
              <div className="stepBlockVertical leftAlign">
                <div className="stepBlockHorizontal">
                  <img className="paddedBottomVertical cardImg halfCardImg" src="/images/illustrations/directioncard.jpg" alt="direction cards" />
                  <img className="paddedBottomVertical cardImg halfCardImg" src="/images/illustrations/directioncard.jpg" alt="direction cards" />
                  <img className="paddedBottomVertical cardImg halfCardImg" src="/images/illustrations/directioncard.jpg" alt="direction cards" />
                </div>
                <div className="stepBlockHorizontal">
                  <img className="paddedBottomVertical cardImg halfCardImg" src="/images/illustrations/directioncard.jpg" alt="direction cards" />
                  <img className="paddedBottomVertical cardImg halfCardImg" src="/images/illustrations/directioncard.jpg" alt="direction cards" />
                  <img className="paddedBottomVertical cardImg halfCardImg" src="/images/illustrations/directioncard.jpg" alt="direction cards" />
                </div>
              </div>
            </div>
            <div className="stepBlockRight is-hidden-mobile">
              <div className="stepBlockVertical leftAlign">
                <div className="stepBlockVertical paddingBottomHalf">
                  <img className="wideImage" src="/images/illustrations/rules/commentatortalk.svg" alt="commentators talking icon"/>
                </div>
              </div>
            </div>
          </div>

          <div className="stepBlockHorizontal paddingTopHalf evenWidthChildren topAlign">
            <div className="stepBlockLeft leftAlign">
              <div className="stepBlockVertical leftAlign topAlign">
                <h2 className="boldText">{t('about page.roleplay.rules.step2 1')}</h2>
              </div>
            </div>
            <div className="stepBlockRight leftAlign">
              <li className="subtext">{t('about page.roleplay.rules.step2 2')}</li>
              <li className="subtext">{t('about page.roleplay.rules.step2 3')}</li>
              <li className="subtext">{t('about page.roleplay.rules.step2 4')}</li>
              <li className="subtext">{t('about page.roleplay.rules.step2 5')}</li>
            </div>
          </div>

        </div>
      </div>

      {/* POINT TOKENS */}
      <div className="stepWrapper">
        <h2 className="stepTitle">{t('about page.roleplay.rules.step3')}</h2>

        <div className="stepBlockWrapper vertical">

          <div className="stepBlockHorizontal paddingTopHalf evenWidthChildren topAlign">
            <div className="stepBlockLeft">
              <div className="stepBlockVertical leftAlign">
                <div className="stepBlockHorizontal">
                  <img className="paddedBottomVertical translateYUp iconImage" src="/images/icons/5point.png" alt="point tokens" />
                  <img className="paddedBottomVertical translateYDown iconImage" src="/images/icons/1point.png" alt="point tokens" />
                  <img className="paddedBottomVertical translateYUp iconImage" src="/images/icons/5point.png" alt="point tokens" />
                  <img className="paddedBottomVertical translateYDown iconImage" src="/images/icons/1point.png" alt="point tokens" />
                  <img className="paddedBottomVertical translateYUp iconImage" src="/images/icons/5point.png" alt="point tokens" />
                  <img className="paddedBottomVertical translateYDown iconImage" src="/images/icons/1point.png" alt="point tokens" />
                </div>
              </div>
            </div>
            <div className="stepBlockRight is-hidden-mobile">
              <div className="stepBlockVertical leftAlign">
                <div className="stepBlockVertical paddingBottomHalf">
                  <img className="wideImage" src="/images/illustrations/rules/membertalk.svg" alt="commentators talking icon"/>
                </div>
              </div>
            </div>
          </div>

          <div className="stepBlockHorizontal evenWidthChildren paddingTopHalf topAlign">
            <div className="stepBlockLeft leftAlign">
              <div className="stepBlockVertical leftAlign topAlign">
                <h2 className="boldText">{t('about page.roleplay.rules.step3 1')}</h2>
              </div>
            </div>
            <div className="stepBlockRight leftAlign">
              <li className="subtext">{t('about page.roleplay.rules.step3 2')}</li>
              <li className="subtext">{t('about page.roleplay.rules.step3 3')}</li>
            </div>
          </div>

        </div>
      </div>

      {/* OTHER RULES */}
      <div className="stepWrapper">
        <h2 className="stepTitle">{t('about page.roleplay.rules.step4')}</h2>

        <div className="stepBlockWrapper vertical">

          <div className="stepBlockHorizontal paddingTopHalf evenWidthChildren topAlign">
            <div className="stepBlockLeft">
              <div className="stepBlockVertical leftAlign">
                <div className="stepBlockVertical paddingBottomHalf">
                  <img className="wideImage" src="/images/illustrations/rules/commentatorpoint2.svg" alt="commentators talking icon"/>
                </div>
              </div>
            </div>
            <div className="stepBlockRight is-hidden-mobile">
              <div className="stepBlockVertical leftAlign">
                <div className="stepBlockVertical paddingBottomHalf">
                  <img className="wideImage" src="/images/illustrations/rules/reveal2.svg" alt="commentators talking icon"/>
                </div>
              </div>
            </div>
          </div>

          <div className="stepBlockHorizontal evenWidthChildren paddingTopHalf topAlign">
            <div className="stepBlockLeft leftAlign">
              <div className="stepBlockVertical leftAlign topAlign">
                <h2 className="boldText">{t('about page.roleplay.rules.step4 1')}</h2>
                <li className="subtext">{t('about page.roleplay.rules.step4 3')}</li>
              </div>
            </div>
            <div className="stepBlockRight leftAlign">
              <h2 className="boldText">{t('about page.roleplay.rules.step4 2')}</h2>
              <li className="subtext">{t('about page.roleplay.rules.step4 4')}</li>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Roleplay;
