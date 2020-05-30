import React, { useEffect } from 'react';

//custom files
import DeckEditor from './DeckEditor/DeckEditor.js';
import DeckSelector from './DeckSelector.js';
import { NavLink } from 'react-router-dom';
import { useStickyState } from './utils/stickyHooks.js';
import "../../css/Designer/designer.css"

function Designer(props){
  const [designing, setDesigning] = useStickyState(false, "designing");

  //using window.localStorage to check if anything was being designed
  useEffect(()=>{
    document.title = "SHAREHOME - Card Designer";

    //hide footer for designer page
    if (designing){
      props.setShowFooter(false);
    }
    else {
      props.setShowFooter(true);
    }
  });

  return (
    <div>
      <div className="content">
        <NavLink to="/"><div className="title noselect"></div></NavLink>
        {designing
          ? <DeckEditor
              viewerMagnifyValue={3}
              designing={designing}
              setDesigning={setDesigning}
            />
          : <DeckSelector
              setDesigning={setDesigning}
            />
        }
      </div>
    </div>
  );
}

export default Designer;
