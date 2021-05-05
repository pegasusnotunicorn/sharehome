import React, { useState } from 'react';
import Card from '../../Card/Card.js';
import { ChevronDown, User, Users, UserPlus, ArrowRight, ArrowUpCircle, ArrowRightCircle, ArrowLeftCircle, MessageSquare, TrendingUp, TrendingDown, Home, Wind, Heart} from 'react-feather';
import '../../../css/about.css';

const Roleplay = (props) => {

  //sizing for about page card styles
  let cardStyle = props.cardStyle;

  //state to keep track of if we are showing game rules or game setup
  const [showRules, setshowRules] = useState(false);
  const toggleSteps = ()=> {
    setshowRules(!showRules);
  }

  return (
    <>
      <h2 className="subtitle">Game {(!showRules) ? "Setup" : "Rules"}</h2>
      <p className="showRulesButton noselect" onClick={toggleSteps}>{(showRules) ? "Show me the game setup again" : "Show me the game rules instead"}</p>

      <div className={"stepsContainer" + ((!showRules) ? " is-active" : "")}>

        <div className="stepWrapper">
          <h2 className="subtitle">Step 1</h2>
          <p>
            Decide the 6 players who will be Members of the House. The rest will be playing as Commentators.
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
            If you don't have enough players, each Member also plays as a Commentator.
          </li>
        </div>

        <div className="stepSplitterLine"><ChevronDown className="is-48" /></div>

        <div className="stepWrapperSplit">

          <div className="stepWrapper">
            <h2 className="subtitle">Step 2 - Members</h2>
            <p>
              Players are given a random Member Card, a Goal Card, and two Signal Tokens.
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
              Your goal is to complete your Goal Card or find love and leave the house.
            </p>
            <li className="subtext">
              Place your Member Card face up for all to see.
            </li>
            <li className="subtext">
              The more convincing your acting, the better!
            </li>
          </div>

          <div className="stepWrapper">
            <h2 className="subtitle">Step 2 - Commentators</h2>
            <p>
              Players are given a random Commentator Card and a Signal Token.
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
              Your goal is to commentate on what the Members are doing and crack jokes.
            </p>
            <li className="subtext">
              You may speak at any time.
            </li>
            <li className="subtext">
              The more you talk, the more everyone has fun!
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
          Sounds good! Take me to the game rules.
        </p>

      </div>

      <div className={"stepsContainer" + ((showRules) ? " is-active" : "")}>

        <div className="stepWrapper">
          <h2 id="step1" className="subtitle">Step 1 - Introductions Round</h2>
          <p>
            All new Members introduce themselves.
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
            All Members secretly point their Signal Tokens towards a Member who they like (may be as a friend) or hate. You can point at yourself.
          </p>
          <div className="illustrationWrapperCenter">
            <User className="greenStroke"/>
            <ArrowRightCircle className="greenStroke" />
            <User className="greenStroke"/>
            <ArrowLeftCircle className="redStroke" />
            <User className="greenStroke"/>
          </div>
          <li className="subtext">
            Use your Member Card to cover your Signal Token.
          </li>
        </div>

        <div className="stepSplitterLine"><ChevronDown className="is-48" /></div>

        <div className="stepWrapper">
          <h2 className="subtitle">Step 2 - Commentary Round</h2>
          <p>
            Commentators commentate on what they saw.
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
            All Commentators use their Signal Tokens to predict which Member likes (or hates) who.
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
            Place your signal tokens in between two members
          </li>
        </div>

        <div className="stepSplitterLine"><ChevronDown className="is-48" /></div>

        <div className="stepWrapperSplit">

          <div className="stepWrapper">
            <h2 className="subtitle">Step 3 - Event Round <span className="green">(Liked)</span></h2>
            <p>
              The Member with the most amount of predicted "likes" from Commentators is now trending!
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
              This Member draws an Event Card and chooses who will act out the Event.
            </p>
            <li className="subtext">
              They may include themselves.
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
            <h2 className="subtitle">Step 4 - Event Round <span className="red">(Hated)</span></h2>
            <p>
              The Member with the most amount of predicted "hates" from Commentators is now trending!
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
              This Member draws an Event Card and chooses who will act out the Event.
            </p>
            <li className="subtext">
              They may include themselves.
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
            <h2 className="subtitle">Step 5 - Reveal Round</h2>
            <p>
              All Members are now back at the house and talk about how their days went. Any Member can ask out any other Member now.
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
              All Members reveal their Signal Tokens. For any correct Predictions, the Commentator and the two predicted Members receive a point each.
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
              The game ends whenever you get bored. The player with the most points wins!
            </p>
          </div>

          <div className="stepWrapper">
            <h2 className="subtitle">About Graduations</h2>
            <p>
              Any Members who have accomplished their goals may graduate to receive a point.
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
              Members who like each other may decide to graduate together to receive a point each.
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
              Any graduating Member is replaced by the youngest non-member player with the lowest amount of points. Pick a random Member Card and join the house.
            </p>

          </div>

        </div>

        <p>...repeat from <span className="link" onClick={()=>{window.scrollTo({top:0,behavior:"smooth"})}}>Step 1</span> until bored.</p>

      </div>
    </>
  );
}

export default Roleplay;
