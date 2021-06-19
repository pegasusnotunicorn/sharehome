import React, { useState } from 'react';
import Card from '../../Card/Card.js';
import { ChevronDown, User, Users, UserPlus, ArrowRight, ArrowUpCircle, ArrowRightCircle, ArrowLeftCircle, MessageSquare, TrendingUp, TrendingDown, Home, Wind, Heart} from 'react-feather';
import { useTranslation } from 'react-i18next';

import RepeatFrom1 from '../utils/RepeatFrom1.js';

import '../../../css/about.css';

const Roleplay = (props) => {
  const { t } = useTranslation();

  //sizing for about page card styles
  let cardStyle = props.cardStyle;

  //state to keep track of if we are showing game rules or game setup
  const [showRules, setshowRules] = useState(false);
  const toggleSteps = ()=> {
    setshowRules(!showRules);
  }

  return (
    <>
      <h2 className="subtitle">{(!showRules) ? t('about page.roleplay.setup.title') : t('about page.roleplay.rules.title')}</h2>
      <p className="showRulesButton noselect" onClick={toggleSteps}>{(showRules) ? t('about page.roleplay.rules.description') : t('about page.roleplay.setup.description')}</p>

      <div className={"stepsContainer" + ((!showRules) ? " is-active" : "")}>

        <div className="stepWrapper">
          <h2 className="subtitle">{t('about page.step1')}</h2>
          <p>
            {t('about page.roleplay.setup.step1 1')}
          </p>
          <div className="illustrationWrapperCenter">
            <div>
              <Users className="greenStroke is-flipped" />
              <Users className="greenStroke is-flipped" />
              <Users className="greenStroke is-flipped" />
            </div>
            <div>
              <Users className="yellowStroke" />
              <Users className="yellowStroke" />
              <Users className="yellowStroke" />
            </div>
          </div>
          <li className="subtext">
            {t('about page.roleplay.setup.step1 2')}
          </li>
        </div>

        <div className="stepSplitterLine"><ChevronDown className="is-48" /></div>

        <div className="stepWrapperSplit">

          <div className="stepWrapper">
            <h2 className="subtitle">{t('about page.roleplay.setup.step2m')}</h2>
            <p>
              {t('about page.roleplay.setup.step2m 1')}
            </p>
            <div className="illustrationWrapperCenter">
              <div className="illustrationCardWrapper">
                <Card
                  type="member"
                  showFront={false}
                  disableFlip={true}
                  hideFront={true}
                  mainStyle={{...cardStyle, marginRight:"10px"}}
                />
                <Card
                  type="goal"
                  showFront={false}
                  disableFlip={true}
                  hideFront={true}
                  mainStyle={{...cardStyle, marginRight:"10px"}}
                />
                <ArrowUpCircle />
                <ArrowUpCircle />
              </div>
              <ArrowRight />
              <div>
                <Users className="greenStroke" />
              </div>
            </div>
            <p>
              {t('about page.roleplay.setup.step2m 2')}
            </p>
            <li className="subtext">
              {t('about page.roleplay.setup.step2m 3')}
            </li>
            <li className="subtext">
              {t('about page.roleplay.setup.step2m 4')}
            </li>
          </div>

          <div className="stepWrapper">
            <h2 className="subtitle">{t('about page.roleplay.setup.step2c')}</h2>
            <p>
              {t('about page.roleplay.setup.step2c 1')}
            </p>
            <div className="illustrationWrapperCenter">
              <div className="illustrationCardWrapper">
                <Card
                  type="commentator"
                  showFront={false}
                  hideFront={true}
                  disableFlip={true}
                  mainStyle={{...cardStyle, marginRight:"10px"}}
                />
                <ArrowUpCircle style={{marginRight:"10px"}}/>
              </div>
              <ArrowRight />
              <div>
                <Users className="yellowStroke" />
                <Users className="yellowStroke" />
              </div>
            </div>
            <p>
              {t('about page.roleplay.setup.step2c 2')}
            </p>
            <li className="subtext">
              {t('about page.roleplay.setup.step2c 3')}
            </li>
            <li className="subtext">
              {t('about page.roleplay.setup.step2c 4')}
            </li>
          </div>

        </div>

        <p
          className="showRulesButton noselect"
          onClick={()=>{
            window.scrollTo({top:0,behavior:"smooth"});
            toggleSteps();
          }}
        >
          {t('about page.roleplay.setup.description2')}
        </p>

      </div>

      <div className={"stepsContainer" + ((showRules) ? " is-active" : "")}>

        <div className="stepWrapper">
          <h2 id="step1" className="subtitle">{t('about page.roleplay.rules.step1')}</h2>
          <p>
            {t('about page.roleplay.rules.step1 1')}
          </p>
          <div className="illustrationWrapperCenter">
            <div>
              <User className="greenStroke"/>
              <MessageSquare style={{marginLeft:"10px"}} />
            </div>
            <div>
              <User />
              <Users />
              <Users />
            </div>
          </div>
          <p>
            {t('about page.roleplay.rules.step1 2')}
          </p>
          <div className="illustrationWrapperCenter">
            <User className="greenStroke"/>
            <ArrowRightCircle className="greenStroke" />
            <User className="greenStroke"/>
            <ArrowLeftCircle className="redStroke" />
            <User className="greenStroke"/>
          </div>
          <li className="subtext">
            {t('about page.roleplay.rules.step1 3')}
          </li>
        </div>

        <div className="stepSplitterLine"><ChevronDown className="is-48" /></div>

        <div className="stepWrapper">
          <h2 className="subtitle">{t('about page.roleplay.rules.step2')}</h2>
          <p>
            {t('about page.roleplay.rules.step2 1')}
          </p>
          <div className="illustrationWrapperCenter">
            <div>
              <Users className="greenStroke is-flipped" />
              <Users className="greenStroke is-flipped" />
              <Users className="greenStroke is-flipped" />
            </div>
            <div>
              <MessageSquare style={{marginRight:"10px"}} className="is-flipped" />
              <Users className="yellowStroke" />
              <Users className="yellowStroke" />
              <Users className="yellowStroke" />
            </div>
          </div>
          <p>
            {t('about page.roleplay.rules.step2 2')}
          </p>
          <div className="illustrationWrapperCenter">
            <div>
              <User  className="greenStroke" style={{marginRight:"10px"}} />
              <ArrowRightCircle className="greenStroke" style={{marginRight:"10px"}} />
              <User className="greenStroke" />
            </div>
            <User className="yellowStroke"/>
          </div>
          <li className="subtext">
            {t('about page.roleplay.rules.step2 3')}
          </li>
        </div>

        <div className="stepSplitterLine"><ChevronDown className="is-48" /></div>

        <div className="stepWrapperSplit">

          <div className="stepWrapper">
            <h2 className="subtitle">{t('about page.roleplay.rules.step3')}<span className='green'>{t('about page.roleplay.rules.step3span')}</span></h2>
            <p>
              {t('about page.roleplay.rules.step3 1')}
            </p>
            <div className="illustrationWrapperCenter">
              <User />
              <ArrowRightCircle className="greenStroke" />
              <div>
                <User />
                <TrendingUp />
              </div>
              <ArrowLeftCircle className="greenStroke" />
              <User />
            </div>
            <p>
              {t('about page.roleplay.rules.step3 2')}
            </p>
            <li className="subtext">
              {t('about page.roleplay.rules.step3 3')}
            </li>
            <div className="illustrationWrapperCenter">
              <div className="illustrationCardWrapper">
                <User style={{marginRight:"10px"}}/>
                <Card
                  type="event"
                  hideFront={true}
                  showFront={false}
                  disableFlip={true}
                  mainStyle={cardStyle}
                />
              </div>
              <ArrowRight />
              <div>
                <User />
                <Users />
                <Users />
              </div>
            </div>
          </div>

          <div className="stepWrapper">
            <h2 className="subtitle">{t('about page.roleplay.rules.step4')}<span className='red'>{t('about page.roleplay.rules.step4span')}</span></h2>
            <p>
              {t('about page.roleplay.rules.step4 1')}
            </p>
            <div className="illustrationWrapperCenter">
              <User />
              <ArrowRightCircle className="redStroke" />
              <div>
                <User />
                <TrendingDown />
              </div>
              <ArrowLeftCircle className="redStroke" />
              <User />
            </div>
            <p>
              {t('about page.roleplay.rules.step4 2')}
            </p>
            <li className="subtext">
              {t('about page.roleplay.rules.step4 3')}
            </li>
            <div className="illustrationWrapperCenter">
              <div className="illustrationCardWrapper">
                <User style={{marginRight:"10px"}}/>
                <Card
                  type="event"
                  hideFront={true}
                  showFront={false}
                  disableFlip={true}
                  mainStyle={cardStyle}
                />
              </div>
              <ArrowRight />
              <div>
                <User />
                <Users />
                <Users />
              </div>
            </div>
          </div>

        </div>

        <div className="stepSplitterLine"><ChevronDown className="is-48" /></div>

        <div className="stepWrapperSplit">

          <div className="stepWrapper greenBorder">
            <h2 className="subtitle">{t('about page.roleplay.rules.step5')}</h2>
            <p>
              {t('about page.roleplay.rules.step5 1')}
            </p>
            <div className="illustrationWrapperCenter">
              <div>
                <Users className="is-flipped" />
                <Users className="is-flipped" />
              </div>
              <Home />
              <div>
                <User style={{marginRight:"10px"}} />
                <MessageSquare className="is-flipped" style={{marginRight:"10px"}} />
                <User />
              </div>
            </div>
            <p>
              {t('about page.roleplay.rules.step5 2')}
            </p>
            <div className="illustrationWrapperCenter">
              <div>
                <User style={{marginRight:"10px"}}/>
                <ArrowRightCircle className="greenStroke" style={{marginRight:"10px"}}/>
                <User />
              </div>
              <div>
                <UserPlus className="yellowStroke" />
                <UserPlus className="greenStroke" />
                <UserPlus className="greenStroke" />
              </div>
            </div>
            <p>
              {t('about page.roleplay.rules.step5 3')}
            </p>
          </div>

          <div className="stepWrapper">
            <h2 className="subtitle">{t('about page.roleplay.rules.step6')}</h2>
            <p>
              {t('about page.roleplay.rules.step6 1')}
            </p>
            <div className="illustrationWrapperCenter">
              <div>
                <Home style={{marginRight:"10px"}} />
                <Users className="is-flipped" />
                <Users className="is-flipped" />
              </div>
              <div>
                <Wind className="is-flipped"/>
                <UserPlus />
              </div>
            </div>
            <p>
              {t('about page.roleplay.rules.step6 2')}
            </p>
            <div className="illustrationWrapperCenter">
              <div>
                <Home style={{marginRight:"10px"}} />
                <Users className="is-flipped" />
                <Users className="is-flipped" />
              </div>
              <div>
                <Wind className="is-flipped"/>
                <UserPlus />
                <Heart className="redStroke" />
                <UserPlus />
              </div>
            </div>
            <p>
              {t('about page.roleplay.rules.step6 3')}
            </p>
          </div>

        </div>

        <RepeatFrom1></RepeatFrom1>

      </div>
    </>
  );
}

export default Roleplay;
