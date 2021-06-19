import React from 'react';
import Card from '../../Card/Card.js';
import { ChevronDown, Users, UserCheck, Watch, Smile, AlertOctagon, Frown } from 'react-feather';
import { useTranslation } from 'react-i18next';

import RepeatFrom1 from '../utils/RepeatFrom1.js';

import '../../../css/about.css';

const Taboo = (props) => {
  const { t } = useTranslation();

  //sizing for about page card styles
  let cardStyle = props.cardStyle;

  return (
    <>
      <div className="stepWrapper">
        <h2 className="subtitle">{t('about page.step1')}</h2>
        <p>{t('about page.guess who.step1 1')}</p>
        <div className="illustrationWrapperCenter">
          <div>
            <Users className="is-flipped" />
            <Users className="is-flipped" />
            <UserCheck className="greenStroke" style={{paddingLeft:"25px"}}/>
          </div>
          <div>
            <UserCheck className="redStroke" style={{paddingRight:"25px"}} />
            <Users />
            <Users />
          </div>
        </div>
      </div>

      <div className="stepSplitterLine"><ChevronDown className="is-48" /></div>

      <div className="stepWrapper">
        <h2 className="subtitle">{t('about page.step2')}</h2>
        <p>{t('about page.guess who.step2 1')}</p>
        <div className="illustrationWrapperCenter">
          <div>
            <UserCheck className="redStroke" />
            <UserCheck className="greenStroke" />
          </div>
          <div className="illustrationCardWrapper">
            <Watch />
            <Card
              type="member"
              hideFront={true}
              showFront={false}
              disableFlip={true}
              mainStyle={cardStyle}
            />
          </div>
          <div>
            <Users />
            <Users />
          </div>
        </div>
      </div>

      <div className="stepSplitterLine"><ChevronDown className="is-48" /></div>

      <div className="stepWrapper">
        <h2 className="subtitle">{t('about page.step3')}</h2>
        <p>{t('about page.guess who.step3 1')}</p>
        <div className="illustrationWrapperCenter">
          <div className="listOfTaboo">
            <li>{t('about page.taboo.step3 li1')}</li>
            <li>{t('about page.taboo.step3 li2')}</li>
            <li>{t('about page.taboo.step3 li3')}</li>
            <li>{t('about page.taboo.step3 li4')}</li>
            <li>{t('about page.taboo.step3 li5')}</li>
            <li>{t('about page.taboo.step3 li6')}</li>
            <li>{t('about page.taboo.step3 li7')}</li>
          </div>
          <div>
            <AlertOctagon className="redStroke" />
          </div>
        </div>
      </div>

      <div className="stepSplitterLine"><ChevronDown className="is-48" /></div>

      <div className="stepWrapper greenBorder">
        <h2 className="subtitle">{t('about page.step4')}</h2>
        <p>{t('about page.taboo.step4 1')}</p>
        <div className="illustrationWrapperCenter">
          <div>
            <Users className="is-flipped" style={{marginRight:"10px"}} />
            <Smile className="greenStroke" style={{marginRight:"10px"}} />
            <Users className="is-flipped" />
          </div>
          <div>
            <Users style={{marginRight:"10px"}} />
            <Frown className="redStroke" style={{marginRight:"10px"}} />
            <Users />
          </div>
        </div>
      </div>

      <RepeatFrom1></RepeatFrom1>

    </>
  );
}

export default Taboo;
