import React from 'react';
import { ChevronDown, Users, UserCheck, Watch, Package, Smile, AlertOctagon, Frown } from 'react-feather';
import '../../../css/about.css';

const Taboo = (props) => {

  return (
    <div>
      <div className="stepWrapper">
        <h2 className="subtitle">Step 1</h2>
        <p>Split into teams and pick a representative for your team.</p>
        <div className="illustrationWrapperCenter">
          <div>
            <Users />
            <Users />
            <UserCheck className="greenStroke" style={{paddingLeft:"25px"}}/>
          </div>
          <div>
            <UserCheck className="redStroke" style={{paddingRight:"25px"}} />
            <Users className="is-flipped" />
            <Users className="is-flipped" />
          </div>
        </div>
      </div>

      <div className="stepSplitterLine"><ChevronDown className="is-48" /></div>

      <div className="stepWrapper">
        <h2 className="subtitle">Step 2</h2>
        <p>Each team representative takes one-minute turns with the deck of Member Cards.</p>
        <div className="illustrationWrapperCenter">
          <div>
            <UserCheck className="redStroke" />
            <UserCheck className="greenStroke" />
          </div>
          <div>
            <Watch />
            <Package />
          </div>
          <div>
            <Users className="is-flipped" />
            <Users className="is-flipped" />
          </div>
        </div>
      </div>

      <div className="stepSplitterLine"><ChevronDown className="is-48" /></div>

      <div className="stepWrapper">
        <h2 className="subtitle">Step 3</h2>
        <p>Try to get your teammates to guess as many Member Cards as possible without mentioning any of these forbidden topics.</p>
        <div className="illustrationWrapperCenter">
          <div className="listOfTaboo">
            <li>Name</li>
            <li>Gender</li>
            <li>Age</li>
            <li>Job</li>
            <li>Career</li>
            <li>Appearance</li>
            <li>...or any other categories you want!</li>
          </div>
          <div>
            <AlertOctagon className="redStroke" />
          </div>
        </div>
      </div>

      <div className="stepSplitterLine"><ChevronDown className="is-48" /></div>

      <div className="stepWrapper">
        <h2 className="subtitle">Step 4</h2>
        <p>The team with the most amount of correct guesses wins!</p>
        <div className="illustrationWrapperCenter">
          <div>
            <Users className="is-flipped" style={{marginRight:"10px"}} />
            <Smile className="greenStroke" style={{marginRight:"10px"}} />
            <Users className="is-flipped" />
          </div>
          <div>
            <Users className="is-flipped" style={{marginRight:"10px"}} />
            <Frown className="redStroke" style={{marginRight:"10px"}} />
            <Users className="is-flipped" />
          </div>
        </div>
      </div>

      <p>...repeat from <span className="link" onClick={()=>{window.scrollTo({top:0,behavior:"smooth"})}}>Step 1</span> until bored.</p>
    </div>
  );
}

export default Taboo;
