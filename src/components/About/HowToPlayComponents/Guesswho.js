import React from 'react';
import Card from '../../Card/Card.js';
import { ChevronDown, User, Users, ArrowRight, CheckCircle, Slash, UserCheck, MessageSquare, Gift } from 'react-feather';
import '../../../css/about.css';

const Guesswho = (props) => {

  //sizing for about page card styles
  let cardStyle = props.cardStyle;

  return (
    <>
      <div className="stepWrapper">
        <h2 className="subtitle">Step 1</h2>
        <p>Every player is given a random Member Card. Do not look at your card but show it to everyone else.</p>
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

      <div className="stepWrapper">
        <h2 className="subtitle">Step 2</h2>
        <p>Take turns asking a single yes / no question about your assigned Member.</p>
        <div className="illustrationWrapperCenter">
          <div>
            <User />
            <MessageSquare />
          </div>
          <div>
            <CheckCircle className="greenStroke" style={{marginRight:"10px"}}/>
            <Slash className="redStroke" />
          </div>
          <div>
            <Users />
            <Users />
          </div>
        </div>
      </div>

      <div className="stepSplitterLine"><ChevronDown className="is-48" /></div>

      <div className="stepWrapper greenBorder">
        <h2 className="subtitle">Step 3</h2>
        <p>Whoever correctly guesses their Member earns a point. The player with the most points wins!</p>
        <div className="illustrationWrapperCenter">
          <div>
            <UserCheck style={{marginRight:"10px"}}/>
            <Gift className="greenStroke" />
          </div>
          <div>
            <Users />
            <Users />
            <Users />
          </div>
        </div>
      </div>
      <p>...repeat from <span className="link" onClick={()=>{window.scrollTo({top:0,behavior:"smooth"})}}>Step 1</span> until bored.</p>
    </>
  );
}

export default Guesswho;
