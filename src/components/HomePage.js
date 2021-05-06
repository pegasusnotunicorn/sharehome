import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Smile } from 'react-feather';

import '../css/home.css';
import '../css/colors.css';

// <div className="CTAWrapper">
//
//   <NavLink className="callToAction noselect" to="/print">
//     <Printer width="30" height="30" className="callToActionIcon whiteStroke" />
//     <h1>Print a shitty<br></br>paper version</h1>
//     <p>free if you have a printer for some reason</p>
//   </NavLink>
//
//   <NavLink className="callToAction noselect" to="/purchase">
//     <Gift width="30" height="30" className="callToActionIcon whiteStroke" />
//     <h1>Purchase a<br></br>physical copy</h1>
//     <p>for when this quarantine stuff is finally over</p>
//   </NavLink>
//
//   <a className="callToAction noselect" rel="noopener noreferrer" target="_blank" href="https://tabletopia.com/playground/sharehome-u81imm/play-now">
//     <Smile width="30" height="30" className="callToActionIcon whiteStroke" />
//     <h1>Play virtually<br></br>right now</h1>
//     <p>friends or video conferencing not included</p>
//   </a>
//
// </div>


const HomePage = (props) => {

  useEffect(() => {
    document.title = "SHAREHOME - A custom party game";
  });

  const [email, setEmail] = useState("");

  return (
    <div className="content">
      <NavLink to="/"><div className="title noselect"></div></NavLink>
      <div className="subcontentWrapper">
        <h3>
          A card game inspired by that hit Japanese reality TV show on that popular streaming service.
        </h3>

        <h3>Coming soon.</h3>

        <div className="emailWrapper">
          <h2 className="subtitle">
            Sign up to be alerted when it goes on sale!
          </h2>

          <form action="https://sharehomethegame.us1.list-manage.com/subscribe?u=492281ef78974a5a81ee73e99&id=53c3e28f07" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>
            <div id="mc_embed_signup_scroll">
              <input type="email" value={email} onChange={(e)=>{
                setEmail(e.target.value);
              }} name="EMAIL" className="emailInput" id="mce-EMAIL" placeholder="minasan@konbanwa.com" required></input>
              <div className="is-hidden" aria-hidden="true"><input type="text" name="b_53aa1e4968079cb91780c349a_db90f0e795" tabindex="-1" value=""></input></div>
              <input type="submit" value="STAY UPDATED" name="subscribe" id="mc-embedded-subscribe" class="email-input-elems subscribeButton button"></input>
            </div>
          </form>
        </div>

      </div>

      <div className="couchContainer">
        <img className="couch" src="/images/couch.svg" alt="Commentator couch"></img>
      </div>
    </div>
  );
}

export default HomePage;
