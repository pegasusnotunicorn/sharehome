import React, { useEffect } from 'react';

//custom files
import DeckSelector from './DeckSelector.js';
import { NavLink } from 'react-router-dom';
import { useStickyState } from './utils/stickyHooks.js';
import "../../css/Designer/designer.css"

const DesignerPage = (props) => {

  //bool to keep track of if we're designing or not
  const [designing, setDesigning] = useStickyState(false, "designing");

  //using window.localStorage to check if anything was being designed
  useEffect(()=>{
    document.title = "SHAREHOME - Card Designer";
    props.setShowFooter(!designing);  //hide footer for designer page
  });

  return (
    <>
      <div className="content">
        <NavLink to="/"><div className="title noselect"></div></NavLink>
        <DeckSelector
          designing={designing}
          setDesigning={setDesigning}
        />
      </div>
    </>
  );
}

export default DesignerPage;
