import React from 'react';
import Card from '../../Card/Card.js';
import { ChevronDown, HelpCircle, ArrowRight, Users, UserPlus, Gift } from 'react-feather';
import { useTranslation } from 'react-i18next';

import RepeatFrom1 from '../utils/RepeatFrom1.js';

import '../../../css/pages/about.css';

const Charades = (props) => {
  const { t } = useTranslation();

  //sizing for about page card styles
  let cardStyle = props.cardStyle;

  return (
    <>
      <div className="stepWrapper">
        <h2 className="subtitle">{t('about page.step1')}</h2>
        <p>{t('about page.charades.step1 1')}</p>
        <div className="illustrationWrapperCenter">
          <Card
            type="event"
            hideFront={true}
            showFront={false}
            disableFlip={true}
            mainStyle={cardStyle}
          />
          <HelpCircle />
          <div>
            <Users />
            <Users />
            <Users />
          </div>
        </div>
      </div>

      <div className="stepSplitterLine"><ChevronDown className="is-48" /></div>

      <div className="stepWrapper">
        <h2 className="subtitle">{t('about page.step2')}</h2>
        <p>{t('about page.charades.step2 1')}</p>
        <div className="illustrationWrapperCenter">
          <div>
            <Users className="is-flipped" />
            <Users className="is-flipped" />
            <Users className="is-flipped" />
          </div>
          <ArrowRight />
          <Card
            type="member"
            hideFront={true}
            showFront={false}
            disableFlip={true}
            mainStyle={cardStyle}
          />
        </div>
      </div>

      <div className="stepSplitterLine"><ChevronDown className="is-48" /></div>

      <div className="stepWrapper greenBorder">
        <h2 className="subtitle">{t('about page.step3')}</h2>
        <p>{t('about page.charades.step3 1')}</p>
        <div className="illustrationWrapperCenter">
          <div>
            <UserPlus style={{marginRight:"10px"}}/>
            <Gift className="greenStroke" />
          </div>
          <div>
            <Users />
            <Users />
            <Users />
          </div>
        </div>
      </div>

      <RepeatFrom1></RepeatFrom1>

    </>
  );
}

export default Charades;
