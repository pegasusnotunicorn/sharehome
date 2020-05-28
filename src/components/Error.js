import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';

function Error(props){

  useEffect(() => {
    props.setShowFooter(true);
    document.title = "SHAREHOME - Something went wrong!";
  });

  return (
    <div className="content max-width">
      <NavLink to="/"><div className="title noselect"></div></NavLink>
      <div className="subcontentWrapper">
        <h2 className="subtitle">Oops, something went wrong!</h2>
        <p>You tried to go to a page that doesn't exist! <NavLink to="/">Click to go back home.</NavLink></p>
      </div>
    </div>
  )
}

export default Error;
