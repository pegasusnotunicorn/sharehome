import React from 'react';
import { EventGoalCard } from '../../Footer/EventGoalCard.js';
import { MemberCard } from '../../Footer/MemberCard.js';
import { ChevronDown, HelpCircle, ArrowRight, Users, UserPlus, Gift } from 'react-feather';
import '../../../css/about.css';

const Charades = (props) => {

  let cardStyle = {
    width:"98px",
    height:"70px",
    fontSize:"3px",
  }

  return (
    <div>
      <div className="stepWrapper">
        <h2 className="subtitle">Step 1</h2>
        <p>Select a random Event Card. Select players at random based on the amount of participants on the Event Card.</p>
        <div className="illustrationWrapperCenter">
          <EventGoalCard
            type="event"
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
        <h2 className="subtitle">Step 2</h2>
        <p>The selected players are each given a random Member Card. They then act out the scene as if they are those Members.</p>
        <div className="illustrationWrapperCenter">
          <div>
            <Users className="is-flipped" />
            <Users className="is-flipped" />
            <Users className="is-flipped" />
          </div>
          <ArrowRight />
          <MemberCard mainStyle={cardStyle} />
        </div>
      </div>

      <div className="stepSplitterLine"><ChevronDown className="is-48" /></div>

      <div className="stepWrapper">
        <h2 className="subtitle">Step 3</h2>
        <p>Whoever first correctly guesses all the Members earns a point. The player with the most points wins!</p>
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

      <p>...repeat from <span className="link" onClick={()=>{window.scrollTo({top:0,behavior:"smooth"})}}>Step 1</span> until bored.</p>
    </div>
  );
}

export default Charades;
