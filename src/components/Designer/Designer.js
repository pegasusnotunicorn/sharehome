import React, { useEffect } from 'react';

//custom files
import DeckEditor from './DeckEditor/DeckEditor.js';
import { NavLink } from 'react-router-dom';
import { useStickyState } from './utils/stickyHooks.js';

function Designer(props){
  const [startedDesigning, setStartedDesigning] = useStickyState(false, "startedDesigning");
  const startDesigning = (e) =>{
    setStartedDesigning(true);
  }

  useEffect(()=>{
    document.title = "SHAREHOME - Card Designer";
    if (startedDesigning){
      props.setShowFooter(false);
    }
  });

  return (
    <div>
      <div className="content">
        <NavLink to="/"><div className="title noselect"></div></NavLink>
        {startedDesigning
          ? <DeckEditor viewerMagnifyValue={3} />
          :
            <div className="subcontentWrapper">
              <h2 className="subtitle">Design your own cards</h2>
              <p>
                Design custom cards of you and your friends to play with. Share the cards with the world so that anyone can play with them. The possibilities are endless!
              </p>
              <button className="button noselect" onClick={startDesigning}>Click me to Start</button>
            </div>
        }
      </div>
    </div>
  );
}

export default Designer;
