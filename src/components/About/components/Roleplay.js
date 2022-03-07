import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import RepeatFrom1 from '../utils/RepeatFrom1.js';
import DefaultButton from '../../utils/DefaultButton.js';

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

  return (
    <div className={"allStepsContainer" + ((!showRules) ? " is-active" : "")}>

      {/* STEP 1 SETUP */}
      <div className="stepWrapper">
        <h2 className="stepTitle">{t('about page.step1')}</h2>

        <div className="stepBlockWrapper vertical">
          <div className="stepBlockHorizontal">

            <div className="stepBlockLeft">
              <div className="stepBlockVertical">
                <div className="stepBlockHorizontal">
                  <img className="translateYDown" src="/images/icons/darkperson.svg" alt="member icon" />
                  <img className="translateYUp" src="/images/icons/darkperson.svg" alt="member icon" />
                  <img className="translateYDown is-hidden-mobile" src="/images/icons/darkperson.svg" alt="member icon" />
                </div>
                <p className="boldText marginTop">{t('about page.roleplay.members')}</p>
              </div>
            </div>

            <div className="stepBlockRight">
              <div className="stepBlockVertical">
                <div className="stepBlockHorizontal">
                  <img className="translateYDown" src="/images/icons/whiteperson.svg" alt="commentator icon" />
                  <img className="translateYUp" src="/images/icons/whiteperson.svg" alt="commentator icon" />
                  <img className="translateYDown is-hidden-mobile" src="/images/icons/whiteperson.svg" alt="commentator icon" />
                </div>
                <p className="boldText marginTop">{t('about page.roleplay.commentators')}</p>
              </div>
            </div>
          </div>

          <div className="stepBlockHorizontal topAlign paddingTop evenWidthChildren">
            <div className="stepBlockLeft">
              <h2 className="boldText">{t('about page.roleplay.setup.step1 1')}</h2>
            </div>
            <div className="stepBlockRight">
              <li className="subtext">{t('about page.roleplay.setup.step1 2')}</li>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 2 SETUP */}
      <div className="stepWrapper">
        <h2 className="stepTitle">{t('about page.roleplay.setup.step2')}</h2>
        <div className="stepBlockWrapper vertical">

          {/* MEMBERS TITLE */}
          <div className="stepBlockHorizontal leftAlign paddingTop">
            <img className="paddingRight" src="/images/icons/darkperson.svg" alt="member icon" />
            <h4 className="boldText">{t('about page.roleplay.members')}</h4>
          </div>

          {/* MEMBERS PT 2 */}
          <div className="stepBlockHorizontal topAlign paddingTop evenWidthChildren">
            <div className="stepBlockLeft">
              <h2 className="boldText">{t('about page.roleplay.setup.step2m 1')}</h2>
            </div>
            <div className="stepBlockRight">
              <div className="stepBlockVertical leftAlign">
                <li className="subtext">{t('about page.roleplay.setup.step2m 3')}</li>
                <li className="subtext">{t('about page.roleplay.setup.step2m 4')}</li>
                <div className="stepBlockHorizontal paddingTopHalf">
                  <img className="smallImage paddingRight" src="/images/icons/flag.svg" alt="flag icon" />
                  <p className="subtext marginTop">{t('about page.roleplay.setup.step2m 2')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="stepBlockDividerHorizontal"></div>

          {/* COMMENTATORS TITLE */}
          <div className="stepBlockHorizontal leftAlign paddingTop">
            <img className="paddingRight" src="/images/icons/whiteperson.svg" alt="commentator icon"/>
            <h4 className="boldText">{t('about page.roleplay.commentators')}</h4>
          </div>

          {/* COMMENTATORS PT 2 */}
          <div className="stepBlockHorizontal topAlign paddingTop evenWidthChildren">
            <div className="stepBlockLeft">
              <h2 className="boldText">{t('about page.roleplay.setup.step2c 1')}</h2>
            </div>
            <div className="stepBlockRight">
              <div className="stepBlockVertical leftAlign">
                <li className="subtext">{t('about page.roleplay.setup.step2c 3')}</li>
                <li className="subtext">{t('about page.roleplay.setup.step2c 4')}</li>
                <div className="stepBlockHorizontal paddingTopHalf">
                  <img className="smallImage paddingRight" src="/images/icons/flag.svg" alt="flag icon"/>
                  <p className="subtext">{t('about page.roleplay.setup.step2c 2')}</p>
                </div>
              </div>
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

  return (
    <div className={"allStepsContainer" + ((showRules) ? " is-active" : "")}>

      {/* INTRODUCTION ROUND*/}
      <div className="stepWrapper">
        <h2 id="step1" className="stepTitle">{t('about page.roleplay.rules.step1')}</h2>
        <div className="stepBlockWrapper vertical">

          <div className="stepBlockVertical leftAlign">
            <h2 className="boldText">{t('about page.roleplay.rules.step1 t')}</h2>
          </div>

          <div className="stepBlockHorizontal paddingTopHalf evenWidthChildren topAlign">
            <div className="stepBlockLeft">
              <div className="stepBlockVertical leftAlign">
                <div className="stepBlockVertical leftAlign topAlign">
                  <p>{t('about page.roleplay.rules.step1 1')}</p>
                </div>
                <div className="stepBlockVertical paddingTopHalf">
                  <img className="wideImage" src="/images/icons/membertalk.svg" alt="members talking icon"/>
                </div>
              </div>
            </div>
            <div className="stepBlockRight">
              <div className="stepBlockVertical leftAlign">
                <div className="stepBlockVertical leftAlign topAlign">
                  <p>{t('about page.roleplay.rules.step1 2')}</p>
                </div>
                <div className="stepBlockVertical paddingTopHalf">
                  <img className="wideImage" src="/images/icons/memberpoint.svg" alt="members talking icon"/>
                </div>
              </div>
            </div>
          </div>

          <div className="stepBlockVertical paddingTop leftAlign">
            <li className="subtext">{t('about page.roleplay.rules.step1 3')}</li>
            <li className="subtext">{t('about page.roleplay.rules.step1 4')}</li>
            <li className="subtext">{t('about page.roleplay.rules.step1 5')}</li>
          </div>

        </div>
      </div>

      {/* COMMENTATOR ROUND */}
      <div className="stepWrapper">
        <h2 className="stepTitle">{t('about page.roleplay.rules.step2')}</h2>

        <div className="stepBlockWrapper vertical">

          <div className="stepBlockVertical leftAlign">
            <h2 className="boldText">{t('about page.roleplay.rules.step2 t')}</h2>
          </div>

          <div className="stepBlockHorizontal paddingTopHalf evenWidthChildren topAlign">
            <div className="stepBlockLeft">
              <div className="stepBlockVertical leftAlign">
                <div className="stepBlockVertical leftAlign topAlign">
                  <p>{t('about page.roleplay.rules.step2 1')}</p>
                </div>
                <div className="stepBlockVertical paddingTopHalf">
                  <img className="wideImage" src="/images/icons/commentatortalk.svg" alt="members talking icon"/>
                </div>
              </div>
            </div>
            <div className="stepBlockRight">
              <div className="stepBlockVertical leftAlign">
                <div className="stepBlockVertical leftAlign topAlign">
                  <p>{t('about page.roleplay.rules.step2 2')}</p>
                </div>
                <div className="stepBlockVertical paddingTopHalf">
                  <img className="wideImage" src="/images/icons/commentatorpoint.svg" alt="members talking icon"/>
                </div>
              </div>
            </div>
          </div>

          <div className="stepBlockVertical paddingTop leftAlign">
            <li className="subtext">{t('about page.roleplay.rules.step2 3')}</li>
            <li className="subtext">{t('about page.roleplay.rules.step2 4')}</li>
          </div>

        </div>
      </div>

      {/* EVENT ROUND */}
      <div className="stepWrapper">
        <h2 className="stepTitle">{t('about page.roleplay.rules.step3')}</h2>

        <div className="stepBlockWrapper vertical">

          <div className="stepBlockVertical leftAlign">
            <h2 className="boldText">{t('about page.roleplay.rules.step3 t')}<span className='likeMode'>{t('about page.roleplay.rules.step3span')}</span></h2>
            <p>{t('about page.roleplay.rules.step3 1')}</p>
          </div>

          <div className="stepBlockHorizontal paddingTop evenWidthChildren topAlign">
            <div className="stepBlockLeft">
              <div className="stepBlockVertical leftAlign">
                <p className="marginTop">{t('about page.roleplay.rules.step3 2')}</p>
              </div>
            </div>
            <div className="stepBlockRight">
              <div className="stepBlockVertical leftAlign">
                <li className="subtext">{t('about page.roleplay.rules.step3 3')}</li>
              </div>
            </div>
          </div>

          <div className="stepBlockDividerHorizontal"></div>

          <div className="stepBlockVertical leftAlign paddingTop">
            <h2 className="boldText">{t('about page.roleplay.rules.step4 t')}<span className='hateMode'>{t('about page.roleplay.rules.step4span')}</span></h2>
            <p>{t('about page.roleplay.rules.step4 1')}</p>
          </div>

          <div className="stepBlockHorizontal paddingTop evenWidthChildren topAlign">
            <div className="stepBlockLeft">
              <div className="stepBlockVertical leftAlign">
                <p className="marginTop">{t('about page.roleplay.rules.step3 2')}</p>
              </div>
            </div>
            <div className="stepBlockRight">
              <div className="stepBlockVertical leftAlign">
                <li className="subtext">{t('about page.roleplay.rules.step3 3')}</li>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="stepWrapper">
        <h2 className="stepTitle">{t('about page.roleplay.rules.step5')}</h2>

          <div className="stepBlockWrapper vertical">
            <div className="stepBlockVertical leftAlign">
              <h2 className="boldText">{t('about page.roleplay.rules.step5 t')}</h2>
              <p>{t('about page.roleplay.rules.step5 1')}</p>
              <p className="marginTop">{t('about page.roleplay.rules.step5 1p')}</p>
            </div>

            <div className="stepBlockVertical paddingTop">
              <img className="wideImage" src="/images/icons/reveal.svg" alt="reveal icon" />
            </div>

            <div className="stepBlockVertical paddingTop leftAlign topAlign">
              <p className="marginTop">{t('about page.roleplay.rules.step5 2')}</p>
            </div>

          </div>
      </div>

      <div className="stepWrapper">
        <h2 className="stepTitle">{t('about page.roleplay.rules.step6')}</h2>

          <div className="stepBlockWrapper vertical">
            <div className="stepBlockVertical leftAlign">
              <h2 className="boldText">{t('about page.roleplay.rules.step6 t')}</h2>
            </div>

            <div className="stepBlockHorizontal paddingTopHalf evenWidthChildren topAlign">
              <div className="stepBlockLeft">
                <div className="stepBlockVertical leftAlign">
                  <div className="stepBlockVertical leftAlign topAlign">
                    <p>{t('about page.roleplay.rules.step6 1')}</p>
                  </div>
                  <div className="stepBlockVertical paddingTopHalf">
                    <img className="wideImage" src="/images/icons/goalgrad.svg" alt="reveal icon" />
                  </div>
                </div>
              </div>
              <div className="stepBlockRight">
                <div className="stepBlockVertical leftAlign">
                  <div className="stepBlockVertical leftAlign topAlign">
                    <p>{t('about page.roleplay.rules.step6 2')}</p>
                  </div>
                  <div className="stepBlockVertical paddingTopHalf">
                    <img className="wideImage" src="/images/icons/couplegrad.svg" alt="reveal icon" />
                  </div>
                </div>
              </div>
            </div>

            <div className="stepBlockVertical paddingTop leftAlign topAlign">
              <p>{t('about page.roleplay.rules.step6 3')}</p>
              <RepeatFrom1 className="marginTopDbl"></RepeatFrom1>
            </div>


          </div>
      </div>


    </div>
  )
}

export default Roleplay;
