import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Gift, Printer } from 'react-feather';

import '../css/home.css';
import '../css/colors.css';

// <NavLink className="callToAction noselect" to="/play">
//   <Smile width="30" height="30" className="callToActionIcon blueStroke" />
//   <h1>Play virtually<br></br>right now</h1>
//   <p>friends or video conferencing not included</p>
// </NavLink>

const HomePage = (props) => {

  useEffect(() => {
    document.title = "SHAREHOME - A custom party game";
  });

  return (
    <div className="content">
      <NavLink to="/"><div className="title noselect"></div></NavLink>
      <div className="subcontentWrapper">
        <h2 className="subtitle">
          A custom party game inspired by that hit Japanese reality TV show on a popular streaming service.
        </h2>
      </div>
      <div className="CTAWrapper">
        <NavLink className="callToAction noselect" to="/purchase">
          <Gift width="30" height="30" className="callToActionIcon blueStroke" />
          <h1>Purchase a<br></br>physical copy</h1>
          <p>for when this quarantine stuff is finally over</p>
        </NavLink>
        <NavLink className="callToAction noselect" to="/print">
          <Printer width="30" height="30" className="callToActionIcon blueStroke" />
          <h1>Print a shitty<br></br>paper version</h1>
          <p>free if you have a printer for some reason</p>
        </NavLink>
      </div>
    </div>
  );
}

export default HomePage;
